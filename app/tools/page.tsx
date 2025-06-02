import type { Metadata } from "next"
import ToolsList from "@/components/tools-list"

export const metadata: Metadata = {
  title: "Security Tools | Bypass WebShell Hub",
  description: "A collection of useful security tools for cybersecurity research and penetration testing.",
  keywords: "security tools, cybersecurity tools, penetration testing, ethical hacking, base64, hash generator",
}

export default function ToolsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 glitch-heading text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Security Tools
        </h1>

        <div className="mb-6 p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm">
          <p className="text-gray-300 font-mono text-sm">
            A collection of useful security tools for cybersecurity research and ethical penetration testing.
          </p>
        </div>

        <ToolsList />
      </div>
    </main>
  )
}
