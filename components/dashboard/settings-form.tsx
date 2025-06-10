"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { settingsService } from "@/lib/database-services/settings-service"
import type { WebsiteSetting, WebsiteSettingCreate } from "@/lib/types/settings"
import type { Json } from "@/lib/database.types"
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Globe,
  Palette,
  Shield,
  CreditCard,
  SettingsIcon,
  Mail,
  Users,
  Database,
  AlertCircle,
} from "lucide-react"

// Helper functions
const parseValue = (value: Json): any => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value
  }
  return JSON.stringify(value)
}

const stringifyValue = (value: any): Json => {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value
  }
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const detectInputType = (key: string, value: Json): string => {
  if (typeof value === "boolean") return "boolean"
  if (typeof value === "number") return "number"
  if (key.includes("color")) return "color"
  if (key.includes("email")) return "email"
  if (key.includes("url") || key.includes("link")) return "url"
  if (key.includes("description") || key.includes("content") || key.includes("text")) return "textarea"
  return "text"
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "general":
      return <Globe className="h-4 w-4" />
    case "theme":
      return <Palette className="h-4 w-4" />
    case "security":
      return <Shield className="h-4 w-4" />
    case "payment":
      return <CreditCard className="h-4 w-4" />
    case "email":
      return <Mail className="h-4 w-4" />
    case "users":
      return <Users className="h-4 w-4" />
    case "database":
      return <Database className="h-4 w-4" />
    default:
      return <SettingsIcon className="h-4 w-4" />
  }
}

