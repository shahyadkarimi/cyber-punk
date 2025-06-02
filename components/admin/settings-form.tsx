"use client"
import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { settingsService } from "@/lib/database-services/settings-service"
import type { WebsiteSetting } from "@/lib/types/settings"
import type { Json } from "@/lib/types/database.types"
import { Save, Loader2, SettingsIcon, AlertTriangle, Palette } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Helper to parse JSONB value safely
const parseJsonValue = (value: Json, defaultValue: any = "") => {
  if (typeof value === "string") {
    try {
      // This handles cases where booleans/numbers might be stored as strings like "true" or "123"
      // but also actual JSON strings.
      // For simple strings meant to be strings, JSON.parse will fail, and we return the original string.
      const parsed = JSON.parse(value)
      return parsed
    } catch (e) {
      return value // It's just a plain string
    }
  }
  return value !== null && typeof value !== "undefined" ? value : defaultValue
}

export function SettingsForm() {
  const { user } = useAuth()
  const [allSettings, setAllSettings] = useState<WebsiteSetting[]>([])
  const [formState, setFormState] = useState<Record<string, Json>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      setError(null)
      try {
        const settingsData = await settingsService.getAllSettingsWithDetails()
        setAllSettings(settingsData)
        const initialFormState: Record<string, Json> = {}
        settingsData.forEach((s) => {
          initialFormState[s.key] = s.value // Keep raw JSONB value initially
        })
        setFormState(initialFormState)
      } catch (err: any) {
        console.error("Failed to load settings:", err)
        setError(`Failed to load settings: ${err.message}`)
        toast({ title: "Error Loading Settings", description: err.message, variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleInputChange = (key: string, value: string | number) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const handleBooleanChange = (key: string, checked: boolean) => {
    setFormState((prev) => ({ ...prev, [key]: checked }))
  }

  const handleColorChange = (key: string, colorValue: string) => {
    setFormState((prev) => ({ ...prev, [key]: colorValue }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save settings.",
        variant: "destructive",
      })
      return
    }
    setIsSaving(true)
    setError(null)

    const updatesToSave = allSettings.map((s) => ({
      key: s.key,
      value: formState[s.key], // Send the current form state value
    }))

    try {
      await settingsService.upsertSettings(updatesToSave, user.id)
      toast({ title: "Settings Saved", description: "Application settings have been updated." })
      // Optionally re-fetch settings to confirm, or assume success
      const updatedSettingsData = await settingsService.getAllSettingsWithDetails()
      setAllSettings(updatedSettingsData)
      const newFormState: Record<string, Json> = {}
      updatedSettingsData.forEach((s) => {
        newFormState[s.key] = s.value
      })
      setFormState(newFormState)
    } catch (err: any) {
      console.error("Failed to save settings:", err)
      setError(`Failed to save settings: ${err.message}`)
      toast({ title: "Error Saving Settings", description: err.message, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff9d]" />
        <p className="ml-2 text-gray-400">Loading settings...</p>
      </div>
    )
  }

  if (error && !allSettings.length) {
    // Show error prominently if loading completely failed
    return (
      <div className="text-center py-10 text-red-400 bg-[#2a2a3a] p-4 rounded-md">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg">Error loading settings</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  const groupedSettings = allSettings.reduce(
    (acc, setting) => {
      const category = setting.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(setting)
      return acc
    },
    {} as Record<string, WebsiteSetting[]>,
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {Object.entries(groupedSettings).map(([category, settings]) => (
        <Card key={category} className="bg-[#20202a] border-[#303040] text-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-[#00e68a] flex items-center">
              {category === "General" && <SettingsIcon className="mr-2 h-5 w-5" />}
              {category === "Theme" && <Palette className="mr-2 h-5 w-5" />}
              {/* Add more icons for other categories */}
              {category}
            </CardTitle>
            {/* <CardDescription className="text-gray-500">Manage {category.toLowerCase()} settings.</CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key} className="text-gray-400 font-medium">
                  {setting.description ||
                    setting.key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </Label>
                {setting.input_type === "boolean" ? (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={setting.key}
                      checked={parseJsonValue(formState[setting.key], false) as boolean}
                      onCheckedChange={(checked) => handleBooleanChange(setting.key, checked)}
                      className="data-[state=checked]:bg-[#00ff9d]"
                    />
                    <span className="text-sm text-gray-500">
                      {parseJsonValue(formState[setting.key], false) ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ) : setting.input_type === "textarea" ? (
                  <Textarea
                    id={setting.key}
                    value={parseJsonValue(formState[setting.key], "") as string}
                    onChange={(e) => handleInputChange(setting.key, e.target.value)}
                    className="bg-[#2a2a3a] border-[#3a3a4a] focus:border-[#00ff9d] min-h-[80px]"
                    placeholder={setting.description || `Enter ${setting.key}`}
                  />
                ) : setting.input_type === "color" ? (
                  <Input
                    id={setting.key}
                    type="color"
                    value={parseJsonValue(formState[setting.key], "#000000") as string}
                    onChange={(e) => handleColorChange(setting.key, e.target.value)}
                    className="bg-[#2a2a3a] border-[#3a3a4a] focus:border-[#00ff9d] p-1 h-10 w-full"
                  /> // Default to text input (includes 'text', 'number')
                ) : (
                  <Input
                    id={setting.key}
                    type={setting.input_type === "number" ? "number" : "text"}
                    value={parseJsonValue(formState[setting.key], "") as string | number}
                    onChange={(e) =>
                      handleInputChange(
                        setting.key,
                        setting.input_type === "number" ? Number.parseFloat(e.target.value) : e.target.value,
                      )
                    }
                    className="bg-[#2a2a3a] border-[#3a3a4a] focus:border-[#00ff9d]"
                    placeholder={setting.description || `Enter ${setting.key}`}
                  />
                )}
                {setting.description && <p className="text-xs text-gray-500 pt-1">{setting.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex justify-end pt-6 border-t border-[#303040] mt-8">
        <Button
          type="submit"
          disabled={isSaving || isLoading}
          className="bg-[#00ff9d] text-[#1a1a1a] hover:bg-[#00e68a] font-semibold py-3 px-6 text-lg min-w-[180px]"
        >
          {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save size={20} className="mr-2" />}
          {isSaving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </form>
  )
}
