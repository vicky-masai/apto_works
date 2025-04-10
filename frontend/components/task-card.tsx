"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Clock, DollarSign, IndianRupee, Tag, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { acceptTask } from "@/API/api"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

interface TaskCardProps {
  id: string
  title: string
  description: string
  price: number
  category: string
  difficulty: string
  estimatedTime: string
  createdAt: string
  stepByStepInstructions: string
  taskStatus: string
  requiredProof: string | null
  numWorkersNeeded: number
  totalAmount: number
  taskProviderId: string
  updatedAt: string
}

export function TaskCard({ id, title, description, price, category, difficulty, estimatedTime, createdAt, stepByStepInstructions, taskStatus, requiredProof, numWorkersNeeded, totalAmount, taskProviderId, updatedAt }: TaskCardProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter();
  const token = Cookies.get("token");
  
  // Convert createdAt to a more readable format
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })
  
  const acceptTaskData = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    
    try {
      console.log("suraj",id);
      const data = await acceptTask(id, token);
      console.log("suraj",data.id);
      router.push(`/tasks/${data.id}/accept`);
    } catch (error) {
      console.error("Error accepting task:", error);
    }
  };
  return (
    <Card className="bg-white border shadow-sm my-3">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            <CardDescription className="mt-1 text-sm sm:text-base">{description}</CardDescription>
          </div>
          <div className="flex items-center text-lg font-semibold text-green-600">
            <IndianRupee className="h-5 w-5 mr-1" />
            {price.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1 border-gray-200 text-xs sm:text-sm">
            <Tag className="h-3 w-3" />
            {category}
          </Badge>
          <Badge
            variant="outline"
            className={
              difficulty === "Easy"
                ? "bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm"
                : difficulty === "Medium"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs sm:text-sm"
                  : "bg-red-50 text-red-700 border-red-200 text-xs sm:text-sm"
            }
          >
            {difficulty}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 border-gray-200 text-xs sm:text-sm">
            <Clock className="h-3 w-3" />
            {estimatedTime}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 border-gray-200 text-xs sm:text-sm">
            <Users className="h-3 w-3" />
            {numWorkersNeeded} workers needed
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 border-gray-200 text-xs sm:text-sm">
            <Calendar className="h-3 w-3" />
            {timeAgo}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">View Details</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">{description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Price</h4>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Estimated Time</h4>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {estimatedTime}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium">Requirements</h4>
                <ul className="text-sm text-gray-500 list-disc list-inside mt-1">
                  <li>{stepByStepInstructions}</li>
                </ul>
              </div>

              { requiredProof &&
              <div>
                <h4 className="text-sm font-medium">Proof Required</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {requiredProof || ""}
                </p>
              </div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={acceptTaskData}>Accept Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={acceptTaskData}>Accept Task</Button>
      </CardFooter>
    </Card>
  )
}
