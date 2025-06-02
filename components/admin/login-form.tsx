"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/admin-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate network delay
    setTimeout(() => {
      const success = login(username, password)

      if (success) {
        router.push("/mrzadmin/dashboard")
      } else {
        setError("Invalid username or password")
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <Card className="w-full max-w-md border-[#00ff9d] bg-black/80 text-white shadow-[0_0_15px_rgba(0,255,157,0.5)]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Admin Access</CardTitle>
        <CardDescription className="text-gray-400">Enter your credentials to access the admin panel</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-500 text-white">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-200">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-gray-900 border-gray-700 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-200">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-900 border-gray-700 text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/20"
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00ff9d] text-black hover:bg-[#00cc7d] transition-all duration-200"
          >
            {isLoading ? "Authenticating..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
        <p className="text-xs text-gray-400">Secure Access Only • Unauthorized Access Prohibited</p>
      </CardFooter>
    </Card>
  )
}