export function SettingsForm() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<WebsiteSetting[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newSetting, setNewSetting] = useState<Partial<WebsiteSettingCreate>>({
    category: "general",
    is_public: false,
  })

  // Load settings
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsService.getAllSettings()
      setSettings(data)

      // Initialize form data
      const initialData: Record<string, any> = {}
      data.forEach((setting) => {
        initialData[setting.key] = parseValue(setting.value)
      })
      setFormData(initialData)

      // Set first category as active if no settings
      if (data.length > 0) {
        const categories = [...new Set(data.map((s) => s.category))]
        setActiveTab(categories[0])
      }
    } catch (error: any) {
      console.error("Failed to load settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save settings",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Only update settings that have changed
      const settingsToUpdate = settings
        .filter((setting) => {
          const currentValue = parseValue(setting.value)
          const newValue = formData[setting.key]
          return JSON.stringify(currentValue) !== JSON.stringify(newValue)
        })
        .map((setting) => ({
          key: setting.key,
          value: stringifyValue(formData[setting.key]),
        }))

      if (settingsToUpdate.length === 0) {
        toast({
          title: "No Changes",
          description: "No settings were modified",
        })
        return
      }

      console.log("Updating settings:", settingsToUpdate)

      await settingsService.updateMultipleSettings(settingsToUpdate, user.id)

      toast({
        title: "Success",
        description: `${settingsToUpdate.length} settings saved successfully`,
      })

      // Reload settings to get updated data
      await loadSettings()
    } catch (error: any) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddSetting = async () => {
    if (!user || !newSetting.key || !newSetting.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const settingData: WebsiteSettingCreate = {
        key: newSetting.key,
        value: newSetting.value || "",
        category: newSetting.category,
        description: newSetting.description,
        is_public: newSetting.is_public || false,
      }

      await settingsService.createSetting(settingData, user.id)

      toast({
        title: "Success",
        description: "Setting added successfully",
      })

      setShowAddDialog(false)
      setNewSetting({ category: "general", is_public: false })
      await loadSettings()
    } catch (error: any) {
      console.error("Failed to add setting:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add setting",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSetting = async (key: string) => {
    if (!confirm("Are you sure you want to delete this setting?")) return

    try {
      await settingsService.deleteSetting(key)
      toast({
        title: "Success",
        description: "Setting deleted successfully",
      })
      await loadSettings()
    } catch (error: any) {
      console.error("Failed to delete setting:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete setting",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff9d]" />
        <span className="ml-2 text-gray-400">Loading settings...</span>
      </div>
    )
  }

  if (settings.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Settings Found</h3>
        <p className="text-gray-400 mb-4">No settings have been configured yet.</p>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff9d] text-[#1a1a1a] hover:bg-[#00e68a]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Setting
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a2e] border-[#00ff9d]/20">
            <DialogHeader>
              <DialogTitle className="text-[#00ff9d]">Add New Setting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="key">Key *</Label>
                <Input
                  id="key"
                  value={newSetting.key || ""}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, key: e.target.value }))}
                  placeholder="setting_key"
                  className="bg-[#2a2a3a] border-[#3a3a4a]"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newSetting.category}
                  onValueChange={(value) => setNewSetting((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-[#2a2a3a] border-[#3a3a4a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="theme">Theme</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={(newSetting.value as string) || ""}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder="Setting value"
                  className="bg-[#2a2a3a] border-[#3a3a4a]"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSetting.description || ""}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Setting description"
                  className="bg-[#2a2a3a] border-[#3a3a4a]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={newSetting.is_public || false}
                  onCheckedChange={(checked) => setNewSetting((prev) => ({ ...prev, is_public: checked }))}
                />
                <Label htmlFor="is_public">Public Setting</Label>
              </div>
              <Button onClick={handleAddSetting} className="w-full bg-[#00ff9d] text-[#1a1a1a]">
                Add Setting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const categories = [...new Set(settings.map((s) => s.category))].sort()
  const getSettingsByCategory = (category: string) => settings.filter((s) => s.category === category)

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Website Settings</h2>
          <p className="text-gray-400">Manage your website configuration ({settings.length} settings)</p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff9d] text-[#1a1a1a] hover:bg-[#00e68a]">
              <Plus className="h-4 w-4 mr-2" />
              Add Setting
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a2e] border-[#00ff9d]/20">
            <DialogHeader>
              <DialogTitle className="text-[#00ff9d]">Add New Setting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="key">Key *</Label>
                <Input
                  id="key"
                  value={newSetting.key || ""}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, key: e.target.value }))}
                  placeholder="setting_key"
                  className="bg-[#2a2a3a] border-[#3a3a4a]"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newSetting.category}
                  onValueChange={(value) => setNewSetting((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-[#2a2a3a] border-[#3a3a4a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="theme">Theme</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={(newSetting.value as string) || ""}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder="Setting value"
                  className="bg-[#2a2a3a] border-[#3a3a4a]"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSetting.description || ""}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Setting description"
                  className="bg-[#2a2a3a] border-[#3a3a4a]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={newSetting.is_public || false}
                  onCheckedChange={(checked) => setNewSetting((prev) => ({ ...prev, is_public: checked }))}
                />
                <Label htmlFor="is_public">Public Setting</Label>
              </div>
              <Button onClick={handleAddSetting} className="w-full bg-[#00ff9d] text-[#1a1a1a]">
                Add Setting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-[#1a1a2e]">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:bg-[#00ff9d] data-[state=active]:text-[#1a1a2e]"
            >
              <span className="flex items-center gap-1">
                {getCategoryIcon(category)}
                {category}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <Card className="bg-[#1a1a2e] border-[#00ff9d]/20">
              <CardHeader>
                <CardTitle className="text-[#00ff9d] flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category.charAt(0).toUpperCase() + category.slice(1)} Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory(category).map((setting) => {
                  const inputType = detectInputType(setting.key, setting.value)
                  const currentValue = formData[setting.key]

                  return (
                    <div key={setting.key} className="space-y-2 p-4 bg-[#2a2a3a] rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Label className="text-gray-300 font-medium">
                            {setting.description ||
                              setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Label>
                          {setting.is_public && (
                            <Badge variant="secondary" className="ml-2 bg-[#00ff9d]/20 text-[#00ff9d]">
                              Public
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSetting(setting.key)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {inputType === "boolean" ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={Boolean(currentValue)}
                            onCheckedChange={(checked) => handleInputChange(setting.key, checked)}
                            className="data-[state=checked]:bg-[#00ff9d]"
                          />
                          <span className="text-sm text-gray-400">{currentValue ? "Enabled" : "Disabled"}</span>
                        </div>
                      ) : inputType === "textarea" ? (
                        <Textarea
                          value={String(currentValue || "")}
                          onChange={(e) => handleInputChange(setting.key, e.target.value)}
                          className="bg-[#1a1a2e] border-[#3a3a4a] focus:border-[#00ff9d]"
                          rows={3}
                        />
                      ) : inputType === "color" ? (
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={String(currentValue || "#000000")}
                            onChange={(e) => handleInputChange(setting.key, e.target.value)}
                            className="w-16 h-10 p-1 bg-[#1a1a2e] border-[#3a3a4a]"
                          />
                          <Input
                            type="text"
                            value={String(currentValue || "")}
                            onChange={(e) => handleInputChange(setting.key, e.target.value)}
                            className="flex-1 bg-[#1a1a2e] border-[#3a3a4a] focus:border-[#00ff9d]"
                          />
                        </div>
                      ) : (
                        <Input
                          type={
                            inputType === "number"
                              ? "number"
                              : inputType === "email"
                                ? "email"
                                : inputType === "url"
                                  ? "url"
                                  : "text"
                          }
                          value={String(currentValue || "")}
                          onChange={(e) =>
                            handleInputChange(
                              setting.key,
                              inputType === "number" ? Number(e.target.value) : e.target.value,
                            )
                          }
                          className="bg-[#1a1a2e] border-[#3a3a4a] focus:border-[#00ff9d]"
                        />
                      )}

                      {setting.description && <p className="text-xs text-gray-500">{setting.description}</p>}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-[#3a3a4a]">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#00ff9d] text-[#1a1a1a] hover:bg-[#00e68a] px-8 py-3"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
