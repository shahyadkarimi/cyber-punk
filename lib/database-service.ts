import { supabase } from "./supabase"

export const db = {
  /**
   * Get all items from a table
   */
  async getAll(
    table: string,
    options: {
      columns?: string
      limit?: number
      orderBy?: { column: string; ascending?: boolean }
      filters?: Record<string, any>
    } = {},
  ) {
    try {
      const { columns = "*", limit, orderBy, filters = {} } = options

      let query = supabase.from(table).select(columns)

      // Apply filters
      Object.entries(filters).forEach(([column, value]) => {
        query = query.eq(column, value)
      })

      // Apply order by
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error(`Supabase error for table ${table}:`, error)
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error: any) {
      console.error(`Error fetching from ${table}:`, error)
      return { data: null, error: error.message || "Failed to fetch data" }
    }
  },

  /**
   * Get a single item by ID
   */
  async getById(table: string, id: string, columns = "*") {
    try {
      const { data, error } = await supabase.from(table).select(columns).eq("id", id).single()

      if (error) {
        console.error(`Supabase error for table ${table}:`, error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error(`Error fetching ${table} by ID:`, error)
      return { data: null, error: error.message || "Failed to fetch data" }
    }
  },

  /**
   * Insert a new item
   */
  async insert(table: string, data: Record<string, any>) {
    try {
      const { data: result, error } = await supabase.from(table).insert(data).select()

      if (error) {
        console.error(`Supabase error inserting into ${table}:`, error)
        return { data: null, error: error.message }
      }

      return { data: result, error: null }
    } catch (error: any) {
      console.error(`Error inserting into ${table}:`, error)
      return { data: null, error: error.message || "Failed to insert data" }
    }
  },

  /**
   * Update an item
   */
  async update(table: string, id: string, data: Record<string, any>) {
    try {
      const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select()

      if (error) {
        console.error(`Supabase error updating ${table}:`, error)
        return { data: null, error: error.message }
      }

      return { data: result, error: null }
    } catch (error: any) {
      console.error(`Error updating ${table}:`, error)
      return { data: null, error: error.message || "Failed to update data" }
    }
  },

  /**
   * Delete an item
   */
  async delete(table: string, id: string) {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id)

      if (error) {
        console.error(`Supabase error deleting from ${table}:`, error)
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error: any) {
      console.error(`Error deleting from ${table}:`, error)
      return { success: false, error: error.message || "Failed to delete data" }
    }
  },

  /**
   * Check if a table exists
   */
  async tableExists(tableName: string) {
    try {
      const { data, error } = await supabase.from(tableName).select("*").limit(1)

      // If there's no error, the table exists
      return { exists: !error, error: error?.message || null }
    } catch (error: any) {
      return { exists: false, error: error.message || "Failed to check table" }
    }
  },

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      const { data, error } = await supabase.from("information_schema.tables").select("table_name").limit(1)

      if (error) {
        // Try a simpler test
        const { error: simpleError } = await supabase.auth.getSession()
        return { connected: !simpleError, error: simpleError?.message || error.message }
      }

      return { connected: true, error: null }
    } catch (error: any) {
      return { connected: false, error: error.message || "Connection failed" }
    }
  },

  /**
   * Log an activity
   */
  async logActivity(data: {
    user_id?: string
    action: string
    resource_type: string
    resource_id?: string
    ip_address?: string
    user_agent?: string
    details?: any
  }) {
    return await this.insert("activity_logs", {
      ...data,
      details: data.details ? data.details : null,
    })
  },
}
