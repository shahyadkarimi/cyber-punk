import type { Metadata } from "next";
import TransactionDetail from "@/components/dashboard/transaction-detail";

interface TransactionDetailPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "Transaction Details | Cyberpunk Web Shell Hub",
  description: "View transaction details",
};

export default function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#00ff9d]">
          Transaction Details
        </h1>
        <p className="text-gray-400">
          View detailed information about this transaction
        </p>
      </div>

      <TransactionDetail method="domain" trackId={params.id} />
    </div>
  );
}
