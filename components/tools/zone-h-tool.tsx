"use client"

import { useState } from "react"
import { Send, AlertTriangle, Info, Check, Trash, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type NotifierType = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14"

const notifierOptions = [
  { value: "1", label: "known vulnerability (i.e. unpatched system)" },
  { value: "2", label: "undisclosed (new) vulnerability" },
  { value: "3", label: "configuration / admin. mistake" },
  { value: "4", label: "brute force attack" },
  { value: "5", label: "social engineering" },
  { value: "6", label: "Web Server intrusion" },
  { value: "7", label: "Web Server external module intrusion" },
  { value: "8", label: "Mail Server intrusion" },
  { value: "9", label: "FTP Server intrusion" },
  { value: "10", label: "SSH Server intrusion" },
  { value: "11", label: "Telnet Server intrusion" },
  { value: "12", label: "RPC Server intrusion" },
  { value: "13", label: "Shares misconfiguration" },
  { value: "14", label: "Other Server intrusion" },
]

export default function ZoneHTool() {
  const [domains, setDomains] = useState("")
  const [notifier, setNotifier] = useState<NotifierType>("1")
  const [isSpecialDefacement, setIsSpecialDefacement] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{ domain: string; status: "success" | "error"; message: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    // Reset states
    setError(null)
    setResults([])
    setIsProcessing(true)

    try {
      // Parse domains
      const domainList = domains
        .split("\n")
        .map((domain) => domain.trim())
        .filter((domain) => domain.length > 0)

      if (domainList.length === 0) {
        setError("Please enter at least one domain")
        setIsProcessing(false)
        return
      }

      // Simulate API call to Zone-H
      // In a real implementation, you would make actual API calls to Zone-H
      // Note: This is just a simulation for educational purposes
      const simulatedResults = []

      for (const domain of domainList) {
        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Validate domain format
        const isValidDomain =
          /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(\/.*)?$/.test(domain)

        if (!isValidDomain) {
          simulatedResults.push({
            domain,
            status: "error" as const,
            message: "Invalid domain format",
          })
          continue
        }

        // Simulate success/failure (80% success rate)
        const isSuccess = Math.random() > 0.2

        simulatedResults.push({
          domain,
          status: isSuccess ? "success" : "error",
          message: isSuccess
            ? "Successfully submitted to Zone-H"
            : "Failed to submit (this is a simulation, no actual submission was made)",
        })
      }

      setResults(simulatedResults)
    } catch (err) {
      setError("An error occurred while processing your request")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setDomains("")
    setResults([])
    setError(null)
  }

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length

  return (
    <Card className="bg-[#0f0f13] border-[#2a2a3a]">
      <CardContent className="p-6">
        <Alert className="mb-6 bg-amber-900/20 border-amber-700/30">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-amber-400 font-mono">Disclaimer</AlertTitle>
          <AlertDescription className="text-amber-300 font-mono text-sm">
            This tool is for educational purposes only. Unauthorized use of this tool to submit websites without
            permission is illegal and unethical. Always ensure you have proper authorization before using this tool.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-mono text-gray-400 mb-2">Domains (one per line)</label>
            <Textarea
              placeholder="Enter domains (e.g., example.com)
One domain per line"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 min-h-[200px] resize-y"
            />
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Format: domain.com or http://domain.com (one domain per line)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">Attack Method</label>
              <Select value={notifier} onValueChange={(value) => setNotifier(value as NotifierType)}>
                <SelectTrigger className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200">
                  <SelectValue placeholder="Select attack method" />
                </SelectTrigger>
                <SelectContent className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 max-h-[300px]">
                  {notifierOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="special-defacement"
                checked={isSpecialDefacement}
                onCheckedChange={(checked) => setIsSpecialDefacement(!!checked)}
                className="border-[#2a2a3a] data-[state=checked]:bg-[#00ff9d] data-[state=checked]:text-black"
              />
              <Label htmlFor="special-defacement" className="font-mono text-gray-300">
                Special Defacement
              </Label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isProcessing || !domains.trim()}
              className="w-full font-mono bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] hover:from-[#00b8ff] hover:to-[#00ff9d] text-black h-12"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <Send className="mr-2 h-5 w-5" />
                  Submit to Zone-H
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isProcessing || (!domains.trim() && results.length === 0)}
              className="w-full font-mono border-[#2a2a3a] text-gray-300 hover:bg-[#2a2a3a] hover:text-white h-12"
            >
              <Trash className="mr-2 h-5 w-5" />
              Clear
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-700/30 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-mono">{error}</AlertDescription>
            </Alert>
          )}

          {results.length > 0 && (
            <div className="border border-[#2a2a3a] rounded-md overflow-hidden">
              <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between">
                <h3 className="font-mono text-[#00ff9d] flex items-center">
                  <Globe className="mr-2 h-5 w-5" /> Results
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-green-400 font-mono text-sm flex items-center">
                    <Check className="mr-1 h-4 w-4" /> {successCount} Success
                  </span>
                  <span className="text-red-400 font-mono text-sm flex items-center">
                    <AlertTriangle className="mr-1 h-4 w-4" /> {errorCount} Failed
                  </span>
                </div>
              </div>

              <div className="bg-[#0a0a0c] p-4 max-h-[300px] overflow-y-auto">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded ${
                        result.status === "success"
                          ? "bg-green-900/20 border border-green-700/30"
                          : "bg-red-900/20 border border-red-700/30"
                      }`}
                    >
                      <div className="flex items-start">
                        {result.status === "success" ? (
                          <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-mono text-gray-200 break-all">{result.domain}</div>
                          <div
                            className={`text-xs font-mono ${
                              result.status === "success" ? "text-green-400" : "text-red-400"
                            } mt-1`}
                          >
                            {result.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Alert className="bg-[#1a1a1a] border-[#2a2a3a]">
            <Info className="h-4 w-4 text-[#00b8ff]" />
            <AlertDescription className="text-gray-400 font-mono text-sm">
              Note: This is a simulation tool. No actual submissions are made to Zone-H. In a real implementation, you
              would need to integrate with Zone-H's submission system.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}
