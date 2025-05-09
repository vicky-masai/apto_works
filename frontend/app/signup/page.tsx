"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield } from "lucide-react"
import toast, { Toaster } from 'react-hot-toast';
import { register } from "@/API/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Footer } from "@/components/Footer"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    // Get all required fields
    const name = formData.get("name")?.toString() || formData.get("company-name")?.toString()
    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()
    const confirmPassword = formData.get("confirm-password")?.toString()
    const userType = formData.get("user-type")?.toString()
    const skills = formData.get("skills")?.toString().split(",").map(skill => skill.trim())

    // Validate required fields
    if (!name || !email || !password || !confirmPassword || !userType || !skills) {
      setError("All fields are required")
      toast.error("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      let userData;
      
      const organizationType = formData.get("organization-type")?.toString() || "Business"
      userData = {
        name: name,
        email: email,
        password: password,
        userType: userType,
        organizationType: organizationType === "business" ? "Business" : 
                        organizationType === "nonprofit" ? "Non-profit" : "Individual",
        skills: skills
      }

      // Show loading toast
      // const loadingToast = toast.loading("Creating your account...")

      const response = await register(userData)
      
      // Update loading toast to success
      toast.success("Registration successful! Please verify your email.")
      
      // Redirect to OTP verification page
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`)

    } catch (error: any) {
      console.error("Registration error:", error)
      console.log("Error response:", error.response)
      console.log("Error message:", error.message)
      console.log("Error config:", error.config)
      
      let errorMessage = "Registration failed. Please try again."
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage
        console.log("Error response data:", error.response.data)
        console.log("Error response status:", error.response.status)
      } else if (error.request) {
        // The request was made but no response was received
        console.log("Error request:", error.request)
        errorMessage = "No response from server. Please check your connection."
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error message:", error.message)
        errorMessage = error.message || errorMessage
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <div className="container m-auto flex flex-1 flex-col items-center justify-center py-5">
        <Link
          href="/"
          className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <div className="mx-auto mt-10 flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Sign up</CardTitle>
              <CardDescription>Complete tasks and earn money or post tasks and find workers</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="Code Apto" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="codeapto@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" name="confirm-password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label>User Type</Label>
                  <RadioGroup name="user-type" defaultValue="TaskProvider">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="TaskProvider" id="task-provider" />
                      <Label htmlFor="task-provider">Task Provider</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Worker" id="task-worker" />
                      <Label htmlFor="task-worker">Worker</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Organization Type</Label>
                  <RadioGroup name="organization-type" defaultValue="business">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="business" id="business" />
                      <Label htmlFor="business">Business</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nonprofit" id="nonprofit" />
                      <Label htmlFor="nonprofit">Non-profit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual">Individual</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input id="skills" name="skills" placeholder="e.g. JavaScript, React, Node.js" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

