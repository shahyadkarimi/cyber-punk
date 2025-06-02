"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Home, ShieldAlert, Terminal } from "lucide-react"

export default function NotFound() {
  const [glitchText, setGlitchText] = useState("404")
  const [redirectTimer, setRedirectTimer] = useState(10)

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*"
      let newText = ""
      for (let i = 0; i < 3; i++) {
        newText += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
      }
      setGlitchText(newText)
      setTimeout(() => setGlitchText("404"), Math.random() * 200 + 50)
    }, 2000)

    const timerInterval = setInterval(() => {
      setRedirectTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval)
          // window.location.href = '/' // Uncomment to enable auto-redirect
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(glitchInterval)
      clearInterval(timerInterval)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d0f] text-[#00ff9d] p-4 font-mono">
      <div className="absolute inset-0 overflow-hidden">
        <div className="matrix-rain"></div> {/* Placeholder for matrix rain effect */}
      </div>
      <div className="relative z-10 flex flex-col items-center text-center bg-[#1a1a1a] p-8 sm:p-12 rounded-lg shadow-2xl shadow-[#00ff9d]/30 border border-[#00ff9d]/50 max-w-2xl w-full">
        <ShieldAlert size={80} className="text-red-500 mb-6 animate-pulse" />
        <h1 className="text-6xl sm:text-8xl font-bold mb-4 relative">
          <span className="glitch-text" data-text="404">
            {glitchText}
          </span>
        </h1>
        <p className="text-2xl sm:text-3xl mb-2 text-red-400">SYSTEM ERROR // ACCESS DENIED</p>
        <p className="text-lg sm:text-xl mb-8 text-gray-400">
          The requested sector is offline or does not exist. Recalibrating navigation systems...
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/" className="glitch-button group">
            <Terminal size={20} className="mr-2 group-hover:animate-ping" />
            RETURN TO TERMINAL (HOME)
            <span className="glitch-button__glitch" aria-hidden="true"></span>
          </Link>
          <Link href="/dashboard" className="glitch-button group">
            <Home size={20} className="mr-2 group-hover:animate-bounce" />
            ACCESS DASHBOARD
            <span className="glitch-button__glitch" aria-hidden="true"></span>
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          If redirection fails, please use the links above.
          {/* Auto-redirecting in {redirectTimer}s... (Uncomment if auto-redirect is enabled) */}
        </p>
      </div>
      <style jsx global>{`
        .glitch-text {
          position: relative;
          color: #00ff9d;
          animation: glitch-skew 1s infinite linear alternate-reverse;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 #ff00c1;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px;
          text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
          clip: rect(86px, 450px, 140px, 0);
          animation: glitch-anim2 5s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim {
          0% { clip: rect(46px, 9999px, 33px, 0); transform: skew(0.3deg); }
          5% { clip: rect(25px, 9999px, 79px, 0); transform: skew(0.1deg); }
          /* ... more steps ... */
          100% { clip: rect(82px, 9999px, 6px, 0); transform: skew(0.6deg); }
        }
        @keyframes glitch-anim2 {
          0% { clip: rect(7px, 9999px, 90px, 0); transform: skew(0.4deg); }
          5% { clip: rect(70px, 9999px, 6px, 0); transform: skew(0.2deg); }
          /* ... more steps ... */
          100% { clip: rect(29px, 9999px, 71px, 0); transform: skew(0.5deg); }
        }
        @keyframes glitch-skew {
          0% { transform: skew(1deg); }
          100% { transform: skew(-1deg); }
        }
        .glitch-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #00ff9d;
          background-color: transparent;
          border: 2px solid #00ff9d;
          border-radius: 0.25rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .glitch-button:hover {
          background-color: #00ff9d;
          color: #0d0d0f;
          box-shadow: 0 0 15px #00ff9d, 0 0 30px #00ff9d;
        }
        .glitch-button__glitch {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #00ff9d;
          z-index: -1;
        }
        .glitch-button:hover .glitch-button__glitch {
          animation: glitch-button-anim 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
        }
        @keyframes glitch-button-anim {
          0% { transform: translate(0); }
          20% { transform: translate(-3px, 3px); }
          40% { transform: translate(-3px, -3px); }
          60% { transform: translate(3px, 3px); }
          80% { transform: translate(3px, -3px); }
          to { transform: translate(0); }
        }
        /* Basic Matrix Rain placeholder - replace with actual effect if desired */
        .matrix-rain::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 255, 157, 0) 0px,
            rgba(0, 255, 157, 0) 20px,
            rgba(0, 255, 157, 0.1) 21px,
            rgba(0, 255, 157, 0.1) 23px
          );
          animation: matrix-scroll 0.5s linear infinite;
          opacity: 0.3;
        }
        @keyframes matrix-scroll {
          from { background-position-y: 0px; }
          to { background-position-y: -46px; }
        }
      `}</style>
    </div>
  )
}
