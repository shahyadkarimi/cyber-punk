"use client"

import { useState, useEffect } from "react"

interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
  delay?: number
}

export default function TypewriterText({
  text,
  speed = 50,
  className = "",
  onComplete,
  delay = 0,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTyping, setStartTyping] = useState(false)

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      setStartTyping(true)
    }, delay * 1000)

    return () => clearTimeout(delayTimeout)
  }, [delay])

  useEffect(() => {
    if (!startTyping) return

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete, startTyping])

  return (
    <span className={`${className} inline-block`}>
      {displayText}
      <span className="animate-blink">|</span>
    </span>
  )
}
