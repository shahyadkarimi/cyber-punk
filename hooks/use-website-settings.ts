"use client"
import { useSettings } from "@/lib/settings-context"

export function useWebsiteSettings() {
  const { settings, loading, error, refreshSettings, getSetting } = useSettings()

  return {
    // General settings
    siteName: getSetting("site_name", "TRX Cyberpunk Hub"),
    siteDescription: getSetting("site_description", "Advanced cyberpunk tools and web shell marketplace"),
    contactEmail: getSetting("contact_email", "admin@trxcyberpunk.com"),
    maintenanceMode: getSetting("maintenance_mode", false),
    registrationEnabled: getSetting("registration_enabled", true),

    // Theme settings
    primaryColor: getSetting("primary_color", "#00ff9d"),
    secondaryColor: getSetting("secondary_color", "#1a1a2e"),
    accentColor: getSetting("accent_color", "#ff6b6b"),
    darkModeEnabled: getSetting("dark_mode_enabled", true),
    cyberpunkEffects: getSetting("cyberpunk_effects", true),

    // Marketplace settings
    marketplaceEnabled: getSetting("marketplace_enabled", true),
    featuredDomainsLimit: getSetting("featured_domains_limit", 10),

    // Social media
    twitterUrl: getSetting("twitter_url", ""),
    telegramUrl: getSetting("telegram_url", ""),
    discordUrl: getSetting("discord_url", ""),
    githubUrl: getSetting("github_url", ""),

    // State
    loading,
    error,
    refreshSettings,
    getSetting,
    allSettings: settings,
  }
}
