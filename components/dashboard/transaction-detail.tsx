"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  TransactionsService,
  type Transaction,
} from "@/lib/database-services/transactions-service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { postData } from "@/services/API";

interface TransactionDetailProps {
  trackId: string;
}

export default function TransactionDetail({ trackId }: TransactionDetailProps) {
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransaction();
  }, [trackId]);

  const fetchTransaction = async () => {
    setLoading(true);
    setError(null);

    postData(`/admin/transactions/get`, { trackId })
      .then((res) => {
        setLoading(false);
        setTransaction(res.data.transaction);
      })
      .catch((err) => {
        setLoading(false);
        setError(
          err.response.data.error || "Failed to fetch transaction details"
        );
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="text-green-500 bg-green-500/15 border-green-500">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="text-yellow-500 bg-yellow-500/15 border-yellow-500">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="text-red-500 bg-red-500/15 border-red-500">
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="text-blue-500 bg-blue-500/15 border-blue-500">
            Refunded
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-16 w-16 text-neon-green" />;
      case "pending":
        return <AlertCircle className="h-16 w-16 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "refunded":
        return <AlertCircle className="h-16 w-16 text-blue-500" />;
      default:
        return null;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff9d]" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button
              onClick={fetchTransaction}
              variant="outline"
              className="mt-4 border-gray-700 hover:bg-gray-800"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) {
    return (
      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">
            <p>Transaction not found.</p>
            <Link href="/dashboard/transactions">
              <Button
                variant="outline"
                className="mt-4 border-gray-700 hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Transactions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/dashboard/transactions">
          <Button
            variant="outline"
            className="border-gray-700 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Button>
        </Link>

        <Button
          variant="outline"
          className="border-gray-700 hover:bg-gray-800"
          onClick={() => window.print()}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Receipt
        </Button>
      </div>

      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardHeader className="bg-black/40 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-[#00ff9d]">
                Transaction Details
              </CardTitle>
              <CardDescription className="text-gray-400">
                Transaction ID: {transaction.track_id}
              </CardDescription>
            </div>
            {getStatusBadge(transaction.status)}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="w-full flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col justify-center items-center gap-3 mb-6">
              {getStatusIcon(transaction.status)}

              <span className="text-2xl font-bold text-neon-green capitalize">
                {`${transaction.status} with ${transaction.payment_method}`}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold mb-4">
                  Transaction Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className="text-lg font-mono font-semibold">
                      {formatAmount(transaction.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p>{formatDate(transaction.created_at)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Payment Method</p>
                    <p>{transaction.payment_method || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Track ID</p>
                    <p className="font-mono">{transaction.track_id || "N/A"}</p>
                  </div>

                  {transaction.transaction_hash && (
                    <div>
                      <p className="text-sm text-gray-400">Transaction Hash</p>
                      <p>{transaction.transaction_hash || "N/A"}</p>
                    </div>
                  )}

                  {user?.role === "admin" && (
                    <div>
                      <p className="text-sm text-gray-400">User</p>
                      <p>
                        {transaction?.buyer_id?.email ||
                          transaction?.buyer_id?.username ||
                          "N/A"}
                      </p>
                    </div>
                  )}

                  {transaction.currency && (
                    <div>
                      <p className="text-sm text-gray-400">Currency</p>
                      <p className="font-mono">
                        {transaction.currency || "N/A"}
                      </p>
                    </div>
                  )}

                  {transaction.network && (
                    <div>
                      <p className="text-sm text-gray-400">Network</p>
                      <p className="font-mono">
                        {transaction.network || "N/A"}
                      </p>
                    </div>
                  )}

                  {transaction.wallet_address && (
                    <div>
                      <p className="text-sm text-gray-400">Wallet Address</p>
                      <p className="font-mono">
                        {transaction.wallet_address || "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {transaction.domain_id && (
                <>
                  <Separator
                    orientation="vertical"
                    className="hidden md:block"
                  />

                  <Separator className="md:hidden" />

                  <div className="md:w-1/3">
                    <h3 className="text-lg font-semibold mb-4">
                      Domain Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">Domain Name</p>
                        <Link
                          href={`/domains/${transaction.domain_id}`}
                          className="text-blue-400 hover:underline"
                        >
                          {transaction.domain.domain}
                        </Link>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">Price</p>
                        <p className="font-mono">
                          {formatAmount(transaction.domain.price || 0)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <p>{transaction.domain.status}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400">Description</p>
                        <p className="mt-1">
                          {transaction.domain.description ||
                            "without description"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
