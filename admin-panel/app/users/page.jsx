"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { auth } from "@/API/auth"
import { getUsers, deleteUser } from "@/API/api"
import { useEffect, useState, useRef, useCallback } from "react"

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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

  const fetchUsers = async (pageNum = 1, search = "") => {
    try {
      setIsLoading(true);
      const data = await getUsers(auth.getToken(), { page: pageNum, search });
      if (pageNum === 1) {
        setUsers(data.users);
      } else {
        setUsers(prevUsers => [...prevUsers, ...data.users]);
      }
      setHasMore(data.users.length > 0);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (page > 1) {
      fetchUsers(page, searchQuery);
    }
  }, [page]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const onClickDelete = async (e, userId) => {
    // e.preventDefault();
    console.log(userId);
    const data = await deleteUser(auth.getToken(), userId);
    // alert(data.message);
    fetchUsers();
    // console.log(data);
    // window.location.reload();
  };

  // Mock data for users
  // const users = [
  //   { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "active", joinDate: "2025-01-15" },
  //   { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "active", joinDate: "2025-02-20" },
  //   {
  //     id: 3,
  //     name: "Mike Johnson",
  //     email: "mike@example.com",
  //     role: "User",
  //     status: "inactive",
  //     joinDate: "2025-03-10",
  //   },
  //   {
  //     id: 4,
  //     name: "Sarah Williams",
  //     email: "sarah@example.com",
  //     role: "Moderator",
  //     status: "active",
  //     joinDate: "2025-01-05",
  //   },
  //   { id: 5, name: "David Brown", email: "david@example.com", role: "User", status: "pending", joinDate: "2025-04-01" },
  //   { id: 6, name: "Emily Davis", email: "emily@example.com", role: "User", status: "active", joinDate: "2025-02-15" },
  //   {
  //     id: 7,
  //     name: "Robert Wilson",
  //     email: "robert@example.com",
  //     role: "Admin",
  //     status: "active",
  //     joinDate: "2025-01-20",
  //   },
  //   { id: 8, name: "Lisa Taylor", email: "lisa@example.com", role: "User", status: "inactive", joinDate: "2025-03-25" },
  // ]

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

      <div className="flex items-center gap-2 max-w-sm">
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
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b">
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
                    <td className="py-3 px-4">{user.role}</td>
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
                        <Button className="w-fit px-3 py-1 rounded-full" variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button onClick={(e) => onClickDelete(e, user.id)} className="w-fit px-3 py-1 rounded-full text-red-500 border-red-500 hover:bg-red-50" variant="outline" size="sm">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>

                ))}
              </tbody>
            </table>
            {isLoading && (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.role}</td>
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
                          <Button className="w-fit px-3 py-1 rounded-full" variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button onClick={(e) => onClickDelete(e, user.id)} className="w-fit px-3 py-1 rounded-full text-red-500 border-red-500 hover:bg-red-50" variant="outline" size="sm">
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
