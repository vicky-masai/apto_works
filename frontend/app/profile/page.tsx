"use client"

import { useState, useEffect } from "react"
import { Camera, CreditCard, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import Leftsidebar from "@/components/Leftsidebar"
import { getProfile, updateProfile } from "@/API/profile"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  })
  console.log("profile", profile);
  
  const router = useRouter()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile()
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        })
      } catch (err) {
        // handle error
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    // Clear all cookies
    Cookies.remove("token")
    // Clear localStorage
    localStorage.clear()
    // Redirect to home page
    router.push("/")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setProfile(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateProfile(profile)
      toast({ title: "Profile updated!", description: "Your profile was updated successfully." })
      // Fetch the updated profile from backend
      const updated = await getProfile()
      setProfile({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
      })
    } catch (err) {
      toast({ title: "Update failed", description: "Could not update profile. Please try again.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePaymentMethodsClick = () => {
    router.push("/wallet");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster />
      <Header isLoggedIn={true} />
      <div className="flex">
        <Leftsidebar />
        <main className={`flex-1 p-6 transition-all duration-300dark:bg-gray-900`}>
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Profile Settings</h1>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>Manage your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src="/placeholder.svg" alt="Profile" />
                          <AvatarFallback>{profile.email.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-lg">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                      <div className="w-full mt-6 space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer" onClick={handlePaymentMethodsClick}>
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Payment Methods</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:w-2/3">
                  <Tabs defaultValue="personal">
                    <TabsList className="grid w-full grid-cols-1">
                      <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    </TabsList>
                    <TabsContent value="personal" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>Update your personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input id="name" value={profile.name} onChange={handleInputChange} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={profile.email} readOnly />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={profile.phone} onChange={handleInputChange} />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button onClick={handleSaveProfile} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

