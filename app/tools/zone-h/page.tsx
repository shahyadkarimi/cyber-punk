import type { Metadata } from "next"
import ZoneHTool from "@/components/tools/zone-h-tool"

export const metadata: Metadata = {
  title: "Zone-H Mass Submitter | Bypass WebShell Hub",
  description: "Submit multiple websites to Zone-H in one go for cybersecurity research and penetration testing.",
  keywords: "zone-h submitter, mass defacement, cybersecurity tools, penetration testing",
}

export default function ZoneHPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0f] text-gray-200 flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="matrix-bg absolute inset-0 opacity-10"></div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 glitch-heading text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
            Zone-H Mass Submitter
          </h1>

          <div className="mb-6 p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm">
            <p className="text-gray-300 font-mono text-sm">
              Submit multiple websites to Zone-H in one go. This tool is for educational purposes only and should be
              used ethically and responsibly.
            </p>
          </div>

          <ZoneHTool />
        </div>
      </main>
    </div>
  )
}
