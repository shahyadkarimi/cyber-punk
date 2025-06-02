"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
  onFilterChange: (filter: string) => void
}

export default function SearchBar({ onSearch, onFilterChange }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a3a] rounded-md font-mono text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50 focus:border-[#00ff9d] transition-all"
          placeholder="Search web shells..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            /
          </kbd>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterChange("all")}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a3a] rounded-md font-mono text-sm hover:bg-[#2a2a3a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50"
        >
          All
        </button>
        {["PHP", "ASPX", "JSP", "Other"].map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter.toLowerCase())}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a3a] rounded-md font-mono text-sm hover:bg-[#2a2a3a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ff9d]/50"
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}
