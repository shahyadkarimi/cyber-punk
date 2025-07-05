import type { Metadata } from "next";
import MyDomainsList from "@/components/dashboard/my-domains-list";
import MyReferralsList from "@/components/dashboard/my-referral-list";
import ProtectedRoute from "@/components/auth/protected-route";

export const metadata: Metadata = {
  title: "My Referral | Cyberpunk Web Shell Hub",
  description: "See your referral list",
};

export default function MyReferral() {
  return (
    <ProtectedRoute allowedRoles={["client", "seller"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#00ff9d]">My Referrals</h1>
          <p className="text-gray-400">Manage your referrals</p>
        </div>

        <MyReferralsList />
      </div>
    </ProtectedRoute>
  );
}
