import type { Metadata } from "next"
import ProtectedRoute from "@/components/auth/protected-route"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Shield, Info } from "lucide-react"

export const metadata: Metadata = {
  title: "Settings - Dashboard",
  description: "Manage website settings and configuration",
}

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#00ff9d]/10 rounded-lg">
              <Settings className="h-6 w-6 text-[#00ff9d]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Website Settings</h1>
              <p className="text-gray-400">Configure your website settings and preferences</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-8 bg-[#1a1a2e] border-[#00ff9d]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#00ff9d]">
              <Info className="h-5 w-5" />
              Important Information
            </CardTitle>
            <CardDescription className="text-gray-300">
              These settings control various aspects of your website. Changes will take effect immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-gray-400">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#00ff9d]" />
                Only administrators can modify these settings
              </li>
              <li className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#00ff9d]" />
                Changes are saved automatically when you click "Save All Settings"
              </li>
              <li className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[#00ff9d]" />
                Some settings may require a page refresh to take effect
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <SettingsForm />
      </div>
    </ProtectedRoute>
  )
}
