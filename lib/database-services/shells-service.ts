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
  language?: string
  category?: string
  file_path: string
  file_size?: number
  tags?: string[]
  is_active: boolean
}
