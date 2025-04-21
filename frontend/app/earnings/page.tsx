"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, CreditCard, DollarSign, Download } from "lucide-react"
import { toast } from "react-hot-toast"

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
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import Leftsidebar from "@/components/Leftsidebar"
import { getUserBalance } from "@/API/money_api"


export default function EarningsPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("paypal")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [upiId, setUpiId] = useState("")
  const [earningsData, setEarningsData]=useState([]);
  const [filteredEarnings, setFilteredEarnings] = useState(earningsData)
  const [filter, setFilter] = useState("all")
  const [totalEarned, settotalEarned]= useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [upiAccounts, setUpiAccounts] = useState([
    { id: 1, upiId: "user@upi", isDefault: true }
  ])

  useEffect(() => {
    if (filter === "all") {
      setFilteredEarnings(earningsData)
    } else {
      setFilteredEarnings(earningsData.filter((item: any) => item.status.toLowerCase() === filter))
    }
  }, [filter, earningsData])
    const fetchUserBalance = async () => {
      try {
        const data = await getUserBalance();
        // Assuming the data structure returned from the API is similar to earningsData
        setFilteredEarnings(data.earningsHistory);
        setEarningsData(data.earningsHistory);
        settotalEarned(data.totalEarnings)
        setAvailableBalance(data.availableBalance)
        setPendingBalance(data.pending)
      } catch (error) {
        console.error('Error fetching user balance:', error);
      }
    };
    useEffect(() => {
      fetchUserBalance();
    }, []);

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

  const downloadEarningsCSV = () => {
    // Define CSV headers
    const headers = ['Task ID', 'Task', 'Date', 'Amount', 'Status'];
    
    // Convert earnings data to CSV format
    const csvData = filteredEarnings.map((earning: { taskId: string; taskName: string; date: string; amount: number; status: string; }) => [
      earning.taskId || '',
      earning.taskName,
      new Date(earning.date).toLocaleDateString(),
      earning.amount.toFixed(2),
      earning.status
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create a Blob containing the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link and trigger download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `earnings_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddUpi = () => {
    if (!upiId.trim()) {
      toast.error("Please enter a valid UPI ID")
      return
    }

    // Check for duplicate UPI
    if (upiAccounts.some(acc => acc.upiId === upiId)) {
      toast.error("This UPI ID already exists")
      return
    }

    const newUpi = {
      id: Date.now(),
      upiId: upiId,
      isDefault: upiAccounts.length === 0
    }

    setUpiAccounts([...upiAccounts, newUpi])
    setUpiId("")
    setOpenPaymentDialog(false)
    toast.success("UPI added successfully")
  }

  const makeDefault = (id: number) => {
    setUpiAccounts(upiAccounts.map(acc => ({
      ...acc,
      isDefault: acc.id === id
    })))
  }

  const removeUpi = (id: number) => {
    const isDefault = upiAccounts.find(acc => acc.id === id)?.isDefault
    if (isDefault && upiAccounts.length > 1) {
      toast.error("Please set another UPI as default first")
      return
    }
    
    setUpiAccounts(prev => {
      const filtered = prev.filter(acc => acc.id !== id)
      // If we removed default and have other UPIs, make first one default
      if (isDefault && filtered.length > 0) {
        filtered[0].isDefault = true
      }
      return filtered
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isLoggedIn={true} />
      <div className="flex">
        <Leftsidebar />
        <main className={`flex-1 p-6 transition-all duration-300 ml-[256px] dark:bg-gray-900`}>
          <div className="container mx-auto max-w-7xl">
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
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={downloadEarningsCSV}>
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
                      <div>Task Id</div>
                        <div>Task</div>
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Status</div>
                      </div>
                      {filteredEarnings.map((earning: { taskId:number; taskName: string; date: string; amount: number; status: string }, i: number) => (
                        <div key={i} className="grid grid-cols-5 items-center p-3 text-sm border-t">
                          <div>{(earning?.taskId) || (i+1)}</div>
                          <div className="font-medium">{earning.taskName}</div>
                          <div className="text-muted-foreground">{new Date(earning.date).toLocaleDateString()}</div>
                          <div className="font-medium">${earning.amount.toFixed(2)}</div>
                          <div>
                            <Badge
                              className={
                                earning.status === "Paid" || earning.status === "Completed"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : earning.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                    : earning.status === "Review"
                                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                      : earning.status === "Rejected"
                                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                                        : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              }
                            >
                              {earning.status}
                            </Badge>
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
                  <CardDescription>Manage your UPI accounts for withdrawals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upiAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
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
                              <rect width="20" height="12" x="2" y="6" rx="2" />
                              <path d="M12 12h.01" />
                              <path d="M2 12h20" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">UPI ID</div>
                            <div className="text-sm text-muted-foreground">{account.upiId}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {account.isDefault ? (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">Default</Badge>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => makeDefault(account.id)}
                              >
                                Make Default
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:bg-red-50"
                                onClick={() => removeUpi(account.id)}
                              >
                                Remove
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Add New UPI
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add UPI Account</DialogTitle>
                          <DialogDescription>
                            Enter your UPI ID to add a new payment method
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label htmlFor="upi-id" className="text-sm font-medium">
                              UPI ID
                            </label>
                            <Input
                              id="upi-id"
                              placeholder="Enter your UPI ID (e.g. name@upi)"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setOpenPaymentDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddUpi}>
                            Add UPI
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

