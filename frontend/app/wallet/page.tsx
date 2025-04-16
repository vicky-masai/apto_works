"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, CreditCard, DollarSign, Plus, Wallet } from "lucide-react"

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { getBalance, getBalanceHistory, getUserWithdrawalRequests } from "@/API/money_api.js"

// Mock transaction data
const transactionsData = [
  {
    id: "1",
    type: "deposit",
    amount: 100.0,
    date: "2025-03-28",
    status: "completed",
    method: "Credit Card",
  },
  {
    id: "2",
    type: "withdrawal",
    amount: 25.0,
    date: "2025-03-25",
    status: "completed",
    method: "PayPal",
  },
  {
    id: "3",
    type: "earning",
    amount: 15.0,
    date: "2025-03-22",
    status: "completed",
    method: "Task Completion",
  },
  {
    id: "4",
    type: "deposit",
    amount: 50.0,
    date: "2025-03-20",
    status: "completed",
    method: "Bank Transfer",
  },
  {
    id: "5",
    type: "withdrawal",
    amount: 30.0,
    date: "2025-03-18",
    status: "processing",
    method: "Bank Transfer",
  },
]

export default function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [depositAmount, setDepositAmount] = useState("")
  const [depositMethod, setDepositMethod] = useState("upi")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("upi")
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [depositSuccess, setDepositSuccess] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [openDepositDialog, setOpenDepositDialog] = useState(false)
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false)
  const [transactions, setTransactions] = useState(transactionsData)
  const [filter, setFilter] = useState("all")
  const [upiAccounts, setUpiAccounts] = useState([
    { id: 1, upiId: "default@upi", isDefault: true }
  ])
  const [newUpiId, setNewUpiId] = useState("")
  const [openAddUpiDialog, setOpenAddUpiDialog] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getBalance();
        setBalance(data.balance);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    fetchBalance();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true
    return transaction.type === filter
  })

  const handleDeposit = () => {
    setIsDepositing(true)

    // Simulate API call
    setTimeout(() => {
      setIsDepositing(false)
      setDepositSuccess(true)

      // Update balance
      const amount = Number.parseFloat(depositAmount)
      setBalance((prevBalance) => prevBalance + amount)

      // Add transaction
      const newTransaction = {
        id: (transactions.length + 1).toString(),
        type: "deposit",
        amount: amount,
        date: new Date().toISOString().split("T")[0],
        status: "completed",
        method: depositMethod === "credit-card" ? "Credit Card" : depositMethod === "bank" ? "Bank Transfer" : "PayPal",
      }

      setTransactions([newTransaction, ...transactions])

      // Reset after showing success message
      setTimeout(() => {
        setOpenDepositDialog(false)
        setDepositSuccess(false)
        setDepositAmount("")
      }, 2000)
    }, 1500)
  }

  const handleWithdraw = () => {
    setIsWithdrawing(true)

    // Simulate API call
    setTimeout(() => {
      setIsWithdrawing(false)
      setWithdrawSuccess(true)

      // Update balance
      const amount = Number.parseFloat(withdrawAmount)
      setBalance((prevBalance) => prevBalance - amount)

      // Add transaction
      const newTransaction = {
        id: (transactions.length + 1).toString(),
        type: "withdrawal",
        amount: amount,
        date: new Date().toISOString().split("T")[0],
        status: "processing",
        method: withdrawMethod === "paypal" ? "PayPal" : withdrawMethod === "bank" ? "Bank Transfer" : "Cryptocurrency",
      }

      setTransactions([newTransaction, ...transactions])

      // Reset after showing success message
      setTimeout(() => {
        setOpenWithdrawDialog(false)
        setWithdrawSuccess(false)
        setWithdrawAmount("")
      }, 2000)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header isLoggedIn={true} />
      <main className="flex-1 container py-6 m-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Wallet</h1>
            <div className="flex gap-2">
              <Dialog open={openDepositDialog} onOpenChange={setOpenDepositDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Money
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Money to Wallet</DialogTitle>
                    <DialogDescription>
                      Enter the amount and your UPI ID to add funds to your wallet.
                    </DialogDescription>
                  </DialogHeader>
                  {!depositSuccess ? (
                    <>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label htmlFor="amount" className="text-sm font-medium">
                            Amount (₹)
                          </label>
                          <Input
                            id="amount"
                            type="number"
                            min="5"
                            step="0.01"
                            placeholder="Enter amount"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="upi-id" className="text-sm font-medium">
                            Select UPI ID
                          </label>
                          <Select defaultValue={upiAccounts.find(acc => acc.isDefault)?.id.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select UPI ID" />
                            </SelectTrigger>
                            <SelectContent>
                              {upiAccounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                  {acc.upiId} {acc.isDefault && "(Default)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDepositDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleDeposit}
                          disabled={isDepositing || !depositAmount || Number(depositAmount) <= 0}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isDepositing ? "Processing..." : "Add Funds"}
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
                      <h3 className="text-xl font-medium text-center">Funds Added Successfully!</h3>
                      <p className="text-center text-gray-500">
                        ${Number(depositAmount).toFixed(2)} has been added to your wallet.
                      </p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog open={openWithdrawDialog} onOpenChange={setOpenWithdrawDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ArrowDown className="mr-2 h-4 w-4" /> Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Enter the amount and select your UPI ID for withdrawal.
                    </DialogDescription>
                  </DialogHeader>
                  {!withdrawSuccess ? (
                    <>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label htmlFor="withdraw-amount" className="text-sm font-medium">
                            Amount (Available: ₹{balance.toFixed(2)})
                          </label>
                          <Input
                            id="withdraw-amount"
                            type="number"
                            min="1"
                            max={balance}
                            step="0.01"
                            placeholder="Enter amount"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="withdraw-upi" className="text-sm font-medium">
                            Select UPI ID
                          </label>
                          <Select defaultValue={upiAccounts.find(acc => acc.isDefault)?.id.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select UPI ID" />
                            </SelectTrigger>
                            <SelectContent>
                              {upiAccounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                  {acc.upiId} {acc.isDefault && "(Default)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenWithdrawDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleWithdraw}
                          disabled={
                            isWithdrawing ||
                            !withdrawAmount ||
                            Number(withdrawAmount) <= 0 ||
                            Number(withdrawAmount) > balance
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
                      <h3 className="text-xl font-medium text-center">Withdrawal Initiated!</h3>
                      <p className="text-center text-gray-500">
                        Your withdrawal request for ${Number(withdrawAmount).toFixed(2)} has been processed and is
                        pending approval.
                      </p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <Wallet className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
                <p className="text-xs text-gray-500">Available for tasks and withdrawals</p>
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$150.00</div>
                <p className="text-xs text-gray-500">All-time deposits</p>
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
                <ArrowDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$55.00</div>
                <p className="text-xs text-gray-500">All-time withdrawals</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
                <Select defaultValue="all" onValueChange={setFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="earning">Earnings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>View all your wallet transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 bg-gray-50 p-3 text-sm font-medium">
                    <div>Type</div>
                    <div>Date</div>
                    <div>Amount</div>
                    <div>Method</div>
                    <div>Status</div>
                  </div>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <div key={transaction.id} className="grid grid-cols-5 items-center p-3 text-sm border-t">
                        <div className="font-medium flex items-center">
                          {transaction.type === "deposit" ? (
                            <ArrowUp className="h-4 w-4 text-green-500 mr-2" />
                          ) : transaction.type === "withdrawal" ? (
                            <ArrowDown className="h-4 w-4 text-red-500 mr-2" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-blue-500 mr-2" />
                          )}
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </div>
                        <div className="text-gray-500">{new Date(transaction.date).toLocaleDateString()}</div>
                        <div
                          className={`font-medium ${
                            transaction.type === "deposit" || transaction.type === "earning"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "deposit" || transaction.type === "earning" ? "+" : "-"}$
                          {transaction.amount.toFixed(2)}
                        </div>
                        <div>{transaction.method}</div>
                        <div>
                          <Badge
                            className={
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
                            }
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No transactions found</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle>UPI Accounts</CardTitle>
              <CardDescription>Manage your UPI IDs for deposits and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upiAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
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
                        <div className="font-medium">{account.upiId}</div>
                        <div className="text-sm text-gray-500">UPI ID</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {account.isDefault ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">Default</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUpiAccounts(upiAccounts.map(acc => ({
                              ...acc,
                              isDefault: acc.id === account.id
                            })))
                          }}
                        >
                          Make Default
                        </Button>
                      )}
                      {!account.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUpiAccounts(upiAccounts.filter(acc => acc.id !== account.id))
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Dialog open={openAddUpiDialog} onOpenChange={setOpenAddUpiDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Add UPI ID
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New UPI ID</DialogTitle>
                      <DialogDescription>
                        Enter your UPI ID to add it to your account
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="new-upi" className="text-sm font-medium">
                          UPI ID
                        </label>
                        <Input
                          id="new-upi"
                          placeholder="yourname@upi"
                          value={newUpiId}
                          onChange={(e) => setNewUpiId(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenAddUpiDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (newUpiId && !upiAccounts.some(acc => acc.upiId === newUpiId)) {
                            const isFirst = upiAccounts.length === 0;
                            setUpiAccounts([...upiAccounts, {
                              id: upiAccounts.length + 1,
                              upiId: newUpiId,
                              isDefault: isFirst
                            }]);
                            setNewUpiId("");
                            setOpenAddUpiDialog(false);
                          }
                        }}
                        disabled={!newUpiId || upiAccounts.some(acc => acc.upiId === newUpiId)}
                      >
                        Add UPI
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

