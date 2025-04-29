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
  Clock,
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
import './styles/landingPage.css'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

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

// Add brand colors at the top after imports
const brandColors = {
  primary: {
    blue: '#4F46E5',
    purple: '#9333EA',
  }
};

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
    <div className={`bg-white text-gray-800 ${roboto.className}`}>
      {/* Hero Section */}
      <section id="hero-section" className="py-16 sm:py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1 max-w-2xl">
              <div className="space-y-8">
                <Badge className="bg-[#2563EB] text-white hover:bg-[#2563EB]/90 px-4 py-1.5 text-base font-medium rounded-full">
                  Trusted by 10,000+ users worldwide
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                  <span className="text-[#2563EB]">
                    Complete Tasks.
                  </span>{" "}
                  <span className="text-[#2563EB]">
                    Get Paid.
                  </span>{" "}
                  <span className="text-[#2563EB]">
                    Simple.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed max-w-xl font-light">
                  Join our marketplace where you can earn money by completing simple tasks or post tasks to get your
                  work done.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Link href="/tasks" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white shadow-lg shadow-blue-700/30 relative overflow-hidden group w-full sm:w-auto h-14 text-lg font-medium rounded-full"
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
                      className="text-[#2563EB] border-2 border-[#2563EB]/20 hover:bg-[#2563EB]/5 w-full sm:w-auto h-14 text-lg font-medium rounded-full"
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
                  <div className="text-lg text-gray-700 font-medium">
                    <span className="text-[#2563EB] font-bold">1,000+</span> tasks completed this week
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full relative mt-10 md:mt-0">
              <div className="relative z-10">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                  alt="People working on tasks"
                  width={600}
                  height={400}
                  className="rounded-xl object-cover w-full h-56 sm:h-80 md:h-[400px] lg:h-[500px] hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute -z-10 top-10 -right-10 w-40 h-40 sm:w-72 sm:h-72 bg-gradient-to-r from-blue-200/50 to-purple-200/50 rounded-full opacity-60 blur-3xl animate-pulse"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 sm:w-72 sm:h-72 bg-gradient-to-r from-purple-200/50 to-blue-200/50 rounded-full opacity-60 blur-3xl animate-pulse"></div>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-transparent -z-20"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-[#2563EB]">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete tasks in four simple steps and start earning today
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Search className="h-8 w-8" />,
                title: "Browse Tasks",
                description: "Find tasks that match your skills and interests",
                bgColor: "bg-blue-100/50",
              },
              {
                icon: <CheckCircle2 className="h-8 w-8" />,
                title: "Accept Task",
                description: "Review requirements and accept the task",
                bgColor: "bg-purple-100/50",
              },
              {
                icon: <Upload className="h-8 w-8" />,
                title: "Submit Work",
                description: "Complete the task and submit your work",
                bgColor: "bg-blue-100/50",
              },
              {
                icon: <Wallet className="h-8 w-8" />,
                title: "Get Paid",
                description: "Receive payment once work is approved",
                bgColor: "bg-purple-100/50",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="p-8 text-center h-full flex flex-col items-center">
                  <div className={`mb-6 p-4 rounded-full ${step.bgColor} w-fit hover:scale-110 transition-transform duration-300`}>
                    <div className="text-[#2563EB]">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 hover:text-[#2563EB] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tasks Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-white">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#2563EB] p-3 rounded-xl">
                  <span className="text-2xl">🚀</span>
                </div>
                <h2 className="text-4xl font-extrabold text-[#2563EB]">
                  Featured Tasks
                </h2>
              </div>
              <p className="text-gray-700 text-lg">
                Explore our top-rated and best-paying tasks curated just for you!
              </p>
            </div>
            <Link href="/tasks">
              <Button className="mt-6 md:mt-0 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white shadow-lg hover:shadow-blue-200 transition-all duration-300 px-8 py-4 rounded-full text-lg font-medium group">
                View All Tasks <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md animate-pulse">
                  <div className="p-6">
                    <div className="h-48 bg-purple-50 rounded-xl mb-6"></div>
                    <div className="h-6 bg-purple-50 rounded-full w-3/4 mb-4"></div>
                    <div className="h-4 bg-purple-50 rounded-full w-1/2 mb-6"></div>
                    <div className="flex gap-2 mb-6">
                      <div className="h-8 bg-purple-50 rounded-full w-20"></div>
                      <div className="h-8 bg-purple-50 rounded-full w-20"></div>
                    </div>
                    <div className="h-10 bg-purple-50 rounded-full w-full"></div>
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
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="task-slider"
            >
              {tasks.map((task) => (
                <SwiperSlide key={task.id}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="p-6 h-full flex flex-col">
                      <h3 className="text-xl font-semibold mb-2 text-[#2563EB]">
                        {task.taskTitle}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-2">
                        {task.taskDescription}
                      </p>

                      {/* Metadata Badges */}
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-blue-50 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 hover:bg-blue-100 transition-colors">
                            💰 ₹{task.price}
                          </span>
                          <span className="bg-blue-50 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 hover:bg-blue-100 transition-colors">
                            ⏰ {task.estimatedTime}
                          </span>
                          <span className="bg-blue-50 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 hover:bg-blue-100 transition-colors">
                            👥 {task.numWorkersNeeded} Workers
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="bg-blue-50 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors">
                            {task.category}
                          </span>
                          <span className="bg-blue-50 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors">
                            {task.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          variant="outline"
                          className="w-full bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white border-2 border-[#2563EB]/20 transition-all duration-300 font-medium py-2.5 rounded-xl"
                          onClick={() => handleViewDetails(task)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* Task Categories Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-[#2563EB]">Task Categories</h2>
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
                color: "text-blue-600",
                iconBg: "bg-blue-100",
              },
              {
                icon: <Paintbrush className="h-8 w-8" />,
                title: "Design",
                count: "180+ Tasks",
                color: "text-pink-600",
                iconBg: "bg-pink-100",
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Writing",
                count: "320+ Tasks",
                color: "text-green-600",
                iconBg: "bg-green-100",
              },
              {
                icon: <Smartphone className="h-8 w-8" />,
                title: "Mobile",
                count: "150+ Tasks",
                color: "text-yellow-600",
                iconBg: "bg-yellow-100",
              },
              {
                icon: <Settings2 className="h-8 w-8" />,
                title: "Technical",
                count: "200+ Tasks",
                color: "text-purple-600",
                iconBg: "bg-purple-100",
              },
              {
                icon: <Clock4 className="h-8 w-8" />,
                title: "Virtual Assistant",
                count: "120+ Tasks",
                color: "text-indigo-600",
                iconBg: "bg-indigo-100",
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Data Entry",
                count: "280+ Tasks",
                color: "text-red-600",
                iconBg: "bg-red-100",
              },
              {
                icon: <Settings2 className="h-8 w-8" />,
                title: "Other",
                count: "100+ Tasks",
                color: "text-orange-600",
                iconBg: "bg-orange-100",
              },
            ].map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="p-6 h-full">
                  <div className={`mb-6 p-3 rounded-full ${category.iconBg} w-fit hover:scale-110 transition-transform duration-300`}>
                    <div className={category.color}>
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 hover:text-[#2563EB] transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600">{category.count}</p>
                </div>
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
              <h2 className="text-4xl font-bold mb-4 text-[#2563EB]">
                Earnings Calculator
              </h2>
              <p className="text-gray-600 mb-8">Calculate your potential earnings based on tasks and hours</p>
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
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
                      <SelectTrigger className="bg-white border-[#2563EB]/20 text-gray-900 hover:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/20 transition-all">
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
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h4 className="text-gray-900 text-lg font-semibold mb-4">Potential Monthly Earnings</h4>
                    <div className="text-4xl font-bold text-[#2563EB]">
                      ₹{earnings.min.toLocaleString()} - ₹{earnings.max.toLocaleString()}
                    </div>
                    <p className="text-gray-600 mt-2">Based on average task rates in selected category</p>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div className="text-gray-600">
                        <div>Hourly Rate</div>
                        <div className="text-[#2563EB] font-semibold mt-1">
                          ₹{RATES_BY_CATEGORY[selectedCategory].min} - ₹{RATES_BY_CATEGORY[selectedCategory].max}
                        </div>
                      </div>
                      <div className="text-gray-600">
                        <div>Weekly Hours</div>
                        <div className="text-[#2563EB] font-semibold mt-1">{hoursPerWeek} hours</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full relative mt-8 md:mt-0">
              <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                  alt="Earnings illustration"
                  width={600}
                  height={600}
                  className="w-full h-auto rounded-xl hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute -z-10 top-10 -right-10 w-32 h-32 sm:w-64 sm:h-64 bg-[#2563EB]/10 rounded-full opacity-50 blur-3xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8 text-[#2563EB]" />,
                label: "Active Users",
                value: "10,000+",
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-[#2563EB]" />,
                label: "Tasks Completed",
                value: "5,000+",
              },
              {
                icon: <DollarSign className="h-8 w-8 text-[#2563EB]" />,
                label: "Total Earnings",
                value: "₹1,000,000+",
              },
              {
                icon: <Star className="h-8 w-8 text-[#2563EB]" />,
                label: "Satisfaction Rate",
                value: "98%",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6"
              >
                <div className="bg-[#2563EB]/10 rounded-full p-3 mb-4 w-fit">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-[#2563EB]">
                  {stat.value}
                </h3>
                <p className="text-gray-600 mt-2 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-[#2563EB]">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied freelancers and businesses who have found success on our platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{testimonial.content}</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#2563EB]">Frequently Asked Questions</h2>
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

      {/* Contact Us Section */}
      <section id="contact-section" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#2563EB]">Contact Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Have questions? We'd love to hear from you.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#818CF8] p-8 rounded-xl shadow-lg text-white hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-4 rounded-full mb-4 hover:bg-white/30 transition-colors">
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

            <div className="bg-gradient-to-br from-[#6366F1] via-[#818CF8] to-[#4F46E5] p-8 rounded-xl shadow-lg text-white hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-4 rounded-full mb-4 hover:bg-white/30 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">PHONE</h3>
                <div className="space-y-2">
                  <p className="text-white/90">
                    Hours: Open · Closes 6 pm
                  </p>
                  <a href="tel:+918040405050" className="text-white/90 hover:text-white block transition-colors">
                    +91 804 040 5050
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#818CF8] via-[#4F46E5] to-[#6366F1] p-8 rounded-xl shadow-lg text-white hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-4 rounded-full mb-4 hover:bg-white/30 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">EMAIL</h3>
                <div className="space-y-2">
                  <a href="mailto:info@codeapto.com" className="text-white/90 hover:text-white block transition-colors">
                    info@codeapto.com
                  </a>
                  <a href="https://codeapto.com" className="text-white/90 hover:text-white block transition-colors">
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
            <h2 className="text-3xl font-bold text-[#2563EB] mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8">Subscribe to our newsletter for the latest updates and offers</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 w-full max-w-md px-6 py-4 rounded-full bg-white border-2 border-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-lg"
              />
              <Button 
                className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white w-full sm:w-auto rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-200"
              >
                Subscribe
              </Button>
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
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {selectedTask?.taskTitle}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {selectedTask?.taskDescription}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Task Metadata Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-50 text-[#2563EB] px-3 py-1.5 rounded-full text-sm font-medium">
                ₹ {selectedTask?.price}
              </span>
              <span className="bg-green-50 text-[#2563EB] px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {selectedTask?.estimatedTime}
              </span>
              <span className="bg-purple-50 text-[#2563EB] px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                <Users className="w-4 h-4" />
                {selectedTask?.numWorkersNeeded} Workers
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
              <p className="text-gray-600">{selectedTask?.stepByStepInstructions}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Proof Required</h4>
              <p className="text-gray-600">{selectedTask?.requiredProof}</p>
            </div>

            {/* Category and Difficulty */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-50 text-[#2563EB] px-3 py-1.5 rounded-full text-sm font-medium">
                {selectedTask?.category}
              </span>
              <span className="bg-purple-50 text-[#2563EB] px-3 py-1.5 rounded-full text-sm font-medium">
                {selectedTask?.difficulty}
              </span>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-blue-200 hover:border-blue-300 text-blue-600"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
