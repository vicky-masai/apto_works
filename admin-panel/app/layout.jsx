import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Admin Panel",
  description: "Super Admin Panel",
  generator: 'v0.dev'
}

import ClientLayout from '@/components/ClientLayout'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}


import './globals.css'