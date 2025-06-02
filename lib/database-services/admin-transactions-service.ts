import { supabase } from "@/lib/supabase"

export type AdminTransaction = {
  id: string
  user_id: string
  domain_id?: string
  amount: number
  status: "pending" | "completed" | "failed" | "refunded"
  payment_method: string
  payment_id?: string
  created_at: string
  updated_at: string
  description?: string
  seller_id?: string
  transaction_type: "deposit" | "withdrawal" | "purchase" | "sale" | "refund"
  // Extended fields for admin view
  user_email?: string
  user_name?: string
  domain_name?: string
  domain_price?: number
  seller_email?: string
}

export type AdminTransactionFilter = {
  status?: string
  type?: string
  startDate?: string
  endDate?: string
  search?: string
  userId?: string
  sellerId?: string
}

export type TransactionStats = {
  totalTransactions: number
  totalAmount: number
  pendingAmount: number
  completedAmount: number
  failedAmount: number
  refundedAmount: number
  todayTransactions: number
  todayAmount: number
  monthlyTransactions: number
  monthlyAmount: number
}

export const AdminTransactionsService = {
  async getAllTransactions(
    filter: AdminTransactionFilter = {},
    page = 1,
    pageSize = 20,
  ): Promise<{ data: AdminTransaction[] | null; count: number; error: any }> {
    try {
      let query = supabase.from("transactions").select(
        `
          *,
          users!transactions_user_id_fkey(email, full_name),
          domains(name, price),
          seller:users!transactions_seller_id_fkey(email, full_name)
        `,
        { count: "exact" },
      )

      // Apply filters
      if (filter.status && filter.status !== "all") {
        query = query.eq("status", filter.status)
      }

      if (filter.type && filter.type !== "all") {
        query = query.eq("transaction_type", filter.type)
      }

      if (filter.startDate) {
        query = query.gte("created_at", filter.startDate)
      }

      if (filter.endDate) {
        query = query.lte("created_at", filter.endDate)
      }

      if (filter.userId) {
        query = query.eq("user_id", filter.userId)
      }

      if (filter.sellerId) {
        query = query.eq("seller_id", filter.sellerId)
      }

      if (filter.search) {
        query = query.or(`
          description.ilike.%${filter.search}%,
          payment_id.ilike.%${filter.search}%,
          users.email.ilike.%${filter.search}%,
          domains.name.ilike.%${filter.search}%
        `)
      }

      // Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

      if (error) {
        console.error("Error fetching admin transactions:", error)
        return { data: null, count: 0, error }
      }

      // Process data to flatten relationships
      const processedData = data.map((transaction) => ({
        ...transaction,
        user_email: transaction.users?.email || "N/A",
        user_name: transaction.users?.full_name || "N/A",
        domain_name: transaction.domains?.name || "N/A",
        domain_price: transaction.domains?.price || 0,
        seller_email: transaction.seller?.email || "N/A",
      }))

      return { data: processedData, count: count || 0, error: null }
    } catch (error) {
      console.error("Error in getAllTransactions:", error)
      return { data: null, count: 0, error }
    }
  },

  async updateTransactionStatus(
    transactionId: string,
    status: "pending" | "completed" | "failed" | "refunded",
    adminNotes?: string,
  ): Promise<{ success: boolean; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (adminNotes) {
        updateData.admin_notes = adminNotes
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

  async getTransactionStats(): Promise<{ data: TransactionStats | null; error: any }> {
    try {
      // Get all transactions
      const { data: allTransactions, error: allError } = await supabase
        .from("transactions")
        .select("amount, status, created_at")

      if (allError) throw allError

      // Calculate stats
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const stats: TransactionStats = {
        totalTransactions: allTransactions.length,
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        failedAmount: 0,
        refundedAmount: 0,
        todayTransactions: 0,
        todayAmount: 0,
        monthlyTransactions: 0,
        monthlyAmount: 0,
      }

      allTransactions.forEach((transaction) => {
        const amount = transaction.amount || 0
        const createdAt = new Date(transaction.created_at)

        // Total amounts by status
        stats.totalAmount += amount
        switch (transaction.status) {
          case "pending":
            stats.pendingAmount += amount
            break
          case "completed":
            stats.completedAmount += amount
            break
          case "failed":
            stats.failedAmount += amount
            break
          case "refunded":
            stats.refundedAmount += amount
            break
        }

        // Today's stats
        if (createdAt >= today) {
          stats.todayTransactions++
          stats.todayAmount += amount
        }

        // Monthly stats
        if (createdAt >= thisMonth) {
          stats.monthlyTransactions++
          stats.monthlyAmount += amount
        }
      })

      return { data: stats, error: null }
    } catch (error) {
      console.error("Error getting transaction stats:", error)
      return { data: null, error }
    }
  },

  async deleteTransaction(transactionId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", transactionId)

      if (error) {
        console.error("Error deleting transaction:", error)
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error("Error in deleteTransaction:", error)
      return { success: false, error }
    }
  },

  async exportTransactions(filter: AdminTransactionFilter = {}): Promise<{ data: any[] | null; error: any }> {
    try {
      let query = supabase.from("transactions").select(`
          *,
          users!transactions_user_id_fkey(email, full_name),
          domains(name, price),
          seller:users!transactions_seller_id_fkey(email, full_name)
        `)

      // Apply same filters as getAllTransactions
      if (filter.status && filter.status !== "all") {
        query = query.eq("status", filter.status)
      }

      if (filter.type && filter.type !== "all") {
        query = query.eq("transaction_type", filter.type)
      }

      if (filter.startDate) {
        query = query.gte("created_at", filter.startDate)
      }

      if (filter.endDate) {
        query = query.lte("created_at", filter.endDate)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Error exporting transactions:", error)
        return { data: null, error }
      }

      // Format data for export
      const exportData = data.map((transaction) => ({
        ID: transaction.id,
        Date: new Date(transaction.created_at).toLocaleString(),
        Type: transaction.transaction_type,
        Amount: transaction.amount,
        Status: transaction.status,
        "Payment Method": transaction.payment_method,
        "Payment ID": transaction.payment_id,
        "User Email": transaction.users?.email || "N/A",
        "User Name": transaction.users?.full_name || "N/A",
        "Domain Name": transaction.domains?.name || "N/A",
        "Seller Email": transaction.seller?.email || "N/A",
        Description: transaction.description || "",
      }))

      return { data: exportData, error: null }
    } catch (error) {
      console.error("Error in exportTransactions:", error)
      return { data: null, error }
    }
  },
}
