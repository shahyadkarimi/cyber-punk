import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export type Transaction = {
  id: string
  domain_id?: string
  seller_id?: string
  buyer_id?: string
  amount: number
  status: "pending" | "completed" | "cancelled"
  payment_method?: string
  transaction_hash?: string
  completed_at?: string
  created_at: string
  updated_at: string
  // Extended fields from joins
  domain_name?: string
  seller_email?: string
  buyer_email?: string
  user_email?: string
}

export type TransactionFilter = {
  status?: string
  startDate?: string
  endDate?: string
  search?: string
}

export const TransactionsService = {
  async getUserTransactions(
    user: User | null,
    filter: TransactionFilter = {},
    page = 1,
    pageSize = 10,
  ): Promise<{ data: Transaction[] | null; count: number; error: any }> {
    if (!user) return { data: null, count: 0, error: "User not authenticated" }

    try {
      console.log("Fetching user transactions for user:", user.id)

      let query = supabase.from("transactions").select("*", { count: "exact" })

      // Apply filters
      if (filter.status && filter.status !== "all") {
        query = query.eq("status", filter.status)
      }

      if (filter.startDate) {
        query = query.gte("created_at", filter.startDate)
      }

      if (filter.endDate) {
        query = query.lte("created_at", filter.endDate)
      }

      if (filter.search) {
        query = query.or(`payment_method.ilike.%${filter.search}%,transaction_hash.ilike.%${filter.search}%`)
      }

      // Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

      if (error) {
        console.error("Error fetching transactions:", error)
        return { data: null, count: 0, error }
      }

      console.log("Fetched transactions:", data?.length || 0)

      // Process data
      const processedData = data.map((transaction) => ({
        ...transaction,
        domain_name: "Domain",
        seller_email: "Seller",
        buyer_email: "Buyer",
        user_email: "User",
      }))

      return { data: processedData, count: count || 0, error: null }
    } catch (error) {
      console.error("Error in getUserTransactions:", error)
      return { data: null, count: 0, error }
    }
  },

  async getSellerTransactions(
    user: User | null,
    filter: TransactionFilter = {},
    page = 1,
    pageSize = 10,
  ): Promise<{ data: Transaction[] | null; count: number; error: any }> {
    if (!user) return { data: null, count: 0, error: "User not authenticated" }

    try {
      console.log("Fetching seller transactions for user:", user.id)

      let query = supabase.from("transactions").select("*", { count: "exact" }).eq("seller_id", user.id)

      // Apply filters
      if (filter.status && filter.status !== "all") {
        query = query.eq("status", filter.status)
      }

      if (filter.startDate) {
        query = query.gte("created_at", filter.startDate)
      }

      if (filter.endDate) {
        query = query.lte("created_at", filter.endDate)
      }

      if (filter.search) {
        query = query.or(`payment_method.ilike.%${filter.search}%,transaction_hash.ilike.%${filter.search}%`)
      }

      // Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

      if (error) {
        console.error("Error fetching seller transactions:", error)
        return { data: null, count: 0, error }
      }

      console.log("Fetched seller transactions:", data?.length || 0)

      const processedData = data.map((transaction) => ({
        ...transaction,
        domain_name: "Domain",
        buyer_email: "Buyer",
        user_email: "Buyer",
      }))

      return { data: processedData, count: count || 0, error: null }
    } catch (error) {
      console.error("Error in getSellerTransactions:", error)
      return { data: null, count: 0, error }
    }
  },

  async getAllTransactions(
    filter: TransactionFilter = {},
    page = 1,
    pageSize = 10,
  ): Promise<{ data: Transaction[] | null; count: number; error: any }> {
    try {
      console.log("Fetching all transactions")

      let query = supabase.from("transactions").select("*", { count: "exact" })

      // Apply filters
      if (filter.status && filter.status !== "all") {
        query = query.eq("status", filter.status)
      }

      if (filter.startDate) {
        query = query.gte("created_at", filter.startDate)
      }

      if (filter.endDate) {
        query = query.lte("created_at", filter.endDate)
      }

      if (filter.search) {
        query = query.or(`payment_method.ilike.%${filter.search}%,transaction_hash.ilike.%${filter.search}%`)
      }

      // Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

      if (error) {
        console.error("Error fetching all transactions:", error)
        return { data: null, count: 0, error }
      }

      console.log("Fetched all transactions:", data?.length || 0)

      const processedData = data.map((transaction) => ({
        ...transaction,
        domain_name: "Domain",
        seller_email: "Seller",
        buyer_email: "Buyer",
        user_email: "User",
      }))

      return { data: processedData, count: count || 0, error: null }
    } catch (error) {
      console.error("Error in getAllTransactions:", error)
      return { data: null, count: 0, error }
    }
  },

  async getTransactionStats(
    user: User | null,
    role: string,
  ): Promise<{
    totalTransactions: number
    totalAmount: number
    pendingTransactions: number
    completedTransactions: number
    cancelledTransactions: number
    error: any
  }> {
    if (!user) {
      return {
        totalTransactions: 0,
        totalAmount: 0,
        pendingTransactions: 0,
        completedTransactions: 0,
        cancelledTransactions: 0,
        error: "User not authenticated",
      }
    }

    try {
      let query = supabase.from("transactions")

      // Filter by user role
      if (role === "admin") {
        // Admin sees all transactions
      } else if (role === "seller") {
        query = query.eq("seller_id", user.id)
      } else {
        query = query.eq("buyer_id", user.id)
      }

      // Get all transactions for stats
      const { data: allTransactions, error: allError } = await query.select("amount, status")

      if (allError) throw allError

      // Calculate stats
      const stats = {
        totalTransactions: allTransactions.length,
        totalAmount: 0,
        pendingTransactions: 0,
        completedTransactions: 0,
        cancelledTransactions: 0,
        error: null,
      }

      allTransactions.forEach((transaction) => {
        const amount = Number.parseFloat(transaction.amount) || 0

        if (transaction.status === "completed") {
          stats.totalAmount += amount
          stats.completedTransactions++
        } else if (transaction.status === "pending") {
          stats.pendingTransactions++
        } else if (transaction.status === "cancelled") {
          stats.cancelledTransactions++
        }
      })

      return stats
    } catch (error) {
      console.error("Error fetching transaction stats:", error)
      return {
        totalTransactions: 0,
        totalAmount: 0,
        pendingTransactions: 0,
        completedTransactions: 0,
        cancelledTransactions: 0,
        error,
      }
    }
  },

  // Helper function to create sample transactions for testing
  async createSampleTransactions(userId: string): Promise<{ success: boolean; error: any }> {
    try {
      console.log("Creating sample transactions for user:", userId)

      // Create different types of transactions
      const sampleTransactions = [
        {
          domain_id: null,
          seller_id: userId, // User is the seller
          buyer_id: userId, // User is also the buyer (for testing)
          amount: 100.0,
          status: "completed" as const,
          payment_method: "crypto",
          transaction_hash: "0x123456789abcdef",
        },
        {
          domain_id: null,
          seller_id: userId,
          buyer_id: userId,
          amount: 250.5,
          status: "pending" as const,
          payment_method: "paypal",
          transaction_hash: "0x987654321fedcba",
        },
        {
          domain_id: null,
          seller_id: userId,
          buyer_id: userId,
          amount: 75.25,
          status: "cancelled" as const,
          payment_method: "stripe",
          transaction_hash: "0x456789123456789",
        },
      ]

      console.log("Inserting transactions:", sampleTransactions)

      const { data, error } = await supabase.from("transactions").insert(sampleTransactions).select()

      if (error) {
        console.error("Error creating sample transactions:", error)
        return { success: false, error }
      }

      console.log("Successfully created transactions:", data)
      return { success: true, error: null }
    } catch (error) {
      console.error("Error in createSampleTransactions:", error)
      return { success: false, error }
    }
  },

  async updateTransactionStatus(
    transactionId: string,
    status: "pending" | "completed" | "cancelled",
  ): Promise<{ success: boolean; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === "completed") {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase.from("transactions").update(updateData).eq("id", transactionId)

      if (error) {
        console.error("Error updating transaction status:", error)
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error("Error in updateTransactionStatus:", error)
      return { success: false, error }
    }
  },

  async createTransaction(
    domainId: string,
    sellerId: string,
    buyerId: string,
    amount: number,
    paymentMethod: string,
  ): Promise<{ data: Transaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          domain_id: domainId,
          seller_id: sellerId,
          buyer_id: buyerId,
          amount,
          payment_method: paymentMethod,
          status: "pending",
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating transaction:", error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error in createTransaction:", error)
      return { data: null, error }
    }
  },
}
