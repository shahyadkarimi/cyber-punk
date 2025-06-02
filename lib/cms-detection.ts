// Enhanced CMS detection

interface CmsPattern {
  name: string
  patterns: string[]
  headers?: { [key: string]: string }
  files?: string[]
}

export const cmsPatterns: CmsPattern[] = [
  {
    name: "WordPress",
    patterns: [
      "/wp-login.php",
      "/wp-admin",
      "wp-content",
      "wp-includes",
      "wp_",
      "WordPress",
      '<meta name="generator" content="WordPress',
    ],
    files: ["/wp-config.php", "/wp-login.php", "/xmlrpc.php"],
  },
  {
    name: "Joomla",
    patterns: [
      "Joomla!",
      "/administrator/index.php",
      "com_content",
      "/components/com_",
      '<meta name="generator" content="Joomla!',
    ],
    files: ["/administrator/", "/components/", "/configuration.php"],
  },
  {
    name: "Drupal",
    patterns: ["/drupal/", "Drupal", "drupal.settings", "drupal.behaviors", '<meta name="Generator" content="Drupal'],
    files: ["/sites/default/settings.php", "/core/misc/drupal.js"],
  },
  {
    name: "Magento",
    patterns: ["Mage.Cookies", "Magento", "var BLANK_URL", "magentoStorefrontEvents"],
    files: ["/app/etc/local.xml", "/js/mage/"],
  },
  {
    name: "Shopify",
    patterns: ["Shopify.theme", "shopify-payment-button", "cdn.shopify.com"],
  },
  {
    name: "WooCommerce",
    patterns: ["woocommerce", "WooCommerce", "wc-", "wc_add_to_cart"],
  },
  {
    name: "PrestaShop",
    patterns: ["prestashop", "PrestaShop", "/modules/ps_"],
    files: ["/config/defines.inc.php", "/admin-dev/"],
  },
  {
    name: "OpenCart",
    patterns: ["opencart", "OpenCart", "/catalog/view/"],
    files: ["/config.php", "/admin/config.php"],
  },
  {
    name: "Laravel",
    patterns: [
      "/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php",
      "laravel",
      "Laravel",
      "laravel_session",
      "XSRF-TOKEN",
    ],
  },
  {
    name: "Django",
    patterns: ["csrfmiddlewaretoken", "__admin_media_prefix__", "Django"],
  },
  {
    name: "React",
    patterns: ["react-root", "react.development.js", "react.production.min.js"],
  },
  {
    name: "Angular",
    patterns: ["ng-app", "ng-controller", "angular.js", "angular.min.js"],
  },
  {
    name: "Vue.js",
    patterns: ["vue.js", "vue.min.js", "data-v-"],
  },
  {
    name: "Wix",
    patterns: ["wix.com", "X-Wix-", "Wix.com"],
  },
  {
    name: "Squarespace",
    patterns: ["squarespace", "Squarespace", "static.squarespace.com"],
  },
  {
    name: "Ghost",
    patterns: ["ghost.io", "ghost-", "data-ghost"],
  },
  {
    name: "Webflow",
    patterns: ["webflow", "Webflow", "wf-"],
  },
]

/**
 * Check for security vulnerabilities
 */
export const securityChecks = [
  {
    name: "Exposed .git directory",
    path: "/.git/HEAD",
    pattern: "ref: refs/",
  },
  {
    name: "Exposed .env file",
    path: "/.env",
    pattern: "DB_|APP_|SECRET",
  },
  {
    name: "Directory listing enabled",
    path: "/",
    pattern: "Index of /",
  },
  {
    name: "phpMyAdmin",
    path: "/phpmyadmin/",
    pattern: "phpMyAdmin",
  },
  {
    name: "WordPress debug log",
    path: "/wp-content/debug.log",
    pattern: "PHP",
  },
  {
    name: "Exposed wp-config.php backup",
    path: "/wp-config.php.bak",
    pattern: "DB_",
  },
]

/**
 * Enhanced CMS detection function
 */
