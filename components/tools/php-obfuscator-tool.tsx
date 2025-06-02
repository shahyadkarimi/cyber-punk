"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle, Code, Copy, RefreshCw, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// Utility function to generate random variable names
const generateRandomName = (length = 8): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$"
  let result = ""
  const firstCharset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$"
  result += firstCharset.charAt(Math.floor(Math.random() * firstCharset.length))

  for (let i = 1; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

// Utility function to generate random strings
const generateRandomString = (length = 16): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

// Utility function to convert string to hexadecimal representation
const stringToHex = (str: string): string => {
  let result = ""
  for (let i = 0; i < str.length; i++) {
    result += "\\x" + str.charCodeAt(i).toString(16).padStart(2, "0")
  }
  return result
}

// Utility function to convert string to ASCII array representation
const stringToAsciiArray = (str: string): string => {
  const asciiValues = []
  for (let i = 0; i < str.length; i++) {
    asciiValues.push(str.charCodeAt(i))
  }
  return asciiValues.join(",")
}

// Main obfuscation function with multiple layers
const obfuscatePhp = (code: string, options: ObfuscationOptions): string => {
  if (!code.trim()) return ""

  let obfuscated = code

  // Extract PHP tags
  const hasTags = obfuscated.includes("<?php") || obfuscated.includes("<?")
  if (!hasTags) {
    obfuscated = `<?php\n${obfuscated}\n?>`
  }

  // Remove comments
  if (options.removeComments) {
    obfuscated = obfuscated.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")
  }

  // Variable name obfuscation
  if (options.obfuscateVariables) {
    // This is a simplified approach - a real implementation would need a PHP parser
    const variableRegex = /\$([a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)/g
    const variables = new Map()

    obfuscated = obfuscated.replace(variableRegex, (match, varName) => {
      if (!variables.has(varName)) {
        variables.set(varName, `$${generateRandomName()}`)
      }
      return variables.get(varName)
    })
  }

  // String encoding
  if (options.encodeStrings) {
    // Replace string literals with encoded versions
    obfuscated = obfuscated.replace(/'([^'\\]*(\\.[^'\\]*)*)'|"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
      const stringContent = match.substring(1, match.length - 1)

      // Choose a random encoding method
      const encodingMethod = Math.floor(Math.random() * 3)

      switch (encodingMethod) {
        case 0: // base64
          return `base64_decode('${Buffer.from(stringContent).toString("base64")}')`
        case 1: // hex
          return `hex2bin('${Buffer.from(stringContent).toString("hex")}')`
        case 2: // ASCII array
          const asciiArray = stringToAsciiArray(stringContent)
          return `implode('', array_map('chr', array(${asciiArray})))`
        default:
          return match
      }
    })
  }

  // Add junk code
  if (options.addJunkCode) {
    const junkFunctions = [
      `function ${generateRandomName()}() { $${generateRandomName()} = ${Math.random() * 1000}; return md5(time() . rand()); }`,
      `$${generateRandomName()} = array(${Array(5)
        .fill(0)
        .map(() => Math.random() * 100)
        .join(", ")});`,
      `// ${generateRandomString(50)}`,
      `if(false) { echo "${generateRandomString(20)}"; }`,
    ]

    // Insert junk at random positions
    const lines = obfuscated.split("\n")
    for (let i = 0; i < Math.min(5, Math.floor(lines.length / 3)); i++) {
      const position = Math.floor(Math.random() * lines.length)
      const junk = junkFunctions[Math.floor(Math.random() * junkFunctions.length)]
      lines.splice(position, 0, junk)
    }

    obfuscated = lines.join("\n")
  }

  // Control flow obfuscation
  if (options.obfuscateControlFlow) {
    // This is a simplified approach - a real implementation would need a PHP parser
    // We'll wrap some code in conditional blocks that always evaluate to true
    const lines = obfuscated.split("\n")
    const newLines = []

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() && !lines[i].includes("<?php") && !lines[i].includes("?>") && Math.random() > 0.7) {
        const condition = [
          `(${Math.floor(Math.random() * 100)} == ${Math.floor(Math.random() * 100)} || true)`,
          `(md5(${Math.random()}) !== md5(${Math.random() + 0.1}))`,
          `(time() > 0)`,
        ][Math.floor(Math.random() * 3)]

        newLines.push(`if (${condition}) {`)
        newLines.push(`    ${lines[i]}`)
        newLines.push(`}`)
      } else {
        newLines.push(lines[i])
      }
    }

    obfuscated = newLines.join("\n")
  }

  // Advanced encryption layer
  if (options.encryptionLayer) {
    // Generate encryption key
    const key = generateRandomString(16)
    const keyVar = generateRandomName()
    const dataVar = generateRandomName()
    const decryptVar = generateRandomName()

    // Simple XOR encryption function
    const xorEncrypt = (text: string, key: string): string => {
      let result = ""
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
      }
      return result
    }

    // Extract the PHP code without the PHP tags
    let phpCode = obfuscated
    if (phpCode.startsWith("<?php")) {
      phpCode = phpCode.substring(5)
    }
    if (phpCode.endsWith("?>")) {
      phpCode = phpCode.substring(0, phpCode.length - 2)
    }

    // Encrypt the code
    const encrypted = Buffer.from(xorEncrypt(phpCode, key)).toString("base64")

    // Create the decryption wrapper
    obfuscated = `<?php
$${keyVar} = '${key}';
$${dataVar} = '${encrypted}';
$${decryptVar} = function($data, $key) {
    $data = base64_decode($data);
    $result = '';
    for ($i = 0; i < strlen($data); $i++) {
        $result .= chr(ord($data[$i]) ^ ord($key[$i % strlen($key)]));
    }
    return $result;
};
eval($${decryptVar}($${dataVar}, $${keyVar}));
?>`
  }

  // Add anti-debugging measures
  if (options.antiDebugging) {
    const timeVar = generateRandomName()
    const checkVar = generateRandomName()

    obfuscated = `<?php
// Anti-debugging measures
$${timeVar} = microtime(true);
$${checkVar} = function() use (&$${timeVar}) {
    if ((microtime(true) - $${timeVar}) > 1) {
        // Execution is too slow, likely being debugged
        header('HTTP/1.0 404 Not Found');
        exit();
    }
    
    if (function_exists('debug_backtrace')) {
        $trace = debug_backtrace();
        foreach ($trace as $item) {
            if (isset($item['function']) && 
                in_array($item['function'], ['xdebug_break', 'debug_zval_dump', 'debug_print_backtrace'])) {
                header('HTTP/1.0 404 Not Found');
                exit();
            }
        }
    }
    
    // Check for common debugging extensions
    $extensions = get_loaded_extensions();
    $debugExtensions = ['xdebug', 'xhprof', 'phpdbg'];
    foreach ($debugExtensions as $ext) {
        if (in_array($ext, $extensions)) {
            header('HTTP/1.0 404 Not Found');
            exit();
        }
    }
};
$${checkVar}();

${obfuscated.replace("<?php", "").replace("?>", "")}

// Run check again at the end
$${checkVar}();
?>`
  }

  // Add expiration timestamp
  if (options.addExpiration) {
    const currentTime = Math.floor(Date.now() / 1000)
    const expirationTime = currentTime + options.expirationDays * 24 * 60 * 60
    const timeCheckVar = generateRandomName()

    obfuscated = `<?php
// Expiration check
$${timeCheckVar} = function() {
    if (time() > ${expirationTime}) {
        // Code has expired
        header('HTTP/1.0 403 Forbidden');
        echo "This code has expired.";
        exit();
    }
};
$${timeCheckVar}();

${obfuscated.replace("<?php", "").replace("?>", "")}
?>`
  }

  return obfuscated
}

