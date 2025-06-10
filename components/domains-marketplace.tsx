"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  SortDesc,
  Grid,
  List,
  TrendingUp,
  Globe,
  Users,
  DollarSign,
  Star,
  Clock,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DomainCard } from "@/components/domain-card"
import { DomainFilters } from "@/components/domain-filters"
import { domainsService } from "@/lib/database-services/domains-service"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import type { DomainWithSeller } from "@/lib/database-services/domains-service"

export function DomainsMarketplace() {
  const { user } = useAuth()
  const isSeller = user?.role === "seller" || user?.role === "admin"

  const [domains, setDomains] = useState<DomainWithSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState({
    totalDomains: 0,
    averagePrice: 0,
    totalRevenue: 0,
    categories: [] as string[],
    topCategory: "",
    newestDomain: new Date(),
  })

  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    minDA: "",
    maxDA: "",
    minPA: "",
    maxPA: "",
    minTraffic: "",
    status: "approved",
  })

  const pageSize = 12

  // Fetch domains with filters
  const fetchDomains = async () => {
    setLoading(true)
    try {
      const { domains: fetchedDomains, count } = await domainsService.getDomains(
        searchTerm,
        filters.status,
        filters.category,
        filters.minPrice ? Number.parseFloat(filters.minPrice) : undefined,
        filters.maxPrice ? Number.parseFloat(filters.maxPrice) : undefined,
        currentPage,
        pageSize,
      )

      // Apply additional filters
      let filteredDomains = fetchedDomains.filter((domain) => {
        if (filters.minDA && domain.da_score && domain.da_score < Number.parseFloat(filters.minDA)) return false
        if (filters.maxDA && domain.da_score && domain.da_score > Number.parseFloat(filters.maxDA)) return false
        if (filters.minPA && domain.pa_score && domain.pa_score < Number.parseFloat(filters.minPA)) return false
        if (filters.maxPA && domain.pa_score && domain.pa_score > Number.parseFloat(filters.maxPA)) return false
        if (filters.minTraffic && domain.traffic && domain.traffic < Number.parseFloat(filters.minTraffic)) return false
        return true
      })

      // Apply sorting
      filteredDomains = filteredDomains.sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          case "oldest":
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          case "price-low":
            return (a.price || 0) - (b.price || 0)
          case "price-high":
            return (b.price || 0) - (a.price || 0)
          case "da-high":
            return (b.da_score || 0) - (a.da_score || 0)
          case "traffic-high":
            return (b.traffic || 0) - (a.traffic || 0)
          default:
            return 0
        }
      })

      setDomains(filteredDomains)
      setTotalCount(count)

      // Find newest domain date and top category
      if (filteredDomains.length > 0) {
        const newestDate = new Date(Math.max(...filteredDomains.map((d) => new Date(d.created_at).getTime())))

        // Find top category
        const categoryCount: Record<string, number> = {}
        filteredDomains.forEach((domain) => {
          if (domain.category) {
            categoryCount[domain.category] = (categoryCount[domain.category] || 0) + 1
          }
        })

        let topCategory = ""
        let maxCount = 0
        Object.entries(categoryCount).forEach(([category, count]) => {
          if (count > maxCount) {
            maxCount = count
            topCategory = category
          }
        })

        setStats((prev) => ({
          ...prev,
          newestDomain: newestDate,
          topCategory,
        }))
      }
    } catch (error) {
      console.error("Error fetching domains:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const domainStats = await domainsService.getDomainStats()
      const { domains: allDomains } = await domainsService.getDomains("", "approved", "", undefined, undefined, 1, 1000)

      // Only calculate sales stats for sellers
      let averagePrice = 0
      let totalRevenue = 0

      if (isSeller) {
        // For sellers, filter domains to only show their own sales
        const sellerDomains = allDomains.filter((d) => d.seller?.id === user?.id)
        averagePrice =
          sellerDomains.length > 0
            ? sellerDomains.reduce((sum, d) => sum + (d.price || 0), 0) / sellerDomains.length
            : 0

        // Get seller's total revenue
        const { data: soldDomains } = await supabase
          .from("domains")
          .select("price")
          .eq("status", "sold")
          .eq("seller_id", user?.id)

        totalRevenue = soldDomains?.reduce((sum, d) => sum + (d.price || 0), 0) || 0
      }

      const categories = [...new Set(allDomains.map((d) => d.category).filter(Boolean))]

      setStats({
        totalDomains: domainStats.approvedDomains,
        averagePrice,
        totalRevenue,
        categories,
        topCategory: "",
        newestDomain: new Date(),
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    fetchDomains()
  }, [searchTerm, sortBy, currentPage, filters])

  useEffect(() => {
    fetchStats()
  }, [isSeller, user?.id])

  const totalPages = Math.ceil(totalCount / pageSize)

  // Format the newest domain date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Premium Domain Marketplace</h2>
              <p className="text-lg text-slate-300 max-w-2xl">
                Discover high-value domains with excellent SEO metrics and growth potential
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Domains</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalDomains}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isSeller ? (
          // Show sales stats only to sellers
          <>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Your Avg. Price</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      ${stats.averagePrice.toFixed(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Your Total Sales</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      ${stats.totalRevenue.toFixed(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          // Show alternative stats for regular users
          <>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-amber-950 dark:to-amber-900 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Latest Addition</p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                      {formatDate(stats.newestDomain)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 dark:from-indigo-950 dark:to-indigo-900 dark:border-indigo-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Tag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Top Category</p>
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 capitalize">
                      {stats.topCategory || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950 dark:to-orange-900 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Categories</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-slate-200 dark:border-slate-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600">
                  <SortDesc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="da-high">Highest DA Score</SelectItem>
                  <SelectItem value="traffic-high">Highest Traffic</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && <DomainFilters filters={filters} onFiltersChange={setFilters} categories={stats.categories} />}

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600 dark:text-slate-400">
          Showing {domains.length} of {totalCount} domains
        </p>
        <div className="flex items-center gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || key === "status") return null
            return (
              <Badge
                key={key}
                variant="secondary"
                className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                {key}: {value}
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, [key]: "" }))}
                  className="ml-2 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Domains Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      ) : domains.length === 0 ? (
        <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="text-center py-20">
            <Globe className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No domains found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {domains.map((domain) => (
            <DomainCard key={domain.id} domain={domain} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-slate-200 dark:border-slate-600"
              >
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="border-slate-200 dark:border-slate-600"
                  >
                    {page}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-slate-200 dark:border-slate-600"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
