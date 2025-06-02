import { Suspense } from "react"
import { DomainsMarketplace } from "@/components/domains-marketplace"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Domain Marketplace | Cyberpunk Web Shell Hub",
  description: "Browse and purchase premium domains with high DA/PA scores, traffic, and SEO value.",
  keywords: "domains, marketplace, buy domains, sell domains, premium domains, high DA domains",
}

export default function DomainsPage() {
  return (
    <div className="min-h-screen bg-[#0d0221] text-[#d1f7ff]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8] bg-clip-text text-transparent">
            Domain Marketplace
          </h1>
          <p className="text-xl text-[#d1f7ff]/80 max-w-2xl mx-auto">
            Discover premium domains with high authority scores, traffic, and SEO value
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#05d9e8]"></div>
            </div>
          }
        >
          <DomainsMarketplace />
        </Suspense>
      </div>
    </div>
  )
}
