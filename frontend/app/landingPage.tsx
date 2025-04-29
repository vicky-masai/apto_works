"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  Star,
  Users,
  ChevronDown,
  Search,
  CheckCircle2,
  Code,
  FileText,
  Paintbrush,
  Settings2,
  Smartphone,
  Upload,
  Wallet,
  Clock4,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getAllTasks } from "@/API/api"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Rate definitions by category
const RATES_BY_CATEGORY: {
  [key: string]: { min: number; max: number }
} = {
  development: { min: 30, max: 60 },
  design: { min: 25, max: 50 },
  writing: { min: 20, max: 40 },
  other: { min: 15, max: 35 },
}

// Static task data to prevent 401 errors
const SAMPLE_TASKS = [
  {
    title: "Website Development",
    description: "Create a responsive website using React and Tailwind CSS",
    price: 250,
    category: "Development",
    difficulty: "Medium",
    time: "3-4 days",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2064&auto=format&fit=crop",
  },
  {
    title: "Content Writing",
    description: "Write engaging blog posts about technology trends",
    price: 100,
    category: "Writing",
    difficulty: "Easy",
    time: "1-2 days",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2073&auto=format&fit=crop",
  },
  {
    title: "UI/UX Design",
    description: "Design a mobile app interface with modern aesthetics",
    price: 300,
    category: "Design",
    difficulty: "Hard",
    time: "4-5 days",
    image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=2036&auto=format&fit=crop",
  },
]

interface AcceptedUser {
  id: string;
  userId: string;
}

interface Task {
  id: string;
  taskTitle: string;
  taskDescription: string;
  category: string;
  price: number;
  estimatedTime: string;
  stepByStepInstructions: string;
  requiredProof: string;
  numWorkersNeeded: number;
  rejectedReason: string;
  totalAmount: number;
  difficulty: string;
  taskStatus: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  acceptedUsers: AcceptedUser[];
}

