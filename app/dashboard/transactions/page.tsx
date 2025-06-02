import type { Metadata } from "next"
import TransactionsList from "@/components/dashboard/transactions-list"

export const metadata: Metadata = {
  title: "Transactions | Cyberpunk Web Shell Hub",
  description: "View and manage your transactions",
}

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#00ff9d]">Transactions</h1>
        <p className="text-gray-400">View and manage your transaction history</p>
      </div>

      <TransactionsList />
    </div>
  )
}
