"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "zoom-out" | "flip" | "glitch"
  delay?: number
  threshold?: number
  duration?: number
}

export default function AnimatedSection({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  threshold = 0.1,
  duration = 0.6,
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    const currentRef = sectionRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  const animationClass = isVisible ? `animate-${animation}` : "opacity-0"
  const delayStyle = { transitionDelay: `${delay}s`, animationDelay: `${delay}s` }
  const durationStyle = { transitionDuration: `${duration}s`, animationDuration: `${duration}s` }

  return (
    <div
      ref={sectionRef}
      className={`transition-all ${animationClass} ${className}`}
      style={{ ...delayStyle, ...durationStyle }}
    >
      {children}
    </div>
  )
}
