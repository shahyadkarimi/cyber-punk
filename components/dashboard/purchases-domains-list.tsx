"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
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
  Edit,
  Trash2,
  X,
  Eye,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { getData, postData } from "@/services/API";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Textarea } from "../ui/textarea";
import { domainCategories } from "./domain-submission-form";

// This would come from your domains service
type Domain = {
  id: string;
  domain: string;
  price: number;
  status: "pending" | "approved" | "rejected" | "sold";
  created_at: string;
  description?: string;
  tags: string[];
  category?: string;
};

export default function PurchasesDomains() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filter, setFilter] = useState<{
    status?: string;
    search?: string;
    category?: string;
  }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [formData, setFormData] = useState({
    domain: "",
    description: "",
    price: 0,
  });

  const fetchDomains = () => {
    setLoading(true);

    getData("/user/domains/purchases-domains", {})
      .then((res) => {
        setLoading(false);
        setDomains(res.data.domains);
        setTotalCount(res.data.domains.length);
      })
      .catch((err) => {
        setLoading(false);

        setError(err?.response?.data?.error);

        toast({
          title: "Error fetching domains",
          description: err?.response?.data?.error,
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilter({});
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-600/15 text-green-600 border border-green-600">
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-600/15 text-yellow-600 border border-yellow-600">
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-600/15 text-red-600 border border-red-600">
            Rejected
          </Badge>
        );
      case "sold":
        return (
          <Badge className="bg-blue-600/15 text-blue-600 border border-blue-600">
            Sold
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (price: number | null) => {
    if (typeof price === "number") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
    }
  };

  const openEditDialogHandler = (domain: Domain) => {
    setEditDialogOpen(true);

    setFormData({
      domain: domain.domain,
      price: domain.price,
      description: domain.description || "",
    });

    setCategory(domain.category || "");

    setTags(domain.tags);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardHeader className="bg-black/40 border-b border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-bold text-[#00ff9d]">
              My Domains
            </CardTitle>

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
        </CardHeader>

        {showFilters && (
          <div className="p-4 bg-black/30 border-b border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Status
                </label>
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
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search domains..."
                    value={filter.search || ""}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
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
                <Button className="mt-4 bg-[#00ff9d] text-black hover:bg-[#00cc7d]">
                  Add Your First Domain
                </Button>
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
                    <TableRow
                      key={domain.id}
                      className="border-gray-800 hover:bg-black/40"
                    >
                      <TableCell className="font-medium">
                        {domain.domain}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatPrice(domain.price)}
                      </TableCell>
                      <TableCell>{getStatusBadge(domain.status)}</TableCell>
                      <TableCell>{domain.category || "N/A"}</TableCell>
                      <TableCell>{formatDate(domain.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-700 hover:bg-gray-800"
                            onClick={() => openEditDialogHandler(domain)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Info</span>
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
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalCount)} of {totalCount} domains
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

      {/* Dialog for show Domain info */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(isOpen) => {
          setEditDialogOpen(isOpen);
          setFormData({
            domain: "",
            description: "",
            price: 0,
          });

          setCategory("");
          setTags([]);
          setNewTag("");
        }}
      >
        <DialogContent className="bg-[#141414] border-[#2a2a3a] text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#00ff9d] text-2xl">
              Domain Info
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-white">
                Domain Name *
              </Label>

              <div className="w-full h-10 px-4 flex items-center bg-gray-800 border border-gray-700 text-white">
                <span>{formData.domain}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <div className="w-full min-h-10 h-auto px-4 flex items-center bg-gray-800 border border-gray-700 text-white">
                <span>{formData.description || ""}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white">
                  Price (USD)
                </Label>

                <div className="w-full min-h-10 h-auto px-4 flex items-center bg-gray-800 border border-gray-700 text-white">
                  <span>{formData.price || ""}$</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">
                  Category
                </Label>

                <div className="w-full min-h-10 h-auto px-4 flex items-center bg-gray-800 border border-gray-700 text-white">
                  <span>{category || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Tags</Label>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-gray-700 text-white"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              onClick={() => {
                setEditDialogOpen(false);
              }}
              className="w-full bg-[#00ff9d] text-black hover:bg-[#00e68a]"
            >
              Ok
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
