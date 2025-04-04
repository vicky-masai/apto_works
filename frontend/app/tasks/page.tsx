"use client"

import Link from "next/link"
import { SetStateAction, useEffect, useState } from "react"
import { ArrowUpDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCard } from "@/components/task-card"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { getAllTasks } from "@/API/api"

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const tasksPerPage = 5

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getAllTasks()
        setTasks(data)
        setFilteredTasks(data)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      }
    }

    fetchTasks()
  }, [])

  useEffect(() => {
    let filtered = tasks.filter((task: { taskTitle: string }) =>
      task.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (sortOrder === "asc") {
      filtered.sort((a: { taskTitle: string }, b: { taskTitle: string }) => a.taskTitle.localeCompare(b.taskTitle))
    } else {
      filtered.sort((a: { taskTitle: string }, b: { taskTitle: string }) => b.taskTitle.localeCompare(a.taskTitle))
    }

    setFilteredTasks(filtered)
  }, [searchTerm, sortOrder, tasks])

  const handleSearch = (e: { target: { value: SetStateAction<string> } }) => {
    setSearchTerm(e.target.value)
  }

  const handleSort = () => {
    setSortOrder(prevOrder => (prevOrder === "asc" ? "desc" : "asc"))
  }

  const indexOfLastTask = currentPage * tasksPerPage
  const indexOfFirstTask = indexOfLastTask - tasksPerPage
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask)

  const paginate = (pageNumber: SetStateAction<number>) => setCurrentPage(pageNumber)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header isLoggedIn={true} />
      <main className="flex-1 container py-6 m-auto">
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
                    <Input type="search" placeholder="Search tasks..." className="w-[200px] md:w-[300px] pl-8" value={searchTerm} onChange={handleSearch} />
                  </div>
                  <Button variant="outline" size="sm" className="gap-1" onClick={handleSort}>
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
                  {currentTasks.map((task: { id: string; taskTitle: string; taskDescription: string; price: number; category: string; difficulty: string; estimatedTime: string; createdAt: string; }) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      title={task.taskTitle}
                      description={task.taskDescription}
                      price={task.price}
                      category={task.category}
                      difficulty={task.difficulty}
                      estimatedTime={task.estimatedTime}
                      createdAt={task.createdAt}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="new" className="space-y-4 mt-4">
                  {currentTasks.filter((task: { id: string; taskTitle: string; taskDescription: string; price: number; category: string; difficulty: string; estimatedTime: string; isNew: boolean; createdAt: string; }) => task.isNew).map((task: { id: string; taskTitle: string; taskDescription: string; price: number; category: string; difficulty: string; estimatedTime: string; isNew: boolean; createdAt: string; }) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      title={task.taskTitle}
                      description={task.taskDescription}
                      price={task.price}
                      category={task.category}
                      difficulty={task.difficulty}
                      estimatedTime={task.estimatedTime}
                      createdAt={task.createdAt}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="popular" className="space-y-4 mt-4">
                  {currentTasks.filter((task: { id: string; taskTitle: string; taskDescription: string; price: number; category: string; difficulty: string; estimatedTime: string; isPopular: boolean; createdAt: string; }) => task.isPopular).map((task: { id: string; taskTitle: string; taskDescription: string; price: number; category: string; difficulty: string; estimatedTime: string; isPopular: boolean; createdAt: string; }) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      title={task.taskTitle}
                      description={task.taskDescription}
                      price={task.price}
                      category={task.category}
                      difficulty={task.difficulty}
                      estimatedTime={task.estimatedTime}
                      createdAt={task.createdAt}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="highpaying" className="space-y-4 mt-4">
                  {currentTasks.filter((task: { id: string; taskTitle: string; taskDescription: string; price: number; category: string; difficulty: string; estimatedTime: string; isHighPaying: boolean; createdAt: string; }) => task.isHighPaying).map((task: { id: string; taskTitle: string; taskDescription: string; price: number; category: string; difficulty: string; estimatedTime: string; isHighPaying: boolean; createdAt: string; }) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      title={task.taskTitle}
                      description={task.taskDescription}
                      price={task.price}
                      category={task.category}
                      difficulty={task.difficulty}
                      estimatedTime={task.estimatedTime}
                      createdAt={task.createdAt}
                    />
                  ))}
                </TabsContent>
              </Tabs>
              {/* <div className="flex justify-center mt-4">
                <Button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastTask >= filteredTasks.length}>
                  Next
                </Button>
              </div> */}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

