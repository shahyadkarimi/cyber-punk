import type { Metadata } from "next"
import MyDomainsList from "@/components/dashboard/my-domains-list"

export const metadata: Metadata = {
  title: "My Domains | Cyberpunk Web Shell Hub",
  description: "Manage your domain listings",
}

export default function MyDomainsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#00ff9d]">My Domains</h1>
        <p className="text-gray-400">Manage your domain listings and track their status</p>
      </div>

      <MyDomainsList />
    </div>
  )
}
