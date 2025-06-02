export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = "admin" | "seller" | "client"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      domains: {
        Row: {
          id: string
          created_at: string
          domain: string
          description: string | null
          price: number | null
          status: "pending" | "approved" | "rejected" | "sold"
          seller_id: string
          buyer_id: string | null
          admin_notes: string | null
          da_score: number | null
          pa_score: number | null
          traffic: number | null
          category: string | null
          tags: string[]
          approved_at: string | null
          approved_by: string | null
          sold_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          domain: string
          description?: string | null
          price?: number | null
          status?: "pending" | "approved" | "rejected" | "sold"
          seller_id: string
          buyer_id?: string | null
          admin_notes?: string | null
          da_score?: number | null
          pa_score?: number | null
          traffic?: number | null
          category?: string | null
          tags?: string[]
          approved_at?: string | null
          approved_by?: string | null
          sold_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          domain?: string
          description?: string | null
          price?: number | null
          status?: "pending" | "approved" | "rejected" | "sold"
          seller_id?: string
          buyer_id?: string | null
          admin_notes?: string | null
          da_score?: number | null
          pa_score?: number | null
          traffic?: number | null
          category?: string | null
          tags?: string[]
          approved_at?: string | null
          approved_by?: string | null
          sold_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          domain_id: string
          seller_id: string
          buyer_id: string
          amount: number
          status: "pending" | "completed" | "cancelled"
          payment_method: string | null
          transaction_hash: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          domain_id: string
          seller_id: string
          buyer_id: string
          amount: number
          status?: "pending" | "completed" | "cancelled"
          payment_method?: string | null
          transaction_hash?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          domain_id?: string
          seller_id?: string
          buyer_id?: string
          amount?: number
          status?: "pending" | "completed" | "cancelled"
          payment_method?: string | null
          transaction_hash?: string | null
          completed_at?: string | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          details: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
