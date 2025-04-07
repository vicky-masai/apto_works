"use client"

import Link from "next/link"
import { SetStateAction, useEffect, useState, useRef, useCallback } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCard } from "@/components/task-card"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { getAllTasks } from "@/API/api"

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
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const tasksPerPage = 5
  const [category, setCategory] = useState("")
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [difficulty, setDifficulty] = useState("")
  const [sortBy, setSortBy] = useState("")

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("")
  const [status, setStatus] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 })
  const [hasMoreTasks, setHasMoreTasks] = useState(true)
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulties(prev => {
      if (prev.includes(difficulty)) {
        return prev.filter(d => d !== difficulty)
      } else {
        return [...prev, difficulty]
      }
    })
  }

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: parseInt(value) || 0
    }))
  }

  const handleApplyFilters = async () => {
    try {
      const filterParams = {
        ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
        ...(priceRange.min > 0 && { minPrice: priceRange.min }),
        ...(priceRange.max > 0 && { maxPrice: priceRange.max }),
        ...(selectedDifficulties.length > 0 && { difficulty: selectedDifficulties.join(',') }),
        ...(sortBy && { sortBy }),
        page: 1,
        ...(searchTerm && { search: searchTerm }),
        status: "Published"
      };

      const data = await getAllTasks(filterParams);
      
      setTasks(data.tasks);
      setFilteredTasks(data.tasks);
      setCurrentPage(1);
      setHasMoreTasks(data.tasks.length >= tasksPerPage);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleSearch = async (e: { target: { value: SetStateAction<string> } }) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    try {
      const filterParams = {
        ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
        ...(priceRange.min > 0 && { minPrice: priceRange.min }),
        ...(priceRange.max > 0 && { maxPrice: priceRange.max }),
        ...(selectedDifficulties.length > 0 && { difficulty: selectedDifficulties.join(',') }),
        ...(sortBy && { sortBy }),
        page: 1,
        ...(searchValue && { search: searchValue }),
        status: "Published"
      };

      const data = await getAllTasks(filterParams);
      
      setTasks(data.tasks);
      setFilteredTasks(data.tasks);
      setCurrentPage(1);
      setHasMoreTasks(data.tasks.length >= tasksPerPage);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleTabChange = async (value: string) => {
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
        ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
        ...(priceRange.min > 0 && { minPrice: priceRange.min }),
        ...(priceRange.max > 0 && { maxPrice: priceRange.max }),
        ...(selectedDifficulties.length > 0 && { difficulty: selectedDifficulties.join(',') }),
        ...(sortBy && { sortBy }),
        page: 1,
        ...(searchTerm && { search: searchTerm }),
        ...(filterParam && { filter: filterParam }),
        status: "Published"
      };

      const data = await getAllTasks(filterParams);
      
      setTasks(data.tasks);
      setFilteredTasks(data.tasks);
      setCurrentPage(1);
      setHasMoreTasks(data.tasks.length >= tasksPerPage);
    } catch (error) {
      console.error("Error fetching tasks:", error);
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
          ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
          ...(priceRange.min > 0 && { minPrice: priceRange.min }),
          ...(priceRange.max > 0 && { maxPrice: priceRange.max }),
          ...(selectedDifficulties.length > 0 && { difficulty: selectedDifficulties.join(',') }),
          ...(sortBy && { sortBy }),
          page: currentPage,
          ...(searchTerm && { search: searchTerm }),
          status: "Published"
        };

        const data = await getAllTasks(filterParams);
        
        if (currentPage === 1) {
          setTasks(data.tasks);
          setFilteredTasks(data.tasks);
        } else {
          setTasks(prevTasks => [...prevTasks, ...data.tasks]);
          setFilteredTasks(prevTasks => [...prevTasks, ...data.tasks]);
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header isLoggedIn={true} />
        <main className="flex-1 container py-6 m-auto">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

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
                      <input 
                        type="checkbox" 
                        id="registration" 
                        className="rounded text-primary" 
                        checked={selectedCategories.includes('registration')}
                        onChange={() => handleCategoryChange('registration')}
                      />
                      <label htmlFor="registration" className="text-sm">
                        Registration
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="social" 
                        className="rounded text-primary"
                        checked={selectedCategories.includes('social')}
                        onChange={() => handleCategoryChange('social')}
                      />
                      <label htmlFor="social" className="text-sm">
                        Social Media
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="testing" 
                        className="rounded text-primary"
                        checked={selectedCategories.includes('testing')}
                        onChange={() => handleCategoryChange('testing')}
                      />
                      <label htmlFor="testing" className="text-sm">
                        Testing
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="content" 
                        className="rounded text-primary"
                        checked={selectedCategories.includes('content')}
                        onChange={() => handleCategoryChange('content')}
                      />
                      <label htmlFor="content" className="text-sm">
                        Content Creation
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="other" 
                        className="rounded text-primary"
                        checked={selectedCategories.includes('other')}
                        onChange={() => handleCategoryChange('other')}
                      />
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
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      min={0} 
                      value={priceRange.min || ''}
                      onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                    />
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      min={0} 
                      value={priceRange.max || ''}
                      onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="font-medium text-sm">Difficulty</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="easy" 
                        className="rounded text-primary"
                        checked={selectedDifficulties.includes('Easy')}
                        onChange={() => handleDifficultyChange('Easy')}
                      />
                      <label htmlFor="easy" className="text-sm">
                        Easy
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="medium" 
                        className="rounded text-primary"
                        checked={selectedDifficulties.includes('Medium')}
                        onChange={() => handleDifficultyChange('Medium')}
                      />
                      <label htmlFor="medium" className="text-sm">
                        Medium
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="hard" 
                        className="rounded text-primary"
                        checked={selectedDifficulties.includes('Hard')}
                        onChange={() => handleDifficultyChange('Hard')}
                      />
                      <label htmlFor="hard" className="text-sm">
                        Hard
                      </label>
                    </div>
                  </div>
                </div>
                <Button className="w-full" onClick={handleApplyFilters}>Apply Filters</Button>
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
                    {filteredTasks?.map((task, index) => (
                      <div
                        key={task.id}
                        ref={index === filteredTasks.length - 1 ? lastTaskElementRef : null}
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
                  </div>
                  {isLoadingMore && (
                    <div className="flex justify-center mt-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="new" className="space-y-4 mt-4">
                  <div className="max-h-[600px] overflow-y-auto pr-4">
                    {filteredTasks?.map((task, index) => (
                      <div
                        key={task.id}
                        ref={index === filteredTasks.length - 1 ? lastTaskElementRef : null}
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
                  </div>
                  {isLoadingMore && (
                    <div className="flex justify-center mt-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="popular" className="space-y-4 mt-4">
                  <div className="max-h-[600px] overflow-y-auto pr-4">
                    {filteredTasks?.map((task, index) => (
                      <div
                        key={task.id}
                        ref={index === filteredTasks.length - 1 ? lastTaskElementRef : null}
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
                  </div>
                  {isLoadingMore && (
                    <div className="flex justify-center mt-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="highpaying" className="space-y-4 mt-4">
                  <div className="max-h-[600px] overflow-y-auto pr-4">
                    {filteredTasks?.map((task, index) => (
                      <div
                        key={task.id}
                        ref={index === filteredTasks.length - 1 ? lastTaskElementRef : null}
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
                  </div>
                  {isLoadingMore && (
                    <div className="flex justify-center mt-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

