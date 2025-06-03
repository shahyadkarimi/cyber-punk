import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import DomainSubmissionForm from "@/components/dashboard/domain-submission-form";

export default function SubmitDomainPage() {
  return (
    <ProtectedRoute allowedRoles={["seller", "admin"]}>
      <DomainSubmissionForm />
    </ProtectedRoute>
  );
}
