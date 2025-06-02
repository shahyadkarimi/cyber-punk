"use client"

import { useState, useEffect } from "react"
import { FileText, Copy, Check, Trash, Info, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ConversionType =
  | "text-to-hex"
  | "hex-to-text"
  | "text-to-binary"
  | "binary-to-text"
  | "text-to-base64"
  | "base64-to-text"
  | "text-to-url"
  | "url-to-text"
  | "text-to-html"
  | "html-to-text"
  | "text-to-morse"
  | "morse-to-text"
  | "text-to-reverse"
  | "uppercase-lowercase"
  | "lowercase-uppercase"

interface ConversionOption {
  value: ConversionType
  label: string
  description: string
}

const conversionOptions: ConversionOption[] = [
  {
    value: "text-to-hex",
    label: "Text to Hexadecimal",
    description: "Convert plain text to hexadecimal representation",
  },
  {
    value: "hex-to-text",
    label: "Hexadecimal to Text",
    description: "Convert hexadecimal back to plain text",
  },
  {
    value: "text-to-binary",
    label: "Text to Binary",
    description: "Convert plain text to binary representation",
  },
  {
    value: "binary-to-text",
    label: "Binary to Text",
    description: "Convert binary back to plain text",
  },
  {
    value: "text-to-base64",
    label: "Text to Base64",
    description: "Encode plain text to Base64",
  },
  {
    value: "base64-to-text",
    label: "Base64 to Text",
    description: "Decode Base64 back to plain text",
  },
  {
    value: "text-to-url",
    label: "Text to URL Encode",
    description: "URL encode text for use in web addresses",
  },
  {
    value: "url-to-text",
    label: "URL Decode to Text",
    description: "Decode URL encoded text back to plain text",
  },
  {
    value: "text-to-html",
    label: "Text to HTML Entities",
    description: "Convert text to HTML entities",
  },
  {
    value: "html-to-text",
    label: "HTML Entities to Text",
    description: "Convert HTML entities back to plain text",
  },
  {
    value: "text-to-morse",
    label: "Text to Morse Code",
    description: "Convert text to Morse code",
  },
  {
    value: "morse-to-text",
    label: "Morse Code to Text",
    description: "Convert Morse code back to text",
  },
  {
    value: "text-to-reverse",
    label: "Reverse Text",
    description: "Reverse the order of characters in text",
  },
  {
    value: "uppercase-lowercase",
    label: "UPPERCASE to lowercase",
    description: "Convert uppercase text to lowercase",
  },
  {
    value: "lowercase-uppercase",
    label: "lowercase to UPPERCASE",
    description: "Convert lowercase text to uppercase",
  },
]

export default function TextConverterTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [conversionType, setConversionType] = useState<ConversionType>("text-to-hex")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<"basic" | "advanced">("basic")

  // Morse code mapping
  const morseCodeMap: Record<string, string> = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "'": ".----.",
    "!": "-.-.--",
    "/": "-..-.",
    "(": "-.--.",
    ")": "-.--.-",
    "&": ".-...",
    ":": "---...",
    ";": "-.-.-.",
    "=": "-...-",
    "+": ".-.-.",
    "-": "-....-",
    _: "..--.-",
    '"': ".-..-.",
    $: "...-..-",
    "@": ".--.-.",
    " ": "/",
  }

  // Reverse Morse code mapping
  const reverseMorseCodeMap: Record<string, string> = {}
  Object.keys(morseCodeMap).forEach((key) => {
    reverseMorseCodeMap[morseCodeMap[key]] = key
  })

  useEffect(() => {
    try {
      setError(null)
      if (!input) {
        setOutput("")
        return
      }

      const result = convertText(input, conversionType)
      setOutput(result)
    } catch (e) {
      console.error("Conversion error:", e)
      setError(`Error during conversion: ${e instanceof Error ? e.message : "Unknown error"}`)
      setOutput("")
    }
  }, [input, conversionType])

  const convertText = (text: string, type: ConversionType): string => {
    if (!text) return ""

    try {
      switch (type) {
        case "text-to-hex":
          return Array.from(text)
            .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
            .join(" ")

        case "hex-to-text":
          return text
            .trim()
            .split(/\s+/)
            .map((hex) => String.fromCharCode(Number.parseInt(hex, 16)))
            .join("")

        case "text-to-binary":
          return Array.from(text)
            .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
            .join(" ")

        case "binary-to-text":
          return text
            .trim()
            .split(/\s+/)
            .map((binary) => String.fromCharCode(Number.parseInt(binary, 2)))
            .join("")

        case "text-to-base64":
          return btoa(unescape(encodeURIComponent(text)))

        case "base64-to-text":
          return decodeURIComponent(escape(atob(text.trim())))

        case "text-to-url":
          return encodeURIComponent(text)

        case "url-to-text":
          return decodeURIComponent(text)

        case "text-to-html":
          return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")

        case "html-to-text":
          return text
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))

        case "text-to-morse":
          return Array.from(text.toUpperCase())
            .map((char) => morseCodeMap[char] || char)
            .join(" ")

        case "morse-to-text":
          return text
            .trim()
            .split(/\s+/)
            .map((morse) => reverseMorseCodeMap[morse] || morse)
            .join("")

        case "text-to-reverse":
          return Array.from(text).reverse().join("")

        case "uppercase-lowercase":
          return text.toLowerCase()

        case "lowercase-uppercase":
          return text.toUpperCase()

        default:
          return text
      }
    } catch (e) {
      console.error("Conversion error:", e)
      throw new Error("Invalid input for the selected conversion type")
    }
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
    // Swap input and output
    setInput(output)

    // Try to determine the reverse conversion type
    const currentType = conversionType
    let newType: ConversionType = currentType

    switch (currentType) {
      case "text-to-hex":
        newType = "hex-to-text"
        break
      case "hex-to-text":
        newType = "text-to-hex"
        break
      case "text-to-binary":
        newType = "binary-to-text"
        break
      case "binary-to-text":
        newType = "text-to-binary"
        break
      case "text-to-base64":
        newType = "base64-to-text"
        break
      case "base64-to-text":
        newType = "text-to-base64"
        break
      case "text-to-url":
        newType = "url-to-text"
        break
      case "url-to-text":
        newType = "text-to-url"
        break
      case "text-to-html":
        newType = "html-to-text"
        break
      case "html-to-text":
        newType = "text-to-html"
        break
      case "text-to-morse":
        newType = "morse-to-text"
        break
      case "morse-to-text":
        newType = "text-to-morse"
        break
      case "uppercase-lowercase":
        newType = "lowercase-uppercase"
        break
      case "lowercase-uppercase":
        newType = "uppercase-lowercase"
        break
      // For text-to-reverse, we keep the same conversion type
    }

    setConversionType(newType)
  }

  const getBasicConversionOptions = (): ConversionOption[] => {
    return conversionOptions.filter((option) =>
      ["text-to-hex", "hex-to-text", "text-to-binary", "binary-to-text", "text-to-base64", "base64-to-text"].includes(
        option.value,
      ),
    )
  }

  return (
    <Card className="bg-[#0f0f13] border-[#2a2a3a]">
      <CardContent className="p-6">
        <Tabs defaultValue="basic" onValueChange={(value) => setMode(value as "basic" | "advanced")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a] mb-6">
            <TabsTrigger
              value="basic"
              className="font-mono data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d] py-3"
            >
              <FileText className="mr-2 h-4 w-4" />
              Basic Conversions
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="font-mono data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d] py-3"
            >
              <FileText className="mr-2 h-4 w-4" />
              Advanced Conversions
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">Conversion Type</label>
              <Select value={conversionType} onValueChange={(value) => setConversionType(value as ConversionType)}>
                <SelectTrigger className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200">
                  <SelectValue placeholder="Select conversion type" />
                </SelectTrigger>
                <SelectContent className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 max-h-[300px]">
                  {(mode === "basic" ? getBasicConversionOptions() : conversionOptions).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-gray-400">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Input</label>
                <Textarea
                  placeholder="Enter text to convert..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 min-h-[200px] resize-y"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-mono text-gray-400">Output</label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="font-mono border-[#2a2a3a] text-gray-300 hover:bg-[#2a2a3a] hover:text-white h-8"
                      disabled={!output}
                    >
                      {copied ? (
                        <>
                          <Check className="mr-1 h-4 w-4 text-green-400" />
                          <span className="sr-only sm:not-sr-only">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-4 w-4" />
                          <span className="sr-only sm:not-sr-only">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <Textarea
                  readOnly
                  value={output}
                  className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 min-h-[200px] resize-y"
                  placeholder="Converted output will appear here..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleSwap}
                className="font-mono border-[#2a2a3a] text-[#00ff9d] hover:bg-[#2a2a3a] hover:text-[#00ff9d]"
                disabled={!output}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Swap Input/Output
              </Button>

              <Button
                variant="outline"
                onClick={handleClear}
                className="font-mono border-[#2a2a3a] text-gray-300 hover:bg-[#2a2a3a] hover:text-white"
                disabled={!input && !output}
              >
                <Trash className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-700/30 text-red-400">
                <AlertDescription className="font-mono">{error}</AlertDescription>
              </Alert>
            )}

            <Alert className="bg-[#1a1a1a] border-[#2a2a3a]">
              <Info className="h-4 w-4 text-[#00b8ff]" />
              <AlertDescription className="text-gray-400 font-mono text-sm">
                <p>
                  This tool converts text between different formats commonly used in cybersecurity and programming.
                  Select the appropriate conversion type and enter your text to see the result.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
