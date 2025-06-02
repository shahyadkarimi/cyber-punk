import type React from "react"
import { Users, Globe, Shield, BarChart3, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change >= 0

  return (
    <Card className="border-gray-800 bg-gray-900/50 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-gray-800 p-1.5 text-[#00ff9d]">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
          <span>{Math.abs(change)}% from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Users" value="2,543" change={12.5} icon={<Users className="h-full w-full" />} />
      <StatCard title="Backlinks Created" value="1,832" change={8.2} icon={<Globe className="h-full w-full" />} />
      <StatCard title="Security Alerts" value="5" change={-3.1} icon={<Shield className="h-full w-full" />} />
      <StatCard title="Revenue" value="$12,500" change={24.3} icon={<BarChart3 className="h-full w-full" />} />
    </div>
  )
}
