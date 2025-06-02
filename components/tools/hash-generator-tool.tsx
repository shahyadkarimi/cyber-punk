"use client"

import { useState, useEffect } from "react"
import { Hash, Copy, Check, Trash, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Import crypto-js components
import MD5 from "crypto-js/md5"
import SHA1 from "crypto-js/sha1"
import SHA256 from "crypto-js/sha256"
import SHA512 from "crypto-js/sha512"
import SHA3 from "crypto-js/sha3"
import RIPEMD160 from "crypto-js/ripemd160"
import HmacMD5 from "crypto-js/hmac-md5"
import HmacSHA1 from "crypto-js/hmac-sha1"
import HmacSHA256 from "crypto-js/hmac-sha256"
import HmacSHA512 from "crypto-js/hmac-sha512"
import HmacSHA3 from "crypto-js/hmac-sha3"
import enc from "crypto-js/enc-hex"

type HashType =
  | "md5"
  | "sha1"
  | "sha256"
  | "sha512"
  | "sha3"
  | "ripemd160"
  | "hmac-md5"
  | "hmac-sha1"
  | "hmac-sha256"
  | "hmac-sha512"
  | "hmac-sha3"

interface HashResult {
  type: HashType
  hash: string
}

export default function HashGeneratorTool() {
  const [input, setInput] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [mode, setMode] = useState<"single" | "multiple">("single")
  const [selectedHash, setSelectedHash] = useState<HashType>("sha256")
  const [results, setResults] = useState<HashResult[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Generate hashes when input changes
  useEffect(() => {
    try {
      setError(null)

      if (!input) {
        setResults([])
        return
      }

      if (mode === "single") {
        const hash = generateHash(input, selectedHash, secretKey)
        setResults([{ type: selectedHash, hash }])
      } else {
        // Generate all hash types
        const hashTypes: HashType[] = ["md5", "sha1", "sha256", "sha512", "sha3", "ripemd160"]

        const allResults = hashTypes.map((type) => ({
          type,
          hash: generateHash(input, type, ""),
        }))

        setResults(allResults)
      }
    } catch (e) {
      setError("An error occurred while generating hashes. Please check your input and try again.")
      setResults([])
    }
  }, [input, selectedHash, mode, secretKey])

  // Generate a hash based on the selected algorithm
  const generateHash = (text: string, type: HashType, key = ""): string => {
    if (!text) return ""

    try {
      switch (type) {
        case "md5":
          return MD5(text).toString(enc)
        case "sha1":
          return SHA1(text).toString(enc)
        case "sha256":
          return SHA256(text).toString(enc)
        case "sha512":
          return SHA512(text).toString(enc)
        case "sha3":
          return SHA3(text).toString(enc)
        case "ripemd160":
          return RIPEMD160(text).toString(enc)
        case "hmac-md5":
          return HmacMD5(text, key || "").toString(enc)
        case "hmac-sha1":
          return HmacSHA1(text, key || "").toString(enc)
        case "hmac-sha256":
          return HmacSHA256(text, key || "").toString(enc)
        case "hmac-sha512":
          return HmacSHA512(text, key || "").toString(enc)
        case "hmac-sha3":
          return HmacSHA3(text, key || "").toString(enc)
        default:
          return SHA256(text).toString(enc)
      }
    } catch (e) {
      console.error("Hash generation error:", e)
      return "Error generating hash"
    }
  }

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopied(hash)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleClear = () => {
    setInput("")
    setSecretKey("")
    setResults([])
    setError(null)
  }

  const isHmac = (type: HashType): boolean => {
    return type.startsWith("hmac-")
  }

  const getHashDisplayName = (type: HashType): string => {
    switch (type) {
      case "md5":
        return "MD5"
      case "sha1":
        return "SHA-1"
      case "sha256":
        return "SHA-256"
      case "sha512":
        return "SHA-512"
      case "sha3":
        return "SHA-3"
      case "ripemd160":
        return "RIPEMD-160"
      case "hmac-md5":
        return "HMAC-MD5"
      case "hmac-sha1":
        return "HMAC-SHA1"
      case "hmac-sha256":
        return "HMAC-SHA256"
      case "hmac-sha512":
        return "HMAC-SHA512"
      case "hmac-sha3":
        return "HMAC-SHA3"
      default:
        return type.toUpperCase()
    }
  }

  return (
    <Card className="bg-[#0f0f13] border-[#2a2a3a]">
      <CardContent className="p-6">
        <Tabs
          defaultValue="single"
          onValueChange={(value) => setMode(value as "single" | "multiple")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a] mb-6">
            <TabsTrigger
              value="single"
              className="font-mono data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d] py-3"
            >
              <Hash className="mr-2 h-4 w-4" />
              Single Hash
            </TabsTrigger>
            <TabsTrigger
              value="multiple"
              className="font-mono data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d] py-3"
            >
              <Hash className="mr-2 h-4 w-4" />
              Multiple Hashes
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">Text to Hash</label>
              <Textarea
                placeholder="Enter text to hash..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 min-h-[100px] resize-y"
              />
            </div>

            {mode === "single" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-gray-400 mb-2">Hash Algorithm</label>
                  <RadioGroup
                    value={selectedHash}
                    onValueChange={(value) => setSelectedHash(value as HashType)}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="md5" id="md5" className="border-[#2a2a3a] text-[#00ff9d]" />
                      <Label htmlFor="md5" className="font-mono">
                        MD5
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sha1" id="sha1" className="border-[#2a2a3a] text-[#00ff9d]" />
                      <Label htmlFor="sha1" className="font-mono">
                        SHA-1
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sha256" id="sha256" className="border-[#2a2a3a] text-[#00ff9d]" />
                      <Label htmlFor="sha256" className="font-mono">
                        SHA-256
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sha512" id="sha512" className="border-[#2a2a3a] text-[#00ff9d]" />
                      <Label htmlFor="sha512" className="font-mono">
                        SHA-512
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sha3" id="sha3" className="border-[#2a2a3a] text-[#00ff9d]" />
                      <Label htmlFor="sha3" className="font-mono">
                        SHA-3
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ripemd160" id="ripemd160" className="border-[#2a2a3a] text-[#00ff9d]" />
                      <Label htmlFor="ripemd160" className="font-mono">
                        RIPEMD-160
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hmac-md5" id="hmac-md5" className="border-[#2a2a3a] text-[#00ff9d]" />
                      <Label htmlFor="hmac-md5" className="font-mono">
                        HMAC-MD5
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hmac-sha1" id="hmac-sha1" className="border-[#2a2a3a] text-[#00ff9d]" />
                      <Label htmlFor="hmac-sha1" className="font-mono">
                        HMAC-SHA1
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="hmac-sha256"
                        id="hmac-sha256"
                        className="border-[#2a2a3a] text-[#00ff9d]"
                      />
                      <Label htmlFor="hmac-sha256" className="font-mono">
                        HMAC-SHA256
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="hmac-sha512"
                        id="hmac-sha512"
                        className="border-[#2a2a3a] text-[#00ff9d]"
                      />
                      <Label htmlFor="hmac-sha512" className="font-mono">
                        HMAC-SHA512
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {isHmac(selectedHash) && (
                  <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">Secret Key (for HMAC)</label>
                    <Input
                      type="text"
                      placeholder="Enter secret key..."
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="font-mono border-[#2a2a3a] text-gray-300 hover:bg-[#2a2a3a] hover:text-white"
                disabled={!input}
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

            <div className="space-y-4">
              <label className="block text-sm font-mono text-gray-400 mb-2">
                {mode === "single" ? "Hash Result" : "Hash Results"}
              </label>

              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="bg-[#1a1a1a] border border-[#2a2a3a] rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="font-mono bg-[#2a2a3a] text-[#00ff9d] border-none">
                          {getHashDisplayName(result.type)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(result.hash)}
                          className="h-8 px-2 text-gray-400 hover:text-white hover:bg-[#2a2a3a]"
                        >
                          {copied === result.hash ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="font-mono text-sm text-gray-300 bg-[#0a0a0c] p-2 rounded overflow-x-auto break-all">
                        {result.hash}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-[#2a2a3a] rounded-lg">
                  <Hash className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 font-mono text-lg mb-2">No hash generated</p>
                  <p className="text-gray-500 font-mono">Enter text above to generate hash</p>
                </div>
              )}
            </div>

            <Alert className="bg-[#1a1a1a] border-[#2a2a3a]">
              <Info className="h-4 w-4 text-[#00b8ff]" />
              <AlertDescription className="text-gray-400 font-mono text-sm">
                <p className="mb-1">
                  Hash functions are one-way cryptographic functions that convert data into a fixed-size string.
                </p>
                <p>They are commonly used for password storage, data integrity verification, and digital signatures.</p>
              </AlertDescription>
            </Alert>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
