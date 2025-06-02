"use client"

import type React from "react"

import { useRole } from "@/lib/use-role"

interface RoleBasedComponentProps {
  adminComponent?: React.ReactNode
  sellerComponent?: React.ReactNode
  clientComponent?: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleBasedComponent({
  adminComponent,
  sellerComponent,
  clientComponent,
  fallback,
}: RoleBasedComponentProps) {
  const { role, loading } = useRole()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00ff9d] border-t-transparent"></div>
      </div>
    )
  }

  switch (role) {
    case "admin":
      return <>{adminComponent || fallback}</>
    case "seller":
      return <>{sellerComponent || fallback}</>
    case "client":
      return <>{clientComponent || fallback}</>
    default:
      return <>{fallback}</>
  }
}
