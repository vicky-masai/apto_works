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
import { getAcceptedTasks } from "@/API/task"
import Leftsidebar from "@/components/Leftsidebar"

export default function DashboardPage() {
  const [totalEarned, settotalEarned] = useState(0)
  const [inProgress, setInProgress] = useState(0)
  const [completedTasks, setCompletedTasks] = useState(0)
  const [balance, setBalance] = useState(0)
  const [activeTask, setActiveTask]=useState([]);
  const [pendingTask, setPendingTask]=useState([]);
  const [completedTask, setCompletedTask]=useState([]);

  useEffect(() => {
    getProfile().then(profile => {
      settotalEarned(profile.totalEarnings)
      setInProgress(profile.inProgress)
      setCompletedTasks(profile.completedTasks)
      setBalance(profile.balance)
      console.log("profile", profile);
      
    }).catch(error => {
      console.error("Error fetching profile:", error);
    });

    getAcceptedTasks().then(data => {
      // Filter tasks based on their status
      const active = data.filter((task: { status: string }) => task.status === 'Active');
      const completed = data.filter((task: { status: string }) => task.status === 'Completed');
      const pending = data.filter((task: { status: string }) => task.status === 'Review');
      
      setActiveTask(active);
      setCompletedTask(completed);
      setPendingTask(pending);
    }).catch(error => {
      console.error("Error fetching accepted tasks:", error);
    });
  }, []);
 
  return (
    <div className="flex min-h-screen flex-col">
      <Header isLoggedIn={true} />
      <div className="flex">
        <Leftsidebar />
        <main className={`flex-1 p-6 transition-all duration-300 ml-[256px] dark:bg-gray-900`}>
          <div className="container mx-auto max-w-7xl">
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
                  </CardContent>
                </Card>
                <Card className="bg-white border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedTasks}</div>
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

              <Card>
                <CardHeader>
                  <CardTitle>Tasks Overview</CardTitle>
                  <CardDescription>Manage and track your tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="active">
                    <TabsList>
                      <TabsTrigger value="active">Active Tasks</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                      <TabsTrigger value="pending">Pending Review</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="space-y-4 mt-4">
                      {activeTask.map((task:any) => (
                        <Card key={task.id} className="bg-white border shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle>{task.task.taskTitle}</CardTitle>
                            <CardDescription>{task.task.taskDescription}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.task.estimatedTime} min
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {task.task.price.toFixed(2)}
                                </Badge>
                              </div>
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                                {task.status}
                              </Badge>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Link href={`/tasks/${task.id}/accept`}>
                              <Button variant="outline">Continue Task</Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4 mt-4">
                      {completedTask.map((task: any) => (
                        <Card key={task.id} className="bg-white border shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle>{task.task.taskTitle}</CardTitle>
                            <CardDescription>{task.task.taskDescription}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.task.estimatedTime} min
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {task.task.price.toFixed(2)}
                                </Badge>
                              </div>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                Completed
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-4 mt-4">
                      {pendingTask.map((task: any) => (
                        <Card key={task.id} className="bg-white border shadow-sm">
                          <CardHeader className="pb-2">
                            <CardTitle>{task.task.taskTitle}</CardTitle>
                            <CardDescription>{task.task.taskDescription}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.task.estimatedTime} min
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {task.task.price.toFixed(2)}
                                </Badge>
                              </div>
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                                Under Review
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

