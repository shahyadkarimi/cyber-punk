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
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-slate-900 dark:text-slate-100">Advanced Filters</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Category</Label>
            <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600">
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
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Min Price ($)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Max Price ($)</Label>
            <Input
              type="number"
              placeholder="10000"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600"
            />
          </div>

          {/* DA Range */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Min DA Score</Label>
            <Input
              type="number"
              placeholder="0"
              min="0"
              max="100"
              value={filters.minDA}
              onChange={(e) => updateFilter("minDA", e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Max DA Score</Label>
            <Input
              type="number"
              placeholder="100"
              min="0"
              max="100"
              value={filters.maxDA}
              onChange={(e) => updateFilter("maxDA", e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600"
            />
          </div>

          {/* PA Range */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Min PA Score</Label>
            <Input
              type="number"
              placeholder="0"
              min="0"
              max="100"
              value={filters.minPA}
              onChange={(e) => updateFilter("minPA", e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Max PA Score</Label>
            <Input
              type="number"
              placeholder="100"
              min="0"
              max="100"
              value={filters.maxPA}
              onChange={(e) => updateFilter("maxPA", e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600"
            />
          </div>

          {/* Traffic */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Min Monthly Traffic</Label>
            <Input
              type="number"
              placeholder="1000"
              value={filters.minTraffic}
              onChange={(e) => updateFilter("minTraffic", e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
