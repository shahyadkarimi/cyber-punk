"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DomainCard } from "@/components/domain-card";
import { DomainFilters } from "@/components/domain-filters";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import type { DomainWithSeller } from "@/lib/database-services/domains-service";
import { postData } from "@/services/API";

export function DomainsMarketplace() {
  const { user } = useAuth();
  const isSeller = user?.role === "seller" || user?.role === "admin";

  const [domains, setDomains] = useState<DomainWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalDomains: 0,
    averagePrice: 0,
    totalRevenue: 0,
    categories: [] as string[],
    topCategory: "",
    newestDomain: new Date(),
  });

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
  });

  const pageSize = 12;

  // Fetch domains with filters
  const fetchDomains = async () => {
    setLoading(true);

    postData("/domains/get-all", {})
      .then((res) => {
        setDomains(res.data.domains);
        setStats({
          ...stats,
          totalRevenue: res.data.stats.total_revenue,
        });
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDomains();
  }, [searchTerm, sortBy, currentPage, filters]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Format the newest domain date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-purple-800/15 border border-purple-800 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-4">
                Premium Domain Marketplace
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl">
                Discover high-value domains with excellent SEO metrics and
                growth potential
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">
                  Premium Quality
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600/15 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Domains
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.totalDomains}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isSeller ? (
          // Show sales stats only to sellers
          <>
            <Card className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a]">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-600/15 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Your Avg. Price
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      ${stats.averagePrice.toFixed(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a]">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-600/15 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600">
                      Your Total Sales
                    </p>
                    <p className="text-2xl font-bold text-purple-800">
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
            <Card className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a]">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-600/15 rounded-lg">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-600">
                      Latest Addition
                    </p>
                    <p className="text-2xl font-bold text-amber-800">
                      {formatDate(stats.newestDomain)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a]">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-600/15 rounded-lg">
                    <Tag className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-600">
                      Top Category
                    </p>
                    <p className="text-2xl font-bold text-indigo-800 capitalize">
                      {stats.topCategory || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-600/15 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Categories
                </p>
                <p className="text-2xl font-bold text-orange-800">
                  {stats.categories.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card className="border-none">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]">
                  <SortDesc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a3a] text-white">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="da-high">Highest DA Score</SelectItem>
                  <SelectItem value="traffic-high">Highest Traffic</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border bg-[#1a1a1a] border-[#2a2a3a] text-white">
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
      {showFilters && (
        <DomainFilters
          filters={filters}
          onFiltersChange={setFilters}
          categories={stats.categories}
        />
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-gray-200">
          Showing {domains.length} of {domains.length} domains
        </p>
        <div className="flex items-center gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || key === "status") return null;
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
            );
          })}
        </div>
      </div>

      {/* Domains Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a] rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      ) : domains.length === 0 ? (
        <Card className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a]">
          <CardContent className="text-center py-20">
            <Globe className="h-16 w-16 text-neon-green mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-100 mb-2">
              No domains found
            </h3>
            <p className="text-slate-300">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
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
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="border-slate-200 dark:border-slate-600"
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
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
  );
}
