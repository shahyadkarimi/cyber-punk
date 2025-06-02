"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function DomainSubmissionForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [formData, setFormData] = useState({
    domain: "",
    description: "",
    price: "",
    category: "",
    da_score: "",
    pa_score: "",
    traffic: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from("domains").insert({
        domain: formData.domain,
        description: formData.description || null,
        price: formData.price ? Number.parseFloat(formData.price) : null,
        category: formData.category || null,
        da_score: formData.da_score ? Number.parseInt(formData.da_score) : null,
        pa_score: formData.pa_score ? Number.parseInt(formData.pa_score) : null,
        traffic: formData.traffic ? Number.parseInt(formData.traffic) : null,
        tags: tags,
        seller_id: user.id,
        status: "pending",
      })

      if (error) throw error

      // Reset form
      setFormData({
        domain: "",
        description: "",
        price: "",
        category: "",
        da_score: "",
        pa_score: "",
        traffic: "",
      })
      setTags([])

      alert("Domain submitted successfully! It will be reviewed by our admin team.")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting domain:", error)
      alert("Error submitting domain. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Submit Domain for Approval</CardTitle>
          <p className="text-gray-400">
            Submit your domain for admin review. Once approved, it will be available in the marketplace.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="domain" className="text-white">
                Domain Name *
              </Label>
              <Input
                id="domain"
                name="domain"
                type="text"
                placeholder="example.com"
                value={formData.domain}
                onChange={handleInputChange}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your domain, its history, and potential use cases..."
                value={formData.description}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700 text-white"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-white">
                  Price (USD)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="1000"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-white">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  type="text"
                  placeholder="Technology, Business, etc."
                  value={formData.category}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="da_score" className="text-white">
                  DA Score
                </Label>
                <Input
                  id="da_score"
                  name="da_score"
                  type="number"
                  placeholder="50"
                  min="0"
                  max="100"
                  value={formData.da_score}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="pa_score" className="text-white">
                  PA Score
                </Label>
                <Input
                  id="pa_score"
                  name="pa_score"
                  type="number"
                  placeholder="45"
                  min="0"
                  max="100"
                  value={formData.pa_score}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="traffic" className="text-white">
                  Monthly Traffic
                </Label>
                <Input
                  id="traffic"
                  name="traffic"
                  type="number"
                  placeholder="10000"
                  value={formData.traffic}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button type="button" onClick={addTag} className="bg-[#00ff9d] text-black hover:bg-[#00e68a]">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-gray-700 text-white">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.domain}
              className="w-full bg-[#00ff9d] text-black hover:bg-[#00e68a]"
            >
              {loading ? "Submitting..." : "Submit Domain"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
