"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'
    }`}>
      <div className="max-w-6xl mx-auto w-full px-2 sm:px-4 lg:px-1">
        <div className="flex items-center h-16 sm:h-20 w-full">
          {/* Logo */}
          <div className="flex-1 flex items-center min-w-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 overflow-hidden rounded-xl bg-purple-600 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-white">A</span>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 to-purple-800/50"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-gray-900">AptoWorks</span>
                <span className="text-[10px] sm:text-xs text-purple-600 -mt-0.5 sm:-mt-1">Digital Solutions</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 flex-1 justify-center min-w-0">
            <a 
              href="#hero-section"
              onClick={(e) => handleSectionClick(e, 'hero-section')}
              className="text-gray-600 hover:text-purple-600 transition-colors cursor-pointer font-medium text-sm lg:text-base"
            >
              About Us
            </a>
            <a 
              href="#contact-section"
              onClick={(e) => handleSectionClick(e, 'contact-section')}
              className="text-gray-600 hover:text-purple-600 transition-colors cursor-pointer font-medium text-sm lg:text-base"
            >
              Contact Us
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-end min-w-0">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium text-sm lg:text-base">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 lg:px-6 font-medium text-sm lg:text-base">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
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
              className="px-4 py-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer font-medium text-sm sm:text-base"
            >
              About Us
            </a>
            <a 
              href="#contact-section"
              onClick={(e) => handleSectionClick(e, 'contact-section')}
              className="px-4 py-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer font-medium text-sm sm:text-base"
            >
              Contact Us
            </a>
            <div className="flex flex-col gap-2 px-4 py-3">
              <Link href="/login">
                <Button variant="ghost" className="w-full text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium text-sm sm:text-base">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm sm:text-base">
                  Sign Up
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}