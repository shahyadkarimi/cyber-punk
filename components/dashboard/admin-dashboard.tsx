"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Globe, DollarSign, CheckCircle, Clock, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  totalUsers: number
  totalDomains: number
  pendingDomains: number
  totalRevenue: number
  recentDomains: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDomains: 0,
    pendingDomains: 0,
    totalRevenue: 0,
    recentDomains: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })

      // Fetch domains stats
      const { data: domains, count: domainsCount } = await supabase.from("domains").select("*", { count: "exact" })

      const pendingCount = domains?.filter((d) => d.status === "pending").length || 0
      const totalRevenue = domains?.filter((d) => d.status === "sold").reduce((sum, d) => sum + (d.price || 0), 0) || 0

      // Fetch recent domains
      const { data: recentDomains } = await supabase
        .from("domains")
        .select(`
          *,
          seller:users!domains_seller_id_fkey(username, email)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      setStats({
        totalUsers: usersCount || 0,
        totalDomains: domainsCount || 0,
        pendingDomains: pendingCount,
        totalRevenue,
        recentDomains: recentDomains || [],
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDomainAction = async (domainId: string, action: "approve" | "reject") => {
    try {
      const { error } = await supabase
        .from("domains")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          approved_at: action === "approve" ? new Date().toISOString() : null,
          approved_by: action === "approve" ? (await supabase.auth.getUser()).data.user?.id : null,
        })
        .eq("id", domainId)

      if (!error) {
        fetchDashboardStats() // Refresh data
      }
    } catch (error) {
      console.error("Error updating domain:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00ff9d] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400">Manage users, domains, and platform operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-[#00ff9d]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Domains</CardTitle>
            <Globe className="h-4 w-4 text-[#00ff9d]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalDomains}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingDomains}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-[#00ff9d]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Domains */}
      <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
        <CardHeader>
          <CardTitle className="text-white">Recent Domain Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentDomains.map((domain) => (
              <div key={domain.id} className="flex items-center justify-between p-4 bg-[#2a2a3a] rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-white">{domain.domain}</h3>
                  <p className="text-sm text-gray-400">
                    Submitted by {domain.seller?.username || domain.seller?.email}
                  </p>
                  <p className="text-sm text-gray-400">Price: ${domain.price?.toLocaleString() || "Not set"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      domain.status === "approved"
                        ? "default"
                        : domain.status === "pending"
                          ? "secondary"
                          : domain.status === "rejected"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {domain.status}
                  </Badge>
                  {domain.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleDomainAction(domain.id, "approve")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDomainAction(domain.id, "reject")}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
