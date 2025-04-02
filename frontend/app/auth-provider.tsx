"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

type User = {
  email: string
  type: string
} | null

type AuthContextType = {
  user: User
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, userType: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (isLoggedIn) {
      const email = localStorage.getItem("userEmail") || ""
      const type = localStorage.getItem("userType") || "worker"
      setUser({ email, type })
    }

    setIsLoading(false)
  }, [])

  // Protect routes
  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = ["/", "/login", "/signup"]

      if (!user && !publicRoutes.includes(pathname) && !pathname.startsWith("/_next")) {
        router.push("/login")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store in localStorage
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userEmail", email)
    localStorage.setItem("userType", "worker") // Default to worker

    setUser({ email, type: "worker" })
    setIsLoading(false)
    router.push("/dashboard")
  }

  const signup = async (email: string, password: string, userType: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store in localStorage
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userEmail", email)
    localStorage.setItem("userType", userType)

    setUser({ email, type: userType })
    setIsLoading(false)
    router.push("/dashboard")
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userType")

    setUser(null)
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

