"use client"

import { useEffect, useRef, useState } from "react"

export default function AnimatedLogo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)

    // Matrix rain effect
    const container = containerRef.current
    if (!container) return

    // Create matrix canvas
    const canvas = document.createElement("canvas")
    canvas.className = "absolute inset-0 z-0 opacity-20"
    container.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Matrix rain characters
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)

    // Vertical position for each column
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    // Drawing the characters
    const draw = () => {
      // Black semi-transparent BG to show trail
      ctx.fillStyle = "rgba(10, 10, 12, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Green text
      ctx.fillStyle = "#00ff9d"
      ctx.font = `${fontSize}px monospace`

      // Loop through drops
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)]

        // x = i * fontSize, y = value of drops[i]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        // Sending the drop to the top randomly after it crosses the screen
        // Adding randomness to the reset to make the drops scattered
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        // Incrementing Y coordinate
        drops[i]++
      }
    }

    const matrixInterval = setInterval(draw, 35)

    return () => {
      clearInterval(matrixInterval)
      window.removeEventListener("resize", resizeCanvas)
      if (container.contains(canvas)) {
        container.removeChild(canvas)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-60 flex items-center justify-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff9d] to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00b8ff] to-transparent opacity-70"></div>
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-[#00ff9d] to-transparent opacity-70"></div>
        <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-[#00b8ff] to-transparent opacity-70"></div>
      </div>

      {/* Main logo text with glitch effect */}
      <div className={`relative z-10 transition-all duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}>
        <h1 className="text-6xl md:text-7xl font-bold glitch-text" data-text="XTeamSec">
          <span className="relative inline-block">
            {/* Glitch layers */}
            <span className="absolute top-0 left-0 w-full h-full text-[#00ff9d] opacity-70 animate-glitch-1">
              XTeamSec
            </span>
            <span className="absolute top-0 left-0 w-full h-full text-[#00b8ff] opacity-70 animate-glitch-2">
              XTeamSec
            </span>

            {/* Main text with gradient */}
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
              XTeamSec
            </span>
          </span>
        </h1>

        {/* Scanning line effect */}
        <div className="absolute left-0 top-0 w-full h-2 bg-[#00ff9d]/30 animate-scan-line"></div>

        {/* Terminal-style blinking cursor */}
        <span className="inline-block h-10 w-3 bg-[#00ff9d] ml-2 animate-blink"></span>

        {/* Subtitle with typewriter effect */}
        <div className="mt-4 text-xl text-gray-400 font-mono overflow-hidden whitespace-nowrap animate-typing">
          Advanced Security Research Team
        </div>
      </div>
    </div>
  )
}
