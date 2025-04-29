"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import toast, { Toaster } from 'react-hot-toast'; 
import { createTask } from "@/API/api"
import cookie from 'js-cookie'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Footer } from "@/components/Footer"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import Leftsidebar from "@/components/Leftsidebar"

export default function PostTaskPage() {
  const router = useRouter();
  const token = Cookies.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]); 

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const estimatedTime = `${formData.get("estimated-time")} ${formData.get("time-unit")}`
    const taskData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      price: parseFloat(formData.get("price") as string),
      estimatedTime,
      stepByStepInstructions: formData.get("instructions"),
      requiredProof: formData.get("proof"),
      numWorkersNeeded: parseInt(formData.get("quantity") as string),
      difficulty: formData.get("difficulty"),
    }

    try {
      const authToken = cookie.get('token')
      await createTask(taskData, authToken)
      setIsSuccess(true)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create task. Please try again.", {
        duration: 4000
      })
      console.error("Error creating task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isLoggedIn={true} />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex">
        <Leftsidebar />
        <main className={`flex-1 p-6 transition-all duration-300 ml-[256px] dark:bg-gray-900`}>
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-center">
                <h1 className="text-2xl font-bold">Post a New Task</h1>
              </div>

              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
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
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="price">Price (₹)</Label>
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
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
