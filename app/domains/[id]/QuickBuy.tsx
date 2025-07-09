"use client";

import { PurchaseModal } from "@/components/purchase-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Ban, DollarSign } from "lucide-react";
import React, { ReactNode, useState } from "react";

const QuickBuy = ({ domain }: { domain: any }) => {
  const { user } = useAuth();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

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

  return (
    <>
      <Button
        disabled={domain.status === "sold"}
        onClick={purchaseDomainHandler}
        className={`w-full ${
          domain.status === "sold"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        } text-white`}
      >
        {domain.status === "sold" ? (
          <>
            <Ban className="h-4 w-4 mr-2" />
            Domain Sold
          </>
        ) : (
          <>
            <DollarSign className="h-4 w-4 mr-2" />
            Buy Now - {formatPrice(domain.price)}
          </>
        )}
      </Button>

      {showPurchaseModal && (
        <PurchaseModal
          domain={domain}
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </>
  );
};

export default QuickBuy;
