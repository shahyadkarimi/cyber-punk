import PaymentStatus from "@/components/payment-status";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Your Payment Status | Cyberpunk Web Shell Hub",
  description:
    "A comprehensive collection of web shells for cybersecurity research and penetration testing.",
  keywords:
    "web shells, php shells, asp shells, jsp shells, cybersecurity tools, penetration testing",
};

export default function page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense>
        <PaymentStatus />
      </Suspense>
    </main>
  );
}
