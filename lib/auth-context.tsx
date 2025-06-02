"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import type { UserRole } from "./database.types"

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, username?: string, role?: UserRole) => Promise<{ error: any; user?: User }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let mounted = true

    // Get initial session with retry logic
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error("Error getting session:", error)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
        setLoading(false)
      } catch (error) {
        console.error("Failed to get initial session:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event, session?.user?.id)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    const maxRetries = 3

    try {
      console.log(`Fetching user profile for ${userId}, attempt ${retryCount + 1}`)

      // Simple query to get user profile
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)

        // If user doesn't exist, create a basic profile
        if (error.code === "PGRST116" && retryCount === 0) {
          console.log("User profile not found, creating basic profile...")

          try {
            const { data: authUser } = await supabase.auth.getUser()
            if (authUser.user) {
              const newProfile = {
                id: authUser.user.id,
                email: authUser.user.email,
                username: authUser.user.user_metadata?.username || authUser.user.email?.split("@")[0] || "user",
                full_name: authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.username || "",
                role: (authUser.user.user_metadata?.role as UserRole) || "client",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }

              const { error: insertError } = await supabase.from("users").insert(newProfile)

              if (!insertError) {
                console.log("Created new user profile, retrying fetch...")
                // Retry fetching after creation
                setTimeout(() => fetchUserProfile(userId, retryCount + 1), 1000)
                return
              } else {
                console.error("Error creating user profile:", insertError)
              }
            }
          } catch (createError) {
            console.error("Error creating user profile:", createError)
          }
        }

        // If it's a network error and we haven't exceeded retries, try again
        if (retryCount < maxRetries && (error.message?.includes("fetch") || error.message?.includes("network"))) {
          console.log(`Retrying fetch in ${(retryCount + 1) * 1000}ms...`)
          setTimeout(() => fetchUserProfile(userId, retryCount + 1), (retryCount + 1) * 1000)
          return
        }

        // Create a minimal profile from auth data as fallback
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser.user) {
          const fallbackProfile = {
            id: authUser.user.id,
            email: authUser.user.email,
            username: authUser.user.email?.split("@")[0] || "user",
            role: "client" as UserRole,
            is_active: true,
          }
          setUserProfile(fallbackProfile)
          setIsAdmin(false)
        }
      } else {
        console.log("User profile fetched successfully:", data)
        setUserProfile(data)
        setIsAdmin(data?.role === "admin")
      }
    } catch (error) {
      console.error("Network error fetching user profile:", error)

      // If it's a network error and we haven't exceeded retries, try again
      if (retryCount < maxRetries) {
        console.log(`Network error, retrying in ${(retryCount + 1) * 2000}ms...`)
        setTimeout(() => fetchUserProfile(userId, retryCount + 1), (retryCount + 1) * 2000)
        return
      }

      // Create a minimal profile as final fallback
      try {
        const { data: authUser } = await supabase.auth.getUser()
        if (authUser.user) {
          const fallbackProfile = {
            id: authUser.user.id,
            email: authUser.user.email,
            username: authUser.user.email?.split("@")[0] || "user",
            role: "client" as UserRole,
            is_active: true,
          }
          setUserProfile(fallbackProfile)
          setIsAdmin(false)
          console.log("Using fallback profile due to network issues")
        }
      } catch (fallbackError) {
        console.error("Failed to create fallback profile:", fallbackError)
      }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: { message: "Network error during sign in" } }
    }
  }

  const signUp = async (email: string, password: string, username?: string, role: UserRole = "client") => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split("@")[0],
            role: role,
            full_name: username || "",
          },
        },
      })

      if (error) {
        return { error, user: null }
      }

      return { error: null, user: data.user }
    } catch (err) {
      console.error("Signup error:", err)
      return { error: { message: "Network error during signup" }, user: null }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUserProfile(null)
      setIsAdmin(false)
    } catch (error) {
      console.error("Sign out error:", error)
      // Force clear state even if signOut fails
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      return { error }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: { message: "Network error during password reset" } }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
