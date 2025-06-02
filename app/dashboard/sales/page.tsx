import type { Metadata } from "next"
import SalesList from "@/components/dashboard/sales-list"

export const metadata: Metadata = {
  title: "Sales | Cyberpunk Web Shell Hub",
  description: "Track your domain sales and revenue",
}

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#00ff9d]">Sales Dashboard</h1>
        <p className="text-gray-400">Track your domain sales and revenue</p>
      </div>

      <SalesList />
    </div>
  )
}
