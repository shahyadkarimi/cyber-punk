"use client"

import { useEffect, useState, useCallback } from "react"
import { domainsService, type DomainWithSeller } from "@/lib/database-services/domains-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DomainForm from "./domain-form"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  Search,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Globe,
  Clock,
} from "lucide-react"
import type { Domain } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  sold: "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

export default function DomainsManagement() {
  const { user } = useAuth()
  const [domains, setDomains] = useState<DomainWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [editingDomain, setEditingDomain] = useState<DomainWithSeller | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [stats, setStats] = useState<any>({})
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10) // Or make this configurable
  const [totalDomains, setTotalDomains] = useState(0)

  const fetchDomainsAndStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const [{ domains: fetchedDomains, count }, domainStats] = await Promise.all([
        domainsService.getDomains(searchTerm, statusFilter, categoryFilter, undefined, undefined, page, pageSize),
        domainsService.getDomainStats(),
      ])
      setDomains(fetchedDomains)
      setStats(domainStats)
      setTotalDomains(count)
    } catch (error) {
      toast({ title: "Error fetching domains", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter, categoryFilter, page, pageSize])

  useEffect(() => {
    fetchDomainsAndStats()
  }, [fetchDomainsAndStats])

  const handleFormSubmit = async (domainData: Partial<Domain>) => {
    if (!user?.id) {
      toast({ title: "Authentication Error", description: "Admin user ID not found.", variant: "destructive" })
      return
    }
    try {
      if (editingDomain) {
        await domainsService.updateDomain(editingDomain.id, domainData, user.id)
        toast({
          title: "Domain Updated",
          description: `${domainData.domain || editingDomain.domain} has been updated.`,
        })
      } else {
        await domainsService.createDomain(domainData, user.id)
        toast({ title: "Domain Created", description: `${domainData.domain} has been created.` })
      }
      setEditingDomain(null)
      setIsFormOpen(false)
      fetchDomainsAndStats() // Refresh data
    } catch (error) {
      toast({ title: "Error saving domain", description: (error as Error).message, variant: "destructive" })
    }
  }

  const handleEdit = (domain: DomainWithSeller) => {
    setEditingDomain(domain)
    setIsFormOpen(true)
  }

  const handleAddNew = () => {
    setEditingDomain(null)
    setIsFormOpen(true)
  }

  const handleDelete = async (domainId: string, domainName: string) => {
    if (window.confirm(`Are you sure you want to delete ${domainName}? This action cannot be undone.`)) {
      try {
        await domainsService.deleteDomain(domainId)
        toast({ title: "Domain Deleted", description: `${domainName} has been deleted.` })
        fetchDomainsAndStats() // Refresh data
      } catch (error) {
        toast({ title: "Error deleting domain", description: (error as Error).message, variant: "destructive" })
      }
    }
  }

  const handleQuickStatusChange = async (domain: DomainWithSeller, newStatus: "approved" | "rejected") => {
    if (!user?.id) {
      toast({ title: "Authentication Error", description: "Admin user ID not found.", variant: "destructive" })
      return
    }
    try {
      await domainsService.updateDomain(domain.id, { status: newStatus }, user.id)
      toast({ title: "Status Updated", description: `${domain.domain} status changed to ${newStatus}.` })
      fetchDomainsAndStats()
    } catch (error) {
      toast({ title: "Error updating status", description: (error as Error).message, variant: "destructive" })
    }
  }

  const totalPages = Math.ceil(totalDomains / pageSize)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { title: "Total Domains", value: stats.totalDomains, icon: Globe },
          { title: "Pending Approval", value: stats.pendingDomains, icon: Clock },
          { title: "Approved Domains", value: stats.approvedDomains, icon: CheckCircle },
          { title: "Rejected Domains", value: stats.rejectedDomains, icon: XCircle },
          { title: "Total Revenue", value: `$${stats.totalRevenue?.toFixed(2)}`, icon: DollarSign },
        ].map((stat) => (
          <div key={stat.title} className="bg-[#1a1a1a] border border-[#2a2a3a] p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{stat.title}</p>
              <stat.icon className="h-5 w-5 text-[#00ff9d]" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{stat.value ?? "0"}</p>
          </div>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search domains (name, desc, seller...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="pl-10 bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value === "all" ? "" : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2a2a3a] text-white">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAddNew} className="w-full md:w-auto bg-[#00ff9d] text-black hover:bg-[#00cc88]">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Domain
        </Button>
        <Button
          onClick={() => fetchDomainsAndStats()}
          variant="outline"
          className="w-full md:w-auto text-[#00ff9d] border-[#00ff9d] hover:bg-[#00ff9d]/10"
        >
          <RefreshCw className="mr-2 h-5 w-5" /> Refresh
        </Button>
      </div>

      {/* Domains Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-10 w-10 text-[#00ff9d] animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1a1a1a] border border-[#2a2a3a] rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="border-b-[#2a2a3a]">
                <TableHead className="text-[#00ff9d]">Domain</TableHead>
                <TableHead className="text-[#00ff9d]">Price</TableHead>
                <TableHead className="text-[#00ff9d]">Status</TableHead>
                <TableHead className="text-[#00ff9d]">Seller</TableHead>
                <TableHead className="text-[#00ff9d]">DA/PA</TableHead>
                <TableHead className="text-[#00ff9d]">Traffic</TableHead>
                <TableHead className="text-[#00ff9d]">Category</TableHead>
                <TableHead className="text-right text-[#00ff9d]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id} className="border-b-[#2a2a3a] hover:bg-[#22222a]">
                  <TableCell className="font-medium text-white">{domain.domain}</TableCell>
                  <TableCell className="text-gray-300">${domain.price?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[domain.status || "pending"]} border`}>{domain.status}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {domain.seller?.username || domain.seller?.email || "N/A"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {domain.da_score || "-"}/{domain.pa_score || "-"}
                  </TableCell>
                  <TableCell className="text-gray-300">{domain.traffic || "-"}</TableCell>
                  <TableCell className="text-gray-300">{domain.category || "-"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {domain.status === "pending" && (
                      <>
                        <Button
                          onClick={() => handleQuickStatusChange(domain, "approved")}
                          size="sm"
                          variant="ghost"
                          className="text-green-400 hover:text-green-300 p-1 h-auto"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleQuickStatusChange(domain, "rejected")}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 p-1 h-auto"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => handleEdit(domain)}
                      size="sm"
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300 p-1 h-auto"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(domain.id, domain.domain)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-400 p-1 h-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {domains.length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-400">
              No domains found. Try adjusting your filters or add a new domain.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1 || isLoading}
            className="text-[#00ff9d] border-[#00ff9d] hover:bg-[#00ff9d]/10 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages || isLoading}
            className="text-[#00ff9d] border-[#00ff9d] hover:bg-[#00ff9d]/10 disabled:opacity-50"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Dialog for Add/Edit Domain */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen)
          if (!isOpen) setEditingDomain(null)
        }}
      >
        <DialogContent className="bg-[#141414] border-[#2a2a3a] text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#00ff9d] text-2xl">
              {editingDomain ? "Edit Domain" : "Add New Domain"}
            </DialogTitle>
          </DialogHeader>
          <DomainForm
            initialData={editingDomain}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingDomain(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
