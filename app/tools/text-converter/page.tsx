import type { Metadata } from "next"
import TextConverterTool from "@/components/tools/text-converter-tool"

export const metadata: Metadata = {
  title: "Text Converter | Bypass WebShell Hub",
  description:
    "Convert text between different formats (Hex, Binary, ASCII, Base64, etc.) for cybersecurity research and penetration testing.",
  keywords: "text converter, hex converter, binary converter, base64 encoder, cybersecurity tools, penetration testing",
}

export default function TextConverterPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0f] text-gray-200 flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="matrix-bg absolute inset-0 opacity-10"></div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 glitch-heading text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
            Text Converter
          </h1>

          <div className="mb-6 p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm">
            <p className="text-gray-300 font-mono text-sm">
              Convert text between different formats including ASCII, Hex, Binary, Base64, URL encoding, and more for
              cybersecurity research and penetration testing.
            </p>
          </div>

          <TextConverterTool />
        </div>
      </main>
    </div>
  )
}
