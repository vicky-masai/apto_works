"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, CreditCard, DollarSign, Download, Menu } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { currencyTypes } from "@/utils/currencyTypes"
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
import { getAllPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/API/payment_method.js"

// Add these interfaces at the top of the file after imports
interface UPIAccount {
  id: number;
  upiId: string;
  isDefault: boolean;
  isActive?: boolean;
  methodType?: string;
}

export default function EarningsPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [selectedUpiId, setSelectedUpiId] = useState("")
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
  const [upiAccounts, setUpiAccounts] = useState<UPIAccount[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (filter === "all") {
      setFilteredEarnings(earningsData)
    } else {
      setFilteredEarnings(earningsData.filter((item: any) => item.status.toLowerCase() === filter))
    }
  }, [filter, earningsData])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceData, paymentMethods] = await Promise.all([
          getUserBalance(),
          getAllPaymentMethods()
        ]);

        setFilteredEarnings(balanceData.earningsHistory as any);
        setEarningsData(balanceData.earningsHistory as any);
        settotalEarned(balanceData.totalEarnings);
        setAvailableBalance(balanceData.availableBalance);
        setPendingBalance(balanceData.pending);
        setUpiAccounts(paymentMethods);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load some data. Please try again.');
      }
    };

    fetchData();
  }, []);

  const handleWithdraw = async () => {
    if (!selectedUpiId || !withdrawAmount) {
      toast.error("Please select a UPI ID and enter an amount");
      return;
    }

    setIsWithdrawing(true);
    try {
      // You'll need to implement this API function
      // await initiateWithdrawal({
      //   amount: Number(withdrawAmount),
      //   upiId: selectedUpiId,
      // });

      setWithdrawSuccess(true);
      toast.success("Withdrawal request initiated successfully");

      // Reset after showing success message
      setTimeout(() => {
        setOpenDialog(false);
        setWithdrawSuccess(false);
        setWithdrawAmount("");
        setSelectedUpiId("");
      }, 2000);
    } catch (error) {
      console.error('Failed to initiate withdrawal:', error);
      toast.error("Failed to initiate withdrawal. Please try again.");
    } finally {
      setIsWithdrawing(false);
    }
  };

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
    link.setAttribute('download', `earnings_history_{currencyTypes[0]?.symbol}{new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddUpi = async () => {
    if (!upiId.trim()) {
      toast.error("Please enter a valid UPI ID")
      return
    }

    // Check for duplicate UPI
    if (upiAccounts.some(acc => acc.upiId === upiId)) {
      toast.error("This UPI ID already exists")
      return
    }

    try {
      const isFirst = upiAccounts.length === 0;
      
      // Call the API to add payment method
      await addPaymentMethod({
        upiId: upiId,
        methodType: "UPI",
        isDefault: isFirst // Only set as default if it's the first UPI ID
      });
      
      // Refresh payment methods
      const paymentMethods = await getAllPaymentMethods();
      setUpiAccounts(paymentMethods);
      
      setUpiId("");
      setOpenPaymentDialog(false);
      toast.success("UPI ID added successfully");
    } catch (error) {
      console.error('Failed to add UPI ID:', error);
      toast.error("Failed to add UPI ID. Please try again.");
    }
  };

  const makeDefault = async (id: number) => {
    try {
      // First, find the current default UPI
      const currentDefault = upiAccounts.find(acc => acc.isDefault);
      
      if (currentDefault?.id === id) {
        toast.success("This UPI ID is already set as default");
        return;
      }

      // Update the selected UPI to be default
      await updatePaymentMethod(id.toString(), { isDefault: true });
      
      // Refresh payment methods
      const paymentMethods = await getAllPaymentMethods();
      setUpiAccounts(paymentMethods);
      toast.success("Default UPI updated successfully");
    } catch (error) {
      console.error('Failed to set default UPI ID:', error);
      toast.error("Failed to update default UPI. Please try again.");
    }
  };

  const deleteUpi = async (id: number) => {
    try {
      const upiToDelete = upiAccounts.find(acc => acc.id === id);
      
      if (!upiToDelete) {
        toast.error("UPI ID not found");
        return;
      }

      if (upiToDelete.isDefault) {
        toast.error("Cannot delete default UPI ID. Please set another UPI as default first.");
        return;
      }

      // Call API to delete the payment method
      await deletePaymentMethod(id.toString());
      
      // Refresh payment methods
      const paymentMethods = await getAllPaymentMethods();
      setUpiAccounts(paymentMethods);
      toast.success("UPI ID deleted successfully");
    } catch (error) {
      console.error('Failed to delete UPI ID:', error);
      toast.error("Failed to delete UPI ID. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sidebar toggle button for mobile, above Header */}
      <div className="md:hidden p-2">
        <button
          className="p-2 focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      <Header isLoggedIn={true} />
      <div className="flex">
        {/* Sidebar overlay for mobile/tablet */}
        <div className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`fixed z-50 inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block`}>
          <Leftsidebar />
        </div>
        <main className="flex-1 p-2 sm:p-4 md:p-6 transition-all duration-300 dark:bg-gray-900">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Earnings</h1>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currencyTypes[0]?.symbol}{totalEarned.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currencyTypes[0]?.symbol}{availableBalance.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Available for withdrawal</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currencyTypes[0]?.symbol}{pendingBalance.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Pending clearance</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <CardTitle>Earnings History</CardTitle>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Select defaultValue="all" onValueChange={setFilter}>
                        <SelectTrigger className="w-full sm:w-[130px]">
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
                    <div className="rounded-md border overflow-x-auto">
                      <div className="min-w-[600px] grid grid-cols-5 bg-muted/50 p-3 text-sm font-medium">
                        <div>Task Id</div>
                        <div>Task</div>
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Status</div>
                      </div>
                      {filteredEarnings.map((earning: { taskId:number; taskName: string; date: string; amount: number; status: string }, i: number) => (
                        <div key={i} className="min-w-[600px] grid grid-cols-5 items-center p-3 text-sm border-t">
                          <div>{(earning?.taskId) || (i+1)}</div>
                          <div className="font-medium">{earning.taskName}</div>
                          <div className="text-muted-foreground">{new Date(earning.date).toLocaleDateString()}</div>
                          <div className="font-medium">{currencyTypes[0]?.symbol}{earning.amount.toFixed(2)}</div>
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
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-md">
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
                              className="text-blue-600 dark:text-blue-400"
                            >
                              <rect width="20" height="12" x="2" y="6" rx="2" />
                              <path d="M12 12h.01" />
                              <path d="M2 12h20" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">{account.upiId}</div>
                            <div className="text-sm text-muted-foreground">UPI ID</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {account.isDefault ? (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                              Default
                            </Badge>
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
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => deleteUpi(account.id)}
                              >
                                Delete
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

