"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { getTasks } from "@/API/api"
import { auth } from "@/API/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function TasksPage() {
  const [tasks, setTasks] = useState([])

  const [isLoading, setIsLoading] = useState(true)

  const getTasksFetch = async () => {
    try {
      console.log("pandey1")
      const response = await getTasks(auth.getToken(), { page: 1, search: "" })
      setTasks(response)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  useEffect(()=>{
    getTasksFetch()
  },[])

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [rejectComment, setRejectComment] = useState("")

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in-progress":
        return "In Progress"
      case "pending":
        return "Pending"
      default:
        return status
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
                  <th className="text-left py-3 px-4 font-medium">Difficulty</th>
                  <th className="text-left py-3 px-4 font-medium">Created Date</th>
                  <th className="text-left py-3 px-4 font-medium">Author</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">{task.taskTitle}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.taskStatus)}
                        <span>{getStatusText(task.taskStatus)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(task.difficulty)}</td>
                    <td className="py-3 px-4">{task.createdAt}</td>
                    <td className="py-3 px-4">{task.user.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {task.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-fit px-3 py-1 text-green-500 border-green-500 hover:bg-green-50 rounded-full"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-500 hover:bg-red-50 rounded-full"
                              onClick={() => handleReject(task)}
                            >
                              Reject
                            </Button>
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

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Task</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this task.</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="py-4">
              <p>
                <strong>Task:</strong> {selectedTask.title}
              </p>
              <Input
                type="text"
                placeholder="Enter rejection reason..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                // Handle rejection logic here
                setIsRejectDialogOpen(false)
              }}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
