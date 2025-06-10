"use client"

import { useAuth } from "@/hooks/use-auth"
import AdminDashboard from "./admin-dashboard"
import SellerDashboard from "./seller-dashboard"
import ClientDashboard from "./client-dashboard"

export default function DashboardOverview() {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return null
  }

  const role = user.role

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
