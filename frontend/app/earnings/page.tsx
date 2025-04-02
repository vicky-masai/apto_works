"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, CreditCard, DollarSign, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data for earnings
const earningsData = [
  {
    id: "1",
    taskName: "Website Registration Task",
    date: "2025-03-28",
    amount: 5.0,
    status: "Paid",
  },
  {
    id: "2",
    taskName: "Social Media Post Engagement",
    date: "2025-03-27",
    amount: 2.5,
    status: "Paid",
  },
  {
    id: "3",
    taskName: "Mobile App Testing",
    date: "2025-03-25",
    amount: 15.0,
    status: "Pending",
  },
  {
    id: "4",
    taskName: "Write Product Review",
    date: "2025-03-22",
    amount: 8.0,
    status: "Paid",
  },
  {
    id: "5",
    taskName: "Telegram Bot Testing",
    date: "2025-03-20",
    amount: 10.0,
    status: "Processing",
  },
  {
    id: "6",
    taskName: "Website Feedback",
    date: "2025-03-18",
    amount: 5.0,
    status: "Paid",
  },
]

export default function EarningsPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("paypal")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [filteredEarnings, setFilteredEarnings] = useState(earningsData)
  const [filter, setFilter] = useState("all")

  // Calculate totals
  const totalEarned = earningsData.reduce((sum, item) => sum + item.amount, 0)
  const availableBalance = earningsData
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => sum + item.amount, 0)
  const pendingBalance = earningsData
    .filter((item) => item.status === "Pending" || item.status === "Processing")
    .reduce((sum, item) => sum + item.amount, 0)

  useEffect(() => {
    if (filter === "all") {
      setFilteredEarnings(earningsData)
    } else {
      setFilteredEarnings(earningsData.filter((item) => item.status.toLowerCase() === filter))
    }
  }, [filter])

  const handleWithdraw = () => {
    setIsWithdrawing(true)

    // Simulate API call
    setTimeout(() => {
      setIsWithdrawing(false)
      setWithdrawSuccess(true)

      // Reset after showing success message
      setTimeout(() => {
        setOpenDialog(false)
        setWithdrawSuccess(false)
        setWithdrawAmount("")
      }, 2000)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Link href="/">TaskHub</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/tasks"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Tasks
            </Link>
            <Link href="/earnings" className="text-sm font-medium text-foreground transition-colors">
              Earnings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Earnings</h1>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>Withdraw Funds</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to withdraw and select your preferred payment method.
                  </DialogDescription>
                </DialogHeader>
                {!withdrawSuccess ? (
                  <>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="amount" className="text-sm font-medium">
                          Amount (Available: ${availableBalance.toFixed(2)})
                        </label>
                        <Input
                          id="amount"
                          type="number"
                          min="1"
                          max={availableBalance}
                          step="0.01"
                          placeholder="Enter amount"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="method" className="text-sm font-medium">
                          Payment Method
                        </label>
                        <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                          <SelectTrigger id="method">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="crypto">Cryptocurrency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {withdrawMethod === "paypal" && (
                        <div className="grid gap-2">
                          <label htmlFor="paypal-email" className="text-sm font-medium">
                            PayPal Email
                          </label>
                          <Input id="paypal-email" type="email" placeholder="your-email@example.com" />
                        </div>
                      )}
                      {withdrawMethod === "bank" && (
                        <div className="space-y-2">
                          <div className="grid gap-2">
                            <label htmlFor="account-name" className="text-sm font-medium">
                              Account Holder Name
                            </label>
                            <Input id="account-name" placeholder="John Doe" />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="account-number" className="text-sm font-medium">
                              Account Number
                            </label>
                            <Input id="account-number" placeholder="XXXXXXXXXXXX" />
                          </div>
                        </div>
                      )}
                      {withdrawMethod === "crypto" && (
                        <div className="grid gap-2">
                          <label htmlFor="wallet-address" className="text-sm font-medium">
                            Wallet Address
                          </label>
                          <Input id="wallet-address" placeholder="Enter your wallet address" />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleWithdraw}
                        disabled={
                          isWithdrawing ||
                          !withdrawAmount ||
                          Number(withdrawAmount) <= 0 ||
                          Number(withdrawAmount) > availableBalance
                        }
                      >
                        {isWithdrawing ? "Processing..." : "Withdraw"}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 space-y-4">
                    <div className="rounded-full bg-green-100 p-3 text-green-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-center">Withdrawal Successful!</h3>
                    <p className="text-center text-muted-foreground">
                      Your withdrawal request for ${Number(withdrawAmount).toFixed(2)} has been processed.
                    </p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalEarned.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Lifetime earnings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${availableBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Available for withdrawal</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${pendingBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Pending clearance</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Earnings History</CardTitle>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all" onValueChange={setFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>View all your earnings from completed tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 bg-muted/50 p-3 text-sm font-medium">
                    <div>Task</div>
                    <div>Date</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {filteredEarnings.map((earning) => (
                    <div key={earning.id} className="grid grid-cols-5 items-center p-3 text-sm border-t">
                      <div className="font-medium">{earning.taskName}</div>
                      <div className="text-muted-foreground">{new Date(earning.date).toLocaleDateString()}</div>
                      <div className="font-medium">${earning.amount.toFixed(2)}</div>
                      <div>
                        <Badge
                          className={
                            earning.status === "Paid"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : earning.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          }
                        >
                          {earning.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your withdrawal methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600"
                      >
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">PayPal</div>
                      <div className="text-sm text-muted-foreground">user@example.com</div>
                    </div>
                  </div>
                  <div>
                    <Badge>Default</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

