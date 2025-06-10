"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect, type FormEvent } from "react"
import { useAuth } from "@/hooks/use-auth"
import { UsersService } from "@/lib/database-services/users-service"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { User, Shield, Mail, DollarSign, CalendarDays, Clock, Save, Loader2 } from "lucide-react"
import type { user } from "@/lib/database.types"

export default function ProfileClientPage() {
  const { user, refreshUser } = useAuth()
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setUsername(user.username || "")
      setFullName(user.full_name || "")
    }
  }, [user])

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !user) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const updates: Partial<user> = {
        id: user.id,
        username,
        full_name: fullName,
      }
      await UsersService.updateUser(user.id, updates)
      await refreshUser()
      toast({ title: "Success", description: "Profile updated successfully." })
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user && !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-[#00ff9d]" />
      </div>
    )
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    const names = name.split(" ")
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0]
    }
    return name.substring(0, 2)
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 max-w-4xl">
      <Card className="bg-[#1a1a1a] border-[#2a2a3a] text-gray-200">
        <CardHeader className="border-b border-[#2a2a3a] pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-[#00ff9d]">
                <AvatarFallback className="bg-[#2a2a3a] text-[#00ff9d] text-3xl font-bold">
                  {getInitials(fullName || username)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center sm:text-left">
              <CardTitle className="text-3xl sm:text-4xl font-bold text-[#00ff9d] mb-1">
                {fullName || username || "User Profile"}
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg flex items-center justify-center sm:justify-start">
                <Shield size={18} className="mr-2 text-[#00b8ff]" />
                Role: {user?.role || "N/A"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="username" className="text-gray-400 flex items-center mb-1">
                  <User size={16} className="mr-2 text-[#00ff9d]" /> Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#2a2a3a] border-[#3a3a4a] focus:border-[#00ff9d]"
                  placeholder="e.g. cyber_ninja"
                />
              </div>
              <div>
                <Label htmlFor="fullName" className="text-gray-400 flex items-center mb-1">
                  <User size={16} className="mr-2 text-[#00ff9d]" /> Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-[#2a2a3a] border-[#3a3a4a] focus:border-[#00ff9d]"
                  placeholder="e.g. Alex Ryder"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-400 flex items-center mb-1">
                <Mail size={16} className="mr-2 text-[#00ff9d]" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-[#2a2a3a] border-[#3a3a4a] opacity-70 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed here.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[#2a2a3a]">
              <InfoPill
                Icon={DollarSign}
                label="Balance"
                value={`$${user?.balance?.toFixed(2) || "0.00"}`}
                color="text-green-400"
              />
              <InfoPill
                Icon={CalendarDays}
                label="Joined"
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                color="text-sky-400"
              />
              <InfoPill
                Icon={Clock}
                label="Last Login"
                value={user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : "N/A"}
                color="text-purple-400"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00ff9d] text-[#1a1a1a] hover:bg-[#00e68a] font-semibold py-3 text-lg"
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save size={20} className="mr-2" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t border-[#2a2a3a] pt-6">
          <p className="text-xs text-gray-500 text-center w-full">
            For security changes like password reset or 2FA, please visit the{" "}
            <Link href="/dashboard/settings" className="text-[#00ff9d] hover:underline">
              Settings
            </Link>{" "}
            page.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

interface InfoPillProps {
  Icon: React.ElementType
  label: string
  value: string
  color?: string
}

const InfoPill: React.FC<InfoPillProps> = ({ Icon, label, value, color = "text-[#00ff9d]" }) => (
  <div className="bg-[#2a2a3a] p-4 rounded-lg flex items-center space-x-3">
    <Icon size={24} className={color} />
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-200">{value}</p>
    </div>
  </div>
)
