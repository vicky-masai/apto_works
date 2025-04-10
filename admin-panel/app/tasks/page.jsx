"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, XCircle, Eye, Check, X } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function TasksPage() {
  // Mock data for tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Review new user registrations",
      status: "completed",
      priority: "high",
      dueDate: "2025-04-10",
      assignedTo: "John Doe",
    },
    {
      id: 2,
      title: "Approve withdrawal requests",
      status: "pending",
      priority: "high",
      dueDate: "2025-04-09",
      assignedTo: "Jane Smith",
    },
    {
      id: 3,
      title: "Update system settings",
      status: "in-progress",
      priority: "medium",
      dueDate: "2025-04-12",
      assignedTo: "John Doe",
    },
    {
      id: 4,
      title: "Generate monthly report",
      status: "pending",
      priority: "low",
      dueDate: "2025-04-15",
      assignedTo: "Mike Johnson",
    },
    {
      id: 5,
      title: "Fix login issue",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-04-08",
      assignedTo: "Jane Smith",
    },
    {
      id: 6,
      title: "Update user documentation",
      status: "completed",
      priority: "medium",
      dueDate: "2025-04-05",
      assignedTo: "Mike Johnson",
    },
  ])

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [rejectComment, setRejectComment] = useState("")
  const [rejectedTasks, setRejectedTasks] = useState({})

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Approved "
      case "in-progress":
        return "In Progress"
      case "pending":
        return "Pending"
      case "rejected":
        return "Rejected"
      default:
        return status
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "in-progress":
        return "text-blue-500"
      case "pending":
        return "text-yellow-500"
      case "rejected":
        return "text-red-500"
      default:
        return ""
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <Badge className="w-fit px-3 py-1 rounded-full" variant="destructive">High</Badge>
      case "medium":
        return <Badge className="w-fit px-3 py-1 rounded-full" variant="default">Medium</Badge>
      case "low":
        return <Badge className="w-fit px-3 py-1 rounded-full" variant="outline">Low</Badge>
      default:
        return null
    }
  }

  const handleReject = (task) => {
    setSelectedTask(task)
    setIsRejectDialogOpen(true)
  }

  const handleRejectSubmit = () => {
    if (selectedTask && rejectComment) {
      setRejectedTasks(prev => ({
        ...prev,
        [selectedTask.id]: rejectComment
      }))
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === selectedTask.id 
            ? {...task, status: 'rejected'} 
            : task
        )
      )
      setIsRejectDialogOpen(false)
      setRejectComment("")
      setSelectedTask(null)
    }
  }

  const handleViewDetails = (task) => {
    setSelectedTask(task)
    setIsViewDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks List</h1>
          <p className="text-muted-foreground">Manage and track all system tasks</p>
        </div>
        <Button className="w-fit px-3 py-1 rounded-full">Add New Task</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Task</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium">Assigned To</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">{task.title}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className={`font-medium ${getStatusStyle(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(task.priority)}</td>
                    <td className="py-3 px-4">{task.dueDate}</td>
                    <td className="py-3 px-4">{task.assignedTo}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {task.status === "pending" ? (
                          <>
                            <button
                              onClick={() => {
                                setTasks(prevTasks =>
                                  prevTasks.map(t =>
                                    t.id === task.id
                                      ? { ...t, status: 'completed' }
                                      : t
                                  )
                                )
                              }}
                              className="px-4 py-2 text-sm font-medium text-green-500 bg-white border border-green-500 rounded-full hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 inline-flex items-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(task)}
                              className="px-4 py-2 text-sm font-medium text-red-500 bg-white border border-red-500 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 inline-flex items-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        ) : task.status === "completed" ? (
                          <div className="inline-flex items-center gap-2 text-green-500 font-medium">
                            <CheckCircle className="h-5 w-5" />
                            Approved
                          </div>
                        ) : task.status === "rejected" && (
                          <>
                            <div className="inline-flex items-center gap-2 text-red-500 font-medium">
                              <XCircle className="h-5 w-5" />
                              Rejected
                            </div>
                            <button
                              onClick={() => handleViewDetails(task)}
                              className="px-4 py-2 text-sm font-medium text-blue-500 bg-white border border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Modal */}
      {isRejectDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Reject Task</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this task.</p>
            
            {selectedTask && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Task:</p>
                  <p>{selectedTask.title}</p>
                </div>
                <div>
                  <label className="font-medium block mb-2">
                    Rejection Reason:
                  </label>
                  <input
                    type="text"
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsRejectDialogOpen(false)
                  setRejectComment("")
                  setSelectedTask(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectComment}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewDetailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Rejection Details</h3>
            
            {selectedTask && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Task:</p>
                  <p>{selectedTask.title}</p>
                </div>
                <div>
                  <p className="font-medium">Rejection Reason:</p>
                  <p className="text-red-500">{rejectedTasks[selectedTask.id]}</p>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setIsViewDetailsOpen(false)
                  setSelectedTask(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
