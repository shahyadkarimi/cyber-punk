"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, Terminal, Code, Lock, ArrowRight } from "lucide-react"
import AnimatedLogo from "./animated-logo"

export default function TRXHero() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#00ff9d]/10 to-transparent rounded-full filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-[#00b8ff]/10 to-transparent rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 z-0 grid-bg opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Logo */}
          <div
            className={`transition-all duration-1000 ${loaded ? "opacity-100 transform-none" : "opacity-0 translate-y-10"}`}
          >
            <AnimatedLogo />
          </div>

          {/* Description */}
          <p
            className={`max-w-2xl mx-auto text-gray-400 mb-8 transition-all duration-1000 delay-300 ${loaded ? "opacity-100 transform-none" : "opacity-0 translate-y-10"}`}
          >
            XTeamSecurity provides cutting-edge cybersecurity tools for security researchers, penetration testers, and
            ethical hackers. Our platform offers web shells, exploits, and security utilities designed for educational
            purposes and authorized security testing.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-500 ${loaded ? "opacity-100 transform-none" : "opacity-0 translate-y-10"}`}
          >
            <Link
              href="/shells"
              className="px-6 py-3 bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] text-black font-bold rounded-md hover:from-[#00b8ff] hover:to-[#00ff9d] transition-all duration-300 flex items-center justify-center group"
            >
              Explore Web Shells
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/tools"
              className="px-6 py-3 bg-transparent border border-[#00ff9d] text-[#00ff9d] font-bold rounded-md hover:bg-[#00ff9d]/10 transition-all duration-300"
            >
              View Security Tools
            </Link>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 transition-all duration-1000 delay-700 ${loaded ? "opacity-100 transform-none" : "opacity-0 translate-y-10"}`}
          >
            {[
              {
                icon: <Shield className="h-8 w-8 mb-4 text-[#00ff9d]" />,
                title: "Penetration Testing",
                desc: "Advanced security assessment to identify vulnerabilities",
              },
              {
                icon: <Terminal className="h-8 w-8 mb-4 text-[#00ff9d]" />,
                title: "Custom Tools",
                desc: "Specialized cybersecurity tools for ethical hacking",
              },
              {
                icon: <Code className="h-8 w-8 mb-4 text-[#00ff9d]" />,
                title: "Exploit Development",
                desc: "Research and development of security exploits",
              },
              {
                icon: <Lock className="h-8 w-8 mb-4 text-[#00ff9d]" />,
                title: "Security Consulting",
                desc: "Expert guidance on cybersecurity strategy",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-[#1a1a2e]/50 border border-[#2a2a3a] p-6 rounded-lg hover:border-[#00ff9d]/50 hover:bg-[#1a1a2e]/80 transition-all duration-300"
              >
                {item.icon}
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 font-mono text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
