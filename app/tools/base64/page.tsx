import type { Metadata } from "next"
import Base64Tool from "@/components/tools/base64-tool"

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder | Bypass WebShell Hub",
  description: "Encode and decode text using Base64 encoding for cybersecurity research and penetration testing.",
  keywords: "base64 encoder, base64 decoder, base64 tool, cybersecurity tools, penetration testing",
}

export default function Base64Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 glitch-heading text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Base64 Encoder/Decoder
        </h1>

        <div className="mb-6 p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm">
          <p className="text-gray-300 font-mono text-sm">
            Encode and decode text using Base64 encoding for cybersecurity research and ethical penetration testing.
          </p>
        </div>

        <Base64Tool />
      </div>
    </main>
  )
}
