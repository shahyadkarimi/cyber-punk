import type { Metadata } from "next"
import PhpObfuscatorTool from "@/components/tools/php-obfuscator-tool"

export const metadata: Metadata = {
  title: "PHP Obfuscator | Cyberpunk WebShell Hub",
  description:
    "Advanced PHP code obfuscator with multi-layered protection to secure your PHP code from reverse engineering.",
  keywords: "PHP obfuscator, code protection, PHP encryption, anti-reverse engineering, PHP security, code obfuscation",
}

export default function PhpObfuscatorPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-mono mb-6 glitch-heading text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          PHP Obfuscator
        </h1>

        <div className="mb-6 p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm">
          <p className="text-gray-300 font-mono text-sm">
            Protect your PHP code with our advanced multi-layered obfuscation technology. This tool makes your code
            extremely difficult to reverse engineer while maintaining full functionality.
          </p>
        </div>

        <PhpObfuscatorTool />
      </div>
    </main>
  )
}
