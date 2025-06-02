import type { Metadata } from "next"
import ProtectedRoute from "@/components/auth/protected-route"
import ShellsManagement from "@/components/dashboard/admin/shells-management"

export const metadata: Metadata = {
  title: "Shells Management | Admin Dashboard",
  description: "Manage web shells database - create, edit and delete shells",
}

export default function AdminShellsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#00ff9d] mb-2">Shells Management</h1>
          <p className="text-gray-400">Manage the web shells database - create, edit and delete shells</p>
        </div>
        <ShellsManagement />
      </div>
    </ProtectedRoute>
  )
}
