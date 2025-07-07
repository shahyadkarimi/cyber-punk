"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  CreditCard,
  Wallet,
  ExternalLink,
  Copy,
  Shield,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { postData } from "@/services/API";
import html2canvas from "html2canvas";

export default function PaymentStatus({}) {
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState<true | false | null>(null);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState<any>({});
  const [transactionLoading, setTransactionLoading] = useState(true);

  const searchParams = useSearchParams();
  const transactionOrderId = searchParams.get("orderId");
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transactionOrderId) {
      setTransactionLoading(true);

      postData("/transactions/get", { orderId: transactionOrderId })
        .then((res) => {
          setTransactionLoading(false);
          setIsSuccess(true);
          setPaymentData(res?.data?.transaction);
        })
        .catch((err) => {
          setTransactionLoading(false);
          setError(
            err?.response?.data?.error || "Faild to get payment details"
          );
        });
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const handleCapture = async () => {
    if (!ref.current) return;

    const canvas = await html2canvas(ref.current, {
      backgroundColor: "#0a0a0c",
      useCORS: true,
    });

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${paymentData?.domain?.domain}`;
    link.click();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            // onClick={handleRefresh}
            className="px-4 py-2 bg-[#2a2a3a] hover:bg-[#3a3a4a] rounded-md text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      {transactionLoading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-12 w-12 animate-spin text-[#00ff9d]" />
          <p className="ml-2 text-[#00ff9d] text-lg">Loading payment data...</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="border-b border-[#2a2a3a] bg-[#1a1a1a]">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    // router.push("/dashboard");

                    handleCapture();
                  }}
                  className="text-white hover:bg-[#2a2a3a]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push("/domains");
                    }}
                    className="border-[#2a2a3a] text-white hover:bg-[#2a2a3a] bg-transparent"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    View all domains
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div ref={ref} className={`container mx-auto py-8 px-4`}>
            {/* Status Hero Section */}
            <div
              className={`relative overflow-hidden ${
                isSuccess
                  ? "bg-green-800/15 border border-green-800"
                  : "bg-red-800/15 border border-red-800"
              } p-8 md:p-12 mb-8`}
            >
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-6">
                  {isSuccess ? (
                    <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center">
                      <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                  )}
                </div>

                <h1
                  className={`text-4xl md:text-5xl font-bold mb-4 ${
                    isSuccess ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isSuccess ? "Payment Successful!" : "Payment Failed"}
                </h1>

                <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
                  {isSuccess
                    ? `Congratulations! Your purchase of ${paymentData?.domain?.domain} has been completed successfully.`
                    : `We're sorry, but your payment for ${paymentData?.domain?.domain} could not be processed. Please try again or contact support.`}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="text-3xl font-bold text-white">
                    {formatPrice(paymentData.amount)}
                  </div>
                  <Badge
                    className={`${
                      isSuccess
                        ? "bg-green-600/15 text-green-600 border-green-600"
                        : "bg-red-600/15 text-red-600 border-red-600"
                    }`}
                  >
                    {isSuccess ? "Completed" : "Failed"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Transaction Details */}
              <div className="space-y-6 h-fit">
                {/* Transaction Information */}
                <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Transaction Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-400">Track ID</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={paymentData.track_id}
                            readOnly
                            className="bg-[#0a0a0c] border-[#3a3a4a] text-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#2a2a3a] text-white hover:bg-[#2a2a3a] bg-transparent"
                            onClick={() =>
                              copyToClipboard(paymentData.track_id)
                            }
                          >
                            {copied ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-400">Domain Name</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={paymentData?.domain?.domain}
                            readOnly
                            className="bg-[#0a0a0c] border-[#3a3a4a] text-white"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#2a2a3a] text-white hover:bg-[#2a2a3a] bg-transparent"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-[#2a2a3a]" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Amount</span>
                        <span className="font-semibold text-white">
                          {formatPrice(paymentData?.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Transaction Date</span>
                        <span className="font-semibold text-white">
                          {formatDate(paymentData?.completed_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">DA/PA</span>
                        <span className="font-semibold text-white">
                          {paymentData?.domain?.da_score || "N/A"}/{" "}
                          {paymentData?.domain?.pa_score || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Status</span>
                        <Badge
                          className={`${
                            isSuccess
                              ? "bg-green-600/15 text-green-600"
                              : "bg-red-600/15 text-red-600"
                          }`}
                        >
                          {isSuccess ? "Paid" : "Failed"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      {paymentData.payment_method === "oxapay" ? (
                        <CreditCard className="h-5 w-5 text-purple-600" />
                      ) : (
                        <Wallet className="h-5 w-5 text-orange-600" />
                      )}
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${
                          paymentData.payment_method === "oxapay"
                            ? "bg-purple-600/15"
                            : "bg-orange-600/15"
                        } rounded-lg flex items-center justify-center`}
                      >
                        {paymentData.payment_method === "oxapay" ? (
                          <CreditCard
                            className={`h-6 w-6 ${
                              paymentData.payment_method === "oxapay"
                                ? "text-purple-600"
                                : "text-orange-600"
                            }`}
                          />
                        ) : (
                          <Wallet
                            className={`h-6 w-6 ${
                              paymentData.payment_method === "oxapay"
                                ? "text-purple-600"
                                : "text-orange-600"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {paymentData.payment_method === "oxapay"
                            ? "Payment Gateway"
                            : "Digital Wallet"}
                        </div>
                        <div className="text-sm text-slate-400">
                          {paymentData.payment_method === "oxapay"
                            ? `Processed via Oxapay`
                            : `Paid with wallet`}
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-[#2a2a3a]" />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Method Type</span>
                        <Badge
                          className={`${
                            paymentData.payment_method === "oxapay"
                              ? "bg-purple-600/15 text-purple-600"
                              : "bg-orange-600/15 text-orange-600"
                          }`}
                        >
                          {paymentData.payment_method === "oxapay"
                            ? "Gateway"
                            : "Wallet"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Provider</span>
                        <span className="text-white">
                          {paymentData.payment_method === "oxapay"
                            ? paymentData.payment_method
                            : "wallet"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Actions & Support */}
              <div className="space-y-6">
                {/* Domain Preview */}
                {isSuccess && (
                  <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Globe className="h-5 w-5 text-neon-green" />
                        Domain Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">
                            Your new domain:
                          </span>
                          <span className="font-semibold text-neon-green text-lg">
                            {paymentData?.domain?.domain}
                          </span>
                        </div>

                        <div className="border border-[#2a2a3a] rounded-lg overflow-hidden">
                          <img
                            className="w-full max-h-80 object-cover object-top"
                            src={`https://image.thum.io/get/width/800/https://${paymentData?.domain?.domain}`}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="border-neon-green text-neon-green hover:bg-neon-green/10 bg-transparent"
                            onClick={() =>
                              window.open(
                                `https://${paymentData?.domain?.domain}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Domain
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Security Information */}
                {/* <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="font-semibold text-white">
                          {isSuccess
                            ? "Secure Transaction"
                            : "Secure & Protected"}
                        </div>
                        <div className="text-sm text-slate-400">
                          {isSuccess
                            ? "Your payment is protected by escrow"
                            : "Your payment information is secure"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}

                {/* Transaction Timeline */}
                {/* <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isSuccess ? "bg-green-600" : "bg-red-600"
                        }`}
                      ></div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {isSuccess ? "Payment Completed" : "Payment Failed"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatDate(paymentData.transactionDate)}
                        </div>
                      </div>
                    </div>

                    {isSuccess && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              Domain Transfer Initiated
                            </div>
                            <div className="text-xs text-slate-400">
                              Processing...
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                          <div>
                            <div className="text-sm font-medium text-slate-400">
                              Domain Transfer Complete
                            </div>
                            <div className="text-xs text-slate-500">
                              Pending (24-48 hours)
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card> */}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
