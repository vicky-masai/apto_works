"use client"

import Layout from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, X } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { getUsers, deleteUser, updateUser } from "@/API/api"
import { auth } from "@/API/auth"
import { currencyTypes } from "@/utils/currencyTypes"
export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    balance: ""
  })

  const fetchUsers = async (pageNum = 1, search = "", filterParams = {}) => {
    try {
      setIsLoading(true)
      const params = {
        page: pageNum,
        limit: 10,
        search,
        ...filterParams
      }
      
      const data = await getUsers(auth.getToken(), params)
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1, searchQuery, filters)
  }, [searchQuery, filters])

  const handleEdit = (user) => {
    setEditingUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      balance: user.balance
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    try {
      await updateUser(auth.getToken(), editingUser.id, editForm)
      await fetchUsers(page, searchQuery, filters)
      setIsEditDialogOpen(false)
      setEditingUser(null)
      setEditForm({ name: "", email: "", balance: "" })
      toast.success("User updated successfully")
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error("Failed to update user")
    }
  }

  const handleDelete = async (userId) => {
    try {
      await deleteUser(auth.getToken(), userId)
      await fetchUsers(page, searchQuery, filters)
      toast.success("User deleted successfully")
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error("Failed to delete user")
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Users</CardTitle>
              <Button variant="outline">Export Data</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-3 max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="search" 
                    placeholder="Search users..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Deleted">Deleted</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">ID</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Email</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Role</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Balance</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Joined Date</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">#{user.id}</td>
                          <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                          <td className="py-4 px-6 text-gray-600">{user.email}</td>
                          <td className="py-4 px-6 text-gray-600">{user.role || user.userType}</td>
                          <td className="py-4 px-6 font-medium">{currencyTypes[0]?.symbol}{user.balance?.toFixed(2) || '0.00'}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === "Active" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(user)}
                              >
                                Edit
                              </Button>
                              {user.status === "Active" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        {isEditDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[500px]">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit User</h2>
                  <button 
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setEditingUser(null)
                      setEditForm({ name: "", email: "", balance: "" })
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Balance</label>
                    <Input
                      type="number"
                      value={editForm.balance}
                      onChange={(e) => setEditForm(prev => ({ ...prev, balance: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setEditingUser(null)
                      setEditForm({ name: "", email: "", balance: "" })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditSubmit}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}