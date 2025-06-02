"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, ExternalLink } from "lucide-react"
import type { WebShell, ShellFormData } from "@/lib/database-services/shells-service"

interface ShellFormProps {
  initialData: WebShell | null
  onSubmit: (data: ShellFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function ShellForm({ initialData, onSubmit, onCancel, isSubmitting = false }: ShellFormProps) {
  const [formData, setFormData] = useState<ShellFormData>({
    name: "",
    description: "",
    file_path: "",
    file_size: 0,
    language: "",
    category: "",
    tags: [],
    is_active: true,
  })
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        file_path: initialData.file_path || "",
        file_size: initialData.file_size || 0,
        language: initialData.language || "",
        category: initialData.category || "",
        tags: initialData.tags || [],
        is_active: initialData.is_active,
      })
    } else {
      // Reset form for new shell
      setFormData({
        name: "",
        description: "",
        file_path: "",
        file_size: 0,
        language: "",
        category: "",
        tags: [],
        is_active: true,
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "file_size") {
      setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.file_path.trim()) {
      newErrors.file_path = "GitHub raw link is required"
    } else if (!isValidGitHubRawLink(formData.file_path)) {
      newErrors.file_path = "Please enter a valid GitHub raw link (e.g., https://raw.githubusercontent.com/...)"
    }

    if (!formData.language.trim()) {
      newErrors.language = "Language is required"
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidGitHubRawLink = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return (
        urlObj.hostname === "raw.githubusercontent.com" || (urlObj.hostname === "github.com" && url.includes("/raw/"))
      )
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      console.log("Form data being submitted:", formData)
      onSubmit(formData)
    } else {
      console.log("Form validation failed:", errors)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-[#2a2a3a] border-[#3a3a4a] text-white"
              placeholder="Shell name"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_path" className="text-white">
              GitHub Raw Link <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="file_path"
                name="file_path"
                value={formData.file_path}
                onChange={handleChange}
                className="bg-[#2a2a3a] border-[#3a3a4a] text-white pr-10"
                placeholder="https://raw.githubusercontent.com/user/repo/main/shell.php"
                disabled={isSubmitting}
              />
              {formData.file_path && isValidGitHubRawLink(formData.file_path) && (
                <a
                  href={formData.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#00ff9d] hover:text-[#00cc7d]"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {errors.file_path && <p className="text-red-500 text-sm">{errors.file_path}</p>}
            <p className="text-gray-400 text-xs">
              Enter a GitHub raw link to the shell file (e.g.,
              https://raw.githubusercontent.com/user/repo/main/shell.php)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="bg-[#2a2a3a] border-[#3a3a4a] text-white min-h-[100px]"
            placeholder="Describe the shell's functionality and features"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="language" className="text-white">
              Language <span className="text-red-500">*</span>
            </Label>
            <Input
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="bg-[#2a2a3a] border-[#3a3a4a] text-white"
              placeholder="PHP, ASP, JSP, etc."
              disabled={isSubmitting}
            />
            {errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">
              Category <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="bg-[#2a2a3a] border-[#3a3a4a] text-white"
              placeholder="Backdoor, C2, etc."
              disabled={isSubmitting}
            />
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_size" className="text-white">
              File Size (bytes)
            </Label>
            <Input
              id="file_size"
              name="file_size"
              type="number"
              value={formData.file_size || ""}
              onChange={handleChange}
              className="bg-[#2a2a3a] border-[#3a3a4a] text-white"
              placeholder="File size in bytes"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-white">
            Tags
          </Label>
          <div className="flex gap-2">
            <Input
              id="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="bg-[#2a2a3a] border-[#3a3a4a] text-white flex-1"
              placeholder="Add tags"
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              className="bg-[#3a3a4a] hover:bg-[#4a4a5a] text-white"
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags?.map((tag) => (
              <div key={tag} className="flex items-center gap-1 bg-[#2a2a3a] text-white px-2 py-1 rounded-md">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-400 hover:text-white"
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleCheckboxChange}
            className="rounded bg-[#2a2a3a] border-[#3a3a4a] text-[#00ff9d] focus:ring-[#00ff9d]"
            disabled={isSubmitting}
          />
          <Label htmlFor="is_active" className="text-white">
            Active (visible to users)
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-[#3a3a4a] text-white"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-[#00ff9d] hover:bg-[#00cc7d] text-black" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
              {initialData ? "Updating..." : "Creating..."}
            </>
          ) : initialData ? (
            "Update Shell"
          ) : (
            "Create Shell"
          )}
        </Button>
      </div>
    </form>
  )
}
