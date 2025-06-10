"use client"

import type React from "react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Globe,
  ShoppingCart,
  Settings,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Code,
  LogOut,
  Home,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userProfile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const role = userProfile?.role || "client"

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const adminNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/users", icon: Users, label: "Users" },
    { href: "/dashboard/exploits", icon: Shield, label: "Exploits" },
    { href: "/dashboard/shells", icon: Code, label: "Shells" },
    { href: "/dashboard/domains", icon: Globe, label: "Domains" },
    { href: "/dashboard/transactions", icon: DollarSign, label: "Transactions" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  const sellerNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/my-domains", icon: Globe, label: "My Domains" },
    { href: "/dashboard/submit-domain", icon: FileText, label: "Submit Domain" },
    { href: "/dashboard/sales", icon: DollarSign, label: "Sales" },
    { href: "/dashboard/profile", icon: Settings, label: "Profile" },
  ]

  const clientNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/marketplace", icon: ShoppingCart, label: "Marketplace" },
    { href: "/dashboard/purchases", icon: CheckCircle, label: "Purchases" },
    { href: "/dashboard/watchlist", icon: Clock, label: "Watchlist" },
    { href: "/dashboard/profile", icon: Settings, label: "Profile" },
  ]

  const getNavItems = () => {
    if (role === "admin") return adminNavItems
    if (role === "seller") return sellerNavItems
    return clientNavItems
  }

  const navItems = getNavItems()

  return (
    <div className="flex h-screen bg-[#0d0d0f] overflow-hidden">
      {/* Single Sidebar */}
      <div className="w-64 bg-[#1a1a1a] border-r border-[#2a2a3a] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a3a]">
          <h2 className="text-xl font-bold text-[#00ff9d]">
            {role === "admin" ? "Admin Panel" : role === "seller" ? "Seller Dashboard" : "Client Dashboard"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">Welcome, {userProfile?.username || user?.email?.split("@")[0]}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "bg-[#00ff9d]/20 text-[#00ff9d]" : "text-gray-400 hover:bg-[#2a2a3a] hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#2a2a3a] space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-[#2a2a3a] hover:text-white transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Back to Site</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
