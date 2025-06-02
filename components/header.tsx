"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Globe, Shield, Home, Info, Github, Wrench, AlertTriangle, Terminal, ShoppingBag } from "lucide-react"
import UserMenu from "./auth/user-menu"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Shells", path: "/shells", icon: <Terminal className="h-4 w-4 mr-2" /> },
    { name: "Exploits", path: "/exploits", icon: <AlertTriangle className="h-4 w-4 mr-2" /> },
    { name: "Domains", path: "/domains", icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
    { name: "Domain Finder", path: "/domain-finder", icon: <Globe className="h-4 w-4 mr-2" /> },
    { name: "Vuln Scanner", path: "/vuln-scanner", icon: <Shield className="h-4 w-4 mr-2" /> },
    { name: "Tools", path: "/tools", icon: <Wrench className="h-4 w-4 mr-2" /> },
    { name: "About", path: "/about", icon: <Info className="h-4 w-4 mr-2" /> },
  ]

  const handleMobileMenuClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-[#0d0d0f]/90 backdrop-blur-md border-b border-[#2a2a3a]" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl md:text-2xl font-mono font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] hover:from-[#00b8ff] hover:to-[#00ff9d] transition-all duration-300"
          >
            <span className="glitch-text">TRXSecurity</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`font-mono text-sm hover:text-[#00ff9d] transition-colors relative group flex items-center ${
                  pathname === item.path || pathname?.startsWith(item.path + "/") ? "text-[#00ff9d]" : "text-gray-300"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
                <span
                  className={`absolute -bottom-1 left-0 w-0 h-[1px] bg-[#00ff9d] transition-all duration-300 group-hover:w-full ${
                    pathname === item.path || pathname?.startsWith(item.path + "/") ? "w-full" : ""
                  }`}
                ></span>
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu and GitHub */}
          <div className="hidden md:flex items-center space-x-4">
            <UserMenu />
            <Link
              href="https://github.com/sagsooz/Bypass-Webshell"
              target="_blank"
              className="flex items-center text-gray-300 hover:text-[#00ff9d] transition-colors"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-[#00ff9d] p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-50 bg-[#0d0d0f]/95 backdrop-blur-md border-b border-[#2a2a3a] animate-fadeIn">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`font-mono text-sm py-2 px-3 rounded-md flex items-center transition-colors ${
                    pathname === item.path || pathname?.startsWith(item.path + "/")
                      ? "bg-[#2a2a3a] text-[#00ff9d]"
                      : "text-gray-300 hover:bg-[#1a1a1a] hover:text-[#00ff9d]"
                  }`}
                  onClick={handleMobileMenuClick}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Menu */}
              <div className="pt-4 border-t border-[#2a2a3a]">
                <UserMenu />
              </div>

              <Link
                href="https://github.com/sagsooz/Bypass-Webshell"
                target="_blank"
                className="font-mono text-sm py-2 px-3 rounded-md flex items-center text-gray-300 hover:bg-[#1a1a1a] hover:text-[#00ff9d]"
                onClick={handleMobileMenuClick}
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub Repo
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
