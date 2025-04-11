"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { auth } from "@/API/auth"
import { getUsers } from "@/API/api"
import { useEffect, useState, useRef, useCallback } from "react"
import { toast } from "react-hot-toast"

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const [searchField, setSearchField] = useState("name");
  const observer = useRef();
  const lastUserElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    balance: ""
  });

  const searchFields = [
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "role", label: "Role" }
  ];

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "Admin", label: "Admin" },
    { value: "User", label: "User" },
    { value: "TaskProvider", label: "Task Provider" }
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Deleted", label: "Deleted" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Join Date" },
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "role", label: "Role" }
  ];

  const fetchUsers = async (pageNum = 1, search = "", field = "name", filterParams = {}) => {
    try {
      setIsLoading(true);
      const params = {
        page: pageNum,
        limit: 10,
        search,
        searchField: field,
        ...filterParams
      };
      
      console.log("Fetching users with params:", params);
      
      const data = await getUsers(auth.getToken(), params);
      
      console.log("Received users data:", data);
      
      if (pageNum === 1) {
        setUsers(data.users || []);
      } else {
        setUsers(prevUsers => [...prevUsers, ...(data.users || [])]);
      }
      setHasMore(data.pagination && data.pagination.page < data.pagination.totalPages);
      setTotalPages(data.pagination ? data.pagination.totalPages : 1);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchQuery, searchField, filters);
  }, [searchQuery, searchField, filters]);

  useEffect(() => {
    if (page > 1) {
      fetchUsers(page, searchQuery, searchField, filters);
    }
  }, [page]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleSearchFieldChange = (value) => {
    setSearchField(value);
    setPage(1);
  };

  const handleSortChange = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc"
    }));
    setPage(1);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      balance: user.balance
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      // Here you'll add the API call to update user
      // const response = await updateUser(auth.getToken(), editingUser.id, editForm);
      
      // For now, updating locally
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...editForm }
          : user
      ));
      
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setEditForm({ name: "", email: "", balance: "" });
      
      toast.success("User updated successfully");
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Failed to update user");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="w-fit px-3 py-1 rounded-full bg-green-500">Active</Badge>
      case "inactive":
        return <Badge className="w-fit px-3 py-1 rounded-full" variant="secondary">Inactive</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="w-fit px-3 py-1 rounded-full text-yellow-500 border-yellow-500">
            Pending
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Button className="w-fit px-3 py-1 rounded-full">Add New User</Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search users..." 
              className="pl-8" 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <select
            value={searchField}
            onChange={(e) => handleSearchFieldChange(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2"
          >
            {searchFields.map(field => (
              <option key={field.value} value={field.value}>{field.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2"
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSortChange(filters.sortBy)}
            >
              {filters.sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            {/* Table with sticky header and scrollable body */}
            <div className="border rounded-md">
              <div className="overflow-x-auto">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-background border-b z-10">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-left py-3 px-4 font-medium">Balance</th>
                        <th className="text-left py-3 px-4 font-medium">Join Date</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((user, index) => (
                        <tr 
                          key={user.id} 
                          className="border-b last:border-0 hover:bg-muted/50"
                          ref={index === users.length - 1 ? lastUserElementRef : null}
                        >
                          <td className="py-3 px-4 font-medium">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">{user.role || user.userType}</td>
                          <td className="py-3 px-4">{user.balance}</td>
                          <td className="py-3 px-4">{new Date(user.createdAt).toLocaleString('en-GB', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          })}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button 
                                className="w-fit px-3 py-1 rounded-full" 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(user)}
                              >
                                Edit
                              </Button>
                              <Button 
                                className="w-fit px-3 py-1 rounded-full text-red-500 border-red-500 hover:bg-red-50" 
                                variant="outline" 
                                size="sm"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {isLoading && (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {isEditDialogOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
              <p className="text-gray-500 mt-1">Update user information</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.balance}
                  onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingUser(null)
                  setEditForm({ name: "", email: "", balance: "" })
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                onClick={handleEditSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
