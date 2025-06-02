import { supabase } from "@/lib/supabase"

export interface WebShell {
  id: string
  name: string
  description?: string | null
  file_path: string
  file_size?: number | null
  language: string
  category: string
  tags: string[]
  download_count: number
  is_active: boolean
  uploaded_by?: string | null
  created_at: string
  updated_at: string
  uploader?: {
    username?: string
    email?: string
  }
}

export interface ShellFormData {
  name: string
  description?: string
  file_path: string
  file_size?: number
  language: string
  category: string
  tags?: string[]
  is_active: boolean
}

export class ShellsService {
  static async getAllShells(): Promise<WebShell[]> {
    console.log("Fetching all shells...")
    try {
      const { data, error } = await supabase
        .from("web_shells")
        .select(`
          id,
          name,
          description,
          file_path,
          file_size,
          language,
          category,
          tags,
          download_count,
          is_active,
          uploaded_by,
          created_at,
          updated_at,
          uploader:users(username, email)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching shells:", error)
        throw error
      }

      console.log(`Successfully fetched ${data?.length || 0} shells`)
      return data || []
    } catch (err) {
      console.error("Exception in getAllShells:", err)
      throw err
    }
  }

  static async getActiveShells(): Promise<WebShell[]> {
    console.log("Fetching active shells...")
    try {
      const { data, error } = await supabase
        .from("web_shells")
        .select(`
          id,
          name,
          description,
          file_path,
          file_size,
          language,
          category,
          tags,
          download_count,
          is_active,
          uploaded_by,
          created_at,
          updated_at,
          uploader:users(username, email)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching active shells:", error)
        throw error
      }

      console.log(`Successfully fetched ${data?.length || 0} active shells`)
      return data || []
    } catch (err) {
      console.error("Exception in getActiveShells:", err)
      throw err
    }
  }

  static async getShellById(id: string): Promise<WebShell | null> {
    console.log(`Fetching shell with ID: ${id}`)
    try {
      const { data, error } = await supabase
        .from("web_shells")
        .select(`
          id,
          name,
          description,
          file_path,
          file_size,
          language,
          category,
          tags,
          download_count,
          is_active,
          uploaded_by,
          created_at,
          updated_at,
          uploader:users(username, email)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching shell by ID:", error)
        throw error
      }

      console.log("Successfully fetched shell:", data?.name)
      return data
    } catch (err) {
      console.error("Exception in getShellById:", err)
      throw err
    }
  }

  static async createShell(shellData: ShellFormData, userId: string): Promise<WebShell> {
    console.log("Creating new shell:", shellData.name)
    try {
      const insertData = {
        name: shellData.name,
        description: shellData.description || null,
        file_path: shellData.file_path,
        file_size: shellData.file_size || null,
        language: shellData.language,
        category: shellData.category,
        tags: shellData.tags || [],
        download_count: 0,
        is_active: shellData.is_active,
        uploaded_by: userId,
      }

      const { data, error } = await supabase
        .from("web_shells")
        .insert(insertData)
        .select(`
          id,
          name,
          description,
          file_path,
          file_size,
          language,
          category,
          tags,
          download_count,
          is_active,
          uploaded_by,
          created_at,
          updated_at,
          uploader:users(username, email)
        `)
        .single()

      if (error) {
        console.error("Error creating shell:", error)
        throw error
      }

      console.log("Successfully created shell:", data?.name)
      return data
    } catch (err) {
      console.error("Exception in createShell:", err)
      throw err
    }
  }

  static async updateShell(id: string, shellData: ShellFormData): Promise<WebShell> {
    console.log(`Updating shell with ID: ${id}`)
    try {
      const updateData = {
        name: shellData.name,
        description: shellData.description || null,
        file_path: shellData.file_path,
        file_size: shellData.file_size || null,
        language: shellData.language,
        category: shellData.category,
        tags: shellData.tags || [],
        is_active: shellData.is_active,
      }

      const { data, error } = await supabase
        .from("web_shells")
        .update(updateData)
        .eq("id", id)
        .select(`
          id,
          name,
          description,
          file_path,
          file_size,
          language,
          category,
          tags,
          download_count,
          is_active,
          uploaded_by,
          created_at,
          updated_at,
          uploader:users(username, email)
        `)
        .single()

      if (error) {
        console.error("Error updating shell:", error)
        throw error
      }

      console.log("Successfully updated shell:", data?.name)
      return data
    } catch (err) {
      console.error("Exception in updateShell:", err)
      throw err
    }
  }

  static async deleteShell(id: string): Promise<void> {
    console.log(`Deleting shell with ID: ${id}`)
    try {
      const { error } = await supabase.from("web_shells").delete().eq("id", id)

      if (error) {
        console.error("Error deleting shell:", error)
        throw error
      }

      console.log(`Successfully deleted shell with ID: ${id}`)
    } catch (err) {
      console.error("Exception in deleteShell:", err)
      throw err
    }
  }

  static async incrementDownloadCount(id: string): Promise<void> {
    console.log(`Incrementing download count for shell: ${id}`)
    try {
      // Get current count
      const { data: shell } = await supabase.from("web_shells").select("download_count").eq("id", id).single()

      if (shell) {
        const { error } = await supabase
          .from("web_shells")
          .update({ download_count: (shell.download_count || 0) + 1 })
          .eq("id", id)

        if (error) {
          console.error("Error incrementing download count:", error)
        }
      }
    } catch (err) {
      console.error("Exception in incrementDownloadCount:", err)
    }
  }

  static async searchShells(query: string): Promise<WebShell[]> {
    console.log(`Searching shells with query: ${query}`)
    try {
      const { data, error } = await supabase
        .from("web_shells")
        .select(`
          id,
          name,
          description,
          file_path,
          file_size,
          language,
          category,
          tags,
          download_count,
          is_active,
          uploaded_by,
          created_at,
          updated_at,
          uploader:users(username, email)
        `)
        .eq("is_active", true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,language.ilike.%${query}%,category.ilike.%${query}%`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error searching shells:", error)
        throw error
      }

      console.log(`Successfully found ${data?.length || 0} shells matching query: ${query}`)
      return data || []
    } catch (err) {
      console.error("Exception in searchShells:", err)
      throw err
    }
  }
}
