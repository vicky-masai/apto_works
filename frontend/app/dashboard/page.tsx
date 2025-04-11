"use client"

import Link from "next/link"
import { CheckCircle, Clock, DollarSign, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { useEffect, useState } from "react"
import { getProfile } from "@/API/profile"

export default function DashboardPage() {
  const [totalEarned, settotalEarned] = useState(0)
  const [inProgress, setInProgress] = useState(0)
  const [completedTasks, setCompletedTasks] = useState(0)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    getProfile().then(profile => {
      settotalEarned(profile.totalEarnings)
      setInProgress(profile.inProgress)
      setCompletedTasks(profile.completedTasks)
      setBalance(profile.balance)
    }).catch(error => {
      console.error("Error fetching profile:", error);
    });
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header isLoggedIn={true} />
      <main className="flex-1 container py-6 m-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex gap-2">
              <Link href="/tasks">
                <Button>Find Tasks</Button>
              </Link>
              <Link href="/wallet">
                <Button variant="outline">
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">
                  ₹{totalEarned}
                </div>
                {/* <p className="text-xs text-gray-500">+$12.50 from last week</p> */}
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks}</div>
                {/* <p className="text-xs text-gray-500">+3 from last week</p> */}
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgress}</div>
                <p className="text-xs text-gray-500">Tasks awaiting completion</p>
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                <Wallet className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">₹{balance}</div>
                <p className="text-xs text-gray-500">Available for withdrawal</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active Tasks</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-4 mt-4">
              <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Mobile App Testing</CardTitle>
                  <CardDescription>Test new mobile application and provide detailed feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        30 min
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        15.00
                      </Badge>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                      In Progress
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/tasks/3/accept">
                    <Button variant="outline">Continue Task</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Write Product Review</CardTitle>
                  <CardDescription>Write a 300-word review for an e-commerce product</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        20 min
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        8.00
                      </Badge>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                      In Progress
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/tasks/4/accept">
                    <Button variant="outline">Continue Task</Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Website Registration Task</CardTitle>
                  <CardDescription>Complete registration on platform and verify email</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />5 min
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        5.00
                      </Badge>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Completed</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" disabled>
                    View Details
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Social Media Post Engagement</CardTitle>
                  <CardDescription>Like, comment and share a post on specified social media platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />3 min
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        2.50
                      </Badge>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Completed</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" disabled>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-4">
              <Card className="bg-white border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Telegram Bot Testing</CardTitle>
                  <CardDescription>Test functionality of a new Telegram bot and report issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        15 min
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        10.00
                      </Badge>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Under Review</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">View Submission</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

