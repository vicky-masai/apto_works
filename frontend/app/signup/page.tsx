"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Footer } from "@/components/Footer"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState("worker")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call for registration
    setTimeout(() => {
      setIsLoading(false)
      // Store user info in localStorage for demo purposes
      // In a real app, this would be handled by a proper auth system
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userType", userType)
      localStorage.setItem("userEmail", (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value)

      // Redirect to dashboard
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
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

          <Tabs defaultValue="worker" className="w-full" onValueChange={setUserType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="worker">Worker</TabsTrigger>
              <TabsTrigger value="provider">Task Provider</TabsTrigger>
            </TabsList>
            <TabsContent value="worker">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Sign up as a Worker</CardTitle>
                  <CardDescription>Complete tasks and earn money</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" required />
                    </div>
                    <div className="space-y-1">
                      <Label>Skills (Optional)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="social-media" className="rounded text-primary" />
                          <label htmlFor="social-media" className="text-sm">
                            Social Media
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="content-writing" className="rounded text-primary" />
                          <label htmlFor="content-writing" className="text-sm">
                            Content Writing
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="testing" className="rounded text-primary" />
                          <label htmlFor="testing" className="text-sm">
                            Testing
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="data-entry" className="rounded text-primary" />
                          <label htmlFor="data-entry" className="text-sm">
                            Data Entry
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="provider">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl">Sign up as a Task Provider</CardTitle>
                  <CardDescription>Post tasks and find workers</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company/Organization Name</Label>
                      <Input id="company-name" placeholder="Acme Inc." required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="contact@acme.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Organization Type</Label>
                      <RadioGroup defaultValue="business">
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
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>

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

