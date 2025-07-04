import type { Metadata } from "next"
import DomainFinderTool from "@/components/domain-finder-tool"

export const metadata: Metadata = {
  title: "Domain & Subdomain Finder | XTeamSec",
  description: "Find domains, subdomains and detect CMS types for cybersecurity research and penetration testing.",
  keywords: "domain finder, subdomain finder, CMS detection, cybersecurity tools, penetration testing",
}

export default function DomainFinderPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 glitch-heading text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Domain & Subdomain Finder
        </h1>

        <div className="mb-6 p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm">
          <p className="text-gray-300 font-mono text-sm">
            Find domains sharing the same IP, discover subdomains, and detect CMS types for ethical penetration testing
            and security research.
          </p>
        </div>

        <DomainFinderTool />
      </div>
    </main>
  )
}
