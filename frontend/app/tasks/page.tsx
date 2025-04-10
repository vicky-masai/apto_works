"use client"

import Link from "next/link"
import { SetStateAction, useEffect, useState, useRef, useCallback } from "react"
import { Search, Filter, UserCheck, Wallet, Upload, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCard } from "@/components/task-card"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { getAllTasks } from "@/API/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Task {
  id: string
  taskTitle: string
  taskDescription: string
  price: number
  category: string
  difficulty: string
  estimatedTime: string
  createdAt: string
  stepByStepInstructions: string
  taskStatus: string
  requiredProof: string | null
  numWorkersNeeded: number
  totalAmount: number
  taskProviderId: string
  updatedAt: string
  isNew?: boolean
  isPopular?: boolean
  isHighPaying?: boolean
  acceptedCount?: number
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const tasksPerPage = 5
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreTasks, setHasMoreTasks] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  const observer = useRef<IntersectionObserver | null>(null)
  const lastTaskElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreTasks) {
        handleLoadMore()
      }
    })
    if (node) observer.current.observe(node)
  }, [isLoading, hasMoreTasks])

  const handleApplyFilters = async () => {
    try {
      const filterParams = {
        page: 1,
        ...(searchTerm && { search: searchTerm }),
        ...(activeTab !== "all" && { filter: activeTab === "new" ? "New" : activeTab === "popular" ? "Popular" : "HighPaying" }),
        status: "Published"
      };

      setIsLoading(true);
      const data = await getAllTasks(filterParams);
      
      setTasks(data.tasks);
      setCurrentPage(1);
      setHasMoreTasks(data.tasks.length >= tasksPerPage);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: { target: { value: SetStateAction<string> } }) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    try {
      const filterParams = {
        page: 1,
        ...(searchValue && { search: searchValue }),
        ...(activeTab !== "all" && { filter: activeTab === "new" ? "New" : activeTab === "popular" ? "Popular" : "HighPaying" }),
        status: "Published"
      };

      setIsLoading(true);
      const data = await getAllTasks(filterParams);
      
      setTasks(data.tasks);
      setCurrentPage(1);
      setHasMoreTasks(data.tasks.length >= tasksPerPage);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
    }
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    try {
      let filterParam = '';
      
      switch (value) {
        case 'new':
          filterParam = 'New';
          break;
        case 'popular':
          filterParam = 'Popular';
          break;
        case 'highpaying':
          filterParam = 'HighPaying';
          break;
        default:
          filterParam = '';
          break;
      }

      const filterParams = {
        page: 1,
        ...(searchTerm && { search: searchTerm }),
        ...(filterParam && { filter: filterParam }),
        status: "Published"
      };

      setIsLoading(true);
      const data = await getAllTasks(filterParams);
      
      setTasks(data.tasks);
      setCurrentPage(1);
      setHasMoreTasks(data.tasks.length >= tasksPerPage);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (currentPage === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        
        const filterParams = {
          page: currentPage,
          ...(searchTerm && { search: searchTerm }),
          ...(activeTab !== "all" && { filter: activeTab === "new" ? "New" : activeTab === "popular" ? "Popular" : "HighPaying" }),
          status: "Published"
        };

        const data = await getAllTasks(filterParams);
        
        if (currentPage === 1) {
          setTasks(data.tasks);
        } else {
          setTasks(prevTasks => [...prevTasks, ...data.tasks]);
        }
        
        setHasMoreTasks(data.tasks.length >= tasksPerPage);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchTasks();
  }, [currentPage]);

  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1)
  }
  
  const handleNavigation = (path: string) => {
    const token = Cookies.get("token")
    if (!token) {
      router.push("/login")
    } else {
      router.push(path)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header isLoggedIn={true} />
      <main className="flex-1 container py-6 m-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
                <CardDescription>Quick links to navigate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full flex items-center gap-2 text-white" 
                  onClick={() => handleNavigation("/wallet")}
                >
                  <Wallet className="h-4 w-4" />
                  Wallet: $100
                </Button>
                <Button 
                  className="w-full mt-2 flex items-center gap-2 text-white"
                  onClick={() => handleNavigation("/post-task")}
                >
                  <Upload className="h-4 w-4" />
                  Post Task
                </Button>
                <Button 
                  className="w-full mt-2 flex items-center gap-2 text-white"
                  onClick={() => handleNavigation("/tasks")}
                >
                  <DollarSign className="h-4 w-4" />
                  Earn Money
                </Button>
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="ml-2">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Filters</DialogTitle>
                      </DialogHeader>
                      <CardContent className="space-y-4">
                        <Button className="w-full" onClick={handleApplyFilters}>Apply Filters</Button>
                      </CardContent>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Tabs defaultValue="all" onValueChange={handleTabChange}>
                <TabsList>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="highpaying">High Paying</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4 mt-4">
                  <div className="max-h-[600px] overflow-y-auto pr-4">
                    {isLoading && currentPage === 1 ? (
                      // Loading skeleton for initial load
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="bg-white border rounded-lg p-6 mb-4 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          <div className="flex gap-2 mt-4">
                            <div className="h-6 w-16 bg-gray-200 rounded"></div>
                            <div className="h-6 w-16 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        {tasks.map((task, index) => (
                          <div
                            key={task.id}
                            ref={index === tasks.length - 1 ? lastTaskElementRef : null}
                          >
                            <TaskCard
                              id={task.id}
                              title={task.taskTitle}
                              description={task.taskDescription}
                              price={task.price}
                              category={task.category}
                              difficulty={task.difficulty}
                              estimatedTime={task.estimatedTime}
                              createdAt={task.createdAt}
                              stepByStepInstructions={task.stepByStepInstructions}
                              taskStatus={task.taskStatus}
                              requiredProof={task.requiredProof}
                              numWorkersNeeded={task.numWorkersNeeded}
                              totalAmount={task.totalAmount}
                              taskProviderId={task.taskProviderId}
                              updatedAt={task.updatedAt}
                            />
                          </div>
                        ))}
                        {tasks.length === 0 && !isLoading && (
                          <div className="text-center py-8 text-gray-500">
                            No tasks found. Try adjusting your filters.
                          </div>
                        )}
                      </>
                    )}
                    {isLoadingMore && (
                      <div className="flex justify-center items-center py-4 gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        <span className="text-sm text-gray-600">Loading more tasks...</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
                {["new", "popular", "highpaying"].map((tabValue) => (
                  <TabsContent key={tabValue} value={tabValue} className="space-y-4 mt-4">
                    <div className="max-h-[600px] overflow-y-auto pr-4">
                      {isLoading && currentPage === 1 ? (
                        // Loading skeleton for initial load
                        Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="bg-white border rounded-lg p-6 mb-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            <div className="flex gap-2 mt-4">
                              <div className="h-6 w-16 bg-gray-200 rounded"></div>
                              <div className="h-6 w-16 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          {tasks.map((task, index) => (
                            <div
                              key={task.id}
                              ref={index === tasks.length - 1 ? lastTaskElementRef : null}
                            >
                              <TaskCard
                                id={task.id}
                                title={task.taskTitle}
                                description={task.taskDescription}
                                price={task.price}
                                category={task.category}
                                difficulty={task.difficulty}
                                estimatedTime={task.estimatedTime}
                                createdAt={task.createdAt}
                                stepByStepInstructions={task.stepByStepInstructions}
                                taskStatus={task.taskStatus}
                                requiredProof={task.requiredProof}
                                numWorkersNeeded={task.numWorkersNeeded}
                                totalAmount={task.totalAmount}
                                taskProviderId={task.taskProviderId}
                                updatedAt={task.updatedAt}
                              />
                            </div>
                          ))}
                          {tasks.length === 0 && !isLoading && (
                            <div className="text-center py-8 text-gray-500">
                              No tasks found. Try adjusting your filters.
                            </div>
                          )}
                        </>
                      )}
                      {isLoadingMore && (
                        <div className="flex justify-center items-center py-4 gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          <span className="text-sm text-gray-600">Loading more tasks...</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

