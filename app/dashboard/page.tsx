import ProtectedRoute from "@/components/auth/protected-route"
import DashboardOverview from "@/components/dashboard/dashboard-overview"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardOverview />
    </ProtectedRoute>
  )
}
