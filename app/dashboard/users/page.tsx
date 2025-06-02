import type { Metadata } from "next"
import ProtectedRoute from "@/components/auth/protected-route"
import UsersManagement from "@/components/dashboard/admin/users-management"

export const metadata: Metadata = {
  title: "Users Management | Admin Dashboard",
  description: "Manage user accounts and roles",
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UsersManagement />
    </ProtectedRoute>
  )
}
