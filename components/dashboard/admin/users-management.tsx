"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Search, Users, UserCheck, UserX, Shield } from "lucide-react"
import { UsersService, type User, type UserStats } from "@/lib/database-services/users-service"
import UserForm from "./user-form"

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    sellers: 0,
    clients: 0,
    active: 0,
    inactive: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    loadUsers()
    loadStats()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await UsersService.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
      // Show error message to user
      alert(`Error loading users: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await UsersService.getUserStats()
      setStats(data)
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers()
      return
    }

    try {
      setLoading(true)
      const data = await UsersService.searchUsers(searchQuery)
      setUsers(data)
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await UsersService.deleteUser(userId)
      await loadUsers()
      await loadStats()
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error deleting user")
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await UsersService.toggleUserStatus(userId, !currentStatus)
      await loadUsers()
      await loadStats()
    } catch (error) {
      console.error("Error toggling user status:", error)
      alert("Error updating user status")
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleUserUpdated = () => {
    setIsEditDialogOpen(false)
    setSelectedUser(null)
    loadUsers()
    loadStats()
  }

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active)

    return matchesRole && matchesStatus
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "seller":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "client":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#00ff9d] mb-2">Users Management</h1>
        <p className="text-gray-400">Manage user accounts, roles, and permissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-[#00ff9d]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.admins}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
        <CardHeader>
          <CardTitle className="text-[#00ff9d]">Search & Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 bg-[#2a2a3a] border-[#3a3a4a] text-white"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#2a2a3a] border-[#3a3a4a] text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a3a] border-[#3a3a4a]">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#2a2a3a] border-[#3a3a4a] text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a3a] border-[#3a3a4a]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info - Remove in production */}
      <Card className="bg-[#1a1a1a] border-[#2a2a3a] mb-4">
        <CardContent className="p-4">
          <p className="text-sm text-gray-400">Debug: Total users loaded: {users.length}</p>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
        <CardHeader>
          <CardTitle className="text-[#00ff9d]">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff9d]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2a2a3a]">
                    <TableHead className="text-gray-400">User</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Role</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Joined</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-[#2a2a3a]">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#2a2a3a] rounded-full flex items-center justify-center">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url || "/placeholder.svg"}
                                alt=""
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <span className="text-[#00ff9d] font-semibold">
                                {(user.full_name || user.username || user.email)?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.full_name || user.username || "No name"}</div>
                            <div className="text-sm text-gray-400">@{user.username || "no-username"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(user.is_active)}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            className="border-[#3a3a4a] text-[#00ff9d] hover:bg-[#00ff9d] hover:text-black"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                            className="border-[#3a3a4a] text-yellow-400 hover:bg-yellow-400 hover:text-black"
                          >
                            {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                            className="border-[#3a3a4a] text-red-400 hover:bg-red-400 hover:text-black"
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
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {users.length === 0
                  ? "No users found. Check your admin permissions."
                  : "No users match the current filters."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a3a] text-white">
          <DialogHeader>
            <DialogTitle className="text-[#00ff9d]">Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm user={selectedUser} onSuccess={handleUserUpdated} onCancel={() => setIsEditDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
