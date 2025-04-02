"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, DollarSign, Tag } from "lucide-react"

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

interface TaskCardProps {
  id: string
  title: string
  description: string
  price: number
  category: string
  difficulty: string
  estimatedTime: string
}

export function TaskCard({ id, title, description, price, category, difficulty, estimatedTime }: TaskCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="flex items-center text-lg font-semibold text-green-600">
            <DollarSign className="h-5 w-5 mr-1" />
            {price.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1 border-gray-200">
            <Tag className="h-3 w-3" />
            {category}
          </Badge>
          <Badge
            variant="outline"
            className={
              difficulty === "Easy"
                ? "bg-green-50 text-green-700 border-green-200"
                : difficulty === "Medium"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-red-50 text-red-700 border-red-200"
            }
          >
            {difficulty}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 border-gray-200">
            <Clock className="h-3 w-3" />
            {estimatedTime}
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
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Price</h4>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <DollarSign className="h-4 w-4 mr-1" />
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
                  <li>Create an account on the specified platform</li>
                  <li>Verify your email address</li>
                  <li>Complete your profile with required information</li>
                  <li>Take a screenshot as proof of completion</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium">Proof Required</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Screenshot of completed profile page showing username and verification status
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Link href={`/tasks/${id}/accept`}>
                <Button>Accept Task</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Link href={`/tasks/${id}/accept`}>
          <Button>Accept Task</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

