"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, CheckCircle, Clock, Globe, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { UserWallet } from "@/components/user-wallet"
import Link from "next/link"

interface ClientStats {
  totalPurchases: number
  watchlistCount: number
  availableDomains: number
  recentDomains: any[]
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<ClientStats>({
    totalPurchases: 0,
    watchlistCount: 0,
    availableDomains: 0,
    recentDomains: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClientStats()
  }, [])

  const fetchClientStats = async () => {
    try {
      // Fetch available domains
      const { data: domains, count: domainsCount } = await supabase
        .from("domains")
        .select(
          `
          *,
          seller:users!domains_seller_id_fkey(username, email)
        `,
          { count: "exact" },
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6)

      setStats({
        totalPurchases: 0, // TODO: Implement purchases tracking
        watchlistCount: 0, // TODO: Implement watchlist
        availableDomains: domainsCount || 0,
        recentDomains: domains || [],
      })
    } catch (error) {
      console.error("Error fetching client stats:", error)
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
          <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
          <p className="text-gray-400">Discover and purchase premium domains</p>
        </div>
        <Button asChild className="bg-[#00ff9d] text-black hover:bg-[#00e68a]">
          <Link href="/domains">
            <Search className="h-4 w-4 mr-2" />
            Browse Domains
          </Link>
        </Button>
      </div>

      {/* User Wallet */}
      <UserWallet />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Available Domains</CardTitle>
            <Globe className="h-4 w-4 text-[#00ff9d]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.availableDomains}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">My Purchases</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPurchases}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Watchlist</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.watchlistCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Cart Items</CardTitle>
            <ShoppingCart className="h-4 w-4 text-[#00ff9d]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Available Domains */}
      <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
        <CardHeader>
          <CardTitle className="text-white">Recently Listed Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentDomains.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Globe className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No domains available yet</p>
              </div>
            ) : (
              stats.recentDomains.map((domain) => (
                <div key={domain.id} className="p-4 bg-[#2a2a3a] rounded-lg">
                  <h3 className="font-medium text-white mb-2">{domain.domain}</h3>
                  <p className="text-sm text-gray-400 mb-2">{domain.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#00ff9d]">
                      ${domain.price?.toLocaleString() || "Contact"}
                    </span>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <Button className="w-full mt-3 bg-[#00ff9d] text-black hover:bg-[#00e68a]">View Details</Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
