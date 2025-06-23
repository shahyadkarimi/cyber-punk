import ProtectedRoute from "@/components/auth/protected-route"
import DomainsManagement from "@/components/dashboard/admin/domains-management"

export default function AdminDomainsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#00ff9d]">Domains Management</h1>
        <p className="text-gray-400">
          Oversee, approve, and manage all domain submissions and listings on the platform.
        </p>
        
        <DomainsManagement />
      </div>
    </ProtectedRoute>
  )
}
