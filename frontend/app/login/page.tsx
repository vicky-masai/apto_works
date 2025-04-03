"use client"

import type React from "react"
import toast, { Toaster } from 'react-hot-toast'; 
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Footer } from "@/components/Footer"
import { login } from "@/API/api" // Import the login function from the API
import cookie from 'js-cookie' // Import the cookie module

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [userType, setUserType] = useState<"Worker" | "TaskProvider">("Worker")
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("")
      }, 3000) // Hide error after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail")
    const savedPassword = localStorage.getItem("savedPassword")
    const savedUserType = localStorage.getItem("savedUserType")
    if (savedEmail && savedPassword && savedUserType) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setUserType(savedUserType as "Worker" | "TaskProvider")
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value

    try {
      const response = await login(email, password, userType)
      // Store login state in localStorage
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userType", userType)
      toast.success("Login success")
      // Set token in cookie with 24h expiry
      cookie.set('token', response.token, { expires: 1 })

      if (rememberMe) {
        localStorage.setItem("savedEmail", email)
        localStorage.setItem("savedPassword", password)
        localStorage.setItem("savedUserType", userType)
      } else {
        localStorage.removeItem("savedEmail")
        localStorage.removeItem("savedPassword")
        localStorage.removeItem("savedUserType")
      }

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      setError("Login failed. Please check your credentials and try again.")
      toast.error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
    <Toaster
  position="top-center"
  reverseOrder={false}
/>
      <div className="container m-auto flex flex-1 flex-col items-center justify-center">
        <Link
          href="/"
          className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] sm:mt-10">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
          </div>

          <Card>
            <div className="flex w-full rounded-t-lg overflow-hidden">
              <button
                className={`flex-1 px-4 py-3 text-center ${
                  userType === "Worker" ? "bg-primary text-white" : "bg-gray-100"
                }`}
                onClick={() => setUserType("Worker")}
              >
                Worker
              </button>
              <button
                className={`flex-1 px-4 py-3 text-center ${
                  userType === "TaskProvider" ? "bg-primary text-white" : "bg-gray-100"
                }`}
                onClick={() => setUserType("TaskProvider")}
              >
                Task Provider
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Sign in as {userType}</CardTitle>
                <CardDescription>
                  {userType === "Worker" 
                    ? "Sign in to complete tasks and earn money" 
                    : "Sign in to post tasks and find workers"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(!!checked)} />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
