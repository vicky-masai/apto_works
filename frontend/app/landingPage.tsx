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
  TrendingUp,
  Shield,
  Award,
  BarChart,
  Globe,
  MessageCircle,
  BookOpen,
  Target,
  Mail,
  Phone
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-white overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-base">
                Trusted by 10,000+ users worldwide
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                The Future of Work:
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Micro Tasks, Macro Impact
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with global opportunities. Whether you're looking to earn, hire, or invest - we're building the future of task-based work.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full">
                  Find Tasks
                </Button>
                <Button size="lg" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-full">
                  Post Tasks
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-8">
                {[
                  { label: "Active Users", value: "10,000+" },
                  { label: "Tasks Completed", value: "50,000+" },
                  { label: "Total Earnings", value: "$1M+" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                src="/hero-image.jpg"
                alt="Platform Overview"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -z-10 top-10 -right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Tabs */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="workers" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Choose Your Path</h2>
              <TabsList className="bg-blue-50 p-2 rounded-full">
                <TabsTrigger value="workers" className="px-8 py-3 rounded-full">For Workers</TabsTrigger>
                <TabsTrigger value="posters" className="px-8 py-3 rounded-full">For Task Posters</TabsTrigger>
                <TabsTrigger value="investors" className="px-8 py-3 rounded-full">For Investors</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="workers" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Clock className="h-8 w-8 text-blue-600" />,
                    title: "Flexible Hours",
                    description: "Work when you want, where you want. Complete tasks at your own pace."
                  },
                  {
                    icon: <DollarSign className="h-8 w-8 text-blue-600" />,
                    title: "Competitive Pay",
                    description: "Earn competitive rates for your skills and expertise."
                  },
                  {
                    icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
                    title: "Skill Growth",
                    description: "Build your portfolio and enhance your skills with diverse tasks."
                  }
                ].map((feature, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="bg-blue-50 w-fit p-3 rounded-lg mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="posters" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Users className="h-8 w-8 text-blue-600" />,
                    title: "Global Talent Pool",
                    description: "Access skilled professionals from around the world."
                  },
                  {
                    icon: <Shield className="h-8 w-8 text-blue-600" />,
                    title: "Quality Assured",
                    description: "Every task completion is verified and quality-checked."
                  },
                  {
                    icon: <DollarSign className="h-8 w-8 text-blue-600" />,
                    title: "Cost Effective",
                    description: "Pay only for completed tasks, no overhead costs."
                  }
                ].map((feature, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="bg-blue-50 w-fit p-3 rounded-lg mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="investors" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <BarChart className="h-8 w-8 text-blue-600" />,
                    title: "Market Growth",
                    description: "Tap into the rapidly growing gig economy market."
                  },
                  {
                    icon: <Globe className="h-8 w-8 text-blue-600" />,
                    title: "Global Reach",
                    description: "Platform available in multiple countries with rapid expansion."
                  },
                  {
                    icon: <Target className="h-8 w-8 text-blue-600" />,
                    title: "Clear Metrics",
                    description: "Transparent growth and performance indicators."
                  }
                ].map((feature, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="bg-blue-50 w-fit p-3 rounded-lg mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple, transparent process for both task workers and posters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* For Workers */}
            <div className="space-y-12">
              <h3 className="text-2xl font-bold text-blue-600">For Workers</h3>
              <div className="space-y-8">
                {[
                  {
                    icon: <Search className="h-6 w-6" />,
                    title: "Browse Tasks",
                    description: "Find tasks that match your skills and interests"
                  },
                  {
                    icon: <CheckCircle2 className="h-6 w-6" />,
                    title: "Accept Task",
                    description: "Review requirements and accept the task"
                  },
                  {
                    icon: <Upload className="h-6 w-6" />,
                    title: "Complete Work",
                    description: "Submit your work following the guidelines"
                  },
                  {
                    icon: <Wallet className="h-6 w-6" />,
                    title: "Get Paid",
                    description: "Receive payment once work is approved"
                  }
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="bg-blue-100 p-3 rounded-full h-fit">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Task Posters */}
            <div className="space-y-12">
              <h3 className="text-2xl font-bold text-purple-600">For Task Posters</h3>
              <div className="space-y-8">
                {[
                  {
                    icon: <FileText className="h-6 w-6" />,
                    title: "Create Task",
                    description: "Define your task with clear requirements"
                  },
                  {
                    icon: <Users className="h-6 w-6" />,
                    title: "Select Workers",
                    description: "Choose from qualified workers"
                  },
                  {
                    icon: <CheckCircle className="h-6 w-6" />,
                    title: "Review Work",
                    description: "Verify the completed work"
                  },
                  {
                    icon: <DollarSign className="h-6 w-6" />,
                    title: "Release Payment",
                    description: "Approve and release payment"
                  }
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="bg-purple-100 p-3 rounded-full h-fit">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Market Opportunity</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tap into the growing gig economy and digital transformation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Market Size",
                value: "$500B+",
                description: "Total addressable market by 2025"
              },
              {
                title: "Annual Growth",
                value: "28%",
                description: "Year-over-year platform growth"
              },
              {
                title: "User Base",
                value: "10M+",
                description: "Active users globally"
              },
              {
                title: "Task Value",
                value: "$100M+",
                description: "Total task value processed"
              }
            ].map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-blue-600">
                    {metric.value}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">{metric.title}</h4>
                  <p className="text-gray-600">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and features for a seamless experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure Payments",
                description: "Protected payments and escrow service"
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Quality Assurance",
                description: "Verified workers and task completion"
              },
              {
                icon: <MessageCircle className="h-8 w-8" />,
                title: "Communication Tools",
                description: "Built-in messaging and collaboration"
              },
              {
                icon: <BarChart className="h-8 w-8" />,
                title: "Analytics Dashboard",
                description: "Detailed insights and reporting"
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Learning Resources",
                description: "Training and support materials"
              },
              {
                icon: <Settings2 className="h-8 w-8" />,
                title: "API Integration",
                description: "Enterprise-ready API solutions"
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-blue-50 w-fit p-3 rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Get Started?</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto">
            Join thousands of users already benefiting from our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Earning
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Post a Task
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Investor Relations
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built with trust, security, and success in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="h-12 w-12 text-blue-600" />,
                title: "Secure Platform",
                description: "Bank-level security for all transactions and data"
              },
              {
                icon: <Users className="h-12 w-12 text-blue-600" />,
                title: "Verified Users",
                description: "Thorough verification process for all users"
              },
              {
                icon: <DollarSign className="h-12 w-12 text-blue-600" />,
                title: "Escrow Payments",
                description: "Safe and secure payment processing"
              },
              {
                icon: <MessageCircle className="h-12 w-12 text-blue-600" />,
                title: "24/7 Support",
                description: "Round-the-clock assistance when you need it"
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-50 p-4 rounded-full">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powered by Modern Technology</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built with the latest technology stack for optimal performance and scalability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              {
                name: "React",
                icon: "/tech/react.svg",
                description: "Frontend Framework"
              },
              {
                name: "Node.js",
                icon: "/tech/nodejs.svg",
                description: "Backend Runtime"
              },
              {
                name: "MongoDB",
                icon: "/tech/mongodb.svg",
                description: "Database"
              },
              {
                name: "AWS",
                icon: "/tech/aws.svg",
                description: "Cloud Infrastructure"
              },
              {
                name: "Docker",
                icon: "/tech/docker.svg",
                description: "Containerization"
              },
              {
                name: "Kubernetes",
                icon: "/tech/kubernetes.svg",
                description: "Orchestration"
              },
              {
                name: "GraphQL",
                icon: "/tech/graphql.svg",
                description: "API Layer"
              },
              {
                name: "Redis",
                icon: "/tech/redis.svg",
                description: "Caching"
              }
            ].map((tech, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center">
                <div className="flex justify-center mb-4">
                  <Image
                    src={tech.icon}
                    alt={tech.name}
                    width={48}
                    height={48}
                    className="h-12 w-12"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{tech.name}</h3>
                <p className="text-sm text-gray-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor Information Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Investor Relations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Key metrics and growth opportunities for potential investors
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Growth Metrics */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-blue-600">Growth Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "User Growth", value: "150%", period: "YoY" },
                  { label: "Revenue Growth", value: "200%", period: "YoY" },
                  { label: "Market Share", value: "15%", period: "Current" },
                  { label: "Task Completion", value: "98%", period: "Rate" }
                ].map((metric, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-3xl font-bold text-blue-600">
                        {metric.value}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">{metric.label}</p>
                      <p className="text-sm text-gray-600">{metric.period}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Market Opportunity */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-purple-600">Market Opportunity</h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Global Gig Economy",
                    value: "$455B by 2023",
                    description: "Expected market value with 17% CAGR"
                  },
                  {
                    title: "Platform Revenue",
                    value: "$50M ARR",
                    description: "Current annual recurring revenue"
                  },
                  {
                    title: "Market Penetration",
                    value: "5 Countries",
                    description: "Active operations with expansion plans"
                  }
                ].map((opportunity, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{opportunity.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-purple-600">{opportunity.value}</p>
                      <p className="text-gray-600 mt-2">{opportunity.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
              <p className="text-xl mb-8">
                Have questions? We're here to help you succeed on our platform.
              </p>
              <div className="space-y-6">
                {[
                  {
                    icon: <MessageCircle className="h-6 w-6" />,
                    title: "Chat Support",
                    description: "Available 24/7 for your questions"
                  },
                  {
                    icon: <Mail className="h-6 w-6" />,
                    title: "Email",
                    description: "support@platform.com"
                  },
                  {
                    icon: <Phone className="h-6 w-6" />,
                    title: "Phone",
                    description: "+1 (555) 123-4567"
                  }
                ].map((contact, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-full">
                      {contact.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{contact.title}</h3>
                      <p className="text-white/80">{contact.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 p-8 rounded-xl backdrop-blur-lg">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 h-32"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <Button className="w-full bg-white text-blue-600 hover:bg-white/90">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-6">About Us</h3>
              <p className="text-gray-400">
                Building the future of work through our innovative task marketplace platform.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Find Tasks</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Post a Task</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Resources</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6">Connect</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Task Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
