import ProfileClientPage from "@/components/dashboard/profile-client-page" // Renamed to avoid conflict

export const metadata = {
  title: "User Profile | Cyberpunk Web Shell Hub",
  description: "Manage your user profile and settings.",
}

export default function ProfilePage() {
  return (
    // If AuthProvider is already in a higher layout, you might not need it here
    // <AuthProvider>
    <ProfileClientPage />
    // </AuthProvider>
  )
}
