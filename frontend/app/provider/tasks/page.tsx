"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Clock, DollarSign, Eye, Search, X } from "lucide-react"

// UI Component Imports
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import Leftsidebar from "@/components/Leftsidebar"
import { getProviderTasks, verifyProof } from "@/API/task"

// Type Definitions
interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  organizationType: string;
  skills: string[];
  balance: number;
  totalEarnings: number;
  inProgress: number;
  completedTasks: number;
  isEmailVerified: boolean;
  role: string;
  status: string;
}

interface AcceptedUser {
  id: string;
  acceptedId: string | null;
  taskId: string;
  userId: string;
  status: string;
  proof: string | null;
  describe: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface Task {
  id: string;
  taskTitle: string;
  taskDescription: string;
  category: string;
  price: number;
  estimatedTime: string;
  stepByStepInstructions: string;
  requiredProof: string;
  numWorkersNeeded: number;
  rejectedReason: string;
  totalAmount: number;
  difficulty: string;
  taskStatus: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  acceptedUsers: AcceptedUser[];
}

// Main Component
export default function ProviderTasksPage() {
  // State Management
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<AcceptedUser | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState("all")
console.log("selectedSubmission",selectedSubmission);

  // Data Fetching
  useEffect(() => {
    getProviderTasks(currentTab==="completed"?"Completed":currentTab==="pending-review"?"Review":currentTab==="active"?"Published":undefined).then((tasksData) => {
      setTasks(tasksData);
    });
  }, [currentTab]);

  // Task Filtering
  console.log("tasks",tasks);

  const filteredTasks = tasks.filter(
    (task) =>
      task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskDescription.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  console.log("filteredTasks",filteredTasks);

  // Helper Functions
  const getSubmissionCounts = (task: Task) => {
    const completedCount = task.acceptedUsers.filter(user => user.status === "Completed").length;
    const inProgressCount = task.acceptedUsers.filter(user => user.status === "Active").length;
    const pendingReviewCount = task.acceptedUsers.filter(user => user.status === "Review" || user.status === "Pending").length;
    
    return {
      completedCount,
      inProgressCount,
      pendingReviewCount,
      totalSlots: task.numWorkersNeeded
    };
  }

  // Event Handlers
  const handleApproveSubmission = async (taskId: string, userId: string) => {
    console.log("taskId", taskId);
    console.log("userId", userId);
    
    setIsProcessing(true)
    try {
      await verifyProof(taskId, userId, true);
      
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              acceptedUsers: task.acceptedUsers.map((user) => {
                if (user.userId === userId) {
                  return { ...user, status: "Completed" }
                }
                return user
              }),
            }
          }
          return task
        }),
      )
      window.location.reload();
    } catch (error) {
      console.error('Error approving submission:', error);
      // You might want to show an error toast/notification here
    } finally {
      setIsProcessing(false)
      setReviewDialogOpen(false)
    }
  }

  const handleRejectSubmission = async (taskId: string, submissionId: string) => {
    setIsProcessing(true)
    try {
      await verifyProof(taskId, submissionId, false);
      
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              acceptedUsers: task.acceptedUsers.map((user) => {
                if (user.id === submissionId) {
                  return { ...user, status: "Review" }
                }
                return user
              }),
            }
          }
          return task
        }),
      )
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      // You might want to show an error toast/notification here
    } finally {
      setIsProcessing(false)
      setReviewDialogOpen(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isLoggedIn={true} />
      <div className="flex">
        <Leftsidebar />
        <main className={`flex-1 p-6 transition-all duration-300 ml-[256px] dark:bg-gray-900`}>
          <div className="container mx-auto max-w-7xl">
            {/* Page Header Section */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Title and Description */}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">My Posted Tasks</h1>
                  <p className="text-muted-foreground mt-1">Manage and monitor your task submissions</p>
                </div>

                {/* Search and Post Task Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search tasks..."
                      className="pl-8 min-w-[250px] md:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {/* Post Task Button */}
                  <Link href="/post-task">
                    <Button className="w-full sm:w-auto shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Post New Task
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Task Tabs Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-1">
                <Tabs 
                  defaultValue="all" 
                  className="w-full"
                  onValueChange={(value) => setCurrentTab(value)}
                >
                  {/* Tab Navigation */}
                  <TabsList className="w-full justify-start gap-2 rounded-none border-b dark:border-gray-700 px-3 pb-0">
                    <TabsTrigger value="all" className="data-[state=active]:border-primary data-[state=active]:bg-transparent">
                      All Tasks
                    </TabsTrigger>
                    <TabsTrigger value="pending-review" className="data-[state=active]:border-primary data-[state=active]:bg-transparent">
                      Pending Review
                    </TabsTrigger>
                    <TabsTrigger value="active" className="data-[state=active]:border-primary data-[state=active]:bg-transparent">
                      Active
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:border-primary data-[state=active]:bg-transparent">
                      Completed
                    </TabsTrigger>
                  </TabsList>

                  {/* All Tasks Tab Content */}
                  <TabsContent value="all" className="space-y-4 mt-4 px-4">
                    {/* Task Cards Stack - Changed from grid to vertical stack */}
                    <div className="space-y-4">
                      {filteredTasks.map((task) => {
                        const counts = getSubmissionCounts(task);
                        return (
                          <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                              <div className="flex-grow p-6">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                  <div className="space-y-1.5">
                                    <CardTitle className="line-clamp-1">{task.taskTitle}</CardTitle>
                                    <CardDescription className="line-clamp-2">{task.taskDescription}</CardDescription>
                                  </div>
                                  <div className="flex items-center text-lg font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                                    <DollarSign className="h-5 w-5 mr-1" />
                                    {task.price.toFixed(2)}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      {task.category}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      {task.difficulty}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.estimatedTime}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={`flex items-center gap-1 ${
                                        task.taskStatus === "Published" ? "bg-green-100 text-green-800" :
                                        task.taskStatus === "Completed" ? "bg-blue-100 text-blue-800" :
                                        "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {(() => {
                                        const status = task.taskStatus === "Published"
                                          ? "Active"
                                          : task.taskStatus === "Completed"
                                          ? "Completed"
                                          : "Pending Review";
                                        return status;
                                      })()}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Task Progress</span>
                                      <span className="font-medium">
                                        {counts.completedCount} of {counts.totalSlots} completed
                                      </span>
                                    </div>
                                    <Progress 
                                      value={(counts.completedCount / counts.totalSlots) * 100} 
                                      className="h-2 bg-gray-100 dark:bg-gray-700"
                                    />

                                    <div className="flex gap-4 mt-4">
                                      <div className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span>{counts.completedCount} Completed</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span>{counts.inProgressCount} Working</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span>{counts.pendingReviewCount} Review</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-800/30 md:w-40 border-l dark:border-gray-700">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setSelectedTask(task)} 
                                  className="w-full text-sm py-1.5 h-auto bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                                  size="sm"
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                    
                    {filteredTasks.length === 0 && (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No tasks found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Pending Review Tab Content */}
                  <TabsContent value="pending-review" className="space-y-4 mt-4 px-4">
                    <div className="space-y-4">
                      {filteredTasks.map((task) => (
                          <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                              <div className="flex-grow p-6">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                  <div className="space-y-1.5">
                                    <CardTitle className="line-clamp-1">{task.taskTitle}</CardTitle>
                                    <CardDescription className="line-clamp-2">{task.taskDescription}</CardDescription>
                                  </div>
                                  {/* <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                                    {task.acceptedUsers.filter(user => user.status === "Review").length} In Review
                                  </Badge> */}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {task.category}
                                  </Badge>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {task.price.toFixed(2)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800/50 md:w-48">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setSelectedTask(task)} 
                                  className="w-full hover:bg-white dark:hover:bg-gray-800"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review Submissions
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>

                  {/* Active Tasks Tab Content */}
                  <TabsContent value="active" className="space-y-4 mt-4 px-4">
                    <div className="space-y-4">
                      {filteredTasks.map((task) => (
                          <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                              <div className="flex-grow p-6">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                  <div className="space-y-1.5">
                                    <CardTitle className="line-clamp-1">{task.taskTitle}</CardTitle>
                                    <CardDescription className="line-clamp-2">{task.taskDescription}</CardDescription>
                                  </div>
                                  {task.acceptedUsers.filter(user => user.status === "Active").length>0 && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                                    {task.acceptedUsers.filter(user => user.status === "Active").length} Working
                                  </Badge>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {task.category}
                                  </Badge>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {task.price.toFixed(2)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800/50 md:w-48">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setSelectedTask(task)} 
                                  className="w-full hover:bg-white dark:hover:bg-gray-800"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Task Details
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>

                  {/* Completed Tasks Tab Content */}
                  <TabsContent value="completed" className="space-y-4 mt-4 px-4">
                    <div className="space-y-4">
                      {filteredTasks.map((task) => (
                          <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                              <div className="flex-grow p-6">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                  <div className="space-y-1.5">
                                    <CardTitle className="line-clamp-1">{task.taskTitle}</CardTitle>
                                    <CardDescription className="line-clamp-2">{task.taskDescription}</CardDescription>
                                  </div>
                                  {/* <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                    {task.acceptedUsers.filter(user => user.status === "Completed").length} Completed
                                  </Badge> */}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {task.category}
                                  </Badge>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {task.price.toFixed(2)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800/50 md:w-48">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setSelectedTask(task)} 
                                  className="w-full hover:bg-white dark:hover:bg-gray-800"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />

      {/* Task Submissions Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[80vh] overflow-y-auto">
          {/* Dialog Header */}
          <DialogHeader className="space-y-1">
            <DialogTitle>{selectedTask?.taskTitle}</DialogTitle>
            <DialogDescription>Review and manage task submissions</DialogDescription>
          </DialogHeader>

          {/* Submission Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            {/* Tab List */}
            <TabsList className="w-full justify-start gap-2 h-auto flex-wrap">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                Pending Review {(() => {
                  const pendingCount = selectedTask?.acceptedUsers
                    ?.filter((user) => user.status === "Review" || user.status === "Pending")
                    ?.length;
                  
                  return pendingCount ? (
                    <Badge variant="secondary" className="ml-1">
                      {pendingCount}
                    </Badge>
                  ) : null;
                })()}
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                Approved {(() => {
                  const approvedCount = selectedTask?.acceptedUsers
                    ?.filter((user) => user.status === "Completed")
                    ?.length;
                  
                  return approvedCount ? (
                    <Badge variant="secondary" className="ml-1">
                      {approvedCount}
                    </Badge>
                  ) : null;
                })()}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                Rejected {(() => {
                  const rejectedCount = selectedTask?.acceptedUsers
                    ?.filter((user) => user.status === "Rejected")
                    ?.length;
                  
                  return rejectedCount ? (
                    <Badge variant="secondary" className="ml-1">
                      {rejectedCount}
                    </Badge>
                  ) : null;
                })()}
              </TabsTrigger>
            </TabsList>

            {/* Pending Submissions Content */}
            <TabsContent value="pending" className="mt-4">
              <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Worker</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTask?.acceptedUsers
                        .filter((user) => user.status === "Review" || user.status === "Pending")
                        .map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell className="font-medium">{user.user.name}</TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                Pending Review
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubmission(user)
                                  setReviewDialogOpen(true)
                                }}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Approved Submissions Content */}
            <TabsContent value="approved" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTask?.acceptedUsers
                      .filter((user) => user.status === "Completed")
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.user.name}</TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                              Approved
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(user)
                                setReviewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {selectedTask?.acceptedUsers.filter((user) => user.status === "Completed").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No approved submissions yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Rejected Submissions Content */}
            <TabsContent value="rejected" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTask?.acceptedUsers
                      .filter((user) => user.status === "Rejected")
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.user.name}</TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Rejected</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(user)
                                setReviewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {selectedTask?.acceptedUsers.filter((user) => user.status === "Rejected").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No rejected submissions
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Submission Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-3xl w-[100vw] max-h-[90vh] overflow-y-auto">
          {/* Review Dialog Header */}
          <DialogHeader className="space-y-1">
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>Reviewing submission by {selectedSubmission?.user.name}</DialogDescription>
          </DialogHeader>

          {/* Submission Details */}
          <div className="grid gap-6 py-4">
            {/* Worker and Task Info */}
            <div className="grid gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Worker</span>
                  <span className="font-medium">{selectedSubmission?.user.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Submitted</span>
                  <span className="font-medium">
                    {selectedSubmission && new Date(selectedSubmission.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Task</span>
                  <span className="font-medium">{selectedTask?.taskTitle}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Payment Amount</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${selectedTask?.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Proof Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Proof Description</h3>
              <div className="rounded-lg border p-4 text-sm bg-white dark:bg-gray-800">
                {selectedSubmission?.describe || "No description provided"}
              </div>
            </div>

            {/* Proof Screenshot */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Proof Screenshot</h3>
              <div className="rounded-lg border overflow-hidden bg-gray-100 dark:bg-gray-800">
                {selectedSubmission?.proof ? (
                  <img
                    src={selectedSubmission.proof}
                    alt="Proof screenshot"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No proof image provided
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {selectedSubmission?.status === "Review" || selectedSubmission?.status === "Pending" ? (
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                  onClick={() =>
                    selectedTask && selectedSubmission && handleRejectSubmission(selectedSubmission.id, selectedSubmission.userId)
                  }
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                  Reject & Request Revision
                </Button>
                <Button
                  className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                  onClick={() =>
                    selectedTask &&
                    selectedSubmission &&
                    handleApproveSubmission(selectedSubmission.id, selectedSubmission.userId)
                  }
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4" />
                  {isProcessing ? "Processing..." : "Approve & Release Payment"}
                </Button>
              </div>
            ) : (
              <div className="flex justify-center py-2">
                <Badge
                  className={
                    selectedSubmission?.status === "Completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }
                >
                  {selectedSubmission?.status}
                </Badge>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
