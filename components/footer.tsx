import Link from "next/link"
import { Github, Shield, ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0c] border-t border-[#2a2a3a] py-8 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold font-mono mb-4 text-[#00ff9d]">Bypass WebShell Hub</h3>
            <p className="text-gray-400 font-mono text-sm mb-4">
              A curated collection of web shells for ethical penetration testing and security research.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/sagsooz/Bypass-Webshell"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#00ff9d] transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold font-mono mb-4 text-[#00ff9d]">Quick Links</h3>
            <ul className="space-y-2 font-mono text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#00ff9d] transition-colors flex items-center">
                  <span className="mr-1">→</span> Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#00ff9d] transition-colors flex items-center">
                  <span className="mr-1">→</span> About
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/sagsooz/Bypass-Webshell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#00ff9d] transition-colors flex items-center"
                >
                  <span className="mr-1">→</span> GitHub Repository <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold font-mono mb-4 text-[#00ff9d]">Disclaimer</h3>
            <div className="p-4 bg-[#1a1a1a] border border-[#2a2a3a] rounded-md">
              <div className="flex items-start mb-2">
                <Shield className="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-amber-400 font-mono text-sm">
                  <strong>For ethical use only.</strong> Ensure you have permission before using these tools.
                </p>
              </div>
              <p className="text-gray-400 font-mono text-xs">
                These tools are for authorized use only. Unauthorized access to systems is illegal and unethical.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#2a2a3a] text-center">
          <p className="text-gray-400 font-mono text-sm">
            &copy; {new Date().getFullYear()} TRXSecurity Team. All rights reserved.
          </p>
          <p className="text-gray-500 font-mono text-xs mt-1">
            Led by M@rAz Ali | For educational and ethical purposes only
          </p>
        </div>
      </div>
    </footer>
  )
}
