import type { Metadata } from "next"
import VulnerabilityScanner from "@/components/vulnerability-scanner"

export const metadata: Metadata = {
  title: "Vulnerability Scanner | Bypass WebShell Hub",
  description:
    "Scan websites for vulnerabilities, detect CMS types, and identify security issues for cybersecurity research and penetration testing.",
  keywords: "vulnerability scanner, security scanner, CMS detection, cybersecurity tools, penetration testing",
}

export default function VulnScannerPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 glitch-heading text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Vulnerability Scanner
        </h1>

        <div className="mb-6 p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm">
          <p className="text-gray-300 font-mono text-sm">
            Scan websites for vulnerabilities, detect CMS types, identify users, themes, and plugins for ethical
            penetration testing and security research.
          </p>
        </div>

        <VulnerabilityScanner />
      </div>
    </main>
  )
}
