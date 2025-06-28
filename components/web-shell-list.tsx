"use client";

import { useState, useEffect } from "react";
import WebShellCard from "./web-shell-card";
import SearchBar from "./search-bar";
import {
  ShellsService,
  type WebShell,
} from "@/lib/database-services/shells-service";
import { Terminal } from "lucide-react";
import { getData, postData } from "@/services/API";

export default function WebShellList() {
  const [shells, setShells] = useState<WebShell[]>([]);
  const [filteredShells, setFilteredShells] = useState<WebShell[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShells();
  }, []);

  const fetchShells = async () => {
    setIsLoading(true);
    setError(null);

    postData("/webshells/get-all")
      .then((res) => {
        setShells(res.data.shells);
        setFilteredShells(res.data.shells);

        setIsLoading(false);
      })
      .catch((err) => {
        setError("Failed to load web shells. Please try again later.");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    filterWebShells(searchQuery, activeFilter);
  }, [searchQuery, activeFilter, shells]);

  const filterWebShells = (query: string, filter: string) => {
    let result = shells;

    // Apply search query filter
    if (query) {
      result = result.filter(
        (shell) =>
          shell.name.toLowerCase().includes(query.toLowerCase()) ||
          shell?.description?.toLowerCase().includes(query.toLowerCase()) ||
          (shell.tags &&
            shell.tags.some((tag) =>
              tag.toLowerCase().includes(query.toLowerCase())
            ))
      );
    }

    // Apply language filter
    if (filter !== "all") {
      result = result.filter(
        (shell) => shell.language.toLowerCase() === filter.toLowerCase()
      );
    }

    setFilteredShells(result);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-t-[#00ff9d] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#00ff9d] font-mono text-lg">
          Loading web shells...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchShells}
            className="px-4 py-2 bg-[#2a2a3a] hover:bg-[#3a3a4a] rounded-md text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold font-mono mb-4 flex items-center">
          <Terminal className="mr-2 h-6 w-6 text-[#00ff9d]" />
          <span>Web Shell Collection</span>
        </h2>
        <p className="text-gray-400 font-mono">
          Browse our curated collection of web shells for ethical penetration
          testing and security research.
        </p>
      </div>

      <SearchBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onRefresh={fetchShells}
      />

      {filteredShells.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShells.map((shell) => (
            <WebShellCard key={shell.id} webShell={shell} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-[#2a2a3a] rounded-lg">
          <p className="text-gray-400 font-mono text-lg mb-2">
            No web shells found
          </p>
          <p className="text-gray-500 font-mono">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </section>
  );
}
