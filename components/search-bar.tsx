"use client";

import type React from "react";

import { useState } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { shellLanguages } from "./dashboard/admin/shells-management";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  onRefresh: () => void;
}

export default function SearchBar({
  onSearch,
  onFilterChange,
}: SearchBarProps) {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("All");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    onSearch(query);
  };

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
          value={search}
          onChange={handleSearch}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            /
          </kbd>
        </div>
      </div>

      <div className="flex flex-col  gap-2">
        <span className="text-sm">Filter by language</span>

        <Select
          value={language}
          onValueChange={(value) => {
            setLanguage(value);

            onFilterChange(value.toLowerCase());
          }}
        >
          <SelectTrigger className="w-full md:w-52 bg-[#1a1a1a] border-[#2a2a3a] text-white focus:border-[#00ff9d]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2a2a3a] text-white">
            <SelectItem value="All">All</SelectItem>

            {shellLanguages.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
