"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import toast, { Toaster } from 'react-hot-toast'; 
import { createTask } from "@/API/api"
import cookie from 'js-cookie' // Import the cookie module
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Footer } from "@/components/Footer"

export default function PostTaskPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const taskData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      price: parseFloat(formData.get("price") as string),
      estimatedTime: parseInt(formData.get("estimated-time") as string),
      stepByStepInstructions: formData.get("instructions"),
      requiredProof: formData.get("proof"),
      numWorkersNeeded: parseInt(formData.get("quantity") as string),
      difficulty: formData.get("difficulty"),
    }

    try {
      const authToken = cookie.get('token') // Retrieve the auth token from the cookie
      await createTask(taskData, authToken)
      setIsSuccess(true)
      toast.success("Task created successfully!")
    } catch (error) {
      toast.error("Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
         <Toaster
  position="top-center"
  reverseOrder={false}
/>
      <div className="container py-6 max-w-2xl m-auto flex-1">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post a New Task</CardTitle>
            <CardDescription>Create a task for workers to complete</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input id="title" name="title" placeholder="e.g., Website Registration Task" required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Task Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe what the worker needs to do"
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="registration">Registration</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="content">Content Creation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select name="difficulty" required>
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input id="price" name="price" type="number" min="0.50" step="0.50" placeholder="5.00" required />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="estimated-time">Estimated Time</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input id="estimated-time" name="estimated-time" type="number" min="1" placeholder="5" required />
                        <Select name="time-unit" defaultValue="minutes">
                          <SelectTrigger id="time-unit">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="instructions">Step-by-Step Instructions</Label>
                    <Textarea
                      id="instructions"
                      name="instructions"
                      placeholder="1. Go to example.com/register&#10;2. Create a new account&#10;3. Verify your email"
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="proof">Required Proof</Label>
                    <Textarea
                      id="proof"
                      name="proof"
                      placeholder="Describe what proof the worker needs to submit (e.g., screenshots, links)"
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Number of Workers Needed</Label>
                    <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Task..." : "Create Task"}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="rounded-full bg-green-100 p-3 text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-center">Task Created Successfully!</h3>
                <p className="text-center text-muted-foreground">
                  Your task has been posted and is now available for workers to complete.
                </p>
                <div className="flex gap-4 mt-4">
                  <Link href="/dashboard">
                    <Button variant="outline">Go to Dashboard</Button>
                  </Link>
                  <Button onClick={() => setIsSuccess(false)}>Create Another Task</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

