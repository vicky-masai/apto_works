"use client"
import Link from "next/link"
import { DollarSign, Home, LogIn, LogOut, Shield, Upload, User, UserPlus, Wallet, Clipboard, Bell, Users } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import socket from '../utils/socket'; // import singleton instance
import { getNotification } from "@/API/profile"
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image'

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
  const [notificationCount, setNotificationCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!Cookies.get("token")) return; // Don't fetch if no token exists
    try {
      const response = await getNotification();
      setNotifications(response.notifications);
      setNotificationCount(response.notifications.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications', err);
      setNotifications([]);
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    if (Cookies.get("token")) {
      fetchNotifications();

      socket.on('getNotification', (data: Notification) => {
        setNotifications((prev) => [data, ...prev]);
        setNotificationCount(prev => prev + 1);
      });

      return () => {
        socket.off('getNotification');
      };
    }
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
    <header className="sticky top-0 z-20 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
        </Link>

        <div className="flex items-center gap-4">
          {/* About Us Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">About Us</span>
              <svg
                className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                <Link
                  href="/about"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  onClick={(e) => {
                    e.preventDefault();
                    const aboutSection = document.getElementById('about');
                    if (aboutSection) {
                      aboutSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = '/about';
                    }
                  }}
                >
                  About Us
                </Link>
                <Link
                  href="/#contact"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = '/#contact';
                    }
                  }}
                >
                  Contact Us
                </Link>
              </div>
            )}
          </div>

          {/* Notifications and User Menu */}
          {isLoggedIn ? (
            <>
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
              <div className="relative" ref={dropdownRef}>
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
                              Sign Up
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
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-purple-600">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 