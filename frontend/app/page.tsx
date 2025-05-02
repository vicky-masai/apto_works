import Link from "next/link"
import { ArrowRight, CheckCircle, DollarSign, Search, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Footer } from "@/components/Footer"
// import { Header } from "@/components/Header"
import TaskMarketplaceLanding from "./landingPage"
import Header from "./header"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <br />
      <br />
      <main className="flex-1">
        <TaskMarketplaceLanding />
      </main>
      {/* <Footer /> */}
    </div>
  )
}

