"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wallet, Plus, RefreshCw, CreditCard, CheckCircle, AlertCircle, TestTube } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UsersService } from "@/lib/database-services/users-service"
import { OxapayService } from "@/lib/payment-services/oxapay-service"

export function UserWallet() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [amount, setAmount] = useState("")
  const [paymentStep, setPaymentStep] = useState<"input" | "processing" | "success" | "error">("input")
  const [paymentUrl, setPaymentUrl] = useState("")
  const [error, setError] = useState("")
  const [testingConnection, setTestingConnection] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchBalance()
    }
  }, [user?.id])

  const fetchBalance = async () => {
    try {
      setLoading(true)
      if (user?.id) {
        const userBalance = await UsersService.getUserBalance(user.id)
        setBalance(userBalance)
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const testConnection = async () => {
    try {
      setTestingConnection(true)
      const result = await OxapayService.testConnection()
      if (result.success) {
        alert("Connection test successful! Oxapay API is working.")
      } else {
        alert(`Connection test failed: ${result.error}`)
      }
    } catch (error) {
      alert(`Connection test failed: ${error}`)
    } finally {
      setTestingConnection(false)
    }
  }

  const handleAddFunds = async () => {
    try {
      const amountNum = Number.parseFloat(amount)

      // Validation
      if (!amountNum || amountNum <= 0) {
        setError("Please enter a valid amount")
        return
      }

      if (amountNum < 1) {
        setError("Minimum amount is $1.00")
        return
      }

      if (amountNum > 10000) {
        setError("Maximum amount is $10,000.00")
        return
      }

      if (!user?.id) {
        setError("You must be logged in to add funds")
        return
      }

      if (!user.email) {
        setError("Email address is required for payment processing")
        return
      }

      setError("")
      setPaymentStep("processing")

      // Generate unique order ID
      const orderId = `wallet-${user.id}-${Date.now()}`

      // Create payment with Oxapay
      const paymentData = await OxapayService.createPayment({
        amount: amountNum,
        currency: "USD",
        callbackUrl: `${window.location.origin}/api/payment/callback`,
        returnUrl: `${window.location.origin}/dashboard?payment=success&amount=${amountNum}`,
        description: `Add $${amountNum.toFixed(2)} to wallet`,
        orderId: orderId,
        email: user.email,
        thanksMessage: `Thank you for adding $${amountNum.toFixed(2)} to your wallet!`,
        lifetime: 30,
        sandbox: false, // Set to true for testing
        feePaidByPayer: 1,
        underPaidCoverage: 2.5,
        toCurrency: "USDT",
        autoWithdrawal: false,
        mixedPayment: true,
      })

      if (paymentData.success && paymentData.paymentUrl) {
        setPaymentUrl(paymentData.paymentUrl)
        setPaymentStep("success")
      } else {
        throw new Error(paymentData.error || "Failed to create payment")
      }
    } catch (error) {
      console.error("Error adding funds:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to process payment"
      setError(errorMessage)
      setPaymentStep("error")
    }
  }

  const handleCompletePayment = () => {
    if (paymentUrl) {
      // Open payment URL in new tab
      window.open(paymentUrl, "_blank")

      // Show instructions
      alert("Payment window opened. After completing payment, please refresh your balance.")

      // Close modal
      setShowAddFunds(false)
      setPaymentStep("input")
      setAmount("")
      setError("")
    }
  }

  const handleCloseModal = () => {
    setShowAddFunds(false)
    setPaymentStep("input")
    setAmount("")
    setError("")
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#2a2a3a]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#d1f7ff]">Wallet Balance</CardTitle>
          <Wallet className="h-4 w-4 text-[#00ff9d]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#00ff9d] mb-4">{loading ? "Loading..." : formatPrice(balance)}</div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddFunds(true)}
              size="sm"
              className="bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8] hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Funds
            </Button>
            <Button
              onClick={fetchBalance}
              size="sm"
              variant="outline"
              disabled={loading}
              className="border-[#2a2a3a] text-[#d1f7ff] hover:bg-[#2a2a3a]"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={testConnection}
              size="sm"
              variant="outline"
              disabled={testingConnection}
              className="border-[#2a2a3a] text-[#d1f7ff] hover:bg-[#2a2a3a]"
              title="Test Oxapay connection"
            >
              <TestTube className={`h-4 w-4 ${testingConnection ? "animate-pulse" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddFunds} onOpenChange={handleCloseModal}>
        <DialogContent className="bg-[#1a1a2e] border-[#2a2a3a] text-[#d1f7ff] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Add Funds to Wallet
            </DialogTitle>
          </DialogHeader>

          {paymentStep === "input" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#d1f7ff] mb-2 block">Amount (USD)</label>
                <Input
                  type="number"
                  placeholder="Enter amount (e.g., 10.00)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max="10000"
                  step="0.01"
                  className="bg-[#2a2a3a] border-[#3a3a4a] text-[#d1f7ff]"
                />
                <p className="text-xs text-[#d1f7ff]/60 mt-1">Minimum: $1.00 | Maximum: $10,000.00</p>
              </div>

              {user?.email && (
                <div className="bg-[#2a2a3a] p-3 rounded-lg">
                  <p className="text-xs text-[#d1f7ff]/60">Payment will be processed for:</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-[#2a2a3a] p-3 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">Payment Method</h4>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#05d9e8]" />
                  <span className="text-sm">Oxapay (Cryptocurrency)</span>
                </div>
                <p className="text-xs text-[#d1f7ff]/60 mt-1">Secure crypto payment gateway</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCloseModal} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFunds}
                  disabled={!amount || Number.parseFloat(amount) <= 0 || !user?.email}
                  className="flex-1 bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8]"
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {paymentStep === "processing" && (
            <div className="space-y-4 text-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#05d9e8] mx-auto"></div>
              <div>
                <h3 className="font-medium mb-2">Creating Payment...</h3>
                <p className="text-sm text-[#d1f7ff]/60">Please wait while we prepare your payment.</p>
              </div>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="space-y-4 text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
              <div>
                <h3 className="font-medium mb-2">Payment Ready!</h3>
                <p className="text-sm text-[#d1f7ff]/60 mb-4">
                  Click the button below to complete your payment of {formatPrice(Number.parseFloat(amount))}
                </p>
              </div>
              <Button onClick={handleCompletePayment} className="w-full bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8]">
                Complete Payment
              </Button>
              <p className="text-xs text-[#d1f7ff]/40">
                You will be redirected to Oxapay to complete your payment securely. After payment, refresh your balance
                to see the update.
              </p>
            </div>
          )}

          {paymentStep === "error" && (
            <div className="space-y-4 text-center py-6">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
              <div>
                <h3 className="font-medium mb-2">Payment Failed</h3>
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded text-sm text-left">
                  {error}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCloseModal} className="flex-1">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setPaymentStep("input")
                    setError("")
                  }}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
