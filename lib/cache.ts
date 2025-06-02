// Enhanced cache with logging and persistence simulation

interface CacheItem<T> {
  data: T
  expiry: number
}

interface CacheLog {
  timestamp: number
  action: "set" | "get" | "hit" | "miss" | "delete"
  key: string
  success: boolean
}

class Cache {
  private cache: Map<string, CacheItem<any>>
  private logs: CacheLog[]
  private maxLogs: number

  constructor(maxLogs = 1000) {
    this.cache = new Map()
    this.logs = []
    this.maxLogs = maxLogs

    // Clean up expired items every hour
    setInterval(() => this.cleanup(), 3600000)

    // Try to load cache from "persistent storage" (simulated)
    this.loadFromStorage()
  }

  /**
   * Set a cache item with expiration
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    const expiry = Date.now() + ttlMs
    this.cache.set(key, { data, expiry })

    // Log the action
    this.addLog({
      timestamp: Date.now(),
      action: "set",
      key,
      success: true,
    })

    // Simulate persistence
    this.saveToStorage()
  }

  /**
   * Get a cache item if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    // If item doesn't exist or has expired, return null
    if (!item || Date.now() > item.expiry) {
      if (item) {
        // Clean up expired item
        this.cache.delete(key)

        // Log cache miss (expired)
        this.addLog({
          timestamp: Date.now(),
          action: "miss",
          key,
          success: false,
        })
      } else {
        // Log cache miss (not found)
        this.addLog({
          timestamp: Date.now(),
          action: "miss",
          key,
          success: false,
        })
      }
      return null
    }

    // Log cache hit
    this.addLog({
      timestamp: Date.now(),
      action: "hit",
      key,
      success: true,
    })

    return item.data
  }

  /**
   * Check if a key exists in the cache and hasn't expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    return !!item && Date.now() <= item.expiry
  }

  /**
   * Delete a cache item
   */
  delete(key: string): void {
    const success = this.cache.delete(key)

    // Log the action
    this.addLog({
      timestamp: Date.now(),
      action: "delete",
      key,
      success,
    })

    // Simulate persistence
    this.saveToStorage()
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    this.cache.clear()

    // Log the action
    this.addLog({
      timestamp: Date.now(),
      action: "delete",
      key: "all",
      success: true,
    })

    // Simulate persistence
    this.saveToStorage()
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hitRate: number; logs: CacheLog[] } {
    const hits = this.logs.filter((log) => log.action === "hit").length
    const misses = this.logs.filter((log) => log.action === "miss").length
    const hitRate = hits + misses > 0 ? hits / (hits + misses) : 0

    return {
      size: this.cache.size,
      hitRate,
      logs: [...this.logs].reverse().slice(0, 100), // Return most recent 100 logs
    }
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }

    // Simulate persistence after cleanup
    this.saveToStorage()
  }

  /**
   * Add a log entry
   */
  private addLog(log: CacheLog): void {
    this.logs.push(log)

    // Trim logs if they exceed the maximum
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  /**
   * Simulate saving cache to persistent storage
   * In a real implementation, this would use Redis, localStorage, or a database
   */
  private saveToStorage(): void {
    // In a real implementation, this would save to persistent storage
    // For this example, we're just simulating persistence
    console.log("Cache saved to persistent storage (simulated)")
  }

  /**
   * Simulate loading cache from persistent storage
   * In a real implementation, this would use Redis, localStorage, or a database
   */
  private loadFromStorage(): void {
    // In a real implementation, this would load from persistent storage
    // For this example, we're just simulating persistence
    console.log("Cache loaded from persistent storage (simulated)")
  }
}

// Create a singleton instance
export const cache = new Cache()

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  REVERSE_LOOKUP: 3600000, // 1 hour
  SUBDOMAIN_LOOKUP: 3600000, // 1 hour
  CMS_CHECK: 86400000, // 24 hours
}
