"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"

type AuthContextType = {
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = Cookies.get("token")

    if (token) {
      // Simulate fetching user data from token
      // Logic to handle token can be added here
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = ["/", "/login", "/signup", "/tasks", "/reset-password", "/about", "/contact", "/privacy-policy","/forgot-password", "/verify-otp"]

      if (!publicRoutes.includes(pathname) && !pathname.startsWith("/_next")) {
        if (!Cookies.get("token")) {
          router.push("/login")
        }
      }
    }
  }, [isLoading, pathname, router])

  const logout = () => {
    // Clear token from cookies
    Cookies.remove("token")

    router.push("/")
  }

  return <AuthContext.Provider value={{ logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
