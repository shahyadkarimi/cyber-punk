"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] p-4">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="text-center">
            <Mail className="mx-auto h-12 w-12 text-[#00ff9d] mb-4" />
            <CardTitle className="text-2xl font-mono text-[#00ff9d]">Check Your Email</CardTitle>
            <CardDescription className="text-gray-400">We've sent a password reset link to {email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-[#00ff9d] text-black hover:bg-[#00e68a] font-mono">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] p-4">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#2a2a3a]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-mono text-[#00ff9d]">Reset Password</CardTitle>
          <CardDescription className="text-gray-400">Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#2a2a3a] border-[#3a3a4a] text-white focus:border-[#00ff9d]"
                placeholder="user@XTeamSecurity.com"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ff9d] text-black hover:bg-[#00e68a] font-mono"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-[#00ff9d] hover:underline flex items-center justify-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
