// API service configurations and utilities

// RapidAPI configuration
export const RAPID_API_CONFIG = {
  apiKey: process.env.RAPID_API_KEY || "d59a6f0de1msh12c12be95cefb12p1b1629jsn36afaf17e20e", // Default to provided key
  apiHost: "domain-da-pa-check.p.rapidapi.com",
  apiUrl: "https://domain-da-pa-check.p.rapidapi.com",
}

// Check if RapidAPI credentials are configured
export const isRapidApiConfigured = () => {
  return !!RAPID_API_CONFIG.apiKey && !!RAPID_API_CONFIG.apiHost
}

// Generate RapidAPI headers
export const getRapidApiHeaders = () => {
  if (!isRapidApiConfigured()) {
    throw new Error("RapidAPI credentials not configured")
  }

  return {
    "x-rapidapi-key": RAPID_API_CONFIG.apiKey,
    "x-rapidapi-host": RAPID_API_CONFIG.apiHost,
  }
}
