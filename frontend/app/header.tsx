"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('token')
    setIsLoggedIn(!!token)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  const handleLogout = () => {
    Cookies.remove('token')
    setIsLoggedIn(false)
    router.push('/')
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-gradient-to-r from-white/95 to-[#EEF2FF]/95 backdrop-blur-md'
    }`}>
      <div className="max-w-6xl mx-auto w-full px-2 sm:px-4 lg:px-1">
        <div className="flex items-center h-16 sm:h-20 w-full">
          {/* Logo */}
          <div className="flex-1 flex items-center min-w-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 overflow-hidden rounded-xl bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#818CF8] flex items-center justify-center group">
                <span className="text-xl sm:text-2xl font-bold text-white relative z-10">A</span>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 via-indigo-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#4F46E5] to-[#818CF8] bg-clip-text text-transparent">AptoWorks</span>
                <span className="text-[10px] sm:text-xs text-[#6366F1] -mt-0.5 sm:-mt-1">Digital Solutions</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 flex-1 justify-center min-w-0">
            <a 
              href="#hero-section"
              onClick={(e) => handleSectionClick(e, 'hero-section')}
              className="text-gray-600 hover:bg-gradient-to-r hover:from-[#4F46E5] hover:to-[#818CF8] hover:bg-clip-text hover:text-transparent transition-all duration-300 cursor-pointer font-medium text-sm lg:text-base"
            >
              About Us
            </a>
            <a 
              href="#contact-section"
              onClick={(e) => handleSectionClick(e, 'contact-section')}
              className="text-gray-600 hover:bg-gradient-to-r hover:from-[#4F46E5] hover:to-[#818CF8] hover:bg-clip-text hover:text-transparent transition-all duration-300 cursor-pointer font-medium text-sm lg:text-base"
            >
              Contact Us
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-end min-w-0">
            {isLoggedIn ? (
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="text-gray-700 hover:bg-gradient-to-r hover:from-[#4F46E5] hover:to-[#818CF8] hover:bg-clip-text hover:text-transparent hover:bg-[#EEF2FF] font-medium text-sm lg:text-base"
              >
                Logout
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700 hover:bg-gradient-to-r hover:from-[#4F46E5] hover:to-[#818CF8] hover:bg-clip-text hover:text-transparent hover:bg-[#EEF2FF] font-medium text-sm lg:text-base">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-[#4F46E5] to-[#818CF8] hover:from-[#4338CA] hover:to-[#6366F1] text-white px-4 lg:px-6 font-medium text-sm lg:text-base transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:bg-gradient-to-r hover:from-[#4F46E5] hover:to-[#818CF8] hover:bg-clip-text hover:text-transparent transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <nav className="flex flex-col py-4 space-y-1">
            <a 
              href="#hero-section"
              onClick={(e) => handleSectionClick(e, 'hero-section')}
              className="px-4 py-3 text-gray-600 hover:bg-gradient-to-r hover:from-[#4F46E5] hover:to-[#818CF8] hover:bg-clip-text hover:text-transparent hover:bg-[#EEF2FF] transition-all duration-300 cursor-pointer font-medium text-sm sm:text-base"
            >
              About Us
            </a>
            <a 
              href="#contact-section"
              onClick={(e) => handleSectionClick(e, 'contact-section')}
              className="px-4 py-3 text-gray-600 hover:bg-gradient-to-r hover:from-[#4F46E5] hover:to-[#818CF8] hover:bg-clip-text hover:text-transparent hover:bg-[#EEF2FF] transition-all duration-300 cursor-pointer font-medium text-sm sm:text-base"
            >
              Contact Us
            </a>
            <div className="flex flex-col gap-2 px-4 py-3">
              {isLoggedIn ? (
                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  className="w-full text-gray-700 hover:bg-gradient-to-r hover:from-[#4F46E5] hover:to-[#818CF8] hover:bg-clip-text hover:text-transparent hover:bg-[#EEF2FF] font-medium text-sm sm:text-base"
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full text-gray-700 hover:bg-gradient-to-r hover:from-[#4F46E5] hover:to-[#818CF8] hover:bg-clip-text hover:text-transparent hover:bg-[#EEF2FF] font-medium text-sm sm:text-base">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full bg-gradient-to-r from-[#4F46E5] to-[#818CF8] hover:from-[#4338CA] hover:to-[#6366F1] text-white font-medium text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}