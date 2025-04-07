"use client"

import type React from "react"
import toast, { Toaster } from 'react-hot-toast'
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/Footer"
import { forgotPassword } from "@/API/api"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const data = await forgotPassword(email)

      toast.success(data.message || "Reset instructions sent to your email")
      router.push("/reset-password")
    } catch (error: any) {
      console.error('Forgot password error:', error)
      setError(error.message || "Failed to send reset instructions. Please try again.")
      toast.error("Reset failed")
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
          href="/login"
          className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Login
        </Link>

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] sm:mt-10">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Reset Password</CardTitle>
                <CardDescription>
                  We'll send you a code to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center text-sm">
            Remember your password?{" "}
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