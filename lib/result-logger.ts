// Result logger for domain finder tool

export interface LogEntry {
  timestamp: number
  action: "reverse_lookup" | "subdomain_lookup" | "cms_check"
  query: string
  results: any
  clientIp: string
  userAgent: string
  processingTime: number
}

class ResultLogger {
  private logs: LogEntry[]
  private maxLogs: number

  constructor(maxLogs = 1000) {
    this.logs = []
    this.maxLogs = maxLogs
  }

  /**
   * Log a result
   */
  log(entry: LogEntry): void {
    this.logs.push(entry)

    // Trim logs if they exceed the maximum
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // In a real implementation, this would write to a file or database
    this.writeToFile(entry)
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs].reverse()
  }

  /**
   * Get logs for a specific action
   */
  getLogsByAction(action: LogEntry["action"]): LogEntry[] {
    return [...this.logs].filter((log) => log.action === action).reverse()
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * Simulate writing to a file
   * In a real implementation, this would write to a file or database
   */
  private writeToFile(entry: LogEntry): void {
    // Format the log entry in an SEO-friendly way
    const formattedEntry = this.formatLogEntry(entry)

    // In a real implementation, this would write to a file
    console.log("Log entry written to file (simulated):", formattedEntry)
  }

  /**
   * Format a log entry in an SEO-friendly way
   */
  private formatLogEntry(entry: LogEntry): string {
    const date = new Date(entry.timestamp).toISOString()
    let output = `[${date}] ${entry.action.toUpperCase()} for "${entry.query}"\n`
    output += `IP: ${entry.clientIp} | User-Agent: ${entry.userAgent}\n`
    output += `Processing Time: ${entry.processingTime}ms\n`

    if (entry.action === "reverse_lookup" && Array.isArray(entry.results)) {
      output += `Found ${entry.results.length} domains:\n`
      entry.results.forEach((domain: string) => {
        output += `- Domain: ${domain}\n`
      })
    } else if (entry.action === "subdomain_lookup" && Array.isArray(entry.results)) {
      output += `Found ${entry.results.length} subdomains:\n`
      entry.results.forEach((subdomain: string) => {
        output += `- Subdomain: ${subdomain}\n`
      })
    } else if (entry.action === "cms_check") {
      output += `CMS Detection Result: ${entry.results}\n`
    }

    output += "---\n"
    return output
  }
}

// Create a singleton instance
export const resultLogger = new ResultLogger()
