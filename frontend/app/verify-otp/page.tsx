"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import toast, { Toaster } from 'react-hot-toast';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyOTP, resendVerifyWorkerOtp, resendTaskProviderOtp } from "@/API/api"

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const email = searchParams.get("email")
  const userType = searchParams.get("userType")

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else {
      setResendDisabled(false)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!email || !userType) {
        throw new Error("Missing email or user type")
      }

      await verifyOTP(email, otp, userType)
      toast.success("Email verified successfully!")
      
      // Redirect to login page after successful verification
      setTimeout(() => {
        router.push("/login")
      }, 1000)
    } catch (error: any) {
      console.error("Verification error:", error)
      const errorMessage = error.response?.data?.error || "Verification failed. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      setResendDisabled(true)
      setCountdown(30) // Disable resend for 30 seconds

      if (!email || !userType) {
        throw new Error("Missing email or user type")
      }

      const resendFunction = userType === "Worker" ? resendVerifyWorkerOtp : resendTaskProviderOtp
      await resendFunction(email)
      
      toast.success("OTP resent successfully!")
    } catch (error: any) {
      console.error("Resend error:", error)
      const errorMessage = error.response?.data?.error || "Failed to resend OTP"
      toast.error(errorMessage)
    }
  }

  if (!email || !userType) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-red-600">Invalid verification link</p>
        <Link href="/signup" className="text-primary hover:underline mt-4">
          Go back to signup
        </Link>
      </div>
    )
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
          href="/signup"
          className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Signup
        </Link>

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Verify your email</CardTitle>
              <CardDescription className="text-center">
                Enter the verification code sent to<br />
                <span className="font-medium text-primary">{email}</span>
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={resendDisabled}
                  className="w-full"
                >
                  {resendDisabled 
                    ? `Resend OTP in ${countdown}s` 
                    : "Resend OTP"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
} 