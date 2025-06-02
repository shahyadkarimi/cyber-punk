"use client"

import { useAuth } from "./auth-context"
import { useEffect, useState } from "react"
import { supabase } from "./supabase"
import type { UserRole } from "./database.types"

export function useRole() {
  const { user } = useAuth()
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.from("users").select("role").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching user role:", error)
          setRole("client") // Default role
        } else {
          setRole(data.role as UserRole)
        }
      } catch (error) {
        console.error("Error:", error)
        setRole("client")
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user])

  const isAdmin = role === "admin"
  const isSeller = role === "seller"
  const isClient = role === "client"

  return {
    role,
    loading,
    isAdmin,
    isSeller,
    isClient,
    hasRole: (requiredRole: UserRole) => role === requiredRole,
    hasAnyRole: (roles: UserRole[]) => (role ? roles.includes(role) : false),
  }
}
