"use client"

// Simple authentication utility for admin panel
// This is a client-side only implementation without a real database
// In a production environment, this should be replaced with a secure server-side solution

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "cyberpunk2077", // This would be hashed in a real implementation
}

const AUTH_TOKEN_KEY = "mrz_admin_auth_token"

export function login(username: string, password: string): boolean {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    // In a real implementation, this would be a JWT or other secure token
    const fakeToken = btoa(`${username}:${Date.now()}`)
    localStorage.setItem(AUTH_TOKEN_KEY, fakeToken)
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}
