import Link from "next/link"
import { Shield } from "lucide-react"

import { Button } from "@/components/ui/button"

interface HeaderProps {
  isLoggedIn?: boolean
}

export function Header({ isLoggedIn = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Shield className="h-6 w-6" />
          <Link href="/">TaskHub</Link>
        </div>
        {isLoggedIn ? (
          <>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-gray-900">
                Dashboard
              </Link>
              <Link href="/tasks" className="text-sm font-medium text-gray-600 hover:text-gray-900">
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
          </>
        ) : (
          <>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                How It Works
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  )
} 