import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { LandingPage } from "./components/LandingPage/LandingPage"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <LandingPage />
      <Footer />
    </div>
  )
}

