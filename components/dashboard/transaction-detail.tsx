"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRole } from "@/lib/use-role"
import { TransactionsService, type Transaction } from "@/lib/database-services/transactions-service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface TransactionDetailProps {
  transactionId: string
}

export default function TransactionDetail({ transactionId }: TransactionDetailProps) {
  const { user } = useAuth()
  const role = useRole()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTransaction()
  }, [transactionId])

  const fetchTransaction = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await TransactionsService.getTransactionById(transactionId)

      if (result.error) {
        setError(result.error.message || "Failed to fetch transaction details")
      } else {
        setTransaction(result.data)
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case "pending":
        return <AlertCircle className="h-16 w-16 text-yellow-500" />
      case "failed":
        return <XCircle className="h-16 w-16 text-red-500" />
      case "refunded":
        return <AlertCircle className="h-16 w-16 text-blue-500" />
      default:
        return null
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff9d]" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardContent className="p-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={fetchTransaction} variant="outline" className="mt-4 border-gray-700 hover:bg-gray-800">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!transaction) {
    return (
      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardContent className="p-8">
          <div className="text-center text-gray-400">
            <p>Transaction not found.</p>
            <Link href="/dashboard/transactions">
              <Button variant="outline" className="mt-4 border-gray-700 hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Transactions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/dashboard/transactions">
          <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Button>
        </Link>

        <Button variant="outline" className="border-gray-700 hover:bg-gray-800" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          Download Receipt
        </Button>
      </div>

      <Card className="w-full shadow-md border border-gray-800 bg-black/60">
        <CardHeader className="bg-black/40 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-[#00ff9d]">Transaction Details</CardTitle>
              <CardDescription className="text-gray-400">Transaction ID: {transaction.id}</CardDescription>
            </div>
            {getStatusBadge(transaction.status)}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="space-y-6">
                <div className="flex justify-center mb-6">{getStatusIcon(transaction.status)}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className="text-lg font-mono font-semibold">{formatAmount(transaction.amount)}</p>
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
                    <p className="text-sm text-gray-400">Payment ID</p>
                    <p className="font-mono">{transaction.payment_id || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Transaction Type</p>
                    <p>{transaction.transaction_type}</p>
                  </div>

                  {role === "admin" && (
                    <div>
                      <p className="text-sm text-gray-400">User</p>
                      <p>{transaction.user_name || transaction.user_email || "N/A"}</p>
                    </div>
                  )}
                </div>

                {transaction.description && (
                  <div>
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="mt-1">{transaction.description}</p>
                  </div>
                )}
              </div>
            </div>

            {transaction.domain_id && (
              <>
                <Separator orientation="vertical" className="hidden md:block" />
                <Separator className="md:hidden" />

                <div className="md:w-1/3">
                  <h3 className="text-lg font-semibold mb-4">Domain Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Domain Name</p>
                      <Link href={`/domains/${transaction.domain_id}`} className="text-blue-400 hover:underline">
                        {transaction.domain_name}
                      </Link>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="font-mono">{formatAmount(transaction.domain_price || 0)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p>{transaction.domain_status}</p>
                    </div>

                    {transaction.domain_description && (
                      <div>
                        <p className="text-sm text-gray-400">Description</p>
                        <p className="mt-1">{transaction.domain_description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
