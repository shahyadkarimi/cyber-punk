"use client";

import { PurchaseModal } from "@/components/purchase-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Ban, DollarSign } from "lucide-react";
import React, { useState } from "react";

const BuyDomain = ({ domain }: { domain: any }) => {
  const { user } = useAuth();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

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
        className={`${
          domain.status === "sold"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-purple-600 hover:bg-purple-700"
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
            Buy Now
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

export default BuyDomain;
