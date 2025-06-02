"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, AlertCircle, Copy } from "lucide-react"
import { createDatabaseTables, insertSampleData } from "@/app/actions/create-tables"

export default function DatabaseInitializer() {
  const [isCreating, setIsCreating] = useState(false)
  const [isInsertingSample, setIsInsertingSample] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    error?: string
    instructions?: string
  } | null>(null)

  const handleCreateTables = async () => {
    setIsCreating(true)
    setResult(null)

    try {
      const response = await createDatabaseTables()
      setResult(response)
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Failed to create tables",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleInsertSampleData = async () => {
    setIsInsertingSample(true)

    try {
      const response = await insertSampleData()
      setResult(response)
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Failed to insert sample data",
      })
    } finally {
      setIsInsertingSample(false)
    }
  }

  const copyInstructions = () => {
    if (result?.instructions) {
      navigator.clipboard.writeText(result.instructions)
    }
  }

  return (
    <div className="border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md backdrop-blur-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Database className="h-6 w-6 text-[#00ff9d]" />
        <h2 className="text-xl font-bold font-mono text-[#00ff9d]">Database Initialization</h2>
      </div>

      <div className="space-y-4">
        <p className="text-gray-300">
          Initialize your Supabase database with the required tables for the Cyberpunk Web Shell Hub.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleCreateTables}
            disabled={isCreating || isInsertingSample}
            className="bg-[#00ff9d] text-black hover:bg-[#00ff9d]/80"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Tables...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Create Database Tables
              </>
            )}
          </Button>

          <Button
            onClick={handleInsertSampleData}
            disabled={isCreating || isInsertingSample}
            variant="outline"
            className="border-[#2a2a3a] hover:bg-[#2a2a3a] hover:text-[#00ff9d]"
          >
            {isInsertingSample ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Inserting Data...
              </>
            ) : (
              "Insert Sample Data"
            )}
          </Button>
        </div>

        {result && (
          <Alert className={result.success ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription className={result.success ? "text-green-400" : "text-red-400"}>
              {result.success ? result.message : result.error}
            </AlertDescription>
          </Alert>
        )}

        {result?.instructions && (
          <div className="mt-4 p-4 bg-[#0d0d0f] border border-[#2a2a3a] rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#00ff9d]">Manual Setup Instructions</h3>
              <Button variant="ghost" size="sm" onClick={copyInstructions} className="h-8 w-8 p-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">{result.instructions}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-900/30 rounded-md">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">Alternative: Manual Setup</h3>
          <p className="text-sm text-gray-300 mb-3">
            If the automatic setup fails, you can create the tables manually in your Supabase dashboard:
          </p>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>
              Go to your{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Supabase Dashboard
              </a>
            </li>
            <li>Navigate to your project</li>
            <li>Go to SQL Editor</li>
            <li>Copy and run the SQL commands from the instructions above</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
