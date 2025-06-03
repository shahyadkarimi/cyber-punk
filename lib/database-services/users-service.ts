import { supabase } from "../supabase"

export interface User {
  id: string
  email: string
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  role: "admin" | "seller" | "client"
  is_active: boolean
  admin_approved: boolean
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

export interface UserStats {
  total: number
  admins: number
  sellers: number
  clients: number
  active: number
  inactive: number
}

export class UsersService {
  // Helper method to check if current user is admin
  private static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser.user) return false

      // Check database
      const { data: userProfile } = await supabase.from("users").select("role").eq("id", currentUser.user.id).single()

      return userProfile?.role === "admin"
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      console.log("Fetching all users...")

      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      console.log("Is current user admin:", isAdmin)

      if (!isAdmin) {
        throw new Error("Access denied: Admin role required")
      }

      // Try direct database query with no RLS
      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          email,
          username,
          full_name,
          avatar_url,
          role,
          is_active,
          admin_approved,
          last_login_at,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching users:", error)
        throw error
      }

      console.log("Fetched users count:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("Error in getAllUsers:", error)
      throw error
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          email,
          username,
          full_name,
          avatar_url,
          role,
          is_active,
          admin_approved,
          last_login_at,
          created_at,
          updated_at
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching user:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in getUserById:", error)
      throw error
    }
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        throw new Error("Access denied: Admin role required")
      }

      // Remove fields that don't exist in the database
      const { created_at, updated_at, ...validUpdates } = updates

      const { data, error } = await supabase
        .from("users")
        .update({
          ...validUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          id,
          email,
          username,
          full_name,
          avatar_url,
          role,
          is_active,
          admin_approved,
          last_login_at,
          created_at,
          updated_at
        `)
        .single()

      if (error) {
        console.error("Error updating user:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in updateUser:", error)
      throw error
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        throw new Error("Access denied: Admin role required")
      }

      const { error } = await supabase.from("users").delete().eq("id", id)

      if (error) {
        console.error("Error deleting user:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in deleteUser:", error)
      throw error
    }
  }

  static async getUserStats(): Promise<UserStats> {
    try {
      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        throw new Error("Access denied: Admin role required")
      }

      // Try to get all users first
      const users = await this.getAllUsers()

      const stats: UserStats = {
        total: users.length,
        admins: users.filter((u) => u.role === "admin").length,
        sellers: users.filter((u) => u.role === "seller").length,
        clients: users.filter((u) => u.role === "client").length,
        active: users.filter((u) => u.is_active).length,
        inactive: users.filter((u) => !u.is_active).length,
      }

      console.log("User stats:", stats)
      return stats
    } catch (error) {
      console.error("Error in getUserStats:", error)
      return {
        total: 0,
        admins: 0,
        sellers: 0,
        clients: 0,
        active: 0,
        inactive: 0,
      }
    }
  }

  static async searchUsers(query: string): Promise<User[]> {
    try {
      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        throw new Error("Access denied: Admin role required")
      }

      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          email,
          username,
          full_name,
          avatar_url,
          role,
          is_active,
          admin_approved,
          last_login_at,
          created_at,
          updated_at
        `)
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error searching users:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in searchUsers:", error)
      throw error
    }
  }

  static async updateUserRole(id: string, role: "admin" | "seller" | "client"): Promise<User> {
    return this.updateUser(id, { role })
  }

  static async toggleUserStatus(id: string, is_active: boolean): Promise<User> {
    return this.updateUser(id, { is_active })
  }

    static async toggleUserAdminApprov(id: string, admin_approved: boolean): Promise<User> {
    return this.updateUser(id, { admin_approved })
  }
}
