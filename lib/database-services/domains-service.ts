import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/database-services/users-service"; // Assuming you have a types file
import type { Database } from "@/lib/database.types";

export interface Domain {
  id: string;
  created_at: string;
  domain: string;
  description: string | null;
  price: number | null;
  status: "pending" | "approved" | "rejected" | "sold";
  seller_id: string;
  buyer_id: string | null;
  admin_notes: string | null;
  da_score: number | null;
  pa_score: number | null;
  traffic: number | null;
  category: string | null;
  tags: string[];
  approved_at: string | null;
  approved_by: string | null;
  sold_at: string | null;
}

export interface DomainWithSeller extends Domain {
  seller: Pick<User, "id" | "username" | "email"> | null;
  approved_by_user: Pick<User, "id" | "username" | "email"> | null;
}

export const domainsService = {
  async getDomains(
    searchTerm = "",
    statusFilter = "",
    categoryFilter = "",
    minPrice?: number,
    maxPrice?: number,
    page = 1,
    pageSize = 10
  ): Promise<{ domains: DomainWithSeller[]; count: number }> {
    let query = supabase
      .from("domains")
      .select(
        `
        *,
        seller:seller_id (id, username, email),
        approved_by_user:approved_by (id, username, email)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (searchTerm) {
      query = query.or(
        `domain.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,seller_id->>username.ilike.%${searchTerm}%`
      );
    }
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }
    if (categoryFilter) {
      query = query.eq("category", categoryFilter);
    }
    if (minPrice !== undefined) {
      query = query.gte("price", minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte("price", maxPrice);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching domains:", error);
      throw error;
    }
    return { domains: (data as DomainWithSeller[]) || [], count: count || 0 };
  },

  async getDomainById(id: string): Promise<DomainWithSeller | null> {
    const { data, error } = await supabase
      .from("domains")
      .select(
        `
        *,
        seller:seller_id (id, username, email),
        approved_by_user:approved_by (id, username, email)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching domain by ID:", error);
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as DomainWithSeller | null;
  },

  async createDomain(
    domainData: Partial<Database["public"]["Tables"]["domains"]["Insert"]>,
    adminUserId?: string
  ): Promise<Database["public"]["Tables"]["domains"]["Row"]> {
    const dataToInsert: Partial<
      Database["public"]["Tables"]["domains"]["Insert"]
    > = {
      ...domainData,
      ...(domainData.status === "approved" &&
        adminUserId && {
          approved_by: adminUserId,
          approved_at: new Date().toISOString(),
        }),
    };
    const { data, error } = await supabase
      .from("domains")
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error("Error creating domain:", error);
      throw error;
    }
    return data!;
  },

  async updateDomain(
    id: string,
    domainData: Partial<Database["public"]["Tables"]["domains"]["Update"]>,
    adminUserId?: string
  ): Promise<Database["public"]["Tables"]["domains"]["Row"]> {
    const currentDomain = await this.getDomainById(id);
    if (!currentDomain) throw new Error("Domain not found");

    const dataToUpdate: Partial<
      Database["public"]["Tables"]["domains"]["Update"]
    > = { ...domainData };

    if (
      domainData.status === "approved" &&
      currentDomain.status !== "approved" &&
      adminUserId
    ) {
      dataToUpdate.approved_by = adminUserId;
      dataToUpdate.approved_at = new Date().toISOString();
    } else if (
      domainData.status !== "approved" &&
      currentDomain.status === "approved"
    ) {
      dataToUpdate.approved_by = null;
      dataToUpdate.approved_at = null;
    }

    const { data, error } = await supabase
      .from("domains")
      .update(dataToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating domain:", error);
      throw error;
    }
    return data!;
  },

  async deleteDomain(id: string): Promise<void> {
    const { error } = await supabase.from("domains").delete().eq("id", id);

    if (error) {
      console.error("Error deleting domain:", error);
      throw error;
    }
  },

  async getDomainStats(): Promise<{
    totalDomains: number;
    pendingDomains: number;
    approvedDomains: number;
    rejectedDomains: number;
    soldDomains: number;
    totalRevenue: number;
  }> {
    let totalDomains = 0,
      pendingDomains = 0,
      approvedDomains = 0,
      rejectedDomains = 0,
      soldDomains = 0,
      totalRevenue = 0;

    try {
      const { count, error } = await supabase
        .from("domains")
        .select("*", { count: "exact", head: true });
      if (error) {
        // Log Supabase specific error, but let the catch below handle generic fetch error
        console.error("Supabase error fetching total domains count:", error);
        throw error;
      }
      totalDomains = count || 0;
    } catch (err: any) {
      console.error(
        "Failed to fetch total domains count:",
        err.message || err,
        err
      );
    }

    try {
      const { count, error } = await supabase
        .from("domains")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) {
        console.error("Supabase error fetching pending domains count:", error);
        throw error;
      }
      pendingDomains = count || 0;
    } catch (err: any) {
      console.error(
        "Failed to fetch pending domains count:",
        err.message || err,
        err
      );
    }

    try {
      const { count, error } = await supabase
        .from("domains")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");
      if (error) {
        console.error("Supabase error fetching approved domains count:", error);
        throw error;
      }
      approvedDomains = count || 0;
    } catch (err: any) {
      console.error(
        "Failed to fetch approved domains count:",
        err.message || err,
        err
      );
    }

    try {
      const { count, error } = await supabase
        .from("domains")
        .select("*", { count: "exact", head: true })
        .eq("status", "rejected"); // This was mentioned in the original error
      if (error) {
        console.error("Supabase error fetching rejected domains count:", error);
        throw error;
      }
      rejectedDomains = count || 0;
    } catch (err: any) {
      // This catch block will handle the "TypeError: Failed to fetch" if it originates here
      console.error(
        "Failed to fetch rejected domains count:",
        err.message || err,
        err
      );
    }

    try {
      const { count, error } = await supabase
        .from("domains")
        .select("*", { count: "exact", head: true })
        .eq("status", "sold");
      if (error) {
        console.error("Supabase error fetching sold domains count:", error);
        throw error;
      }
      soldDomains = count || 0;
    } catch (err: any) {
      console.error(
        "Failed to fetch sold domains count:",
        err.message || err,
        err
      );
    }

    try {
      const { data: soldDomainsData, error } = await supabase
        .from("domains")
        .select("price")
        .eq("status", "sold");
      if (error) {
        console.error("Supabase error fetching revenue data:", error);
        throw error;
      }
      totalRevenue =
        soldDomainsData?.reduce((sum, d) => sum + (d.price || 0), 0) || 0;
    } catch (err: any) {
      console.error("Failed to fetch revenue data:", err.message || err, err);
    }

    return {
      totalDomains,
      pendingDomains,
      approvedDomains,
      rejectedDomains,
      soldDomains,
      totalRevenue,
    };
  },

  async getSellers(): Promise<Pick<User, "id" | "username" | "email">[]> {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email")
      .or("role.eq.seller,role.eq.admin");

    if (error) {
      console.error("Error fetching sellers:", error);
      throw error;
    }
    return (data as Pick<User, "id" | "username" | "email">[]) || [];
  },
};
