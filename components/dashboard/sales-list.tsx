"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Eye,
  Download,
} from "lucide-react";
import { TransactionsService } from "@/lib/database-services/transactions-service";
import Link from "next/link";
import { getData } from "@/services/API";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "../ui/toaster";

export default function SalesList() {
  const { user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [timeframe, setTimeframe] = useState("all");
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averagePrice: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    fetchSales();
  }, [user, page, timeframe]);

  const fetchSales = async () => {
    setLoading(true);

    getData("/user/domains/sale-domains", {})
      .then((res) => {
        setLoading(false);
        setSales(res.data.transactions);
        setTotalCount(res.data.transactions.length);

        setStats({
          totalSales: res.data.stats.totalSales,
          totalRevenue: res.data.stats.totalRevenue,
          averagePrice: res.data.stats.averagePrice,
          conversionRate: res.data.stats.conversionRate,
        });
      })
      .catch((err) => {
        setLoading(false);

        setError(err?.response?.data?.error);

        toast({
          title: "Error fetching domains",
          description: err?.response?.data?.error,
          variant: "default",
        });
      });
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

  const getStatusBadge = (status: string) => {
    const statusColors = {
      paid: "bg-green-500/20 text-green-400 border-green-500/50",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      failed: "bg-red-500/20 text-red-400 border-red-500/50",
      cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/50",
    };

    return (
      <Badge
        variant="outline"
        className={`${
          statusColors[status as keyof typeof statusColors] ||
          statusColors.pending
        } capitalize`}
      >
        {status}
      </Badge>
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <Toaster />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md border border-gray-800 bg-black/60">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold mt-1">{stats.totalSales}</p>
              </div>
              <div className="bg-[#00ff9d]/20 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-[#00ff9d]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-800 bg-black/60">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {formatAmount(stats.totalRevenue)}
                </p>
              </div>
              <div className="bg-[#00ff9d]/20 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-[#00ff9d]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-800 bg-black/60">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Average Price</p>
                <p className="text-2xl font-bold mt-1">
                  {formatAmount(stats.averagePrice)}
                </p>
              </div>
              <div className="bg-[#00ff9d]/20 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-[#00ff9d]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-800 bg-black/60">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.conversionRate ? `${stats.conversionRate}%` : "N/A"}
                </p>
              </div>
              <div className="bg-[#00ff9d]/20 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-[#00ff9d]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardHeader className="bg-black/40 border-b border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-bold text-[#00ff9d]">
              Sales History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px] bg-black/50 border-gray-700">
                  <SelectValue placeholder="Select Timeframe" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#00ff9d]" />
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500">
              <p>{error}</p>
              <Button
                onClick={fetchSales}
                variant="outline"
                className="mt-4 border-gray-700 hover:bg-gray-800"
              >
                Try Again
              </Button>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No sales found</p>
              <p className="text-sm">
                Your sales will appear here once you start selling domains.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-900/50">
                    <TableHead className="text-gray-300">
                      Transaction ID
                    </TableHead>
                    <TableHead className="text-gray-300">Domain</TableHead>
                    <TableHead className="text-gray-300">Buyer</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow
                      key={sale._id}
                      className="border-gray-800 hover:bg-gray-900/30"
                    >
                      <TableCell className="font-mono text-sm text-gray-300">
                        {sale.track_id.slice(0, 5)}...
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {sale.domain?.domain || "N/A"}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {sale?.domain?.buyer_id?.username || "Anonymous"}
                      </TableCell>
                      <TableCell className="font-semibold text-[#00ff9d]">
                        {formatAmount(sale.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(sale.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/transactions/${sale.track_id}`}
                          >
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
                              console.log("Download receipt for:", sale.id);
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
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-800">
              <div className="text-sm text-gray-400">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalCount)} of {totalCount} sales
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
