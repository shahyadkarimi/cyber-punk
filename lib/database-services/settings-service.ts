import { supabase } from "@/lib/supabase"
import type { WebsiteSetting, WebsiteSettingCreate } from "@/lib/types/settings"
import type { Json } from "@/lib/database.types"

export const settingsService = {
  async getAllSettings(): Promise<WebsiteSetting[]> {
    try {
      const { data, error } = await supabase.from("website_settings").select("*").order("category").order("key")

      if (error) {
        console.error("Error fetching settings:", error)
        throw new Error(`Failed to fetch settings: ${error.message}`)
      }

      return data || []
    } catch (error: any) {
      console.error("Settings service error:", error)
      throw error
    }
  },

  async getPublicSettings(): Promise<Record<string, Json>> {
    try {
      const { data, error } = await supabase.from("website_settings").select("key, value").eq("is_public", true)

      if (error) {
        console.error("Error fetching public settings:", error)
        return {}
      }

      return (data || []).reduce(
        (acc, setting) => {
          acc[setting.key] = setting.value
          return acc
        },
        {} as Record<string, Json>,
      )
    } catch (error) {
      console.error("Public settings error:", error)
      return {}
    }
  },

  async getSettingByKey(key: string): Promise<WebsiteSetting | null> {
    try {
      const { data, error } = await supabase.from("website_settings").select("*").eq("key", key).maybeSingle()

      if (error) {
        console.error(`Error fetching setting ${key}:`, error)
        throw new Error(`Failed to fetch setting ${key}: ${error.message}`)
      }

      return data
    } catch (error: any) {
      console.error("Get setting error:", error)
      throw error
    }
  },

  async updateSetting(key: string, value: Json, userId: string): Promise<WebsiteSetting> {
    try {
      const { data, error } = await supabase
        .from("website_settings")
        .update({
          value,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("key", key)
        .select()
        .single()

      if (error) {
        console.error(`Error updating setting ${key}:`, error)
        throw new Error(`Failed to update setting ${key}: ${error.message}`)
      }

      return data
    } catch (error: any) {
      console.error("Update setting error:", error)
      throw error
    }
  },

  async createSetting(setting: WebsiteSettingCreate, userId: string): Promise<WebsiteSetting> {
    try {
      const { data, error } = await supabase
        .from("website_settings")
        .insert({
          ...setting,
          updated_by: userId,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating setting:", error)
        throw new Error(`Failed to create setting: ${error.message}`)
      }

      return data
    } catch (error: any) {
      console.error("Create setting error:", error)
      throw error
    }
  },

  async updateMultipleSettings(
    settingsToUpdate: Array<{ key: string; value: Json }>,
    userId: string,
  ): Promise<WebsiteSetting[]> {
    try {
      const results: WebsiteSetting[] = []

      // Update each setting individually to avoid null constraint issues
      for (const setting of settingsToUpdate) {
        const { data, error } = await supabase
          .from("website_settings")
          .update({
            value: setting.value,
            updated_by: userId,
            updated_at: new Date().toISOString(),
          })
          .eq("key", setting.key)
          .select()
          .single()

        if (error) {
          console.error(`Error updating setting ${setting.key}:`, error)
          throw new Error(`Failed to update setting ${setting.key}: ${error.message}`)
        }

        if (data) {
          results.push(data)
        }
      }

      return results
    } catch (error: any) {
      console.error("Update multiple settings error:", error)
      throw error
    }
  },

  // Keep the old method for backward compatibility but use the new one
  async upsertSettings(settings: Array<{ key: string; value: Json }>, userId: string): Promise<WebsiteSetting[]> {
    return this.updateMultipleSettings(settings, userId)
  },

  async deleteSetting(key: string): Promise<void> {
    try {
      const { error } = await supabase.from("website_settings").delete().eq("key", key)

      if (error) {
        console.error(`Error deleting setting ${key}:`, error)
        throw new Error(`Failed to delete setting ${key}: ${error.message}`)
      }
    } catch (error: any) {
      console.error("Delete setting error:", error)
      throw error
    }
  },
}
