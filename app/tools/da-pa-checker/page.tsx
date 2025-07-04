import type { Metadata } from "next"
import DaPaCheckerTool from "@/components/tools/da-pa-checker-tool"

export const metadata: Metadata = {
  title: "Domain Authority & Page Authority Checker | XTeamSec",
  description: "Check Domain Authority (DA) and Page Authority (PA) for multiple domains without limits",
  keywords: "domain authority, page authority, DA, PA, SEO tools, bulk domain checker, cybersecurity tools",
}

export default function DaPaCheckerPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 glitch-heading text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Domain Authority & Page Authority Checker
        </h1>

        <div className="mb-6 p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm">
          <p className="text-gray-300 font-mono text-sm">
            Check Domain Authority (DA) and Page Authority (PA) metrics for multiple domains at once. No limits on the
            number of domains you can check.
          </p>
        </div>

        <DaPaCheckerTool />
      </div>
    </main>
  )
}
