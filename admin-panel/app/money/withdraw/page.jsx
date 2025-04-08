"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function WithdrawMoneyPage() {
  // Mock data for withdrawal requests
  const [withdrawals, setWithdrawals] = useState([
    {
      id: 1,
      userId: 1,
      userName: "John Doe",
      amount: 300,
      method: "Bank Transfer",
      accountDetails: "XXXX-XXXX-1234",
      date: "2025-04-08",
      status: "pending",
    },
    {
      id: 2,
      userId: 2,
      userName: "Jane Smith",
      amount: 500,
      method: "PayPal",
      accountDetails: "jane@example.com",
      date: "2025-04-07",
      status: "pending",
    },
    {
      id: 3,
      userId: 3,
      userName: "Mike Johnson",
      amount: 150,
      method: "Bank Transfer",
      accountDetails: "XXXX-XXXX-5678",
      date: "2025-04-06",
      status: "pending",
    },
    {
      id: 4,
      userId: 4,
      userName: "Sarah Williams",
      amount: 700,
      method: "PayPal",
      accountDetails: "sarah@example.com",
      date: "2025-04-05",
      status: "approved",
    },
    {
      id: 5,
      userId: 5,
      userName: "David Brown",
      amount: 250,
      method: "Bank Transfer",
      accountDetails: "XXXX-XXXX-9012",
      date: "2025-04-04",
      status: "rejected",
    },
    {
      id: 6,
      userId: 6,
      userName: "Emily Davis",
      amount: 1000,
      method: "PayPal",
      accountDetails: "emily@example.com",
      date: "2025-04-03",
      status: "approved",
    },
    {
      id: 7,
      userId: 7,
      userName: "Robert Wilson",
      amount: 180,
      method: "Bank Transfer",
      accountDetails: "XXXX-XXXX-3456",
      date: "2025-04-02",
      status: "rejected",
    },
    {
      id: 8,
      userId: 8,
      userName: "Lisa Taylor",
      amount: 450,
      method: "PayPal",
      accountDetails: "lisa@example.com",
      date: "2025-04-01",
      status: "approved",
    },
  ])

  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="w-fit px-3 py-1 bg-green-500">Approved</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="w-fit px-3 py-1 text-yellow-500 border-yellow-500">
            Pending
          </Badge>
        )
      case "rejected":
        return <Badge className="w-fit px-3 py-1" variant="destructive">Rejected</Badge>
      default:
        return null
    }
  }

  const handleApprove = (id) => {
    setWithdrawals(
      withdrawals.map((withdrawal) => (withdrawal.id === id ? { ...withdrawal, status: "approved" } : withdrawal)),
    )
    setIsApproveDialogOpen(false)
  }

  const handleReject = (id) => {
    setWithdrawals(
      withdrawals.map((withdrawal) => (withdrawal.id === id ? { ...withdrawal, status: "rejected" } : withdrawal)),
    )
    setIsRejectDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdraw Money Requests</h1>
          <p className="text-muted-foreground">Manage withdrawal requests from users</p>
        </div>
        <Button className="w-fit px-3 py-1 rounded-full">Export Data</Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex items-center justify-center w-full h-10">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search withdrawals..." className="pl-8" />
        </div>
        <Button className="w-fit px-5 py-1 rounded-full" variant="outline">Filter</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Method</th>
                  <th className="text-left py-3 px-4 font-medium">Account Details</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">#{withdrawal.id}</td>
                    <td className="py-3 px-4 font-medium">{withdrawal.userName}</td>
                    <td className="py-3 px-4">${withdrawal.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">{withdrawal.method}</td>
                    <td className="py-3 px-4">{withdrawal.accountDetails}</td>
                    <td className="py-3 px-4">{withdrawal.date}</td>
                    <td className="py-3 px-4 ">{getStatusBadge(withdrawal.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {withdrawal.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-fit px-3 py-1 text-green-500 border-green-500 hover:bg-green-50 rounded-2xl"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal)
                                setIsApproveDialogOpen(true)
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-500 hover:bg-red-50 rounded-2xl"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal)
                                setIsRejectDialogOpen(true)
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button className="w-fit px-3 py-1 rounded-full" variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal Request</DialogTitle>
            <DialogDescription>Are you sure you want to approve this withdrawal request?</DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="py-4">
              <p>
                <strong>User:</strong> {selectedWithdrawal.userName}
              </p>
              <p>
                <strong>Amount:</strong> ${selectedWithdrawal.amount.toFixed(2)}
              </p>
              <p>
                <strong>Method:</strong> {selectedWithdrawal.method}
              </p>
              <p>
                <strong>Account:</strong> {selectedWithdrawal.accountDetails}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={() => selectedWithdrawal && handleApprove(selectedWithdrawal.id)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal Request</DialogTitle>
            <DialogDescription>Are you sure you want to reject this withdrawal request?</DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="py-4">
              <p>
                <strong>User:</strong> {selectedWithdrawal.userName}
              </p>
              <p>
                <strong>Amount:</strong> ${selectedWithdrawal.amount.toFixed(2)}
              </p>
              <p>
                <strong>Method:</strong> {selectedWithdrawal.method}
              </p>
              <p>
                <strong>Account:</strong> {selectedWithdrawal.accountDetails}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => selectedWithdrawal && handleReject(selectedWithdrawal.id)}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
