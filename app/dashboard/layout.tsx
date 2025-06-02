import type React from "react"
import type { Metadata } from "next"
import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export const metadata: Metadata = {
  title: "Dashboard | Cyberpunk Web Shell Hub",
  description: "User dashboard for managing your account and activities",
}

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