export async function detectCMS(url: string): Promise<{ cms: string; confidence: number; vulnerabilities?: string[] }> {
  try {
    // Clean the URL input
    url = url.replace(/^https?:\/\//, "")

    // Check if it's a cPanel subdomain
    if (isCpanelSubdomain(url)) {
      return { cms: "CPanel Subdomain", confidence: 100 }
    }

    // Try both http and https
    let content = ""
    let headers: Headers | null = null
    let protocol = "http"

    try {
      const httpResponse = await fetch(`http://${url}`, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        signal: AbortSignal.timeout(5000),
      })

      if (httpResponse.ok) {
        content = await httpResponse.text()
        headers = httpResponse.headers
        protocol = "http"
      }
    } catch (error) {
      // Silently fail and try https
    }

    if (!content) {
      try {
        const httpsResponse = await fetch(`https://${url}`, {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          signal: AbortSignal.timeout(5000),
        })

        if (httpsResponse.ok) {
          content = await httpsResponse.text()
          headers = httpsResponse.headers
          protocol = "https"
        }
      } catch (error) {
        // Silently fail
      }
    }

    if (!content) {
      return { cms: "Dead", confidence: 100 }
    }

    // Check for CMS patterns
    const results: { cms: string; confidence: number }[] = []

    for (const cms of cmsPatterns) {
      let matches = 0

      // Check content patterns
      for (const pattern of cms.patterns) {
        if (content.includes(pattern)) {
          matches++
        }
      }

      // Check headers if available
      if (headers && cms.headers) {
        for (const [header, value] of Object.entries(cms.headers)) {
          const headerValue = headers.get(header)
          if (headerValue && headerValue.includes(value)) {
            matches++
          }
        }
      }

      // Calculate confidence based on matches
      if (matches > 0) {
        const confidence = Math.min(100, matches * 25)
        results.push({ cms: cms.name, confidence })
      }
    }

    // Check for security vulnerabilities
    const vulnerabilities: string[] = []

    for (const check of securityChecks) {
      try {
        const response = await fetch(`${protocol}://${url}${check.path}`, {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          signal: AbortSignal.timeout(3000),
        })

        if (response.ok) {
          const checkContent = await response.text()
          if (checkContent.includes(check.pattern)) {
            vulnerabilities.push(check.name)
          }
        }
      } catch (error) {
        // Silently fail
      }
    }

    // Sort results by confidence
    results.sort((a, b) => b.confidence - a.confidence)

    // Check for sensitive pages if no CMS detected
    if (results.length === 0) {
      const sensitivePage = await checkSensitivePages(url, protocol)
      if (sensitivePage) {
        return {
          cms: `Sensitive Page: ${sensitivePage}`,
          confidence: 90,
          vulnerabilities: vulnerabilities.length > 0 ? vulnerabilities : undefined,
        }
      }

      return {
        cms: "Unknown",
        confidence: 0,
        vulnerabilities: vulnerabilities.length > 0 ? vulnerabilities : undefined,
      }
    }

    return {
      cms: results[0].cms,
      confidence: results[0].confidence,
      vulnerabilities: vulnerabilities.length > 0 ? vulnerabilities : undefined,
    }
  } catch (error) {
    console.error("Error in detectCMS:", error)
    return { cms: "Error Checking", confidence: 0 }
  }
}

/**
 * Check if the URL is a cPanel subdomain
 */
function isCpanelSubdomain(url: string): boolean {
  const cpanelSubdomains = ["cpcontacts.", "webmail.", "cpanel.", "webdisk.", "mail."]

  for (const subdomain of cpanelSubdomains) {
    if (url.startsWith(subdomain)) {
      return true
    }
  }

  return false
}

/**
 * Check for sensitive pages
 */
async function checkSensitivePages(url: string, protocol: string): Promise<string | null> {
  const sensitivePages = ["/register", "/admin", "/admin.php", "/adminpanel", "/login", "/wp-login.php"]
  const sensitiveKeywords = ["Confirm Password", "Password", "password", "username", "Username", "Login", "login"]

  for (const page of sensitivePages) {
    const fullUrl = `${protocol}://${url}${page}`

    try {
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        signal: AbortSignal.timeout(3000),
      })

      if (response.ok) {
        const content = await response.text()

        for (const keyword of sensitiveKeywords) {
          if (content.includes(keyword)) {
            return fullUrl
          }
        }
      }
    } catch (error) {
      // Silently fail and continue checking
    }
  }

  return null
}