export default function TaskMarketplaceLanding() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("development")
  const [hoursPerWeek, setHoursPerWeek] = useState(20)
  const [earnings, setEarnings] = useState({ min: 2400, max: 4800 })
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Testimonials data
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Freelance Developer",
      content: "This platform has been a game-changer for me. I've found consistent work opportunities and the payment process is seamless. Perfect for Indian freelancers!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/79.jpg"
    },
    {
      name: "Rajesh Kumar",
      role: "Digital Marketing Expert",
      content: "As a digital marketer, I've found great opportunities here. The platform is user-friendly and the support team is very responsive. Highly recommended!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Ananya Patel",
      role: "Content Writer",
      content: "Being a content writer, I love how easy it is to find quality writing projects here. The platform ensures timely payments and great communication with clients.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/31.jpg"
    },
    {
      name: "Arjun Mehta",
      role: "UI/UX Designer",
      content: "The quality of design projects here is exceptional. I've been able to build a strong portfolio and connect with great clients from around the world.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/85.jpg"
    }
  ]

  const faqData = [
    {
      question: "How do I get started?",
      answer:
        "Simply create an account, complete your profile, and start browsing available tasks or post your own tasks. Our platform makes it easy to begin earning or finding help immediately.",
    },
    {
      question: "How are payments processed?",
      answer:
        "We use secure payment processors to handle all transactions. Payments are held in escrow until the task is completed and verified. Once approved, payments are released within 24 hours to your connected account.",
    },
    {
      question: "What types of tasks can I post?",
      answer:
        "You can post any legal task that can be completed remotely. This includes data entry, content writing, graphic design, web development, virtual assistance, research, and more. All tasks must comply with our platform guidelines.",
    },
    {
      question: "How do I ensure task quality?",
      answer:
        "Our platform includes a comprehensive rating system, detailed reviews, and a verification process. We also provide dispute resolution and guarantee satisfaction for all completed tasks. You can view worker profiles, ratings, and past work history.",
    },
    {
      question: "What if I'm not satisfied with the work?",
      answer:
        "We have a satisfaction guarantee policy. If you're not satisfied with the completed work, you can request revisions or open a dispute. Our support team will help resolve any issues and ensure fair resolution for both parties.",
    },
  ]

  const calculateEarnings = (category: string, hours: number) => {
    const rate = RATES_BY_CATEGORY[category] || RATES_BY_CATEGORY.other
    const weeklyMin = hours * rate.min
    const weeklyMax = hours * rate.max
    const monthlyMin = Math.round(weeklyMin * 4)
    const monthlyMax = Math.round(weeklyMax * 4)

    setEarnings({ min: monthlyMin, max: monthlyMax })
  }

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await getAllTasks({ status: 'Published' });
      setTasks(response.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleAcceptTask = (taskId: string) => {
    router.push(`/tasks/${taskId}/accept`)
  }

  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section id="hero-section" className="py-16 sm:py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1 max-w-2xl">
              <div className="space-y-8">
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-1.5 text-base font-medium rounded-full">
                  Trusted by 10,000+ users worldwide
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                  Complete Tasks. <span className="text-purple-600 relative">
                    Get Paid.
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-purple-200 transform -skew-x-12"></span>
                  </span> Simple.
                </h1>
                <p className="text-base sm:text-lg md:text-2xl text-gray-700 leading-relaxed max-w-xl font-medium">
                  Join our marketplace where you can earn money by completing simple tasks or post tasks to get your
                  work done.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Link href="/tasks" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-700/30 relative overflow-hidden group w-full sm:w-auto h-12 sm:h-14 text-base sm:text-lg font-semibold"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Find Tasks{" "}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                  <Link href="/post-task" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-purple-700 border-2 border-purple-200 hover:bg-purple-50 w-full sm:w-auto h-12 sm:h-14 text-base sm:text-lg font-semibold"
                    >
                      Post a Task
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-6">
                  <div className="flex -space-x-3 justify-center">
                    {[
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1887&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop",
                    ].map((src, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md hover:scale-110 transition-transform duration-200"
                      >
                        <Image
                          src={src || "/placeholder.svg"}
                          alt="User"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-base text-gray-700 font-medium">
                    <span className="font-bold text-purple-600">1,000+</span> tasks completed this week
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full relative mt-10 md:mt-0">
              <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300 w-full max-w-md mx-auto md:max-w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 mix-blend-overlay"></div>
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                  alt="People working on tasks"
                  width={600}
                  height={400}
                  className="rounded-xl object-cover w-full h-56 sm:h-80 md:h-[400px] lg:h-[500px]"
                />
                <div className="absolute -bottom-3 sm:-bottom-5 -right-3 sm:-right-5 bg-purple-600 text-white p-4 sm:p-6 rounded-lg shadow-xl transform hover:translate-y-1 transition-transform duration-200 text-sm sm:text-2xl font-bold">
                  10,000+ Tasks Completed
                </div>
              </div>
              {/* Decorative background elements */}
              <div className="absolute -z-10 top-10 -right-10 w-40 h-40 sm:w-72 sm:h-72 bg-purple-200/50 rounded-full opacity-60 blur-3xl animate-pulse"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 sm:w-72 sm:h-72 bg-blue-200/50 rounded-full opacity-60 blur-3xl animate-pulse"></div>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-50/50 to-transparent -z-20"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8 text-purple-600" />,
                label: "Active Users",
                value: "10,000+",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-purple-600" />,
                label: "Tasks Completed",
                value: "5,000+",
              },
              {
                icon: <DollarSign className="h-8 w-8 text-purple-600" />,
                label: "Total Earnings",
                value: "$1,000,000+",
              },
              {
                icon: <Star className="h-8 w-8 text-purple-600" />,
                label: "Satisfaction Rate",
                value: "98%",
              },
            ].map((stat, index) => (
              <div key={index} className="w-full">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                  <div className="bg-purple-100 rounded-full p-3 mb-4 w-fit">{stat.icon}</div>
                  <h3 className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                  <p className="text-gray-600 mt-2">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied freelancers and businesses who have found success on our platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-purple-100 hover:border-purple-300 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-purple-100">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tasks Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Featured Tasks</h2>
              <p className="text-gray-600">Browse through our most popular and high-paying tasks</p>
            </div>
            <Link href="/tasks">
            <Button className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white">
              View All Tasks <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            </Link>
          </div>
          
          {isLoading ? (
            // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="flex gap-2 mb-6">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="task-slider"
            >
              {tasks.map((task) => (
                <SwiperSlide key={task.id}>
                  <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">{task.taskTitle}</h3>
                    <p className="text-gray-600 mb-4 flex-grow">{task.taskDescription}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-green-600 font-bold">${task.price}</span>
                        <span className="text-gray-500 ml-4">{task.estimatedTime}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">Workers needed:</span>
                        <span className="font-semibold">{task.numWorkersNeeded}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{task.category}</span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm ml-2">{task.difficulty}</span>
                    </div>
                    <div className="flex gap-3 mt-auto">
                    <Button
                      variant="outline"
                        className="w-full"
                        onClick={() => handleViewDetails(task)}
                    >
                      View Details
                    </Button>
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleAcceptTask(task.id)}
                      >
                        Accept Task
                      </Button>
                    </div>
                  </div>
                </SwiperSlide>
            ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete tasks in four simple steps and start earning today
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Search className="h-8 w-8 text-purple-600" />,
                title: "Browse Tasks",
                description: "Find tasks that match your skills and interests",
              },
              {
                icon: <CheckCircle2 className="h-8 w-8 text-purple-600" />,
                title: "Accept Task",
                description: "Review requirements and accept the task",
              },
              {
                icon: <Upload className="h-8 w-8 text-purple-600" />,
                title: "Submit Work",
                description: "Complete the task and submit your work",
              },
              {
                icon: <Wallet className="h-8 w-8 text-purple-600" />,
                title: "Get Paid",
                description: "Receive payment once work is approved",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center h-full flex flex-col items-center"
              >
                <div className="mb-6 p-4 rounded-full bg-purple-100 w-fit">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Task Categories Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Task Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore tasks across various categories and find the perfect match for your skills
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Code className="h-8 w-8" />,
                title: "Development",
                count: "250+ Tasks",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: <Paintbrush className="h-8 w-8" />,
                title: "Design",
                count: "180+ Tasks",
                color: "bg-pink-100 text-pink-600",
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Writing",
                count: "320+ Tasks",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: <Smartphone className="h-8 w-8" />,
                title: "Mobile",
                count: "150+ Tasks",
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                icon: <Settings2 className="h-8 w-8" />,
                title: "Technical",
                count: "200+ Tasks",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: <Clock4 className="h-8 w-8" />,
                title: "Virtual Assistant",
                count: "120+ Tasks",
                color: "bg-indigo-100 text-indigo-600",
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Data Entry",
                count: "280+ Tasks",
                color: "bg-red-100 text-red-600",
              },
              {
                icon: <Settings2 className="h-8 w-8" />,
                title: "Other",
                count: "100+ Tasks",
                color: "bg-orange-100 text-orange-600",
              },
            ].map((category, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition-all duration-300 cursor-pointer h-full"
              >
                <div className={`mb-6 p-3 rounded-full ${category.color} w-fit`}>{category.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{category.title}</h3>
                <p className="text-gray-600">{category.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Earnings Calculator</h2>
              <p className="text-gray-600 mb-8">Calculate your potential earnings based on tasks and hours</p>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="grid gap-6">
                  <div>
                    <label className="text-gray-900 mb-2 block font-medium">Task Category</label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) => {
                        setSelectedCategory(value)
                        calculateEarnings(value, hoursPerWeek)
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-gray-900 mb-2 block font-medium">Hours per Week</label>
                    <div className="space-y-4">
                      <Slider
                        value={[hoursPerWeek]}
                        min={1}
                        max={40}
                        step={1}
                        className="py-4"
                        onValueChange={(value) => {
                          setHoursPerWeek(value[0])
                          calculateEarnings(selectedCategory, value[0])
                        }}
                      />
                      <div className="flex justify-between text-gray-600 text-sm">
                        <span>1 hour</span>
                        <span>{hoursPerWeek} hours</span>
                        <span>40 hours</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-gray-900 text-lg font-semibold mb-4">Potential Monthly Earnings</h4>
                    <div className="text-4xl font-bold text-purple-600">
                      ${earnings.min.toLocaleString()} - ${earnings.max.toLocaleString()}
                    </div>
                    <p className="text-gray-600 mt-2">Based on average task rates in selected category</p>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div className="text-gray-600">
                        <div>Hourly Rate</div>
                        <div className="text-gray-900 font-semibold mt-1">
                          ${RATES_BY_CATEGORY[selectedCategory].min} - ${RATES_BY_CATEGORY[selectedCategory].max}
                        </div>
                      </div>
                      <div className="text-gray-600">
                        <div>Weekly Hours</div>
                        <div className="text-gray-900 font-semibold mt-1">{hoursPerWeek} hours</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full relative mt-8 md:mt-0">
              <div className="image-border-animation w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                  alt="Earnings illustration"
                  width={600}
                  height={600}
                  className="rounded-xl w-full h-auto"
                />
              </div>
              <div className="absolute -z-10 top-10 -right-10 w-32 h-32 sm:w-64 sm:h-64 bg-purple-200 rounded-full opacity-50 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions about our platform</p>
          </div>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex items-center justify-between w-full"
                >
                  <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.question}</h3>
                  <div className="bg-purple-100 rounded-full p-1">
                    <ChevronDown
                      className={`h-5 w-5 text-purple-600 transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>
                {openFaq === index && (
                  <div className="pt-4 text-gray-600 animate-in fade-in-50 duration-300">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-purple-600">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to transform your workflow?</h2>
            <p className="text-lg max-w-3xl mx-auto text-white/90">
              Join thousands of teams and freelancers who are already using our platform to streamline their tasks,
              collaborate effectively, and get paid securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 sm:pt-4 w-full">
              <Button size="lg" className="bg-white hover:bg-gray-100 text-purple-600 w-full sm:w-auto">
                Get Started for Free
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/10 hover:bg-white/20 w-full sm:w-auto">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact-section" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Contact Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Have questions? We'd love to hear from you.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-purple-600 p-8 rounded-xl shadow-lg text-white">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">ADDRESS</h3>
                <p className="text-white/90">
                  No 301, Jeevan Sai Meadows,<br />
                  13th Cross, Manjunatha Lyt,<br />
                  Muneakolala, Marathahalli,<br />
                  Bengaluru, Karnataka 560037
                </p>
              </div>
            </div>

            <div className="bg-purple-600 p-8 rounded-xl shadow-lg text-white">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">PHONE</h3>
                <div className="space-y-2">
                  <p className="text-white/90">
                    Hours: Open · Closes 6 pm
                  </p>
                  <a href="tel:+918040405050" className="text-white/90 hover:text-white block">
                    +91 804 040 5050
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-purple-600 p-8 rounded-xl shadow-lg text-white">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">EMAIL</h3>
                <div className="space-y-2">
                  <a href="mailto:info@codeapto.com" className="text-white/90 hover:text-white block">
                    info@codeapto.com
                  </a>
                  <a href="https://codeapto.com" className="text-white/90 hover:text-white block">
                    codeapto.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8">Subscribe to our newsletter for the latest updates and offers</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 w-full max-w-md px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-20 px-4 bg-gray-50">
        {/* Existing content remains unchanged */}
      </section>

      {/* Task Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedTask?.taskTitle}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {selectedTask?.taskDescription}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-gray-900">Price</h4>
                <p className="text-2xl font-bold text-green-600">
                  ${selectedTask?.price}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Estimated Time</h4>
                <p className="text-gray-600">{selectedTask?.estimatedTime}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
              <p className="text-gray-600">{selectedTask?.stepByStepInstructions}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Proof Required</h4>
              <p className="text-gray-600">{selectedTask?.requiredProof}</p>
            </div>

            <div className="flex gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {selectedTask?.category}
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {selectedTask?.difficulty}
              </span>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  setIsModalOpen(false)
                  if (selectedTask) {
                    handleAcceptTask(selectedTask.id)
                  }
                }}
              >
                Accept Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes pulse-border {
          0% { border-color: rgba(147, 51, 234, 0.2); }
          50% { border-color: rgba(147, 51, 234, 0.5); }
          100% { border-color: rgba(147, 51, 234, 0.2); }
        }

        .image-border-animation {
          animation: pulse-border 2s infinite;
        }

        /* Add these styles for the slider */
        .task-slider {
          padding: 20px 10px 50px !important;
        }

        .swiper-button-next,
        .swiper-button-prev {
          color: #9333ea !important;
        }

        .swiper-pagination-bullet-active {
          background: #9333ea !important;
        }
      `}</style>
    </div>
  )
}
