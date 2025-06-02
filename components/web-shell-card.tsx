"use client"

import { useState } from "react"
import { ExternalLink, Copy, Check, FileCode } from "lucide-react"
import Link from "next/link"
import type { WebShell } from "@/lib/database-services/shells-service"

interface WebShellCardProps {
  webShell: WebShell
}

export default function WebShellCard({ webShell }: WebShellCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webShell.file_path)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a3a] rounded-lg overflow-hidden hover:border-[#00ff9d]/50 transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="mr-3 p-2 bg-[#2a2a3a] rounded-md">
              <FileCode className={`h-5 w-5 ${getTypeColor(webShell.language)}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono group-hover:text-[#00ff9d] transition-colors">
                {webShell.name}
              </h3>
              <p className="text-sm text-gray-400 font-mono">{webShell.language.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="p-2 bg-[#2a2a3a] rounded-md hover:bg-[#3a3a4a] transition-colors"
              aria-label="Copy path"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-400" />}
            </button>

            <Link
              href={`/shells/${webShell.id}`}
              className="p-2 bg-[#2a2a3a] rounded-md hover:bg-[#3a3a4a] transition-colors"
              aria-label="View details"
            >
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>

        <p className="text-gray-300 mb-4 font-mono text-sm">{webShell.description || "No description available"}</p>

        <div className="flex flex-wrap gap-2">
          {webShell.tags &&
            webShell.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-[#2a2a3a] rounded-md text-xs font-mono text-gray-300">
                {tag}
              </span>
            ))}
        </div>
      </div>

      <div className="px-6 py-4 bg-[#0d0d0f] border-t border-[#2a2a3a] flex justify-between items-center">
        <span className="text-xs text-gray-400 font-mono">Last updated: {formatDate(webShell.updated_at)}</span>

        <div className="flex items-center">
          <span className="text-xs text-gray-400 font-mono mr-2">{webShell.download_count} downloads</span>
          <Link
            href={`/shells/${webShell.id}`}
            className="text-[#00b8ff] hover:text-[#00ff9d] text-sm font-mono transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}

function getTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case "php":
      return "text-purple-400"
    case "aspx":
    case "asp":
      return "text-blue-400"
    case "jsp":
      return "text-red-400"
    case "python":
      return "text-green-400"
    case "perl":
      return "text-yellow-400"
    default:
      return "text-gray-400"
  }
}
