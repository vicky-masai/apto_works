"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Linkedin, Twitter, Facebook, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-[#0a0118] text-gray-300 py-16 relative overflow-hidden">
      {/* 3D Animated Background */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          className="absolute w-full h-full"
          animate={{
            backgroundImage: [
              "radial-gradient(circle at 0% 0%, #2d1b4b 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, #2d1b4b 0%, transparent 50%)",
              "radial-gradient(circle at 0% 100%, #2d1b4b 0%, transparent 50%)",
              "radial-gradient(circle at 100% 0%, #2d1b4b 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, #2d1b4b 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-1 md:col-span-1"
          >
            <div className="flex items-center gap-2 mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold"
              >
                AW
              </motion.div>
              <span className="text-xl font-bold text-white">AptoWorks</span>
            </div>
            <p className="text-gray-400 mb-6">
              Your all-in-one task management solution. Connect, collaborate, and get paid with ease on India's most powerful freelance platform.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Linkedin className="h-5 w-5" />, href: "#" },
                { icon: <Twitter className="h-5 w-5" />, href: "#" },
                { icon: <Facebook className="h-5 w-5" />, href: "#" },
                { icon: <Instagram className="h-5 w-5" />, href: "#" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Product Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white font-semibold mb-6">Product</h3>
            <ul className="space-y-4">
              {[
                { text: "Features", href: "#" },
                { text: "Pricing", href: "#" },
                { text: "Integrations", href: "#" },
                { text: "Changelog", href: "#" },
                { text: "Roadmap", href: "#" },
              ].map((item, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link href={item.href} className="text-gray-400 hover:text-purple-400 transition-colors">
                    {item.text}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-white font-semibold mb-6">Resources</h3>
            <ul className="space-y-4">
              {[
                { text: "Blog", href: "#" },
                { text: "Help Center", href: "#" },
                { text: "API Docs", href: "#" },
                { text: "Community", href: "#" },
                { text: "Status", href: "#" },
              ].map((item, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link href={item.href} className="text-gray-400 hover:text-purple-400 transition-colors">
                    {item.text}
          </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-white font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              {[
                { text: "About Us", href: "#" },
                { text: "Careers", href: "#" },
                { text: "Contact", href: "#" },
                { text: "Partners", href: "#" },
                { text: "Press", href: "#" },
              ].map((item, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link href={item.href} className="text-gray-400 hover:text-purple-400 transition-colors">
                    {item.text}
          </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400">© 2025 AptoWorks. All rights reserved.</p>
          <div className="flex gap-6">
            {[
              { text: "Terms", href: "/terms" },
              { text: "Privacy", href: "/privacy" },
              { text: "Cookies", href: "#" },
              { text: "Security", href: "#" },
            ].map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                className="text-gray-400 hover:text-purple-400 transition-colors"
                whileHover={{ y: -2 }}
              >
                {item.text}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
} 