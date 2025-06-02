"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// This would come from your domains service
type Domain = {
  id: string
  name: string
  price: number
  status: "pending" | "approved" | "rejected" | "sold"
  created_at: string
  description?: string
  category?: string
}

export default function MyDomainsList() {
  const { user } = useAuth()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filter, setFilter] = useState<{ status?: string; search?: string }>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    // This would be replaced with your actual API call
    const fetchDomains = async () => {
      setLoading(true)
      try {
        // Mock data for demonstration
        const mockDomains: Domain[] = [
          {
            id: "1",
            name: "example.com",
            price: 1999.99,
            status: "approved",
            created_at: new Date().toISOString(),
            description: "A premium domain name",
            category: "Premium",
          },
          {
            id: "2",
            name: "cyberpunk-domains.net",
            price: 499.99,
            status: "pending",
            created_at: new Date().toISOString(),
            description: "Cyberpunk themed domain",
            category: "Technology",
          },
          {
            id: "3",
            name: "hacktheplanet.io",
            price: 799.99,
            status: "approved",
            created_at: new Date().toISOString(),
            description: "Perfect for tech communities",
            category: "Technology",
          },
          {
            id: "4",
            name: "neonbytes.tech",
            price: 299.99,
            status: "rejected",
            created_at: new Date().toISOString(),
            description: "Futuristic tech domain",
            category: "Technology",
          },
          {
            id: "5",
            name: "digitalfrontier.co",
            price: 899.99,
            status: "sold",
            created_at: new Date().toISOString(),
            description: "Digital business domain",
            category: "Business",
          },
        ]

        // Filter domains based on filter state
        let filteredDomains = [...mockDomains]

        if (filter.status) {
          filteredDomains = filteredDomains.filter((domain) => domain.status === filter.status)
        }

        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          filteredDomains = filteredDomains.filter(
            (domain) =>
              domain.name.toLowerCase().includes(searchLower) ||
              domain.description?.toLowerCase().includes(searchLower),
          )
        }

        setDomains(filteredDomains)
        setTotalCount(filteredDomains.length)
      } catch (err: any) {
        setError(err.message || "Failed to fetch domains")
      } finally {
        setLoading(false)
      }
    }

    fetchDomains()
  }, [user, page, filter])

  const handleFilterChange = (key: string, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filter changes
  }

  const clearFilters = () => {
    setFilter({})
    setPage(1)
  }

  const handleDeleteClick = (domain: Domain) => {
    setSelectedDomain(domain)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDomain) return

    // This would be your actual delete API call
    try {
      // Mock deletion
      setDomains(domains.filter((d) => d.id !== selectedDomain.id))
      setDeleteDialogOpen(false)
      setSelectedDomain(null)
    } catch (err: any) {
      setError(err.message || "Failed to delete domain")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "sold":
        return <Badge className="bg-blue-500">Sold</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <>
      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardHeader className="bg-black/40 border-b border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-bold text-[#00ff9d]">My Domain Listings</CardTitle>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/submit-domain">
                <Button className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Domain
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-700 hover:bg-gray-800"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <div className="p-4 bg-black/30 border-b border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Status</label>
                <Select value={filter.status || ""} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="bg-black/50 border-gray-700">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search domains..."
                    value={filter.search || ""}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-8 bg-black/50 border-gray-700"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#00ff9d]" />
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">
              <p>{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4 border-gray-700 hover:bg-gray-800"
              >
                Try Again
              </Button>
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <p>You haven't listed any domains yet.</p>
              <Link href="/dashboard/submit-domain">
                <Button className="mt-4 bg-[#00ff9d] text-black hover:bg-[#00cc7d]">Add Your First Domain</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Domain Name</TableHead>
                    <TableHead className="text-gray-400">Price</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-400">Listed On</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow key={domain.id} className="border-gray-800 hover:bg-black/40">
                      <TableCell className="font-medium">{domain.name}</TableCell>
                      <TableCell className="font-mono">{formatPrice(domain.price)}</TableCell>
                      <TableCell>{getStatusBadge(domain.status)}</TableCell>
                      <TableCell>{domain.category || "N/A"}</TableCell>
                      <TableCell>{formatDate(domain.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-700 hover:bg-gray-800"
                            disabled={domain.status === "sold"}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-700 hover:bg-gray-800 hover:text-red-500"
                            onClick={() => handleDeleteClick(domain)}
                            disabled={domain.status === "sold"}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && domains.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-800">
              <div className="text-sm text-gray-400">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} domains
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-400">
                  Page {page} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-black border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-[#00ff9d]">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the domain <span className="font-semibold">{selectedDomain?.name}</span>?
            </p>
            <p className="text-gray-400 mt-2">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-gray-700 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
