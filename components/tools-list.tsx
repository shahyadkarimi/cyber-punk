import type React from "react"
import { FileCode2, Hash, RefreshCw, Shield, Terminal, Globe, BarChart3 } from "lucide-react"
import Link from "next/link"

interface Tool {
  name: string
  description: string
  icon: React.ReactNode
  href: string
  isNew?: boolean
}

export default function ToolsList() {
  const tools: Tool[] = [
    {
      name: "Base64 Encoder/Decoder",
      description: "Encode or decode Base64 strings with this simple tool",
      icon: <FileCode2 className="h-6 w-6 text-[#00ff9d]" />,
      href: "/tools/base64",
    },
    {
      name: "Hash Generator",
      description: "Generate various hash types (MD5, SHA1, SHA256, etc.)",
      icon: <Hash className="h-6 w-6 text-[#00ff9d]" />,
      href: "/tools/hash-generator",
    },
    {
      name: "Text Converter",
      description: "Convert text between different formats and encodings",
      icon: <RefreshCw className="h-6 w-6 text-[#00ff9d]" />,
      href: "/tools/text-converter",
    },
    {
      name: "Zone-H Mirror Checker",
      description: "Check if a domain has been defaced and archived on Zone-H",
      icon: <Shield className="h-6 w-6 text-[#00ff9d]" />,
      href: "/tools/zone-h",
    },
    {
      name: "PHP Obfuscator",
      description: "Obfuscate PHP code to protect it from being easily readable",
      icon: <Terminal className="h-6 w-6 text-[#00ff9d]" />,
      href: "/tools/php-obfuscator",
    },
    {
      name: "Domain & Subdomain Finder",
      description: "Find domains on the same IP and discover subdomains",
      icon: <Globe className="h-6 w-6 text-[#00ff9d]" />,
      href: "/domain-finder",
    },
    {
      name: "DA/PA Checker",
      description: "Check Domain Authority and Page Authority for multiple domains",
      icon: <BarChart3 className="h-6 w-6 text-[#00ff9d]" />,
      href: "/tools/da-pa-checker",
      isNew: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool, index) => (
        <Link
          key={index}
          href={tool.href}
          className="border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-lg p-4 hover:bg-[#2a2a3a]/50 transition-all duration-300 backdrop-blur-sm group"
        >
          <div className="flex items-start space-x-4">
            <div className="bg-[#2a2a3a] p-3 rounded-lg group-hover:bg-[#3a3a4a] transition-all duration-300">
              {tool.icon}
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="text-lg font-bold font-mono text-[#00ff9d] mb-2">{tool.name}</h3>
                {tool.isNew && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-[#00ff9d] text-black">
                    NEW
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{tool.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
