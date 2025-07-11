import type { Metadata } from "next"
import WalletTransactionsList from "@/components/dashboard/wallet-transactions-list"

export const metadata: Metadata = {
  title: "Transactions | Cyberpunk Web Shell Hub",
  description: "View and manage your transactions",
}

export default function WalletTransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#00ff9d]">Wallet Transactions</h1>
        <p className="text-gray-400">View and manage users wallet transactions history</p>
      </div>

      <WalletTransactionsList />
    </div>
  )
}
