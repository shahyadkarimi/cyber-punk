"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/database-service"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Database, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type TableName = "users" | "web_shells" | "exploits" | "vulnerability_scans" | "activity_logs" | "domains"

export default function DatabaseExplorer() {
  const [activeTable, setActiveTable] = useState<TableName>("users")
  const [tableData, setTableData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking")

  const checkConnection = async () => {
    setConnectionStatus("checking")
    const { connected, error } = await db.testConnection()
    setConnectionStatus(connected ? "connected" : "disconnected")
    if (!connected && error) {
      setError(`Connection failed: ${error}`)
    }
  }

  const fetchTableData = async (table: TableName) => {
    setLoading(true)
    setError(null)

    try {
      // First check if table exists
      const { exists, error: tableError } = await db.tableExists(table)

      if (!exists) {
        setError(`Table "${table}" does not exist. Please initialize the database first.`)
        setTableData(null)
        setLoading(false)
        return
      }

      const { data, error } = await db.getAll(table, { limit: 100 })

      if (error) {
        setError(error)
        setTableData(null)
      } else {
        setTableData(data || [])
      }
    } catch (err: any) {
      console.error(`Error fetching ${table} data:`, err)
      setError(err.message || `Failed to fetch ${table} data`)
      setTableData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    if (connectionStatus === "connected") {
      fetchTableData(activeTable)
    }
  }, [activeTable, connectionStatus])

  const handleRefresh = () => {
    checkConnection()
    if (connectionStatus === "connected") {
      fetchTableData(activeTable)
    }
  }

  const renderConnectionStatus = () => {
    if (connectionStatus === "checking") {
      return (
        <Alert className="mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Checking database connection...</AlertDescription>
        </Alert>
      )
    }

    if (connectionStatus === "disconnected") {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Database connection failed. Please check your Supabase configuration.</AlertDescription>
        </Alert>
      )
    }

    return (
      <Alert className="mb-4 border-green-500/20 bg-green-500/10">
        <Database className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-400">Database connected successfully!</AlertDescription>
      </Alert>
    )
  }

  const renderTableContent = () => {
    if (connectionStatus !== "connected") {
      return null
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00ff9d]" />
          <span className="ml-2 text-gray-400">Loading {activeTable} data...</span>
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-mono">{error}</AlertDescription>
        </Alert>
      )
    }

    if (!tableData || tableData.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400 font-mono">No data found in the "{activeTable}" table.</p>
          <p className="text-gray-500 text-sm mt-2">
            {tableData !== null ? "The table is empty." : "The table may not exist yet."}
          </p>
        </div>
      )
    }

    // Get column names from the first row
    const columns = Object.keys(tableData[0])

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-[#2a2a3a]">
              {columns.map((column) => (
                <th key={column} className="p-3 text-left text-xs font-mono text-gray-400 uppercase">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-[#2a2a3a] hover:bg-[#1a1a1a]/50 transition-colors">
                {columns.map((column) => {
                  const value = row[column]
                  let displayValue = value

                  // Format different value types
                  if (value === null || value === undefined) {
                    displayValue = <span className="text-gray-500 italic">null</span>
                  } else if (typeof value === "object") {
                    displayValue = (
                      <span className="text-yellow-400">
                        {JSON.stringify(value).substring(0, 50)}
                        {JSON.stringify(value).length > 50 ? "..." : ""}
                      </span>
                    )
                  } else if (typeof value === "boolean") {
                    displayValue = value ? (
                      <span className="text-green-400">true</span>
                    ) : (
                      <span className="text-red-400">false</span>
                    )
                  } else if (column.includes("_at") && typeof value === "string") {
                    // Format dates
                    try {
                      displayValue = new Date(value).toLocaleString()
                    } catch {
                      displayValue = value
                    }
                  } else if (typeof value === "string" && value.length > 100) {
                    displayValue = value.substring(0, 100) + "..."
                  }

                  return (
                    <td key={column} className="p-3 text-xs font-mono max-w-xs">
                      {displayValue}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 text-xs text-gray-500 border-t border-[#2a2a3a]">
          Showing {tableData.length} record{tableData.length !== 1 ? "s" : ""}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
        <div className="flex items-center space-x-3">
          <Database className="h-5 w-5 text-[#00ff9d]" />
          <h2 className="text-lg font-bold font-mono text-[#00ff9d]">Database Explorer</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="border-[#2a2a3a] hover:bg-[#2a2a3a] hover:text-[#00ff9d]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="p-4">
        {renderConnectionStatus()}

        {connectionStatus === "connected" && (
          <Tabs defaultValue="users" value={activeTable} onValueChange={(value) => setActiveTable(value as TableName)}>
            <div className="mb-4 overflow-x-auto">
              <TabsList className="bg-[#0d0d0f]">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="web_shells">Web Shells</TabsTrigger>
                <TabsTrigger value="exploits">Exploits</TabsTrigger>
                <TabsTrigger value="vulnerability_scans">Vuln Scans</TabsTrigger>
                <TabsTrigger value="activity_logs">Activity Logs</TabsTrigger>
                <TabsTrigger value="domains">Domains</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="users">{renderTableContent()}</TabsContent>
            <TabsContent value="web_shells">{renderTableContent()}</TabsContent>
            <TabsContent value="exploits">{renderTableContent()}</TabsContent>
            <TabsContent value="vulnerability_scans">{renderTableContent()}</TabsContent>
            <TabsContent value="activity_logs">{renderTableContent()}</TabsContent>
            <TabsContent value="domains">{renderTableContent()}</TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
