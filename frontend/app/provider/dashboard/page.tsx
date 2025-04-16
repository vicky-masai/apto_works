import Link from "next/link"
import { ArrowUpDown, Clock, DollarSign, Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function ProviderDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Link href="/">TaskHub</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/provider/dashboard" className="text-sm font-medium text-foreground transition-colors">
              Dashboard
            </Link>
            <Link
              href="/provider/tasks"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              My Tasks
            </Link>
            <Link
              href="/post-task"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Post Task
            </Link>
            <Link
              href="/provider/payments"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Payments
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Provider Dashboard</h1>
            <div className="flex gap-2">
              <Link href="/post-task">
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  Post New Task
                </Button>
              </Link>
              <Link href="/provider/tasks">
                <Button variant="outline">View All Tasks</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Tasks currently available</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">10</div>
                <p className="text-xs text-muted-foreground">Submissions awaiting review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">Workers completed your tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$325.50</div>
                <p className="text-xs text-muted-foreground">Payments to workers</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tasks Overview</CardTitle>
                <CardDescription>Status of your posted tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Website Registration Task</span>
                      <span>12/20 completed</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>3 pending review</span>
                      <span>5 in progress</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Social Media Post Engagement</span>
                      <span>30/50 completed</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 pending review</span>
                      <span>15 in progress</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Mobile App Testing</span>
                      <span>3/10 completed</span>
                    </div>
                    <Progress value={30} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>2 pending review</span>
                      <span>4 in progress</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest task submissions requiring review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="font-medium">Mobile App Testing</div>
                      <div className="text-sm text-muted-foreground">Submitted by Emily Davis</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Pending</Badge>
                      <Link href="/provider/tasks">
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="font-medium">Social Media Post Engagement</div>
                      <div className="text-sm text-muted-foreground">Submitted by Sarah Williams</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Pending</Badge>
                      <Link href="/provider/tasks">
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="font-medium">Website Registration Task</div>
                      <div className="text-sm text-muted-foreground">Submitted by John Doe</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Pending</Badge>
                      <Link href="/provider/tasks">
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Link href="/provider/tasks">
                      <Button variant="outline">View All Submissions</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
