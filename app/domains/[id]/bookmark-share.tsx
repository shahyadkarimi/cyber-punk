"use client";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { DomainWithSeller } from "@/lib/database-services/domains-service";
import { postData } from "@/services/API";
import { Bookmark, Loader2, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function BookmarkShare({ domain }: { domain: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addWatchListHandler = () => {
    setLoading(true);

    postData("/user/watchlist/add", { id: domain.id })
      .then(async (res) => {
        await router.refresh();
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);

        toast({
          title: "Faild",
          description: err?.response?.data?.error || "Faild to add domain",
          variant: "default",
        });
      });
  };

  return (
    <div className="flex items-center gap-2">
      <Toaster />
      <Button
        variant="ghost"
        size="sm"
        onClick={addWatchListHandler}
        className={`${
          domain.is_in_watchlist ? "text-neon-green" : "text-white"
        } hover:bg-[#2a2a3a]`}
      >
        <Bookmark
          className={`h-4 w-4 mr-2 ${
            domain.is_in_watchlist ? "fill-neon-green text-neon-green" : ""
          }`}
        />

        {loading ? (
          <Loader2 className="animate-spin text-white" />
        ) : (
          domain.watchlist_count || 0
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-[#2a2a3a]"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  );
}
