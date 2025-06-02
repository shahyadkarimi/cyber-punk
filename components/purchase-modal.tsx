"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Globe, CreditCard, Shield, CheckCircle, Wallet, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { UsersService } from "@/lib/database-services/users-service"
import { OxapayService } from "@/lib/payment-services/oxapay-service"
import { domainsService } from "@/lib/database-services/domains-service" // Fixed import
import type { DomainWithSeller } from "@/lib/database-services/domains-service"

interface PurchaseModalProps {
  domain: DomainWithSeller
  isOpen: boolean
  onClose: () => void
}

export function PurchaseModal({ domain, isOpen, onClose }: PurchaseModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<"confirm" | "payment" | "success" | "error">("confirm")
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"balance" | "oxapay">("balance")
  const [userBalance, setUserBalance] = useState(0)
  const [paymentUrl, setPaymentUrl] = useState("")
  const [error, setError] = useState("")

  // Check if we're in development/preview mode
  const isDevelopment =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("preview"))

  useEffect(() => {
    if (user?.id && isOpen) {
      fetchUserBalance()
    }
  }, [user?.id, isOpen])

  const fetchUserBalance = async () => {
    try {
      if (user?.id) {
        const balance = await UsersService.getUserBalance(user.id)
        setUserBalance(balance)

        // Default to Oxapay if balance is insufficient
        if (balance < (domain.price || 0)) {
          setPaymentMethod("oxapay")
        }
      }
    } catch (error) {
      console.error("Error fetching user balance:", error)
      // In development mode, set a mock balance
      if (isDevelopment) {
        setUserBalance(1000)
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handlePurchase = async () => {
    try {
      setLoading(true)
      setError("")

      if (!user?.id) {
        setError("You must be logged in to make a purchase")
        setLoading(false)
        return
      }

      const totalPrice = domain.price || 0

      if (paymentMethod === "balance") {
        // Check if user has enough balance
        if (userBalance < totalPrice && !isDevelopment) {
          setError("Insufficient balance. Please add funds or choose another payment method.")
          setLoading(false)
          return
        }

        try {
          // In development mode, simulate success
          if (isDevelopment) {
            console.log("DEVELOPMENT MODE: Simulating successful balance payment")
            setTimeout(() => {
              setStep("success")
              setLoading(false)
            }, 1000)
            return
          }

          // Deduct from user balance
          await UsersService.deductUserBalance(user.id, totalPrice)

          // Update domain status and create transaction
          // Use the correct method from domainsService
          await domainsService.updateDomain(
            domain.id,
            {
              status: "sold",
              buyer_id: user.id,
              sold_at: new Date().toISOString(),
            },
            user.id,
          )

          // Show success
          setStep("success")
        } catch (error) {
          console.error("Error processing balance payment:", error)
          setError("Failed to process payment. Please try again.")
          setStep("error")
        }
      } else {
        // Process with Oxapay
        const paymentData = await OxapayService.createPayment({
          amount: totalPrice,
          currency: "USD",
          callbackUrl: `${window.location.origin}/api/payment/domain-purchase/callback`,
          returnUrl: `${window.location.origin}/domains/${domain.id}/success`,
          description: `Purchase domain: ${domain.domain}`,
          orderId: `domain-${domain.id}-${user.id}-${Date.now()}`,
          email: user.email || "",
          sandbox: isDevelopment, // Use sandbox in development
        })

        if (paymentData.success && paymentData.paymentUrl) {
          setPaymentUrl(paymentData.paymentUrl)
          setStep("payment")
        } else {
          throw new Error(paymentData.error || "Failed to create payment")
        }
      }
    } catch (error) {
      console.error("Error processing purchase:", error)
      setError(error instanceof Error ? error.message : "Failed to process payment")
      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep("confirm")
    setError("")
    onClose()
  }

  const handleCompletePayment = () => {
    if (isDevelopment) {
      // In development, simulate success
      setStep("success")
      return
    }

    if (paymentUrl) {
      window.open(paymentUrl, "_blank")
    }
  }

  const hasEnoughBalance = userBalance >= (domain.price || 0) || isDevelopment

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a2e] border-[#2a2a3a] text-[#d1f7ff] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "confirm" && (
              <>
                <CreditCard className="h-5 w-5" /> Purchase Domain
              </>
            )}
            {step === "payment" && (
              <>
                <Shield className="h-5 w-5" /> Complete Payment
              </>
            )}
            {step === "success" && (
              <>
                <CheckCircle className="h-5 w-5 text-green-400" /> Purchase Complete
              </>
            )}
            {step === "error" && (
              <>
                <AlertCircle className="h-5 w-5 text-red-400" /> Payment Failed
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {isDevelopment && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-2 rounded text-sm mb-4">
            Development Mode: Payment gateway is simulated. No real transactions will occur.
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="h-6 w-6 text-[#05d9e8]" />
                <h3 className="text-xl font-bold">{domain.domain}</h3>
              </div>
              {domain.category && <Badge className="bg-[#2a2a3a] text-[#d1f7ff]">{domain.category}</Badge>}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#d1f7ff]/60">Domain Price:</span>
                <span className="font-semibold">{formatPrice(domain.price || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#d1f7ff]/60">Platform Fee (5%):</span>
                <span className="font-semibold">{formatPrice((domain.price || 0) * 0.05)}</span>
              </div>
              <hr className="border-[#2a2a3a]" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-[#05d9e8]">{formatPrice((domain.price || 0) * 1.05)}</span>
              </div>
            </div>

            <div className="bg-[#2a2a3a] p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What you get:</h4>
              <ul className="text-sm space-y-1 text-[#d1f7ff]/80">
                <li>• Full domain ownership transfer</li>
                <li>• Domain authority: {domain.da_score || "N/A"}</li>
                <li>• Page authority: {domain.pa_score || "N/A"}</li>
                <li>• Monthly traffic: {domain.traffic ? `${domain.traffic.toLocaleString()}` : "N/A"}</li>
                <li>• 30-day money-back guarantee</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Payment Method</h4>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: "balance" | "oxapay") => setPaymentMethod(value)}
              >
                <div className="flex items-center space-x-2 bg-[#2a2a3a] p-3 rounded-md mb-2">
                  <RadioGroupItem value="balance" id="balance" disabled={!hasEnoughBalance && !isDevelopment} />
                  <Label htmlFor="balance" className="flex items-center gap-2 cursor-pointer">
                    <Wallet className="h-5 w-5 text-[#00ff9d]" />
                    <div>
                      <span className="text-white">Wallet Balance</span>
                      <div className="text-xs text-[#d1f7ff]/60">
                        Available: {formatPrice(userBalance)}
                        {!hasEnoughBalance && !isDevelopment && " (Insufficient)"}
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 bg-[#2a2a3a] p-3 rounded-md">
                  <RadioGroupItem value="oxapay" id="oxapay" />
                  <Label htmlFor="oxapay" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-5 w-5 text-[#05d9e8]" />
                    <span className="text-white">Oxapay</span>
                  </Label>
                </div>
              </RadioGroup>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8]"
              >
                {loading ? "Processing..." : "Purchase Domain"}
              </Button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center py-4">
              <div className="bg-[#2a2a3a] p-6 rounded-full">
                <CreditCard className="h-12 w-12 text-[#05d9e8]" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Complete Your Payment</h3>
              <p className="text-[#d1f7ff]/60">
                Click the button below to proceed to the payment gateway and complete your purchase.
              </p>
            </div>

            <Button onClick={handleCompletePayment} className="w-full bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8]">
              Complete Payment
            </Button>

            <p className="text-xs text-[#d1f7ff]/40">
              {isDevelopment
                ? "In development mode, clicking the button will simulate a successful payment."
                : "You will be redirected to Oxapay to complete your payment securely. After payment, you'll be returned to the success page."}
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6 text-center">
            <div className="text-green-400">
              <CheckCircle className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Purchase Successful!</h3>
              <p className="text-[#d1f7ff]/60">
                Congratulations! You are now the owner of <strong>{domain.domain}</strong>
              </p>
            </div>

            <div className="bg-[#2a2a3a] p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">Next Steps:</h4>
              <ul className="text-sm space-y-1 text-[#d1f7ff]/80">
                <li>• Check your email for transfer instructions</li>
                <li>• Domain transfer will begin within 24 hours</li>
                <li>• You'll receive confirmation once complete</li>
                <li>• Contact support if you need assistance</li>
              </ul>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-6 text-center">
            <div className="text-red-400">
              <AlertCircle className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded text-sm">
                {error || "There was an error processing your payment. Please try again."}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => setStep("confirm")}
                className="flex-1 bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8]"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
