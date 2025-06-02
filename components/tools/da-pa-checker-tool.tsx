"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Globe,
  Search,
  Download,
  Trash2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Copy,
  Check,
  Loader2,
  ArrowUpDown,
  X,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface DomainResult {
  domain: string
  da: number
  pa: number
  spamScore: number
  backlinks: number
  status: "success" | "error" | "pending"
  error?: string
}

export default function DaPaCheckerTool() {
  const [domains, setDomains] = useState<string>("")
  const [results, setResults] = useState<DomainResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [sortField, setSortField] = useState<keyof DomainResult>("da")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterValue, setFilterValue] = useState<string>("")
  const [showOnlyErrors, setShowOnlyErrors] = useState<boolean>(false)
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null)
  const [apiProvider, setApiProvider] = useState<string>("RapidAPI")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if API is configured on component mount
  useEffect(() => {
    checkApiConfiguration()
  }, [])

  const checkApiConfiguration = async () => {
    try {
      const response = await fetch("/api/da-pa-checker/config")
      const data = await response.json()
      setApiConfigured(data.configured)
      setApiProvider(data.provider || "RapidAPI")
    } catch (error) {
      console.error("Failed to check API configuration:", error)
      setApiConfigured(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!domains.trim()) {
      setError("Please enter at least one domain")
      return
    }

    setLoading(true)
    setProgress(0)
    setError(null)

    // Split domains by newline, comma, or space
    const domainList = domains
      .split(/[\n,\s]+/)
      .map((d) => d.trim())
      .filter((d) => d.length > 0)
      .map((d) => d.replace(/^https?:\/\//, ""))
      .map((d) => d.replace(/\/$/, ""))

    // Initialize results with pending status
    const initialResults = domainList.map((domain) => ({
      domain,
      da: 0,
      pa: 0,
      spamScore: 0,
      backlinks: 0,
      status: "pending" as const,
    }))

    setResults(initialResults)

    try {
      // Process all domains in one request
      const response = await fetch("/api/da-pa-checker/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domains: domainList }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API error: ${response.status}`)
      }

      const data = await response.json()

      // Update results
      setResults(data.results)
      setProgress(100)
    } catch (err) {
      console.error("Error processing domains:", err)
      setError(err instanceof Error ? err.message : "Failed to check domains")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setDomains(content || "")
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClear = () => {
    setDomains("")
    setResults([])
    setError(null)
  }

  const copyToClipboard = () => {
    if (results.length === 0) return

    const text = results.map((r) => `${r.domain},${r.da},${r.pa},${r.backlinks}`).join("\n")

    const header = "Domain,DA,PA,Backlinks\n"

    navigator.clipboard.writeText(header + text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportCSV = () => {
    if (results.length === 0) return

    const text = results.map((r) => `${r.domain},${r.da},${r.pa},${r.backlinks}`).join("\n")

    const header = "Domain,DA,PA,Backlinks\n"
    const blob = new Blob([header + text], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "domain-metrics.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSort = (field: keyof DomainResult) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // New field, default to descending
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Sort and filter results
  const filteredResults = results
    .filter((result) => {
      if (showOnlyErrors) return result.status === "error"
      return true
    })
    .filter((result) => {
      if (!filterValue) return true
      return result.domain.toLowerCase().includes(filterValue.toLowerCase())
    })
    .sort((a, b) => {
      // Handle undefined values
      const aValue = a[sortField] ?? 0
      const bValue = b[sortField] ?? 0

      if (aValue === bValue) return 0

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : 1
      } else {
        return aValue > bValue ? -1 : 1
      }
    })

  // Get color class based on score
  const getScoreColor = (score: number, max = 100, inverse = false) => {
    const percentage = score / max

    if (inverse) {
      if (percentage < 0.3) return "text-green-400"
      if (percentage < 0.7) return "text-yellow-400"
      return "text-red-400"
    } else {
      if (percentage > 0.7) return "text-green-400"
      if (percentage > 0.3) return "text-yellow-400"
      return "text-red-400"
    }
  }

  return (
    <div className="space-y-6">
      {apiConfigured === false && (
        <Alert className="bg-yellow-900/20 border-yellow-900 text-yellow-400">
          <Info className="h-4 w-4" />
          <AlertTitle>API Not Configured</AlertTitle>
          <AlertDescription>
            The RapidAPI credentials are not configured. Please add RAPID_API_KEY to your environment variables.
            <a
              href="https://rapidapi.com/ARZConsultant/api/domain-da-pa-check/"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 underline"
            >
              Get RapidAPI credentials
            </a>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="domains" className="text-sm font-mono text-gray-300">
              Enter domains (one per line or comma-separated)
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs border-[#2a2a3a] text-gray-300 hover:bg-[#2a2a3a]"
              >
                Upload File
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-xs border-[#2a2a3a] text-gray-300 hover:bg-[#2a2a3a]"
                disabled={!domains && results.length === 0}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
          <Textarea
            id="domains"
            placeholder="example.com
domain.org
another-site.net"
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            className="h-32 bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 font-mono"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="submit"
            disabled={loading || !domains.trim() || apiConfigured === false}
            className="bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] hover:from-[#00b8ff] hover:to-[#00ff9d] text-black font-mono transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Domains...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Check DA/PA
              </>
            )}
          </Button>

          <div className="text-xs text-gray-400 font-mono mt-2 sm:mt-0 sm:self-end">
            {domains.split(/[\n,\s]+/).filter((d) => d.trim().length > 0).length} domains
          </div>
        </div>
      </form>

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md p-4 space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-sm font-mono text-gray-300">Processing domains... ({Math.round(progress)}%)</div>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-[#2a2a3a]"
            indicatorClassName="bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]"
          />
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold font-mono text-[#00ff9d]">Results ({results.length} domains)</h2>

            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="border-[#2a2a3a] text-[#00ff9d] hover:bg-[#2a2a3a]"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy CSV
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy results as CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="border-[#2a2a3a] text-[#00ff9d] hover:bg-[#2a2a3a]"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Filter domains..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              {filterValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0 text-gray-400"
                  onClick={() => setFilterValue("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showErrors"
                checked={showOnlyErrors}
                onCheckedChange={(checked) => setShowOnlyErrors(checked as boolean)}
                className="border-[#2a2a3a] data-[state=checked]:bg-[#00ff9d] data-[state=checked]:text-black"
              />
              <Label htmlFor="showErrors" className="text-sm font-mono text-gray-300 cursor-pointer">
                Show only errors
              </Label>
            </div>

            <div className="ml-auto text-xs text-gray-400 font-mono">
              Showing {filteredResults.length} of {results.length} domains
            </div>
          </div>

          <div className="border border-[#2a2a3a] rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#2a2a3a] text-gray-300 font-mono uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer hover:bg-[#3a3a4a]" onClick={() => handleSort("domain")}>
                      <div className="flex items-center">
                        Domain
                        {sortField === "domain" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                        {sortField !== "domain" && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                      </div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-[#3a3a4a]" onClick={() => handleSort("da")}>
                      <div className="flex items-center">
                        DA
                        {sortField === "da" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                        {sortField !== "da" && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                      </div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-[#3a3a4a]" onClick={() => handleSort("pa")}>
                      <div className="flex items-center">
                        PA
                        {sortField === "pa" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                        {sortField !== "pa" && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                      </div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-[#3a3a4a]" onClick={() => handleSort("backlinks")}>
                      <div className="flex items-center">
                        Backlinks
                        {sortField === "backlinks" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                        {sortField !== "backlinks" && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => (
                    <tr
                      key={index}
                      className={`
                        border-t border-[#2a2a3a] 
                        ${index % 2 === 0 ? "bg-[#1a1a1a]/50" : "bg-[#1a1a1a]/30"}
                        ${result.status === "error" ? "bg-red-900/10" : ""}
                        hover:bg-[#2a2a3a]/30
                      `}
                    >
                      <td className="px-4 py-3 font-mono">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-[#00ff9d]" />
                          {result.domain}
                          {result.status === "error" && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Error
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {result.status === "pending" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        ) : result.status === "error" ? (
                          <span className="text-red-400">-</span>
                        ) : (
                          <span className={getScoreColor(result.da)}>{result.da}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {result.status === "pending" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        ) : result.status === "error" ? (
                          <span className="text-red-400">-</span>
                        ) : (
                          <span className={getScoreColor(result.pa)}>{result.pa}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {result.status === "pending" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        ) : result.status === "error" ? (
                          <span className="text-red-400">-</span>
                        ) : (
                          <span>{result.backlinks.toLocaleString()}</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-400 font-mono">
                        {showOnlyErrors ? "No errors found" : "No domains match your filter"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md p-4 text-sm text-gray-400 font-mono backdrop-blur-sm">
        <h3 className="text-[#00ff9d] mb-2 font-bold">About Domain Metrics</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>DA (Domain Authority):</strong> A score (1-100) that predicts how well a website will rank on search
            engines.
          </li>
          <li>
            <strong>PA (Page Authority):</strong> Similar to DA but for individual pages rather than entire domains.
          </li>
          <li>
            <strong>Backlinks:</strong> The total number of links pointing to a domain.
          </li>
        </ul>
        <p className="mt-4">
          <span className="text-[#00ff9d]">Note:</span> This tool uses the {apiProvider} to provide real domain metrics.
        </p>
      </div>
    </div>
  )
}
