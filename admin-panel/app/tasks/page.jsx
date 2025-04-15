"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, X, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { getTasks } from "@/API/api"
import { auth } from "@/API/auth"

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [rejectComment, setRejectComment] = useState("")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const getTasksFetch = async () => {
    try {
      const response = await getTasks(auth.getToken(), { page: 1, search: "" })
      setTasks(response.tasks)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getTasksFetch()
  }, [])

  const handleApprove = async (taskId) => {
    try {
      // Add your API call here for approving task
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, taskStatus: 'Approved' }
          : task
      ))
    } catch (error) {
      console.error('Error approving task:', error)
    }
  }

  const handleReject = (task) => {
    setSelectedTask(task)
    setIsRejectDialogOpen(true)
  }

  const submitReject = async () => {
    try {
      // Add your API call here for rejecting task
      setTasks(tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task, taskStatus: 'Rejected', rejectionReason: rejectComment }
          : task
      ))
      setIsRejectDialogOpen(false)
      setRejectComment("")
      setSelectedTask(null)
    } catch (error) {
      console.error('Error rejecting task:', error)
    }
  }

  const handleView = (task) => {
    setSelectedTask(task)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks List</h1>
          <p className="text-muted-foreground">Manage and track all system tasks</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">Add New Task</Button>
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
                  <th className="text-left py-3 px-4 font-medium">Difficulty</th>
                  <th className="text-left py-3 px-4 font-medium">Created Date</th>
                  <th className="text-left py-3 px-4 font-medium">Author</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b last:border-0">
                    <td className="py-4 px-4">{task.taskTitle}</td>
                    <td className="py-4 px-4">
                      <Badge 
                        className={`px-3 py-1 rounded-full ${
                          task.taskStatus === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : task.taskStatus === 'Review'
                            ? 'bg-blue-100 text-blue-800'
                            : task.taskStatus === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.taskStatus}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">{task.difficulty}</td>
                    <td className="py-4 px-4">{task.createdAt}</td>
                    <td className="py-4 px-4">{task.user.name}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {task.taskStatus === "Review" ? (
                          <>
                            <Button
                              onClick={() => handleApprove(task.id)}
                              className="px-4 py-2 text-sm border border-green-500 text-green-500 hover:bg-green-50 rounded-full"
                              variant="outline"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(task)}
                              className="px-4 py-2 text-sm border border-red-500 text-red-500 hover:bg-red-50 rounded-full"
                              variant="outline"
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <>
                            {task.taskStatus === 'Rejected' && (
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className="px-3 py-1.5 rounded-full bg-red-50 text-red-500 border border-red-100"
                                >
                                  Rejected
                                </Badge>
                                <Button
                                  onClick={() => handleView(task)}
                                  className="px-3 py-1.5 text-sm bg-white hover:bg-gray-50 rounded-full flex items-center gap-1.5 border border-gray-200"
                                  variant="outline"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </Button>
                              </div>
                            )}
                            {task.taskStatus === 'Approved' && (
                              <Badge 
                                className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100"
                              >
                                {task.taskStatus}
                              </Badge>
                            )}
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

      {/* Custom Reject Dialog */}
      {isRejectDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[500px]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Reject Task</h2>
                <button 
                  onClick={() => {
                    setIsRejectDialogOpen(false)
                    setRejectComment("")
                    setSelectedTask(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Rejection Reason</h4>
                <textarea
                  placeholder="Enter reason for rejection"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRejectDialogOpen(false)
                    setRejectComment("")
                    setSelectedTask(null)
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReject}
                  disabled={!rejectComment.trim()}
                  className="px-6 bg-red-500 hover:bg-red-600 text-white"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[500px]">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">View Task Details</h2>
                <button 
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setSelectedTask(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Rejection Reason</h4>
                  <p className="mt-1 text-gray-600">{selectedTask?.rejectionReason}</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setSelectedTask(null)
                  }}
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}