import { supabase } from "./supabase"

// Admin service that uses service role for admin operations
export class AdminService {
  // Check if current user is admin
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.from("users").select("role").eq("id", userId).single()

      if (error) {
        console.error("Error checking admin status:", error)
        return false
      }

      return data?.role === "admin"
    } catch (error) {
      console.error("Error in isAdmin check:", error)
      return false
    }
  }

  // Get all users (admin only)
  static async getAllUsers() {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error fetching all users:", error)
      return { data: null, error }
    }
  }

  // Update user role (admin only)
  static async updateUserRole(userId: string, role: string) {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error("Error updating user role:", error)
      return { data: null, error }
    }
  }

  // Delete user (admin only)
  static async deleteUser(userId: string) {
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId)

      return { error }
    } catch (error) {
      console.error("Error deleting user:", error)
      return { error }
    }
  }
}
