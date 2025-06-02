import type { Metadata } from "next"
import TransactionsManagement from "@/components/dashboard/admin/transactions-management"

export const metadata: Metadata = {
  title: "Transactions Management | Admin Panel",
  description: "Manage all transactions in the system",
}

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#00ff9d]">Transactions Management</h1>
        <p className="text-gray-400">View and manage all transactions in the system</p>
      </div>

      <TransactionsManagement />
    </div>
  )
}
