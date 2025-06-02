import type { Json } from "./database.types"

export interface WebsiteSetting {
  id: string
  key: string
  value: Json
  category: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  updated_by: string | null
}

export interface WebsiteSettingUpdate {
  value: Json
  updated_by?: string
}

export interface WebsiteSettingCreate {
  key: string
  value: Json
  category: string
  description?: string
  is_public?: boolean
}

export type SettingsFormState = Record<string, Json>

// Input type for rendering appropriate form controls
export type SettingInputType = "text" | "textarea" | "number" | "boolean" | "color" | "email" | "url" | "json"