// Calculate obfuscation strength based on selected options and code characteristics
const calculateObfuscationStrength = (
  code: string,
  options: ObfuscationOptions,
): {
  score: number
  level: string
  color: string
  factors: Array<{ factor: string; impact: number }>
} => {
  // Base score starts at 0
  let score = 0
  const factors: Array<{ factor: string; impact: number }> = []

  // Factor 1: Basic obfuscation options
  if (options.removeComments) {
    score += 5
    factors.push({ factor: "Comment Removal", impact: 5 })
  }
  if (options.obfuscateVariables) {
    score += 15
    factors.push({ factor: "Variable Obfuscation", impact: 15 })
  }
  if (options.encodeStrings) {
    score += 15
    factors.push({ factor: "String Encoding", impact: 15 })
  }
  if (options.addJunkCode) {
    score += 10
    factors.push({ factor: "Junk Code", impact: 10 })
  }
  if (options.obfuscateControlFlow) {
    score += 15
    factors.push({ factor: "Control Flow Obfuscation", impact: 15 })
  }

  // Factor 2: Advanced protection options
  if (options.encryptionLayer) {
    score += 20
    factors.push({ factor: "Encryption Layer", impact: 20 })
  }
  if (options.antiDebugging) {
    score += 15
    factors.push({ factor: "Anti-Debugging", impact: 15 })
  }
  if (options.addExpiration) {
    score += 5
    factors.push({ factor: "Code Expiration", impact: 5 })
  }

  // Factor 3: Code complexity (simplified estimation)
  const codeLength = code.length
  let complexityScore = 0

  if (codeLength > 0) {
    // Count PHP functions (very simplified approach)
    const functionMatches = code.match(/function\s+[\w_]+\s*\(/g) || []
    const functionCount = functionMatches.length

    // Count PHP classes (very simplified approach)
    const classMatches = code.match(/class\s+[\w_]+/g) || []
    const classCount = classMatches.length

    // Count conditionals (very simplified approach)
    const conditionalMatches = code.match(/if\s*\(|switch\s*\(|for\s*\(|foreach\s*\(|while\s*\(/g) || []
    const conditionalCount = conditionalMatches.length

    // Calculate complexity score (max 10 points)
    complexityScore = Math.min(
      10,
      Math.floor(codeLength / 500) + // 1 point per 500 chars
        functionCount +
        classCount * 2 +
        Math.floor(conditionalCount / 2),
    )

    score += complexityScore
    factors.push({ factor: "Code Complexity", impact: complexityScore })
  }

  // Determine level and color based on score
  let level = "Low"
  let color = "text-red-500"

  if (score >= 80) {
    level = "Very High"
    color = "text-[#00ff9d]"
  } else if (score >= 60) {
    level = "High"
    color = "text-green-500"
  } else if (score >= 40) {
    level = "Medium"
    color = "text-yellow-500"
  } else if (score >= 20) {
    level = "Low"
    color = "text-orange-500"
  } else {
    level = "Very Low"
    color = "text-red-500"
  }

  return {
    score: Math.min(100, score), // Cap at 100
    level,
    color,
    factors,
  }
}

interface ObfuscationOptions {
  removeComments: boolean
  obfuscateVariables: boolean
  encodeStrings: boolean
  addJunkCode: boolean
  obfuscateControlFlow: boolean
  encryptionLayer: boolean
  antiDebugging: boolean
  addExpiration: boolean
  expirationDays: number
}

export default function PhpObfuscatorTool() {
  const [inputCode, setInputCode] = useState<string>("")
  const [outputCode, setOutputCode] = useState<string>("")
  const [isObfuscating, setIsObfuscating] = useState<boolean>(false)
  const [options, setOptions] = useState<ObfuscationOptions>({
    removeComments: true,
    obfuscateVariables: true,
    encodeStrings: true,
    addJunkCode: true,
    obfuscateControlFlow: true,
    encryptionLayer: false,
    antiDebugging: false,
    addExpiration: false,
    expirationDays: 30,
  })
  const [strengthMetrics, setStrengthMetrics] = useState<{
    score: number
    level: string
    color: string
    factors: Array<{ factor: string; impact: number }>
  }>({
    score: 0,
    level: "Not Calculated",
    color: "text-gray-500",
    factors: [],
  })
  const [showFactors, setShowFactors] = useState(false)

  const handleObfuscate = () => {
    if (!inputCode.trim()) return

    setIsObfuscating(true)

    // Calculate obfuscation strength
    const metrics = calculateObfuscationStrength(inputCode, options)
    setStrengthMetrics(metrics)

    // Simulate processing time for better UX
    setTimeout(() => {
      try {
        const result = obfuscatePhp(inputCode, options)
        setOutputCode(result)
      } catch (error) {
        console.error("Obfuscation error:", error)
        setOutputCode(`Error during obfuscation: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsObfuscating(false)
      }
    }, 500)
  }

  const handleCopyToClipboard = () => {
    if (!outputCode) return
    navigator.clipboard
      .writeText(outputCode)
      .then(() => {
        // You could add a toast notification here
        console.log("Copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  const handleOptionChange = (key: keyof ObfuscationOptions, value: boolean | number) => {
    const newOptions = {
      ...options,
      [key]: value,
    }
    setOptions(newOptions)

    // Update strength metrics if we have input code
    if (inputCode.trim()) {
      const metrics = calculateObfuscationStrength(inputCode, newOptions)
      setStrengthMetrics(metrics)
    }
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-[#1a1a1a] border-[#2a2a3a]">
        <AlertCircle className="h-4 w-4 text-[#00ff9d]" />
        <AlertTitle className="text-[#00ff9d]">Advanced PHP Obfuscator</AlertTitle>
        <AlertDescription className="text-gray-300">
          This tool uses a multi-layered approach to obfuscate your PHP code, making it extremely difficult to reverse
          engineer.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="obfuscator" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a]">
          <TabsTrigger
            value="obfuscator"
            className="data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d]"
          >
            Obfuscator
          </TabsTrigger>
          <TabsTrigger value="options" className="data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d]">
            Options
          </TabsTrigger>
        </TabsList>

        <TabsContent value="obfuscator" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="input-code" className="text-gray-300 flex items-center gap-2">
                <Code className="h-4 w-4 text-[#00ff9d]" />
                Input PHP Code
              </Label>
              <Textarea
                id="input-code"
                placeholder="Enter your PHP code here..."
                className="font-mono h-[400px] bg-[#0d0d0f] border-[#2a2a3a] text-gray-200"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="output-code" className="text-gray-300 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#00ff9d]" />
                  Obfuscated Code
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        disabled={!outputCode}
                        className="text-gray-400 hover:text-[#00ff9d] hover:bg-[#2a2a3a]"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="output-code"
                readOnly
                className="font-mono h-[400px] bg-[#0d0d0f] border-[#2a2a3a] text-gray-200"
                value={outputCode}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleObfuscate}
              disabled={isObfuscating || !inputCode.trim()}
              className="bg-[#2a2a3a] hover:bg-[#3a3a4a] text-[#00ff9d] border border-[#00ff9d]/30 hover:border-[#00ff9d] transition-all duration-300"
            >
              {isObfuscating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Obfuscating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Obfuscate Code
                </>
              )}
            </Button>
          </div>

          {/* Strength Meter */}
          {outputCode && (
            <div className="mt-6 p-4 bg-[#1a1a1a] border border-[#2a2a3a] rounded-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                <h3 className="text-gray-300 font-semibold mb-2 md:mb-0">Obfuscation Strength</h3>
                <div className="flex items-center">
                  <Badge className={`${strengthMetrics.color} bg-transparent border border-current`}>
                    {strengthMetrics.level} Protection
                  </Badge>
                  <span className="ml-2 text-gray-400 text-sm">{strengthMetrics.score}/100</span>
                </div>
              </div>

              <Progress
                value={strengthMetrics.score}
                max={100}
                className="h-2 bg-[#2a2a3a]"
                style={
                  {
                    "--progress-background":
                      strengthMetrics.score >= 80
                        ? "#00ff9d"
                        : strengthMetrics.score >= 60
                          ? "#10b981"
                          : strengthMetrics.score >= 40
                            ? "#f59e0b"
                            : strengthMetrics.score >= 20
                              ? "#f97316"
                              : "#ef4444",
                  } as React.CSSProperties
                }
              />

              <div className="mt-4">
                <button
                  onClick={() => setShowFactors(!showFactors)}
                  className="text-sm text-gray-400 hover:text-[#00ff9d] flex items-center"
                >
                  {showFactors ? "Hide details" : "Show details"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`ml-1 transition-transform ${showFactors ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {showFactors && (
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {strengthMetrics.factors.map((factor, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-400">{factor.factor}</span>
                        <span className="text-gray-300">+{factor.impact} points</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="options" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-[#1a1a1a] p-4 rounded-md border border-[#2a2a3a]">
              <h3 className="text-lg font-semibold text-[#00ff9d]">Basic Options</h3>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="removeComments"
                  checked={options.removeComments}
                  onChange={(e) => handleOptionChange("removeComments", e.target.checked)}
                  className="rounded border-[#2a2a3a] bg-[#0d0d0f] text-[#00ff9d] focus:ring-[#00ff9d]"
                />
                <Label htmlFor="removeComments" className="text-gray-300">
                  Remove Comments
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="obfuscateVariables"
                  checked={options.obfuscateVariables}
                  onChange={(e) => handleOptionChange("obfuscateVariables", e.target.checked)}
                  className="rounded border-[#2a2a3a] bg-[#0d0d0f] text-[#00ff9d] focus:ring-[#00ff9d]"
                />
                <Label htmlFor="obfuscateVariables" className="text-gray-300">
                  Obfuscate Variable Names
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="encodeStrings"
                  checked={options.encodeStrings}
                  onChange={(e) => handleOptionChange("encodeStrings", e.target.checked)}
                  className="rounded border-[#2a2a3a] bg-[#0d0d0f] text-[#00ff9d] focus:ring-[#00ff9d]"
                />
                <Label htmlFor="encodeStrings" className="text-gray-300">
                  Encode String Literals
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="addJunkCode"
                  checked={options.addJunkCode}
                  onChange={(e) => handleOptionChange("addJunkCode", e.target.checked)}
                  className="rounded border-[#2a2a3a] bg-[#0d0d0f] text-[#00ff9d] focus:ring-[#00ff9d]"
                />
                <Label htmlFor="addJunkCode" className="text-gray-300">
                  Add Junk Code
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="obfuscateControlFlow"
                  checked={options.obfuscateControlFlow}
                  onChange={(e) => handleOptionChange("obfuscateControlFlow", e.target.checked)}
                  className="rounded border-[#2a2a3a] bg-[#0d0d0f] text-[#00ff9d] focus:ring-[#00ff9d]"
                />
                <Label htmlFor="obfuscateControlFlow" className="text-gray-300">
                  Obfuscate Control Flow
                </Label>
              </div>
            </div>

            <div className="space-y-4 bg-[#1a1a1a] p-4 rounded-md border border-[#2a2a3a]">
              <h3 className="text-lg font-semibold text-[#00ff9d]">Advanced Protection</h3>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="encryptionLayer"
                  checked={options.encryptionLayer}
                  onChange={(e) => handleOptionChange("encryptionLayer", e.target.checked)}
                  className="rounded border-[#2a2a3a] bg-[#0d0d0f] text-[#00ff9d] focus:ring-[#00ff9d]"
                />
                <Label htmlFor="encryptionLayer" className="text-gray-300">
                  Add Encryption Layer
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="antiDebugging"
                  checked={options.antiDebugging}
                  onChange={(e) => handleOptionChange("antiDebugging", e.target.checked)}
                  className="rounded border-[#2a2a3a] bg-[#0d0d0f] text-[#00ff9d] focus:ring-[#00ff9d]"
                />
                <Label htmlFor="antiDebugging" className="text-gray-300">
                  Add Anti-Debugging Measures
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="addExpiration"
                  checked={options.addExpiration}
                  onChange={(e) => handleOptionChange("addExpiration", e.target.checked)}
                  className="rounded border-[#2a2a3a] bg-[#0d0d0f] text-[#00ff9d] focus:ring-[#00ff9d]"
                />
                <Label htmlFor="addExpiration" className="text-gray-300">
                  Add Expiration Date
                </Label>
              </div>

              {options.addExpiration && (
                <div className="pl-6 space-y-2">
                  <Label htmlFor="expirationDays" className="text-gray-300">
                    Expires after (days):
                  </Label>
                  <input
                    type="number"
                    id="expirationDays"
                    min="1"
                    max="365"
                    value={options.expirationDays}
                    onChange={(e) => handleOptionChange("expirationDays", Number.parseInt(e.target.value) || 30)}
                    className="w-full rounded bg-[#0d0d0f] border-[#2a2a3a] text-gray-200 focus:ring-[#00ff9d] focus:border-[#00ff9d]"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-4 rounded-md border border-[#2a2a3a]">
            <h3 className="text-lg font-semibold text-[#00ff9d] mb-2">About This Obfuscator</h3>
            <p className="text-gray-300 text-sm">
              This PHP obfuscator uses a multi-layered approach to protect your code from reverse engineering. It
              combines variable renaming, string encoding, control flow obfuscation, and more to create highly
              obfuscated code that is extremely difficult to understand while maintaining full functionality.
            </p>
            <Separator className="my-4 bg-[#2a2a3a]" />
            <p className="text-gray-400 text-xs">
              Note: While this obfuscator makes your code difficult to read and understand, it does not provide absolute
              security. Critical business logic and sensitive information should be kept server-side.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
