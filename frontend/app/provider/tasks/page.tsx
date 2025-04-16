"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, Clock, DollarSign, Eye, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Header } from "@/components/Header"

// Mock data for posted tasks
const postedTasks = [
  {
    id: "1",
    title: "Website Registration Task",
    description: "Complete registration on platform and verify email",
    price: 5.0,
    category: "Registration",
    difficulty: "Easy",
    estimatedTime: "5 min",
    totalSlots: 20,
    completedCount: 12,
    inProgressCount: 5,
    pendingReviewCount: 3,
    submissions: [
      {
        id: "sub1",
        userId: "user1",
        userName: "John Doe",
        submittedAt: "2025-03-28T14:30:00",
        proofText:
          "I registered on the website using my email john@example.com. I verified my email and completed my profile with all required information.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub2",
        userId: "user2",
        userName: "Jane Smith",
        submittedAt: "2025-03-28T15:45:00",
        proofText:
          "I completed the registration process and verified my email. My username on the platform is janesmith22.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },

      {
        id: "sub3",
        userId: "user3",
        userName: "Mike Johnson",
        submittedAt: "2025-03-28T16:20:00",
        proofText:
          "Registration completed successfully. I've added all required profile information and verified my email address.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
    ],
  },
  {
    id: "2",
    title: "Social Media Post Engagement",
    description: "Like, comment and share a post on specified social media platform",
    price: 2.5,
    category: "Social Media",
    difficulty: "Easy",
    estimatedTime: "3 min",
    totalSlots: 50,
    completedCount: 30,
    inProgressCount: 15,
    pendingReviewCount: 5,
    submissions: [
      {
        id: "sub4",
        userId: "user4",
        userName: "Sarah Williams",
        submittedAt: "2025-03-27T10:15:00",
        proofText:
          "I liked, commented, and shared the post as requested. My comment was 'Great content, thanks for sharing!'",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub5",
        userId: "user5",
        userName: "David Brown",
        submittedAt: "2025-03-27T11:30:00",
        proofText: "Task completed. I engaged with the post and shared it on my timeline.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
    ],
  },
  {
    id: "3",
    title: "Mobile App Testing",
    description: "Test new mobile application and provide detailed feedback",
    price: 15.0,
    category: "Testing",
    difficulty: "Medium",
    estimatedTime: "30 min",
    totalSlots: 10,
    completedCount: 3,
    inProgressCount: 4,
    pendingReviewCount: 2,
    submissions: [
      {
        id: "sub6",
        userId: "user6",
        userName: "Emily Davis",
        submittedAt: "2025-03-26T14:00:00",
        proofText:
          "I tested all the features of the app and found a few bugs: 1) The login button doesn't work on the first try, 2) The profile page crashes when uploading a profile picture, 3) The search function is very slow.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
      {
        id: "sub7",
        userId: "user7",
        userName: "Alex Wilson",
        submittedAt: "2025-03-26T16:45:00",
        proofText:
          "Completed the app testing. The app works well overall, but I noticed some UI issues on smaller screens and the notification system doesn't always work.",
        proofImageUrl: "/placeholder.svg?height=300&width=400",
        status: "pending",
      },
    ],
  },
]

export default function ProviderTasksPage() {
  const [tasks, setTasks] = useState(postedTasks)
  const [selectedTask, setSelectedTask] = useState<(typeof postedTasks)[0] | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<(typeof postedTasks)[0]["submissions"][0] | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleApproveSubmission = (taskId: string, submissionId: string) => {
    setIsProcessing(true)

    // Simulate API call
    setTimeout(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              submissions: task.submissions.map((sub) => {
                if (sub.id === submissionId) {
                  return { ...sub, status: "approved" }
                }
                return sub
              }),
              completedCount: task.completedCount + 1,
              pendingReviewCount: task.pendingReviewCount - 1,
            }
          }
          return task
        }),
      )

      setIsProcessing(false)
      setReviewDialogOpen(false)
    }, 1500)
  }

  const handleRejectSubmission = (taskId: string, submissionId: string) => {
    setIsProcessing(true)

    // Simulate API call
    setTimeout(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              submissions: task.submissions.map((sub) => {
                if (sub.id === submissionId) {
                  return { ...sub, status: "rejected" }
                }
                return sub
              }),
              inProgressCount: task.inProgressCount + 1,
              pendingReviewCount: task.pendingReviewCount - 1,
            }
          }
          return task
        }),
      )

      setIsProcessing(false)
      setReviewDialogOpen(false)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 container py-6 px-4 mx-auto md:px-6 lg:px-8">
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Posted Tasks</h1>
              <p className="text-muted-foreground mt-1">Manage and monitor your task submissions</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-1">
            <Tabs defaultValue="all" className="w-full">
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

              <TabsContent value="all" className="space-y-4 mt-4 px-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTasks.map((task) => (
                    <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1.5">
                            <CardTitle className="line-clamp-1">{task.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                          </div>
                          <div className="flex items-center text-lg font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                            <DollarSign className="h-5 w-5 mr-1" />
                            {task.price.toFixed(2)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
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
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Task Progress</span>
                              <span className="font-medium">
                                {task.completedCount} of {task.totalSlots} completed
                              </span>
                            </div>
                            <Progress 
                              value={(task.completedCount / task.totalSlots) * 100} 
                              className="h-2 bg-gray-100 dark:bg-gray-700"
                            />

                            <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                              <div className="flex flex-col items-center p-2 rounded-md bg-green-50 dark:bg-green-900/20">
                                <span className="font-medium text-green-600 dark:text-green-400">{task.completedCount}</span>
                                <span className="text-xs text-muted-foreground">Completed</span>
                              </div>
                              <div className="flex flex-col items-center p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20">
                                <span className="font-medium text-yellow-600 dark:text-yellow-400">{task.inProgressCount}</span>
                                <span className="text-xs text-muted-foreground">In Progress</span>
                              </div>
                              <div className="flex flex-col items-center p-2 rounded-md bg-blue-50 dark:bg-blue-900/20">
                                <span className="font-medium text-blue-600 dark:text-blue-400">{task.pendingReviewCount}</span>
                                <span className="text-xs text-muted-foreground">Pending</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <div className="border-t px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedTask(task)} 
                          className="w-full hover:bg-white dark:hover:bg-gray-800"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Submissions
                        </Button>
                      </div>
                    </Card>
                  ))}
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

              <TabsContent value="pending-review" className="space-y-4 mt-4 px-4">
                {filteredTasks
                  .filter((task) => task.pendingReviewCount > 0)
                  .map((task) => (
                    <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1.5">
                            <CardTitle className="line-clamp-1">{task.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                            {task.pendingReviewCount} Pending Review
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-4">
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
                      </CardContent>
                      <div className="border-t px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedTask(task)} 
                          className="w-full hover:bg-white dark:hover:bg-gray-800"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review Submissions
                        </Button>
                      </div>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="active" className="space-y-4 mt-4 px-4">
                {filteredTasks
                  .filter((task) => task.inProgressCount > 0)
                  .map((task) => (
                    <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1.5">
                            <CardTitle className="line-clamp-1">{task.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                            {task.inProgressCount} In Progress
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-4">
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
                      </CardContent>
                      <div className="border-t px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedTask(task)} 
                          className="w-full hover:bg-white dark:hover:bg-gray-800"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Task Details
                        </Button>
                      </div>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4 mt-4 px-4">
                {filteredTasks
                  .filter((task) => task.completedCount > 0)
                  .map((task) => (
                    <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1.5">
                            <CardTitle className="line-clamp-1">{task.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                          </div>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                            {task.completedCount} Completed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-4">
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
                      </CardContent>
                      <div className="border-t px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedTask(task)} 
                          className="w-full hover:bg-white dark:hover:bg-gray-800"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Completed Submissions
                        </Button>
                      </div>
                    </Card>
                  ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Task Submissions Dialog - Updated for better mobile responsiveness */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>Review and manage task submissions</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full justify-start gap-2 h-auto flex-wrap">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                Pending Review
                <Badge variant="secondary" className="ml-1">
                  {selectedTask?.pendingReviewCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

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
                      {selectedTask?.submissions
                        .filter((sub) => sub.status === "pending")
                        .map((submission) => (
                          <TableRow key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell className="font-medium">{submission.userName}</TableCell>
                            <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
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
                                  setSelectedSubmission(submission)
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
                    {selectedTask?.submissions
                      .filter((sub) => sub.status === "approved")
                      .map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">{submission.userName}</TableCell>
                          <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
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
                                setSelectedSubmission(submission)
                                setReviewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {selectedTask?.submissions.filter((sub) => sub.status === "approved").length === 0 && (
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
                    {selectedTask?.submissions
                      .filter((sub) => sub.status === "rejected")
                      .map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">{submission.userName}</TableCell>
                          <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Rejected</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission)
                                setReviewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {selectedTask?.submissions.filter((sub) => sub.status === "rejected").length === 0 && (
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

      {/* Submission Review Dialog - Enhanced for better UX */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-3xl w-[100vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>Reviewing submission by {selectedSubmission?.userName}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Worker</span>
                  <span className="font-medium">{selectedSubmission?.userName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Submitted</span>
                  <span className="font-medium">
                    {selectedSubmission && new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Task</span>
                  <span className="font-medium">{selectedTask?.title}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Payment Amount</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${selectedTask?.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Proof Description</h3>
              <div className="rounded-lg border p-4 text-sm bg-white dark:bg-gray-800">
                {selectedSubmission?.proofText}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Proof Screenshot</h3>
              <div className="rounded-lg border overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={selectedSubmission?.proofImageUrl || "/placeholder.svg"}
                  alt="Proof screenshot"
                  className="w-full h-auto max-h-[400px] object-contain"
                />
              </div>
            </div>

            {selectedSubmission?.status === "pending" ? (
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                  onClick={() =>
                    selectedTask && selectedSubmission && handleRejectSubmission(selectedTask.id, selectedSubmission.id)
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
                    handleApproveSubmission(selectedTask.id, selectedSubmission.id)
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
                    selectedSubmission?.status === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }
                >
                  {selectedSubmission?.status === "approved" ? "Approved" : "Rejected"}
                </Badge>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
