"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, CheckCircle, DollarSign, Star, Users, ChevronLeft, ChevronRight, ChevronDown, Search, Calculator, CheckCircle2, Clock4, Code, FileText, Paintbrush, Settings2, Smartphone } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useInView,
  useSpring,
} from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Wallet } from "lucide-react"

// Add this type definition after the imports
interface RatesByCategory {
  [key: string]: { min: number; max: number };
}

// Add this constant before the LandingPage component
const RATES_BY_CATEGORY: RatesByCategory = {
  development: { min: 30, max: 60 },
  design: { min: 25, max: 50 },
  writing: { min: 20, max: 40 },
  other: { min: 15, max: 35 }
} as const;

export const LandingPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const testimonialRef = useRef<HTMLDivElement>(null)
  const newsletterRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const [isMounted, setIsMounted] = useState(false)
  const [taskAmounts, setTaskAmounts] = useState<number[]>([])
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [stats, setStats] = useState({
    users: 0,
    tasks: 0,
    earnings: 0,
    satisfaction: 0,
  })
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("development")
  const [hoursPerWeek, setHoursPerWeek] = useState(20)
  const [earnings, setEarnings] = useState({ min: 2400, max: 4800 })

  // Scroll progress for parallax effects
  const { scrollYProgress } = useScroll()
  const statsInView = useInView(statsRef, { once: false, amount: 0.3 })
  const testimonialInView = useInView(testimonialRef, { once: false, amount: 0.3 })
  const newsletterInView = useInView(newsletterRef, { once: false, amount: 0.3 })
  const faqInView = useInView(faqRef, { once: false, amount: 0.3 })
  const ctaInView = useInView(ctaRef, { once: false, amount: 0.3 })

  // Smooth scroll progress for animations
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    mass: 0.5,
  })

  // Parallax values for different sections
  const heroParallax = useTransform(smoothScrollProgress, [0, 0.2], [0, -30])
  const statsParallax = useTransform(smoothScrollProgress, [0.1, 0.3], [30, 0])
  const testimonialParallax = useTransform(smoothScrollProgress, [0.3, 0.5], [30, 0])
  const newsletterParallax = useTransform(smoothScrollProgress, [0.5, 0.7], [30, 0])
  const faqParallax = useTransform(smoothScrollProgress, [0.5, 0.7], [30, 0])

  // Track scroll position for 3D effects
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollY(latest * 100)
  })

  useEffect(() => {
    setIsMounted(true)
    // Generate random amounts only on client side
    setTaskAmounts(
      Array(4)
        .fill(0)
        .map(() => Number((Math.random() * 10 + 5).toFixed(2))),
    )

    // Add the animations to the global CSS
    const style = document.createElement("style")
    style.textContent = `
      @keyframes float {
        0% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-3px) rotate(2deg);
          transform: translateY(-5px) rotate(3deg);
        }
        100% {
          transform: translateY(0px) rotate(0deg);
        }
      }
      
      .animate-float {
        animation: float 8s ease-in-out infinite;
      }

      @keyframes pulse-glow {
        0%, 100% {
          filter: drop-shadow(0 0 3px rgba(147, 51, 234, 0.3));
        }
        50% {
          filter: drop-shadow(0 0 10px rgba(147, 51, 234, 0.5));
        }
      }
      
      .pulse-glow {
        animation: pulse-glow 6s ease-in-out infinite;
      }

      .perspective-container {
        perspective: 1000px;
      }
      
      .preserve-3d {
        transform-style: preserve-3d;
      }

      .space-bg {
        background-color: #0a0118;
        background-image: 
          radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), 
          radial-gradient(circle at 80% 70%, rgba(79, 70, 229, 0.15) 0%, transparent 50%);
      }
    `
    document.head.appendChild(style)

    return () => {
      style.remove()
    }
  }, [])

  // Animate stats when in view
  useEffect(() => {
    if (!statsInView) return

    const targetStats = {
      users: 10000,
      tasks: 5000,
      earnings: 1000000,
      satisfaction: 98,
    }

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      if (currentStep > steps) {
        clearInterval(interval)
        return
      }

      setStats({
        users: Math.floor((targetStats.users * currentStep) / steps),
        tasks: Math.floor((targetStats.tasks * currentStep) / steps),
        earnings: Math.floor((targetStats.earnings * currentStep) / steps),
        satisfaction: Math.floor((targetStats.satisfaction * currentStep) / steps),
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [statsInView])

  // Main 3D animation
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !isMounted) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    })

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 1000

    const posArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 3
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))

    // Materials
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015,
      color: new THREE.Color("#9333ea"),
      transparent: true,
      opacity: 0.6,
    })

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    // Add floating cubes
    const cubeGroup = new THREE.Group()
    scene.add(cubeGroup)

    for (let i = 0; i < 10; i++) {
      const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#9333ea"),
        transparent: true,
        opacity: 0.5,
      })

      const cube = new THREE.Mesh(geometry, material)

      cube.position.x = (Math.random() - 0.5) * 3
      cube.position.y = (Math.random() - 0.5) * 3
      cube.position.z = (Math.random() - 0.5) * 3

      cubeGroup.add(cube)
    }

    // Add glowing spheres
    const sphereGroup = new THREE.Group()
    scene.add(sphereGroup)

    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.SphereGeometry(0.08, 32, 32)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(i % 2 === 0 ? "#9333ea" : "#4f46e5"),
        transparent: true,
        opacity: 0.5,
      })

      const sphere = new THREE.Mesh(geometry, material)

      sphere.position.x = (Math.random() - 0.5) * 3
      sphere.position.y = (Math.random() - 0.5) * 3
      sphere.position.z = (Math.random() - 0.5) * 3

      sphereGroup.add(sphere)
    }

    // Add torus knots for more complex shapes
    const torusGroup = new THREE.Group()
    scene.add(torusGroup)

    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.TorusKnotGeometry(0.2, 0.08, 64, 8)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#9333ea"),
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      })

      const torusKnot = new THREE.Mesh(geometry, material)

      torusKnot.position.x = (Math.random() - 0.5) * 5
      torusKnot.position.y = (Math.random() - 0.5) * 5
      torusKnot.position.z = (Math.random() - 0.5) * 5
      torusKnot.scale.set(0.4, 0.4, 0.4)

      torusGroup.add(torusKnot)
    }

    // Position camera
    camera.position.z = 2.5

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enableZoom = false
    controls.enablePan = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.3

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      particlesMesh.rotation.x += 0.0002
      particlesMesh.rotation.y += 0.0002

      particlesMesh.position.y = scrollY * 0.001

      cubeGroup.rotation.x += 0.0003
      cubeGroup.rotation.y += 0.0003

      cubeGroup.position.y = scrollY * 0.0005

      sphereGroup.children.forEach((sphere, i) => {
        sphere.position.y += Math.sin(Date.now() * 0.0003 + i) * 0.0005
        sphere.position.x += Math.cos(Date.now() * 0.0003 + i) * 0.0005
      })

      torusGroup.children.forEach((torus, i) => {
        torus.rotation.x += 0.0002
        torus.rotation.y += 0.0004
        torus.position.y = Math.sin(Date.now() * 0.0002 + i) * 0.2
      })

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      renderer.dispose()
      scene.clear()
      particlesGeometry.dispose()
      particlesMaterial.dispose()

      cubeGroup.children.forEach((cube) => {
        if (cube instanceof THREE.Mesh) {
          cube.geometry.dispose()
          if (cube.material instanceof THREE.Material) {
            cube.material.dispose()
          }
        }
      })

      sphereGroup.children.forEach((sphere) => {
        if (sphere instanceof THREE.Mesh) {
          sphere.geometry.dispose()
          if (sphere.material instanceof THREE.Material) {
            sphere.material.dispose()
          }
        }
      })

      torusGroup.children.forEach((torus) => {
        if (torus instanceof THREE.Mesh) {
          torus.geometry.dispose()
          if (torus.material instanceof THREE.Material) {
            torus.material.dispose()
          }
        }
      })
    }
  }, [isMounted, scrollY])

  // Floating animation for cards
  const floatingAnimation = "animate-float"

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Freelancer",
      content:
        "This platform has completely transformed how I earn money online. The tasks are clear and payments are always on time.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Task Provider",
      content: "I've found reliable workers for all my projects. The quality of work is consistently excellent.",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Student",
      content: "Perfect for earning extra income while studying. The tasks are flexible and well-paid.",
      rating: 5,
    },
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

  // 3D card effect
  const card3DEffect = (x: number, y: number) => {
    const maxRotation = 5
    const xRotation = (y / window.innerHeight - 0.5) * maxRotation
    const yRotation = (x / window.innerWidth - 0.5) * -maxRotation
    return `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`
  }

  // Card hover state
  const [cardTransform, setCardTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)")

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCardTransform(card3DEffect(x, y))
  }

  const handleCardMouseLeave = () => {
    setCardTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)")
  }

  const calculateEarnings = (category: string, hours: number) => {
    const rate = RATES_BY_CATEGORY[category] || RATES_BY_CATEGORY.other
    const weeklyMin = hours * rate.min
    const weeklyMax = hours * rate.max
    const monthlyMin = Math.round(weeklyMin * 4)
    const monthlyMax = Math.round(weeklyMax * 4)

    setEarnings({ min: monthlyMin, max: monthlyMax })
  }

  return (
    <main className="flex-1 overflow-hidden space-bg text-white">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen py-12 md:py-24 lg:py-32 overflow-hidden flex items-center">
        <div ref={containerRef} className="absolute inset-0 w-full h-full">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <motion.div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10" style={{ y: heroParallax }}>
          <div className="flex flex-col items-center text-center gap-8">
            <motion.div
              className="max-w-3xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1
                className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl/none mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Complete Tasks.{" "}
                <motion.span
                  className="text-purple-400"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  Get Paid.
                </motion.span>{" "}
                Simple.
              </motion.h1>
              <motion.p
                className="text-gray-300 text-xl md:text-2xl leading-relaxed mb-10 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Join our marketplace where you can earn money by completing simple tasks or post tasks to get your work done.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <Link href="/tasks">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-700/30 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center">
                      Find Tasks <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </Link>
                <Link href="/post-task">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Post a Task</span>
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating 3D elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0118] to-transparent z-10"></div>
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-purple-500/20 blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 right-10 w-32 h-32 rounded-full bg-indigo-500/20 blur-xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="w-full py-16 space-bg relative overflow-hidden">
        <motion.div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10" style={{ y: statsParallax }}>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center"
            initial={{ opacity: 0 }}
            animate={statsInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[
              {
                icon: <Users className="h-8 w-8 text-purple-500" />,
                label: "Active Users",
                value: stats.users.toLocaleString(),
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-purple-500" />,
                label: "Tasks Completed",
                value: stats.tasks.toLocaleString(),
              },
              {
                icon: <DollarSign className="h-8 w-8 text-purple-500" />,
                label: "Total Earnings",
                value: `$${stats.earnings.toLocaleString()}`,
              },
              {
                icon: <Star className="h-8 w-8 text-purple-500" />,
                label: "Satisfaction Rate",
                value: `${stats.satisfaction}%`,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="w-full"
              >
                <motion.div
                  className="stat-card glow-effect w-full"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <motion.div
                    className="bg-purple-500/10 rounded-full p-3 mb-4 w-fit"
                    initial={{ scale: 0 }}
                    animate={statsInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200, damping: 10 }}
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.h3
                    className="text-3xl font-bold mt-2 text-white"
                    initial={{ opacity: 0 }}
                    animate={statsInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  >
                    {stat.value}
                  </motion.h3>
                  <motion.p
                    className="text-gray-500 mt-2"
                    initial={{ opacity: 0 }}
                    animate={statsInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
                  >
                    {stat.label}
                  </motion.p>

                  {/* 3D floating elements inside each card */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-purple-400 opacity-70"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.7, 0.9, 0.7],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: index * 0.5,
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-indigo-400 opacity-70"
                    animate={{
                      y: [0, 10, 0],
                      opacity: [0.7, 0.9, 0.7],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: index * 0.5 + 1,
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialRef} className="w-full py-16 space-bg relative overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={testimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl font-bold mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={testimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              className="text-purple-200/60"
              initial={{ opacity: 0 }}
              animate={testimonialInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Trusted by thousands of users worldwide
            </motion.p>
          </motion.div>
          <div className="max-w-3xl mx-auto perspective-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, rotateY: -10, z: -50 }}
                animate={{ opacity: 1, rotateY: 0, z: 0 }}
                exit={{ opacity: 0, rotateY: 10, z: -50 }}
                transition={{ type: "spring", stiffness: 70, damping: 12 }}
                className="stat-card glow-effect relative"
                style={{ transform: cardTransform }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <motion.div
                  className="flex items-center gap-2 mb-4"
                  style={{ transformStyle: "preserve-3d", transform: "translateZ(30px)" }}
                >
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i, type: "spring" }}
                    >
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  ))}
                </motion.div>
                <motion.p
                  className="text-purple-200/80 mb-4"
                  style={{ transformStyle: "preserve-3d", transform: "translateZ(40px)" }}
                >
                  {testimonials[currentTestimonial].content}
                </motion.p>
                <motion.div style={{ transformStyle: "preserve-3d", transform: "translateZ(50px)" }}>
                  <h4 className="font-semibold text-white">{testimonials[currentTestimonial].name}</h4>
                  <p className="text-purple-200/60">{testimonials[currentTestimonial].role}</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-4 mt-8">
              <motion.button
                onClick={() => setCurrentTestimonial((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1))}
                className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 relative overflow-hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-6 w-6 text-purple-200" />
              </motion.button>
              <motion.button
                onClick={() => setCurrentTestimonial((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0))}
                className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 relative overflow-hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="h-6 w-6 text-purple-200" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Tasks Section */}
      <section className="w-full py-16 space-bg relative overflow-hidden">
        <motion.div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 className="text-3xl font-bold mb-4 text-white">Featured Tasks</motion.h2>
            <motion.p className="text-purple-200/60">
              Browse through our most popular and high-paying tasks
            </motion.p>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Website Development",
                description: "Create a responsive website using React and Tailwind CSS",
                price: 250,
                category: "Development",
                difficulty: "Medium",
                time: "3-4 days",
              },
              {
                title: "Content Writing",
                description: "Write engaging blog posts about technology trends",
                price: 100,
                category: "Writing",
                difficulty: "Easy",
                time: "1-2 days",
              },
              {
                title: "UI/UX Design",
                description: "Design a mobile app interface with modern aesthetics",
                price: 300,
                category: "Design",
                difficulty: "Hard",
                time: "4-5 days",
              },
            ].map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="feature-card group cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold text-white mb-2">{task.title}</h3>
                <p className="text-purple-200/60 mb-4">{task.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-200">
                    {task.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      task.difficulty === "Easy"
                        ? "bg-green-500/10 text-green-200"
                        : task.difficulty === "Medium"
                        ? "bg-yellow-500/10 text-yellow-200"
                        : "bg-red-500/10 text-red-200"
                    }
                  >
                    {task.difficulty}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-200">
                    {task.time}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">${task.price}</span>
                  <Button variant="outline" className="text-purple-200 border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20">
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 space-bg relative overflow-hidden">
        <motion.div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 className="text-3xl font-bold mb-4 text-white">How It Works</motion.h2>
            <motion.p className="text-purple-200/60">
              Complete tasks in four simple steps
            </motion.p>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Search className="h-8 w-8 text-purple-400" />,
                title: "Browse Tasks",
                description: "Find tasks that match your skills and interests",
              },
              {
                icon: <CheckCircle2 className="h-8 w-8 text-purple-400" />,
                title: "Accept Task",
                description: "Review requirements and accept the task",
              },
              {
                icon: <Upload className="h-8 w-8 text-purple-400" />,
                title: "Submit Work",
                description: "Complete the task and submit your work",
              },
              {
                icon: <Wallet className="h-8 w-8 text-purple-400" />,
                title: "Get Paid",
                description: "Receive payment once work is approved",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="feature-card text-center"
              >
                <motion.div
                  className="mx-auto mb-4 p-3 rounded-full bg-purple-500/10 w-fit"
                  whileHover={{ scale: 1.1 }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-purple-200/60">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Task Categories Section */}
      <section className="w-full py-16 space-bg relative overflow-hidden">
        <motion.div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 className="text-3xl font-bold mb-4 text-white">Task Categories</motion.h2>
            <motion.p className="text-purple-200/60">
              Explore tasks across various categories
            </motion.p>
          </motion.div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Code className="h-8 w-8" />,
                title: "Development",
                count: "250+ Tasks",
                color: "bg-blue-500/10 text-blue-200",
              },
              {
                icon: <Paintbrush className="h-8 w-8" />,
                title: "Design",
                count: "180+ Tasks",
                color: "bg-pink-500/10 text-pink-200",
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Writing",
                count: "320+ Tasks",
                color: "bg-green-500/10 text-green-200",
              },
              {
                icon: <Smartphone className="h-8 w-8" />,
                title: "Mobile",
                count: "150+ Tasks",
                color: "bg-yellow-500/10 text-yellow-200",
              },
              {
                icon: <Settings2 className="h-8 w-8" />,
                title: "Technical",
                count: "200+ Tasks",
                color: "bg-purple-500/10 text-purple-200",
              },
              {
                icon: <Clock4 className="h-8 w-8" />,
                title: "Virtual Assistant",
                count: "120+ Tasks",
                color: "bg-indigo-500/10 text-indigo-200",
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Data Entry",
                count: "280+ Tasks",
                color: "bg-red-500/10 text-red-200",
              },
              {
                icon: <Settings2 className="h-8 w-8" />,
                title: "Other",
                count: "100+ Tasks",
                color: "bg-orange-500/10 text-orange-200",
              },
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`feature-card cursor-pointer ${category.color}`}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div className="mb-4" whileHover={{ scale: 1.1 }}>
                  {category.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="opacity-80">{category.count}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Earnings Calculator Section */}
      <section className="w-full py-16 space-bg relative overflow-hidden">
        <motion.div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 className="text-3xl font-bold mb-4 text-white">Earnings Calculator</motion.h2>
            <motion.p className="text-purple-200/60">
              Calculate your potential earnings based on tasks and hours
            </motion.p>
          </motion.div>
          <motion.div
            className="feature-card max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid gap-6">
              <div>
                <label className="text-white mb-2 block">Task Category</label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value)
                    calculateEarnings(value, hoursPerWeek)
                  }}
                >
                  <SelectTrigger className="bg-purple-500/10 border-purple-500/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a0b2e] border-purple-500/20">
                    <SelectItem value="development" className="text-white hover:bg-purple-500/20">Development</SelectItem>
                    <SelectItem value="design" className="text-white hover:bg-purple-500/20">Design</SelectItem>
                    <SelectItem value="writing" className="text-white hover:bg-purple-500/20">Writing</SelectItem>
                    <SelectItem value="other" className="text-white hover:bg-purple-500/20">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white mb-2 block">Hours per Week</label>
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
                  <div className="flex justify-between text-purple-200/60 text-sm">
                    <span>1 hour</span>
                    <span>{hoursPerWeek} hours</span>
                    <span>40 hours</span>
                  </div>
                </div>
              </div>
              <motion.div 
                className="bg-purple-500/10 p-6 rounded-lg"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.5 }}
              >
                <h4 className="text-white text-lg font-semibold mb-4">Potential Monthly Earnings</h4>
                <motion.div 
                  className="text-4xl font-bold text-white"
                  key={`${earnings.min}-${earnings.max}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ${earnings.min.toLocaleString()} - ${earnings.max.toLocaleString()}
                </motion.div>
                <p className="text-purple-200/60 mt-2">Based on average task rates in selected category</p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div className="text-purple-200/60">
                    <div>Hourly Rate</div>
                    <div className="text-white font-semibold mt-1">
                      ${RATES_BY_CATEGORY[selectedCategory].min} - 
                      ${RATES_BY_CATEGORY[selectedCategory].max}
                    </div>
                  </div>
                  <div className="text-purple-200/60">
                    <div>Weekly Hours</div>
                    <div className="text-white font-semibold mt-1">{hoursPerWeek} hours</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="w-full py-16 space-bg relative overflow-hidden">
        <motion.div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10" style={{ y: faqParallax }}>
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={faqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl font-bold mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={faqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              className="text-purple-200/60"
              initial={{ opacity: 0 }}
              animate={faqInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Find answers to common questions
            </motion.p>
          </motion.div>
          <motion.div
            className="max-w-3xl mx-auto space-y-4"
            initial={{ opacity: 0 }}
            animate={faqInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={faqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                className="feature-card"
                whileHover={{ scale: 1.01 }}
              >
                <motion.button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex items-center justify-between w-full"
                  whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-purple-500/10 rounded-full p-1"
                  >
                    <ChevronDown className="h-5 w-5 text-purple-400" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        className="pt-4 text-purple-200/80"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {faq.answer}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Ready to Transform Section */}
      <section ref={ctaRef} className="w-full py-16 space-bg relative overflow-hidden border-t border-purple-500/10">
        <motion.div
          className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10"
          initial={{ opacity: 0 }}
          animate={ctaInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 50 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Ready to transform your workflow?
            </motion.h2>
            <motion.p
              className="text-lg text-purple-200/60 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={ctaInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Join thousands of teams and freelancers who are already using AptoWorks to streamline their tasks,
              collaborate effectively, and get paid securely.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-purple-500 hover:bg-purple-600 text-white relative overflow-hidden group w-full sm:w-auto"
                >
                  <span className="relative z-10">Get Started for Free</span>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-purple-200 border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 relative overflow-hidden group w-full sm:w-auto"
                >
                  <span className="relative z-10">Schedule a Demo</span>
                  <motion.span
                    className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
      {/* Newsletter Section */}
      <section ref={newsletterRef} className="w-full py-16 space-bg relative overflow-hidden border-t border-purple-500/10">
        <motion.div
          className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10"
          style={{ y: newsletterParallax }}
        >
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={newsletterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={newsletterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Stay Updated
            </motion.h2>
            <motion.p
              className="text-purple-200/60 mb-8"
              initial={{ opacity: 0 }}
              animate={newsletterInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Subscribe to our newsletter for the latest updates and offers
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={newsletterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.input
                type="email"
                placeholder="Enter your email"
                className="flex-1 max-w-md px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white placeholder-purple-200/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white relative overflow-hidden group">
                  <span className="relative z-10">Subscribe</span>
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>



    </main>
  )
}
