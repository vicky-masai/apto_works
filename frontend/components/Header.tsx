"use client"
import Link from "next/link"
import { DollarSign, Home, LogIn, LogOut, Shield, Upload, User, UserPlus, Wallet, Clipboard, Bell, Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import socket from '../utils/socket'; // import singleton instance
import { getNotification, clearAllNotifications } from "@/API/profile"
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface HeaderProps {
  isLoggedIn?: boolean
}

type Notification = {
  id: number;
  heading: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
};

export function Header({ isLoggedIn = true }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isBlinking, setIsBlinking] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await getNotification()
      setNotifications(response.notifications);
      setNotificationCount(response.notifications.length);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    socket.on('getNotification', (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
    });

    // Cleanup (optional but good practice)
    return () => {
      socket.off('getNotification');
    };
  }, []);

  
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
    <header className="sticky top-0 z-20 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Shield className="h-6 w-6" />
          <Link href="/">TaskHub</Link>
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
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      <button
                        className="text-xs text-red-500 border border-red-200 rounded px-2 py-1 disabled:opacity-50"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await clearAllNotifications();
                            setNotifications([]);
                            setNotificationCount(0);
                          } catch (err) {
                            console.error('Failed to clear notifications', err);
                          }
                        }}
                        disabled={notifications.length === 0}
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm">{notification.heading}</h4>
                            <span className="text-xs text-gray-500">{dayjs(notification.timestamp).fromNow()}</span>
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
              <button 
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white border-b md:hidden">
                <nav className="container px-4 py-4 flex flex-col gap-4">
                  <button 
                    onClick={() => {
                      handleProtectedNavigation("/dashboard");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium text-gray-900 hover:text-primary"
                  >
                    Dashboard
                  </button>
                  <Link 
                    href="/tasks" 
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tasks
                  </Link>
                  <Link 
                    href="/provider/tasks" 
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Posted Tasks
                  </Link>
                </nav>
              </div>
            )}
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
              <button 
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            {/* Mobile Menu for non-logged in users */}
            {isMobileMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white border-b md:hidden">
                <nav className="container px-4 py-4 flex flex-col gap-4">
                  <Link 
                    href="#features" 
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    How It Works
                  </Link>
                  <Link 
                    href="#pricing" 
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  )
} 