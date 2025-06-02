"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, RefreshCw } from "lucide-react"

interface CaptchaProps {
  captchaId: string
  question: string
  onVerify: (id: string, answer: string) => Promise<boolean>
  onSuccess: () => void
}

export default function CaptchaChallenge({ captchaId, question, onVerify, onSuccess }: CaptchaProps) {
  const [answer, setAnswer] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!answer.trim()) {
      setError("Please enter an answer")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const success = await onVerify(captchaId, answer)

      if (success) {
        onSuccess()
      } else {
        setError("Incorrect answer. Please try again.")
        setAttempts((prev) => prev + 1)
        setAnswer("")
      }
    } catch (error) {
      setError("Verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="bg-[#0f0f13] border-[#2a2a3a] max-w-md mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="font-mono text-[#00ff9d] text-xl sm:text-2xl flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Security Verification
        </CardTitle>
        <CardDescription className="font-mono text-gray-400 text-sm">
          Please complete this challenge to continue
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a1a] border border-[#2a2a3a] rounded-md">
              <p className="font-mono text-gray-200 text-center text-lg">{question}</p>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter your answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="font-mono bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 h-12 text-base"
                autoComplete="off"
              />

              {error && <p className="text-red-400 font-mono text-sm">{error}</p>}

              {attempts > 2 && <p className="text-amber-400 font-mono text-sm">Hint: The answer is a simple number</p>}
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 px-4 sm:px-6">
        <Button
          type="button"
          variant="outline"
          className="font-mono border-[#2a2a3a] text-gray-300 hover:bg-[#2a2a3a] hover:text-white w-full sm:w-auto h-12"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          New Challenge
        </Button>

        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isVerifying || !answer.trim()}
          className="font-mono bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] hover:from-[#00b8ff] hover:to-[#00ff9d] text-black w-full sm:w-auto h-12"
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </CardFooter>
    </Card>
  )
}
