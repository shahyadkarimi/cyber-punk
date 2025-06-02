"use server"

import { initializeDatabase } from "@/lib/init-database"

export async function initDb() {
  return await initializeDatabase()
}
