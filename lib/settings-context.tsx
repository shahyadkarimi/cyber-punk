"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { settingsService } from "@/lib/database-services/settings-service"
import type { Json } from "@/lib/types/database.types"

interface SettingsContextType {
  settings: Record<string, Json>
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
  getSetting: (key: string, defaultValue?: any) => any
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, Json>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const publicSettings = await settingsService.getPublicSettings()
      setSettings(publicSettings)
    } catch (err: any) {
      console.error("Failed to load settings:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getSetting = (key: string, defaultValue: any = null) => {
    const value = settings[key]
    if (value === null || value === undefined) {
      return defaultValue
    }

    // Parse JSON strings if needed
    if (typeof value === "string") {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }

    return value
  }

  useEffect(() => {
    refreshSettings()
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refreshSettings,
        getSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
