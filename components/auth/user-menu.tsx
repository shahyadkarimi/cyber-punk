"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings, Shield, LayoutDashboard, ChevronDown, Wallet, HelpCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await logout()
      setIsOpen(false)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigation = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-[#2a2a3a] text-gray-300 hover:bg-[#2a2a3a] hover:text-white transition-colors"
        >
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="bg-[#00ff9d] text-black hover:bg-[#00e68a] transition-all duration-200 shadow-lg hover:shadow-xl font-mono"
        >
          <Link href="/auth/signup">Get Started</Link>
        </Button>
      </div>
    )
  }

  const userInitials = user.email?.charAt(0).toUpperCase() || "U"
  const username = user?.username || user.email?.split("@")[0] || "User"
  const role = user?.role || "client"
  const balance = user?.balance || 0

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-pink-500"
      case "seller":
        return "bg-gradient-to-r from-[#00b8ff] to-[#00ff9d]"
      default:
        return "bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]"
    }
  }

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      color: "text-[#00b8ff]",
    },
    {
      icon: User,
      label: "Profile",
      path: "/dashboard/profile",
      color: "text-[#9d00ff]",
    },
    {
      icon: Wallet,
      label: "Wallet",
      path: "/dashboard/wallet",
      color: "text-[#00ff9d]",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/dashboard/settings",
      color: "text-gray-400",
    },
  ]

  if (role === "admin") {
    menuItems.push({
      icon: Shield,
      label: "Admin Panel",
      path: "/dashboard/users",
      color: "text-red-400",
    })
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="relative flex items-center space-x-3 h-12 px-4 rounded-xl hover:bg-[#2a2a3a] transition-all duration-200 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative">
          <Avatar className="h-9 w-9 ring-2 ring-[#00ff9d] shadow-lg">
            <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={username} />
            <AvatarFallback className={`${getRoleColor(role)} text-white font-semibold`}>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00ff9d] rounded-full border-2 border-[#1a1a1a]"></div>
        </div>

        <div className="hidden xl:flex flex-col items-start">
          <span className="text-sm font-semibold text-white">{username}</span>
          <span className="text-xs text-gray-400 capitalize">{role}</span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:text-[#00ff9d] ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#2a2a3a] z-50 overflow-hidden">
            {/* Header */}
            <div className={`${getRoleColor(role)} p-6 text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative flex items-center space-x-4">
                <Avatar className="h-12 w-12 ring-2 ring-white/20">
                  <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={username} />
                  <AvatarFallback className="bg-white/20 text-white font-semibold">{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{username}</h3>
                  <p className="text-white/80 text-sm">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="bg-black/30 px-2 py-1 rounded-full text-xs font-medium capitalize border border-white/20">
                      {role}
                    </span>
                    <span className="bg-black/30 px-2 py-1 rounded-full text-xs font-medium border border-white/20">
                      ${balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#2a2a3a] transition-colors duration-200 group"
                >
                  <div className="p-2 rounded-lg bg-[#2a2a3a] group-hover:bg-[#3a3a4a] transition-colors">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="font-medium text-white">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-[#2a2a3a] my-2"></div>

            {/* Footer Actions */}
            <div className="p-2">
              <button
                onClick={() => handleNavigation("/help")}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-[#2a2a3a] transition-colors duration-200 group"
              >
                <div className="p-2 rounded-lg bg-[#2a2a3a] group-hover:bg-[#3a3a4a] transition-colors">
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
                <span className="font-medium text-white">Help & Support</span>
              </button>

              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors duration-200 group"
              >
                <div className="p-2 rounded-lg bg-[#2a2a3a] group-hover:bg-red-500/20 transition-colors">
                  <LogOut className="h-4 w-4 text-red-400" />
                </div>
                <span className="font-medium text-red-400">{isLoading ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
