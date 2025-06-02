"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ShellsService, type WebShell } from "@/lib/database-services/shells-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Code } from "lucide-react"
import ShellForm from "./shell-form"

export default function ShellsManagement() {
  const { user } = useAuth()
  const [shells, setShells] = useState<WebShell[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredShells, setFilteredShells] = useState<WebShell[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentShell, setCurrentShell] = useState<WebShell | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchShells()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredShells(shells)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = shells.filter(
        (shell) =>
          shell.name.toLowerCase().includes(query) ||
          (shell.description && shell.description.toLowerCase().includes(query)) ||
          shell.language.toLowerCase().includes(query) ||
          shell.category.toLowerCase().includes(query) ||
          (shell.tags && shell.tags.some((tag) => tag.toLowerCase().includes(query))),
      )
      setFilteredShells(filtered)
    }
  }, [searchQuery, shells])

  const fetchShells = async () => {
    setLoading(true)
    try {
      console.log("Fetching shells for admin panel...")
      const data = await ShellsService.getAllShells()
      console.log("Fetched shells:", data)
      setShells(data)
      setFilteredShells(data)
    } catch (error) {
      console.error("Error fetching shells:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShell = () => {
    setCurrentShell(null)
    setFormMode("create")
    setIsFormOpen(true)
  }

  const handleEditShell = (shell: WebShell) => {
    setCurrentShell(shell)
    setFormMode("edit")
    setIsFormOpen(true)
  }

  const handleDeleteClick = (shell: WebShell) => {
    setCurrentShell(shell)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!currentShell) return

    try {
      console.log("Deleting shell:", currentShell.id)
      await ShellsService.deleteShell(currentShell.id)
      setShells(shells.filter((shell) => shell.id !== currentShell.id))
      setIsDeleteDialogOpen(false)
      setCurrentShell(null)
    } catch (error) {
      console.error("Error deleting shell:", error)
      alert("Failed to delete shell. Please try again.")
    }
  }

  const handleFormSubmit = async (formData: any) => {
    if (!user?.id) {
      console.error("No user ID available")
      alert("You must be logged in to create shells")
      return
    }

    setSubmitting(true)
    try {
      console.log("Submitting shell form:", formData)

      if (formMode === "create") {
        console.log("Creating new shell with user ID:", user.id)
        const newShell = await ShellsService.createShell(formData, user.id)
        console.log("Shell created successfully:", newShell)

        // Refresh the list
        await fetchShells()

        setIsFormOpen(false)
        setCurrentShell(null)
      } else if (formMode === "edit" && currentShell) {
        console.log("Updating shell:", currentShell.id)
        const updatedShell = await ShellsService.updateShell(currentShell.id, formData)
        console.log("Shell updated successfully:", updatedShell)

        // Refresh the list
        await fetchShells()

        setIsFormOpen(false)
        setCurrentShell(null)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert(`Failed to ${formMode} shell. Please check the console for details.`)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatFileSize = (size?: number | null) => {
    if (!size) return "Unknown"
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search shells..."
            className="pl-8 bg-[#1a1a1a] border-[#2a2a3a]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateShell} className="bg-[#00ff9d] hover:bg-[#00cc7d] text-black">
          <Plus className="mr-2 h-4 w-4" /> Add Shell
        </Button>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a3a] rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="w-8 h-8 border-2 border-t-[#00ff9d] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-400">Loading shells...</span>
          </div>
        ) : filteredShells.length === 0 ? (
          <div className="text-center p-8">
            <Code className="mx-auto h-12 w-12 text-gray-500 mb-2" />
            <h3 className="text-lg font-medium text-gray-300">No shells found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? "Try adjusting your search query" : "Start by adding a new web shell"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#2a2a3a] hover:bg-[#2a2a3a]/50">
                  <TableHead className="text-[#00ff9d]">Name</TableHead>
                  <TableHead className="text-[#00ff9d]">Language</TableHead>
                  <TableHead className="text-[#00ff9d]">Category</TableHead>
                  <TableHead className="text-[#00ff9d]">Size</TableHead>
                  <TableHead className="text-[#00ff9d]">Status</TableHead>
                  <TableHead className="text-[#00ff9d]">Downloads</TableHead>
                  <TableHead className="text-[#00ff9d]">Created</TableHead>
                  <TableHead className="text-[#00ff9d]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShells.map((shell) => (
                  <TableRow key={shell.id} className="border-b border-[#2a2a3a] hover:bg-[#2a2a3a]/50">
                    <TableCell className="font-medium text-white">{shell.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#2a2a3a] text-white border-none">
                        {shell.language}
                      </Badge>
                    </TableCell>
                    <TableCell>{shell.category}</TableCell>
                    <TableCell>{formatFileSize(shell.file_size)}</TableCell>
                    <TableCell>
                      {shell.is_active ? (
                        <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400 border-gray-600">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{shell.download_count}</TableCell>
                    <TableCell>{formatDate(shell.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-[#2a2a3a] hover:bg-[#2a2a3a] hover:text-[#00ff9d]"
                          onClick={() => handleEditShell(shell)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-[#2a2a3a] hover:bg-red-900/30 hover:text-red-500"
                          onClick={() => handleDeleteClick(shell)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Shell Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a3a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#00ff9d] text-xl">
              {formMode === "create" ? "Add New Web Shell" : "Edit Web Shell"}
            </DialogTitle>
          </DialogHeader>
          <ShellForm
            initialData={currentShell}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-xl">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the shell <span className="font-bold">{currentShell?.name}</span>?
            </p>
            <p className="text-gray-400 mt-2">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
