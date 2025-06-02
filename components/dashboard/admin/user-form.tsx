"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { UsersService, type User } from "@/lib/database-services/users-service"

interface UserFormProps {
  user: User
  onSuccess: () => void
  onCancel: () => void
}

export default function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    full_name: user.full_name || "",
    email: user.email,
    avatar_url: user.avatar_url || "",
    role: user.role,
    is_active: user.is_active,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await UsersService.updateUser(user.id, formData)
      onSuccess()
    } catch (error) {
      console.error("Error updating user:", error)
      setError("Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username" className="text-gray-300">
            Username
          </Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="bg-[#2a2a3a] border-[#3a3a4a] text-white"
            placeholder="Enter username"
          />
        </div>

        <div>
          <Label htmlFor="full_name" className="text-gray-300">
            Full Name
          </Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="bg-[#2a2a3a] border-[#3a3a4a] text-white"
            placeholder="Enter full name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-gray-300">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-[#2a2a3a] border-[#3a3a4a] text-white"
          placeholder="Enter email"
          required
        />
      </div>

      <div>
        <Label htmlFor="avatar_url" className="text-gray-300">
          Avatar URL
        </Label>
        <Input
          id="avatar_url"
          value={formData.avatar_url}
          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
          className="bg-[#2a2a3a] border-[#3a3a4a] text-white"
          placeholder="Enter avatar URL"
        />
      </div>

      <div>
        <Label htmlFor="role" className="text-gray-300">
          Role
        </Label>
        <Select
          value={formData.role}
          onValueChange={(value: "admin" | "seller" | "client") => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger className="bg-[#2a2a3a] border-[#3a3a4a] text-white">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent className="bg-[#2a2a3a] border-[#3a3a4a]">
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active" className="text-gray-300">
          Active User
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-[#3a3a4a] text-gray-300 hover:bg-[#2a2a3a]"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]">
          {loading ? "Updating..." : "Update User"}
        </Button>
      </div>
    </form>
  )
}
