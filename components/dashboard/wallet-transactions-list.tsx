"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/lib/use-role";
import {
  type Transaction,
  type TransactionFilter,
} from "@/lib/database-services/transactions-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Eye,
} from "lucide-react";
import { postData } from "@/services/API";
import Link from "next/link";

export default function WalletTransactionsList() {
  const { user } = useAuth();
  const userRole = user?.role || "client";
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [user, userRole, page, filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    postData("/admin/wallet-transactions/get-all", {})
      .then((res) => {
        setTransactions(res.data.transactions || []);
        setLoading(false);
        setTotalCount(res.data.total);
      })
      .catch((err) => {
        setLoading(false);
        setError(err?.response?.data?.error || "Failed to fetch transactions");
      });
  };

  const handleFilterChange = (key: keyof TransactionFilter, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilter({});
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-500/15 text-green-500 border border-green-500">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/15 text-yellow-500 border border-yellow-500">
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/15 text-red-500 border border-red-500">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card className="w-full shadow-md border border-gray-800 bg-black/60">
      <CardHeader className="bg-black/40 border-b border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-bold text-[#00ff9d]">
            {userRole === "admin"
              ? "All Transactions"
              : userRole === "seller"
              ? "Sales Transactions"
              : "Your Transactions"}
          </CardTitle>
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
          </div>
        </div>
      </CardHeader>

      {showFilters && (
        <div className="p-4 bg-black/30 border-b border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Status</label>
              <Select
                value={filter.status || ""}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="bg-black/50 border-gray-700">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="md:col-span-2 flex items-end justify-end">
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
            <span className="ml-2 text-gray-400">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            <p>{error}</p>
            <Button
              onClick={fetchTransactions}
              variant="outline"
              className="mt-4 border-gray-700 hover:bg-gray-800"
            >
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
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">
                    Payment Method
                  </TableHead>
                  <TableHead className="text-gray-400">
                    Transaction Hash
                  </TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction.track_id}
                    className="border-gray-800 hover:bg-black/40"
                  >
                    <TableCell className="font-mono text-xs text-gray-300">
                      {transaction.track_id.substring(0, 5)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-300">
                      {transaction?.user?.email}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {formatDate(transaction.created_at)}
                    </TableCell>
                    <TableCell className="font-mono text-gray-300">
                      {formatAmount(transaction.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-gray-300">
                      {transaction.payment_method || "N/A"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-300">
                      {transaction.transaction_hash || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/wallet-transactions/${transaction.track_id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-neon-green/15 hover:text-neon-green transition-all"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-neon-green/15 hover:text-neon-green transition-all"
                          onClick={() => {
                            // Handle download receipt
                            console.log("Download receipt for:", transaction.track_id);
                          }}
                        >
                          <Download className="h-4 w-4" />
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
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalCount)} of {totalCount}{" "}
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
  );
}
