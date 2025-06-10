"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRole } from "@/lib/use-role"
import {
  AdminTransactionsService,
  type AdminTransaction,
  type AdminTransactionFilter,
  type TransactionStats,
} from "@/lib/database-services/admin-transactions-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Download,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

export default function TransactionsManagement() {
  const { user } = useAuth()
  const role = useRole()
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [filter, setFilter] = useState<AdminTransactionFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null)
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (role === "admin") {
      fetchTransactions()
      fetchStats()
    }
  }, [user, role, page, filter])

  const fetchTransactions = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await AdminTransactionsService.getAllTransactions(filter, page, pageSize)

      if (result.error) {
        setError(result.error.message || "Failed to fetch transactions")
      } else {
        setTransactions(result.data || [])
        setTotalCount(result.count)
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const result = await AdminTransactionsService.getTransactionStats()
      if (result.data) {
        setStats(result.data)
      }
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  const handleFilterChange = (key: keyof AdminTransactionFilter, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilter({})
    setPage(1)
  }

  const handleStatusUpdate = async () => {
    if (!selectedTransaction || !newStatus) return

    setUpdating(true)
    try {
      const result = await AdminTransactionsService.updateTransactionStatus(
        selectedTransaction.id,
        newStatus as any,
        adminNotes,
      )

      if (result.success) {
        setStatusUpdateDialog(false)
        setSelectedTransaction(null)
        setNewStatus("")
        setAdminNotes("")
        fetchTransactions()
        fetchStats()
      } else {
        setError(result.error?.message || "Failed to update transaction status")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      return
    }

    try {
      const result = await AdminTransactionsService.deleteTransaction(transactionId)

      if (result.success) {
        fetchTransactions()
        fetchStats()
      } else {
        setError(result.error?.message || "Failed to delete transaction")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    }
  }

  const handleExportTransactions = async () => {
    try {
      const result = await AdminTransactionsService.exportTransactions(filter)

      if (result.data) {
        // Convert to CSV and download
        const csv = convertToCSV(result.data)
        downloadCSV(csv, "transactions-export.csv")
      } else {
        setError(result.error?.message || "Failed to export transactions")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
    ].join("\n")

    return csvContent
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      case "refunded":
        return <Badge className="bg-blue-500">Refunded</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return <Badge className="bg-purple-500">Deposit</Badge>
      case "withdrawal":
        return <Badge className="bg-orange-500">Withdrawal</Badge>
      case "purchase":
        return <Badge className="bg-blue-500">Purchase</Badge>
      case "sale":
        return <Badge className="bg-green-500">Sale</Badge>
      case "refund":
        return <Badge className="bg-red-500">Refund</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (role !== "admin") {
    return (
      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            <p>Access denied. Admin privileges required.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-gray-800 bg-black/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-[#00ff9d]">{stats.totalTransactions}</p>
                </div>
                <DollarSign className="h-8 w-8 text-[#00ff9d]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-black/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-[#00ff9d]">{formatAmount(stats.completedAmount)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#00ff9d]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-black/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Amount</p>
                  <p className="text-2xl font-bold text-yellow-500">{formatAmount(stats.pendingAmount)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-800 bg-black/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Today's Transactions</p>
                  <p className="text-2xl font-bold text-[#00ff9d]">{stats.todayTransactions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-[#00ff9d]" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Transactions Table */}
      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardHeader className="bg-black/40 border-b border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-bold text-[#00ff9d]">Transactions Management</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-700 hover:bg-gray-800"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTransactions}
                className="border-gray-700 hover:bg-gray-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchTransactions()
                  fetchStats()
                }}
                className="border-gray-700 hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <div className="p-4 bg-black/30 border-b border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Status</label>
                <Select value={filter.status || ""} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="bg-black/50 border-gray-700">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Type</label>
                <Select value={filter.type || ""} onValueChange={(value) => handleFilterChange("type", value)}>
                  <SelectTrigger className="bg-black/50 border-gray-700">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={filter.startDate || ""}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="bg-black/50 border-gray-700"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={filter.endDate || ""}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="bg-black/50 border-gray-700"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search transactions..."
                    value={filter.search || ""}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-8 bg-black/50 border-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters} className="border-gray-700 hover:bg-gray-800">
                Clear Filters
              </Button>
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
              <Button onClick={fetchTransactions} variant="outline" className="mt-4 border-gray-700 hover:bg-gray-800">
                Try Again
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">ID</TableHead>
                    <TableHead className="text-gray-400">User</TableHead>
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Type</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Domain</TableHead>
                    <TableHead className="text-gray-400">Payment Method</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-gray-800 hover:bg-black/40">
                      <TableCell className="font-mono text-xs">{transaction.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{transaction.user_email}</p>
                          <p className="text-xs text-gray-400">{transaction.user_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell>{getTransactionTypeBadge(transaction.transaction_type)}</TableCell>
                      <TableCell className="font-mono">{formatAmount(transaction.amount)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        {transaction.domain_name !== "N/A" ? (
                          <Link href={`/domains/${transaction.domain_id}`} className="text-blue-400 hover:underline">
                            {transaction.domain_name}
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>{transaction.payment_method}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setNewStatus(transaction.status)
                              setStatusUpdateDialog(true)
                            }}
                            className="border-gray-700 hover:bg-gray-800"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Link href={`/dashboard/transactions/${transaction.id}`}>
                            <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800">
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="border-red-700 hover:bg-red-800 text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
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
          {!loading && !error && transactions.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-800">
              <div className="text-sm text-gray-400">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount}{" "}
                transactions
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

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
        <DialogContent className="bg-black border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-[#00ff9d]">Update Transaction Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status" className="text-gray-400">
                Status
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-black/50 border-gray-700">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes" className="text-gray-400">
                Admin Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this status change..."
                className="bg-black/50 border-gray-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setStatusUpdateDialog(false)}
                className="border-gray-700 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus}
                className="bg-[#00ff9d] text-black"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
