"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, TrendingUp, Eye, ShoppingCart, Star, Ban } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PurchaseModal } from "@/components/purchase-modal";
import type { DomainWithSeller } from "@/lib/database-services/domains-service";

interface DomainCardProps {
  domain: DomainWithSeller;
  viewMode?: "grid" | "list";
}

export function DomainCard({ domain, viewMode = "grid" }: DomainCardProps) {
  const { user } = useAuth();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      Technology: "bg-blue-600/15 text-blue-600 border-blue-600",
      Education: "bg-green-600/15 text-green-600 border-green-600",
      Business: "bg-purple-600/15 text-purple-600 border-purple-600",
      Entertainment: "bg-pink-600/15 text-pink-600 border-pink-600",
      Health: "bg-red-600/15 text-red-600 border-red-600",
      Finance: "bg-yellow-600/15 text-yellow-600 border-yellow-600",
    };
    return (
      colors[category as keyof typeof colors] ||
      "bg-gray-600/15 text-gray-600 border-gray-600"
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const purchaseDomainHandler = () => {
    if (!user) {
      window.location.href = "/auth/login?redirect=/domains";
      return;
    }

    if (domain.status === "approved") setShowPurchaseModal(true);
  };

  if (viewMode === "list") {
    return (
      <Card className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a] hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <Link
                  href={`/domains/${domain.id}`}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-slate-100/15 group-hover:bg-neon-green/15 rounded-lg transition-colors">
                    <Globe className="h-5 w-5 text-slate-100 group-hover:text-neon-green" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-neon-green transition-colors">
                    {domain.domain}
                  </h3>
                </Link>
                {domain.category && (
                  <Badge className={getCategoryColor(domain.category)}>
                    {domain.category}
                  </Badge>
                )}
              </div>

              <p className="text-slate-300 mb-6 line-clamp-3 min-h-[4.5rem]">
                {domain.description || "Premium domain with high SEO value"}
              </p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-red-900/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-slate-100 text-sm">DA:</span>
                  <span className="text-red-600 font-semibold">
                    {domain.da_score || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-purple-900/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-slate-100 text-sm">PA:</span>
                  <span className="text-purple-600 font-semibold">
                    {domain.pa_score || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                {formatPrice(domain.price || 0)}
              </div>
              <div className="flex gap-2">
                <Link href={`/domains/${domain.id}`}>
                  <Button
                    variant="outline"
                    className="w-full hover:border-neon-green hover:text-neon-green"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
                <Button
                  onClick={purchaseDomainHandler}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a] hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Link
              href={`/domains/${domain.id}`}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-slate-100/15 group-hover:bg-neon-green/15 rounded-lg transition-colors">
                <Globe className="h-5 w-5 text-slate-100 group-hover:text-neon-green" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-neon-green transition-colors">
                {domain.domain}
              </h3>
            </Link>
            {domain.category && (
              <Badge className={getCategoryColor(domain.category)}>
                {domain.category}
              </Badge>
            )}
          </div>

          <p className="text-slate-300 mb-6 line-clamp-3 min-h-[4.5rem]">
            {domain.description ||
              "Premium domain with high SEO value and excellent potential for business growth."}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-2 bg-red-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <span className="text-slate-100 text-sm">DA:</span>
                <span className="text-red-600 font-semibold">
                  {domain.da_score || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-slate-100 text-sm">PA:</span>
                <span className="text-purple-600 font-semibold">
                  {domain.pa_score || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(domain.price || 0)}
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-slate-300">Premium Quality</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 space-x-3">
          <Link href={`/domains/${domain.id}`} className="w-full">
            <Button
              variant="outline"
              className="w-full hover:border-neon-green hover:text-neon-green"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>

          <Button
            onClick={purchaseDomainHandler}
            disabled={domain.status === "sold"}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {domain.status === "sold" ? (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Sold
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Now
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {showPurchaseModal && (
        <PurchaseModal
          domain={domain}
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </>
  );
}
