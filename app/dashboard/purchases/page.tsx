import type { Metadata } from "next";
import PurchasesDomains from "@/components/dashboard/purchases-domains-list";

export const metadata: Metadata = {
  title: "Purchases Domains | Cyberpunk Web Shell Hub",
  description: "Manage your domains",
};

export default function MyDomainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#00ff9d]">Purchases Domains</h1>
        <p className="text-gray-400">Manage your domains</p>
      </div>

      <PurchasesDomains />
    </div>
  );
}
