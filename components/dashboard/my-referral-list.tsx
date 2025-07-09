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
  CheckCircle,
  Copy,
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

// This would come from your referrals service
type Domain = {
  _id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: string;
  created_at: string;
};

export default function MyReferralsList() {
  const [referrals, setReferrals] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { user } = useAuth();

  const fetchDomains = () => {
    setLoading(true);

    getData("/user/referrals/get-all", {})
      .then((res) => {
        setLoading(false);
        setReferrals(res.data.referrals);
        setTotalCount(res.data.referrals.length);
      })
      .catch((err) => {
        setLoading(false);

        setError(err?.response?.data?.error);

        toast({
          title: "Error fetching referrals",
          description: err?.response?.data?.error,
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "seller":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "client":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const copyToClipboard = (text: number) => {
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLinkToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:gap-8">
        <div className="w-full max-w-60">
          <Label className="text-slate-400">Your Referral Code</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              value={user?.referral_code}
              readOnly
              className="bg-[#0a0a0c] border-[#3a3a4a] text-white"
            />
            <Button
              size="sm"
              variant="outline"
              className="border-[#2a2a3a] text-white hover:bg-[#2a2a3a] bg-transparent"
              onClick={() => copyToClipboard(user?.referral_code || 0)}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="w-full lg:max-w-[650px]">
          <Label className="text-slate-400">Your Referral Link</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              value={`${window.location.hostname}/auth/signup?referral_code=${user?.referral_code}`}
              readOnly
              className="bg-[#0a0a0c] border-[#3a3a4a] text-white"
            />
            <Button
              size="sm"
              variant="outline"
              className="border-[#2a2a3a] text-white hover:bg-[#2a2a3a] bg-transparent"
              onClick={() =>
                copyLinkToClipboard(
                  `${window.location.hostname}/auth/signup?referral_code=${user?.referral_code}`
                )
              }
            >
              {copiedLink ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardHeader className="bg-black/40 border-b border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-bold text-[#00ff9d]">
              Referrals list
            </CardTitle>
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
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4 border-gray-700 hover:bg-gray-800"
              >
                Try Again
              </Button>
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <p>You haven't add any referral.</p>
              <Button className="mt-4 bg-[#00ff9d] text-black hover:bg-[#00cc7d]">
                <div className="">Add Your First Referral</div>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">User</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Role</TableHead>
                    <TableHead className="text-gray-400">Register On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow
                      key={referral._id}
                      className="border-gray-800 hover:bg-black/40"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#2a2a3a] rounded-full flex items-center justify-center">
                            {referral.avatar_url ? (
                              <img
                                src={referral.avatar_url || "/placeholder.svg"}
                                alt=""
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <span className="text-[#00ff9d] font-semibold">
                                {(referral.full_name ||
                                  referral.username ||
                                  referral.email)?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {referral.full_name ||
                                referral.username ||
                                "No name"}
                            </div>
                            <div className="text-sm text-gray-400">
                              @{referral.username || "no-username"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{referral.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(referral.role)}>
                          {referral.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(referral.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && referrals.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-800">
              <div className="text-sm text-gray-400">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalCount)} of {totalCount}{" "}
                referrals
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
    </>
  );
}
