"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, DollarSign, Clock, CheckCircle, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface SellerStats {
  totalDomains: number
  pendingDomains: number
  approvedDomains: number
  totalEarnings: number
  myDomains: any[]
}

export default function SellerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<SellerStats>({
    totalDomains: 0,
    pendingDomains: 0,
    approvedDomains: 0,
    totalEarnings: 0,
    myDomains: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSellerStats()
    }
  }, [user])

  const fetchSellerStats = async () => {
    if (!user) return

    try {
      const { data: domains } = await supabase
        .from("domains")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })

      const totalDomains = domains?.length || 0
      const pendingDomains = domains?.filter((d) => d.status === "pending").length || 0
      const approvedDomains = domains?.filter((d) => d.status === "approved").length || 0
      const totalEarnings = domains?.filter((d) => d.status === "sold").reduce((sum, d) => sum + (d.price || 0), 0) || 0

      setStats({
        totalDomains,
        pendingDomains,
        approvedDomains,
        totalEarnings,
        myDomains: domains || [],
      })
    } catch (error) {
      console.error("Error fetching seller stats:", error)
    } finally {
      setLoading(false)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Seller Dashboard</h1>
          <p className="text-gray-400">Manage your domain listings and sales</p>
        </div>
        <Button asChild className="bg-[#00ff9d] text-black hover:bg-[#00e68a]">
          <Link href="/dashboard/submit-domain">
            <Plus className="h-4 w-4 mr-2" />
            Submit Domain
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium text-gray-400">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.approvedDomains}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-[#00ff9d]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* My Domains */}
      <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
        <CardHeader>
          <CardTitle className="text-white">My Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.myDomains.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No domains submitted yet</p>
                <Button asChild className="mt-4 bg-[#00ff9d] text-black hover:bg-[#00e68a]">
                  <Link href="/dashboard/submit-domain">Submit Your First Domain</Link>
                </Button>
              </div>
            ) : (
              stats.myDomains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between p-4 bg-[#2a2a3a] rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{domain.domain}</h3>
                    <p className="text-sm text-gray-400">{domain.description}</p>
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
                              : domain.status === "sold"
                                ? "outline"
                                : "outline"
                      }
                    >
                      {domain.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
