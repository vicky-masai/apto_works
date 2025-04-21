"use client"
import Link from "next/link"
import { DollarSign, Home, LogIn, LogOut, Shield, Upload, User, UserPlus, Wallet, Clipboard } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

interface HeaderProps {
  isLoggedIn?: boolean
}

export function Header({ isLoggedIn = true }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = Cookies.get("token");
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/");
  };

  const handleProtectedNavigation = (path: string) => {
    if (!token) {
      router.push("/login");
      return;
    }
    router.push(path);
  };

  return (
    <header className="sticky top-0 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          {/* <Shield className="h-6 w-6" /> */}
          {/* <Link href="/">TaskHub</Link> */}
        </div>
        {isLoggedIn ? (
          <>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => handleProtectedNavigation("/dashboard")} 
                className="text-sm font-medium text-gray-900 hover:text-primary"
              >
                Dashboard
              </button>
              <Link href="/tasks" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Tasks
              </Link>
              <Link href="/provider/tasks" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                My Posted Tasks
              </Link>
            </nav>
            <div className="relative flex items-center gap-4" ref={dropdownRef}>
              <button onClick={toggleDropdown} className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
                <User className="h-5 w-5 text-gray-600" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                  <div className="py-1">
                    {token ? (
                      <>
                        <button 
                          onClick={() => handleProtectedNavigation("/dashboard")} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="flex items-center">
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                          </span>
                        </button>
                        <button 
                          onClick={() => handleProtectedNavigation("/post-task")} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            Post a Task
                          </span>
                        </button>
                        <button 
                          onClick={() => handleProtectedNavigation("/provider/tasks")} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="flex items-center">
                            <Clipboard className="h-4 w-4 mr-2" />
                            My Posted Tasks
                          </span>
                        </button>
                        <button 
                          onClick={() => handleProtectedNavigation("/earnings")} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Earnings
                          </span>
                        </button>
                        <button 
                          onClick={() => handleProtectedNavigation("/wallet")} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="flex items-center">
                            <Wallet className="h-4 w-4 mr-2" />
                            Wallet
                          </span>
                        </button>
                        <button 
                          onClick={() => handleProtectedNavigation("/profile")} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </span>
                        </button>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <span className="flex items-center">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <span className="flex items-center">
                            <LogIn className="h-4 w-4 mr-2" />
                            Login
                          </span>
                        </Link>
                        <Link href="/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <span className="flex items-center">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Signup
                          </span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
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