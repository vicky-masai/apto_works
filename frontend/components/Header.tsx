"use client"
import Link from "next/link"
import { DollarSign, Home, LogIn, LogOut, Shield, Upload, User, UserPlus, Wallet, Clipboard, Bell } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

interface HeaderProps {
  isLoggedIn?: boolean
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export function Header({ isLoggedIn = true }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isBlinking, setIsBlinking] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Task Assigned",
      message: "You have been assigned a new task: UI Development",
      time: "2 minutes ago",
      isRead: false
    },
    {
      id: 2,
      title: "Task Update",
      message: "Your task 'API Integration' has been approved",
      time: "1 hour ago",
      isRead: false
    },
    {
      id: 3,
      title: "Payment Received",
      message: "You received payment for task: Database Design",
      time: "2 hours ago",
      isRead: false
    }
  ]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const token = Cookies.get("token");
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsBlinking(true);
    const timer = setTimeout(() => {
      setIsBlinking(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [notificationCount]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
    setNotificationCount(prev => Math.max(0, prev - 1));
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
            {/* <nav className="hidden md:flex items-center gap-6">
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
            </nav> */}
            <div className="relative flex items-center gap-4">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={toggleNotifications}
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
                >
                  <Bell className={`h-5 w-5 ${isBlinking ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
                {isNotificationOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative flex items-center gap-4" ref={dropdownRef}>
                <div className="relative">
                  <button 
                    onClick={toggleDropdown}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                    <div className="py-1">
                      {token ? (
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <span className="flex items-center">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </span>
                        </button>
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