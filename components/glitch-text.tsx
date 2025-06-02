"use client"

import { useState, useEffect } from "react"

interface GlitchTextProps {
  text: string
  className?: string
  glitchInterval?: number
  glitchDuration?: number
}

export default function GlitchText({
  text,
  className = "",
  glitchInterval = 3000,
  glitchDuration = 200,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsGlitching(true)

      setTimeout(() => {
        setIsGlitching(false)
      }, glitchDuration)
    }, glitchInterval)

    return () => clearInterval(intervalId)
  }, [glitchInterval, glitchDuration])

  return (
    <span className={`relative inline-block ${className} ${isGlitching ? "glitch-active" : ""}`} data-text={text}>
      {text}
    </span>
  )
}
