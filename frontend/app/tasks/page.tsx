import Link from "next/link"
import { ArrowUpDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCard } from "@/components/task-card"

export default function TasksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Link href="/">TaskHub</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/tasks" className="text-sm font-medium text-gray-900">
              Tasks
            </Link>
            <Link href="/earnings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Earnings
            </Link>
            <Link href="/wallet" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Wallet
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
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Narrow down tasks by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium text-sm">Categories</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="registration" className="rounded text-primary" />
                      <label htmlFor="registration" className="text-sm">
                        Registration
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="social" className="rounded text-primary" />
                      <label htmlFor="social" className="text-sm">
                        Social Media
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="testing" className="rounded text-primary" />
                      <label htmlFor="testing" className="text-sm">
                        Testing
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="content" className="rounded text-primary" />
                      <label htmlFor="content" className="text-sm">
                        Content Creation
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="other" className="rounded text-primary" />
                      <label htmlFor="other" className="text-sm">
                        Other
                      </label>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="font-medium text-sm">Price Range</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Min" min={0} />
                    <Input type="number" placeholder="Max" min={0} />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="font-medium text-sm">Difficulty</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="easy" className="rounded text-primary" />
                      <label htmlFor="easy" className="text-sm">
                        Easy
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="medium" className="rounded text-primary" />
                      <label htmlFor="medium" className="text-sm">
                        Medium
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="hard" className="rounded text-primary" />
                      <label htmlFor="hard" className="text-sm">
                        Hard
                      </label>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Apply Filters</Button>
              </CardContent>
            </Card>
          </div>
          <div className="md:w-3/4">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Available Tasks</h1>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input type="search" placeholder="Search tasks..." className="w-[200px] md:w-[300px] pl-8" />
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                  </Button>
                </div>
              </div>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="highpaying">High Paying</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4 mt-4">
                  <TaskCard
                    id="1"
                    title="Website Registration Task"
                    description="Complete registration on platform and verify email"
                    price={5.0}
                    category="Registration"
                    difficulty="Easy"
                    estimatedTime="5 min"
                  />
                  <TaskCard
                    id="2"
                    title="Social Media Post Engagement"
                    description="Like, comment and share a post on specified social media platform"
                    price={2.5}
                    category="Social Media"
                    difficulty="Easy"
                    estimatedTime="3 min"
                  />
                  <TaskCard
                    id="3"
                    title="Mobile App Testing"
                    description="Test new mobile application and provide detailed feedback"
                    price={15.0}
                    category="Testing"
                    difficulty="Medium"
                    estimatedTime="30 min"
                  />
                  <TaskCard
                    id="4"
                    title="Write Product Review"
                    description="Write a 300-word review for an e-commerce product"
                    price={8.0}
                    category="Content Creation"
                    difficulty="Medium"
                    estimatedTime="20 min"
                  />
                  <TaskCard
                    id="5"
                    title="Telegram Bot Testing"
                    description="Test functionality of a new Telegram bot and report issues"
                    price={10.0}
                    category="Testing"
                    difficulty="Easy"
                    estimatedTime="15 min"
                  />
                </TabsContent>
                <TabsContent value="new" className="space-y-4 mt-4">
                  <TaskCard
                    id="3"
                    title="Mobile App Testing"
                    description="Test new mobile application and provide detailed feedback"
                    price={15.0}
                    category="Testing"
                    difficulty="Medium"
                    estimatedTime="30 min"
                  />
                  <TaskCard
                    id="5"
                    title="Telegram Bot Testing"
                    description="Test functionality of a new Telegram bot and report issues"
                    price={10.0}
                    category="Testing"
                    difficulty="Easy"
                    estimatedTime="15 min"
                  />
                </TabsContent>
                <TabsContent value="popular" className="space-y-4 mt-4">
                  <TaskCard
                    id="1"
                    title="Website Registration Task"
                    description="Complete registration on platform and verify email"
                    price={5.0}
                    category="Registration"
                    difficulty="Easy"
                    estimatedTime="5 min"
                  />
                  <TaskCard
                    id="2"
                    title="Social Media Post Engagement"
                    description="Like, comment and share a post on specified social media platform"
                    price={2.5}
                    category="Social Media"
                    difficulty="Easy"
                    estimatedTime="3 min"
                  />
                </TabsContent>
                <TabsContent value="highpaying" className="space-y-4 mt-4">
                  <TaskCard
                    id="3"
                    title="Mobile App Testing"
                    description="Test new mobile application and provide detailed feedback"
                    price={15.0}
                    category="Testing"
                    difficulty="Medium"
                    estimatedTime="30 min"
                  />
                  <TaskCard
                    id="4"
                    title="Write Product Review"
                    description="Write a 300-word review for an e-commerce product"
                    price={8.0}
                    category="Content Creation"
                    difficulty="Medium"
                    estimatedTime="20 min"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

