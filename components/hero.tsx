"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  const [typedText, setTypedText] = useState("")
  const fullText = "Discover powerful web shells for ethical penetration testing and security research."

  useEffect(() => {
    let i = 0
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText((prev) => prev + fullText.charAt(i))
        i++
      } else {
        clearInterval(typingInterval)
      }
    }, 30)

    return () => clearInterval(typingInterval)
  }, [])

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0f]/0 via-[#0d0d0f]/50 to-[#0d0d0f] z-10"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?key=rwizn')] bg-cover bg-center opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-mono mb-6 glitch-heading text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
            Ultimate Web Shell Collection
          </h1>

          <div className="h-20">
            <p className="text-lg md:text-xl text-gray-300 mb-8 font-mono terminal-text">
              <span className="text-[#00ff9d]">$</span> {typedText}
              <span className="cursor inline-block w-2 h-5 bg-[#00ff9d] ml-1 animate-blink"></span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className="bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] hover:from-[#00b8ff] hover:to-[#00ff9d] text-black font-mono font-bold px-6 py-6 rounded-md transition-all duration-300 shadow-glow"
              onClick={() => window.open("https://github.com/sagsooz/Bypass-Webshell", "_blank")}
            >
              <Github className="mr-2 h-5 w-5" />
              View GitHub Repository
            </Button>

            <Button
              variant="outline"
              className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 font-mono px-6 py-6 rounded-md transition-all duration-300"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>

          <div className="mt-8 p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm">
            <p className="text-amber-400 font-mono text-sm">
              ⚠️ <strong>DISCLAIMER:</strong> These tools are for authorized use only. Unauthorized access to systems is
              illegal.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
