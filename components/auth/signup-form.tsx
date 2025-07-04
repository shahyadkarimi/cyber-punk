"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import type { UserRole } from "@/lib/database.types";
import { postData } from "@/services/API";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (!username.trim()) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    const registerResult = await register({
      email,
      password,
      username: username.trim(),
      full_name: username.trim(),
      role,
    });

    if (registerResult.success) {
      router.push("/dashboard");
      setSuccess(true);
    } else {
      setError(registerResult.error || "Register failed");
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] p-4">
        <Card className="w-full max-w-md bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-[#00ff9d] mb-4" />
            <CardTitle className="text-2xl font-mono text-[#00ff9d]">
              Registration Successful
            </CardTitle>
            <CardDescription className="text-gray-400">
              Check your email for a verification link to complete your
              registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#00ff9d]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] p-4">
      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#2a2a3a]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-mono text-[#00ff9d]">
            Request Access
          </CardTitle>
          <CardDescription className="text-gray-400">
            Create your XTeamSec account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300 font-mono">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#2a2a3a] border-[#3a3a4a] text-white focus:border-[#00ff9d]"
                placeholder="hacker_alias"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 font-mono">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#2a2a3a] border-[#3a3a4a] text-white focus:border-[#00ff9d]"
                placeholder="user@XTeamSec.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-300 font-mono">
                Account Type
              </Label>
              <Select
                value={role}
                onValueChange={(value: UserRole) => setRole(value)}
              >
                <SelectTrigger className="bg-[#2a2a3a] border-[#3a3a4a] text-white font-mono">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a3a] border-[#3a3a4a]">
                  <SelectItem
                    value="client"
                    className="text-white hover:bg-[#3a3a4a] font-mono"
                  >
                    🛒 Client - Browse and purchase domains
                  </SelectItem>
                  <SelectItem
                    value="seller"
                    className="text-white hover:bg-[#3a3a4a] font-mono"
                  >
                    💼 Seller - Submit domains for sale
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 font-mono">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#2a2a3a] border-[#3a3a4a] text-white focus:border-[#00ff9d] pr-10"
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-gray-300 font-mono"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[#2a2a3a] border-[#3a3a4a] text-white focus:border-[#00ff9d]"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00ff9d] text-black hover:bg-[#00e68a] font-mono"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Request Access"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-400">
              Already have access?{" "}
              <Link
                href="/auth/login"
                className="text-[#00ff9d] hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
