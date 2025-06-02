"use client"

import { useState, useEffect } from "react"
import { ArrowDownUp, Copy, Check, Trash, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Base64Tool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      setError(null)
      if (!input) {
        setOutput("")
        return
      }

      if (mode === "encode") {
        // Encode to Base64
        const encoded = btoa(unescape(encodeURIComponent(input)))
        setOutput(encoded)
      } else {
        // Decode from Base64
        try {
          const decoded = decodeURIComponent(escape(atob(input)))
          setOutput(decoded)
        } catch (e) {
          setError("Invalid Base64 input. Please check your input and try again.")
          setOutput("")
        }
      }
    } catch (e) {
      setError("An error occurred during conversion. Please check your input and try again.")
      setOutput("")
    }
  }, [input, mode])

  const handleModeChange = (value: string) => {
    setMode(value as "encode" | "decode")
    // Clear fields when switching modes
    setInput("")
    setOutput("")
    setError(null)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
    setError(null)
  }

  const handleSwap = () => {
    setInput(output)
    setMode(mode === "encode" ? "decode" : "encode")
  }

  return (
    <Card className="bg-[#0f0f13] border-[#2a2a3a]">
      <CardContent className="p-6">
        <Tabs defaultValue="encode" onValueChange={handleModeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a] mb-6">
            <TabsTrigger
              value="encode"
              className="font-mono data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d] py-3"
            >
              <Code className="mr-2 h-4 w-4" />
              Encode to Base64
            </TabsTrigger>
            <TabsTrigger
              value="decode"
              className="font-mono data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d] py-3"
            >
              <Code className="mr-2 h-4 w-4" />
              Decode from Base64
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">
                {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
              </label>
              <Textarea
                placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 to decode..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 min-h-[150px] resize-y"
              />
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwap}
                className="font-mono border-[#2a2a3a] text-[#00ff9d] hover:bg-[#2a2a3a] hover:text-[#00ff9d]"
                disabled={!output}
              >
                <ArrowDownUp className="mr-2 h-4 w-4" />
                Swap Input/Output
              </Button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-mono text-gray-400">
                  {mode === "encode" ? "Base64 Output" : "Decoded Text"}
                </label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="font-mono border-[#2a2a3a] text-gray-300 hover:bg-[#2a2a3a] hover:text-white"
                    disabled={!input && !output}
                  >
                    <Trash className="mr-1 h-4 w-4" />
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="font-mono border-[#2a2a3a] text-gray-300 hover:bg-[#2a2a3a] hover:text-white"
                    disabled={!output}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1 h-4 w-4 text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <Textarea
                value={output}
                readOnly
                className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 min-h-[150px] resize-y"
                placeholder={
                  mode === "encode" ? "Base64 output will appear here..." : "Decoded text will appear here..."
                }
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-700/30 text-red-400">
                <AlertDescription className="font-mono">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
