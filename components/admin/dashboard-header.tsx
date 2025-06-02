"use client"

import { Bell, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  toggleSidebar: () => void
  sidebarOpen: boolean
}

export function DashboardHeader({ toggleSidebar, sidebarOpen }: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState(3)

  return (
    <header className="flex h-14 items-center gap-4 border-b border-gray-800 bg-black px-4 lg:h-[60px]">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
        {sidebarOpen ? <X className="h-6 w-6 text-gray-400" /> : <Menu className="h-6 w-6 text-gray-400" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifications(0)}>
          <Bell className="h-5 w-5 text-gray-400" />
          {notifications > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-xs text-white">
              {notifications}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00ff9d] to-[#00a3ff]" />
          <div className="hidden text-sm font-medium text-white md:block">Admin</div>
        </div>
      </div>
    </header>
  )
}
