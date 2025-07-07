"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wallet,
  Plus,
  RefreshCw,
  CreditCard,
  CheckCircle,
  AlertCircle,
  CircleCheckBig,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { OxapayService } from "@/lib/payment-services/oxapay-service";
import { getData, postData } from "@/services/API";
import { useRouter, useSearchParams } from "next/navigation";

export function UserWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentStep, setPaymentStep] = useState<
    "input" | "processing" | "success" | "error"
  >("input");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [error, setError] = useState("");
  const [paymentInformation, setPaymentInformation] = useState({});
  const [completePaymentError, setCompletePaymentError] = useState("");
  const [completePaymentLoading, setCompletePaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transaction, setTransaction] = useState<any>({});
  const [transactionLoading, setTransactionLoading] = useState(false);

  const searchParams = useSearchParams();

  const transactionOrderId = searchParams.get("orderId");

  const router = useRouter();

  useEffect(() => {
    if (user?._id) {
      fetchBalance();
    }

    if (transactionOrderId) {
      setTransactionLoading(true);

      postData("/wallet-transactions/get", { orderId: transactionOrderId })
        .then((res) => {
          setTransactionLoading(false);
          setPaymentSuccess(true);
          setTransaction(res?.data?.transaction);
        })
        .catch((err) => {
          setTransactionLoading(false);
          setPaymentSuccess(false);
        });
    }
  }, [user?._id]);

  const fetchBalance = async () => {
    if (!user?._id) return;

    setLoading(true);
    getData("/user/wallet-balance", {})
      .then((res) => {
        setBalance(res.data.balance);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching balance:", err);
        setLoading(false);
      });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const addFundHandler = async () => {
    try {
      const amountNum = Number.parseFloat(amount);

      // Validation
      if (!amountNum || amountNum <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      if (amountNum < 1) {
        setError("Minimum amount is $1.00");
        return;
      }

      if (amountNum > 10000) {
        setError("Maximum amount is $10,000.00");
        return;
      }

      if (!user?._id) {
        setError("You must be logged in to add funds");
        return;
      }

      if (!user.email) {
        setError("Email address is required for payment processing");
        return;
      }

      setError("");
      setPaymentStep("processing");

      // Generate unique order ID
      const orderId = `wallet-${user._id}-${Date.now()}`;

      // Create payment with Oxapay
      const paymentData = await OxapayService.createPayment({
        amount: amountNum,
        currency: "USD",
        callbackUrl: `${window.location.origin}/api/payment/add-funds/callback`,
        returnUrl: `${window.location.origin}/dashboard?orderId=${orderId}&amount=${amountNum}`,
        description: `Add $${amountNum.toFixed(2)} to wallet`,
        orderId: orderId,
        email: user.email,
        thanksMessage: `Thank you for adding $${amountNum.toFixed(
          2
        )} to your wallet!`,
        lifetime: 30,
        sandbox: false, // Set to true for testing
        feePaidByPayer: 1,
        underPaidCoverage: 2.5,
        toCurrency: "USDT",
        autoWithdrawal: false,
        mixedPayment: true,
      });

      if (paymentData.success && paymentData?.paymentUrl) {
        setPaymentInformation({
          order_id: orderId,
          track_id: paymentData.trackId,
          status: "pending",
          amount: amountNum,
        });
        setPaymentUrl(paymentData.paymentUrl || "");
        setPaymentStep("success");
      } else {
        throw new Error(paymentData.error || "Failed to create payment");
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process payment";
      setError(errorMessage);
      setPaymentStep("error");
    }
  };

  const completePaymentHandler = () => {
    if (paymentUrl) {
      setCompletePaymentLoading(true);
      // create transactions
      postData("/wallet-transactions/create", { ...paymentInformation })
        .then((res) => {
          // Open payment URL in new tab
          router.push(paymentUrl);
        })
        .catch((err) => {
          setCompletePaymentLoading(false);

          setCompletePaymentError(
            err?.response?.data?.error || "Faild to redirect to oxapay"
          );
        });
    }
  };

  const handleCloseModal = () => {
    setShowAddFunds(false);
    setPaymentStep("input");
    setAmount("");
    setError("");
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#2a2a3a]">
        {transactionLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="text-2xl font-bold text-[#00ff9d]">
              Loading payment status...
            </div>
          </div>
        ) : paymentSuccess && transaction?.order_id ? (
          <div className="w-full flex flex-col items-center py-6 gap-4">
            <CircleCheckBig className="size-20 text-neon-green" />
            <h4 className="text-neon-green font-black text-2xl">
              Payment Success
            </h4>

            <p className="-mt-2.5 opacity-80">{`Thank you for adding $${transaction?.amount?.toFixed(
              2
            )} to your wallet!`}</p>

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm">Track Id</span>
              <span className="opacity-80">
                {transaction?.track_id || "N/A"}
              </span>
            </div>

            <p className="text-neon-green">
              New Wallet Balance: {formatPrice(balance)}
            </p>

            <Button
              onClick={() => {
                setPaymentSuccess(false);
                setTransaction({});
                setTransactionLoading(false);
                router.push("/dashboard");
              }}
              className="bg-[#00ff9d] text-black hover:bg-[#00e68a]"
            >
              Ok, show my balance
            </Button>
          </div>
        ) : (
          <>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#d1f7ff]">
                Wallet Balance
              </CardTitle>

              <Wallet className="h-4 w-4 text-[#00ff9d]" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-[#00ff9d] mb-4">
                {loading ? "Loading..." : formatPrice(balance)}
              </div>
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
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </CardContent>
          </>
        )}
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
                <label className="text-sm font-medium text-[#d1f7ff] mb-2 block">
                  Amount (USD)
                </label>
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
                <p className="text-xs text-[#d1f7ff]/60 mt-1">
                  Minimum: $1.00 | Maximum: $10,000.00
                </p>
              </div>

              {user?.email && (
                <div className="bg-[#2a2a3a] p-3 rounded-lg">
                  <p className="text-xs text-[#d1f7ff]/60">
                    Payment will be processed for:
                  </p>
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
                <p className="text-xs text-[#d1f7ff]/60 mt-1">
                  Secure crypto payment gateway
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addFundHandler}
                  disabled={
                    !amount || Number.parseFloat(amount) <= 0 || !user?.email
                  }
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
                <p className="text-sm text-[#d1f7ff]/60">
                  Please wait while we prepare your payment.
                </p>
              </div>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="space-y-4 text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
              <div>
                <h3 className="font-medium mb-2">Payment Ready!</h3>
                <p className="text-sm text-[#d1f7ff]/60 mb-4">
                  Click the button below to complete your payment of{" "}
                  {formatPrice(Number.parseFloat(amount))}
                </p>
              </div>

              {completePaymentError && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{completePaymentError}</span>
                </div>
              )}

              <Button
                onClick={completePaymentHandler}
                className="w-full bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8]"
              >
                {completePaymentLoading
                  ? "Redirecting to Oxapay..."
                  : "Complete Payment"}
              </Button>
              <p className="text-xs text-[#d1f7ff]/40">
                You will be redirected to Oxapay to complete your payment
                securely. After payment, refresh your balance to see the update.
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
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setPaymentStep("input");
                    setError("");
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
  );
}
