"use client"

import { useAuth } from "@/hooks/use-auth"
import AdminDashboard from "./admin-dashboard"
import SellerDashboard from "./seller-dashboard"
import ClientDashboard from "./client-dashboard"

export default function DashboardOverview() {
  const { userProfile, loading } = useAuth()

  if (loading || !userProfile) {
    return null
  }

  const role = userProfile.role

  switch (role) {
    case "admin":
      return <AdminDashboard />
    case "seller":
      return <SellerDashboard />
    case "client":
    default:
      return <ClientDashboard />
  }
}
