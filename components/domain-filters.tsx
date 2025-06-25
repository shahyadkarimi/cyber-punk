"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, Filter } from "lucide-react"

interface DomainFiltersProps {
  filters: {
    category: string
    minPrice: string
    maxPrice: string
    minDA: string
    maxDA: string
    minPA: string
    maxPA: string
    minTraffic: string
    status: string
  }
  onFiltersChange: (filters: any) => void
  categories: string[]
}

export function DomainFilters({ filters, onFiltersChange, categories }: DomainFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange((prev) => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    onFiltersChange({
      category: "",
      minPrice: "",
      maxPrice: "",
      minDA: "",
      maxDA: "",
      minPA: "",
      maxPA: "",
      minTraffic: "",
      status: "approved",
    })
  }

  return (
    <Card className="border text-card-foreground shadow-sm bg-[#1a1a1a] border-[#2a2a3a]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-neon-green" />
          <CardTitle className="text-slate-100">Advanced Filters</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-red-600 hover:text-red-600 hover:bg-red-900/20"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-gray-300">Category</Label>
            <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label className="text-gray-300">Min Price ($)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Max Price ($)</Label>
            <Input
              type="number"
              placeholder="10000"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
            />
          </div>

          {/* DA Range */}
          <div className="space-y-2">
            <Label className="text-gray-300">Min DA Score</Label>
            <Input
              type="number"
              placeholder="0"
              min="0"
              max="100"
              value={filters.minDA}
              onChange={(e) => updateFilter("minDA", e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Max DA Score</Label>
            <Input
              type="number"
              placeholder="100"
              min="0"
              max="100"
              value={filters.maxDA}
              onChange={(e) => updateFilter("maxDA", e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
            />
          </div>

          {/* PA Range */}
          <div className="space-y-2">
            <Label className="text-gray-300">Min PA Score</Label>
            <Input
              type="number"
              placeholder="0"
              min="0"
              max="100"
              value={filters.minPA}
              onChange={(e) => updateFilter("minPA", e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Max PA Score</Label>
            <Input
              type="number"
              placeholder="100"
              min="0"
              max="100"
              value={filters.maxPA}
              onChange={(e) => updateFilter("maxPA", e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
            />
          </div>

          {/* Traffic */}
          <div className="space-y-2">
            <Label className="text-gray-300">Min Monthly Traffic</Label>
            <Input
              type="number"
              placeholder="1000"
              value={filters.minTraffic}
              onChange={(e) => updateFilter("minTraffic", e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
