"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, XCircle, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function WithdrawMoneyPage() {
  const [withdrawals, setWithdrawals] = useState([
    {
      id: 1,
      userId: 1,
      userName: "John Doe",
      amount: 300,
      userUpiId: "user@upi",
      companyUpiId: "company@upi",
      date: "2025-04-08",
      status: "pending",
      reference: "REF123456",
      screenshot: "/payments/screenshot1.jpg",
      rejectionReason: ""
    },
    {
      id: 2,
      userId: 2,
      userName: "Jane Smith",
      amount: 500,
      userUpiId: "jane@upi",
      companyUpiId: "company@upi",
      date: "2025-04-07",
      status: "pending",
      reference: "REF789012",
      screenshot: "/payments/screenshot2.jpg",
      rejectionReason: ""
    }
  ])

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  
  const [formData, setFormData] = useState({
    userName: "",
    amount: "",
    upiId: ""
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newId = withdrawals.length > 0 ? Math.max(...withdrawals.map(w => w.id)) + 1 : 1
    const today = new Date().toISOString().split('T')[0]
    
    const newWithdrawal = {
      id: newId,
      userId: newId,
      userName: formData.userName,
      amount: parseFloat(formData.amount),
      userUpiId: formData.upiId,
      companyUpiId: "company@upi",
      date: today,
      status: "pending",
      reference: `REF${Math.floor(Math.random() * 1000000)}`,
      screenshot: "",
      rejectionReason: ""
    }
    
    setWithdrawals([newWithdrawal, ...withdrawals])
    setFormData({ userName: "", amount: "", upiId: "" })
    setShowAddDialog(false)
  }

  const handleApprove = (withdrawal) => {
    setWithdrawals(withdrawals.map(w => 
      w.id === withdrawal.id ? { ...w, status: "approved" } : w
    ))
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }
    
    setWithdrawals(withdrawals.map(w => 
      w.id === selectedWithdrawal.id 
        ? { ...w, status: "rejected", rejectionReason: rejectionReason } 
        : w
    ))
    setRejectionReason("")
    setShowRejectDialog(false)
    setSelectedWithdrawal(null)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Withdraw Money Requests</h1>
          <p className="text-gray-600">Manage UPI withdrawal requests</p>
        </div>
        <button 
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Withdrawal
        </button>
      </div>

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] relative">
            <button 
              onClick={() => setShowAddDialog(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            
            <h2 className="text-xl font-bold mb-4">Add UPI Withdrawal</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter user name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID
                </label>
                <input
                  required
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter UPI ID (e.g. user@upi)"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Dialog */}
      {showViewDialog && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => {
                setShowViewDialog(false)
                setSelectedWithdrawal(null)
              }}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-6">Transaction Details</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">#{selectedWithdrawal.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span className="font-medium">{selectedWithdrawal.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{selectedWithdrawal.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company UPI ID:</span>
                    <span className="font-medium">{selectedWithdrawal.companyUpiId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User UPI ID:</span>
                    <span className="font-medium">{selectedWithdrawal.userUpiId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{selectedWithdrawal.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{selectedWithdrawal.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      selectedWithdrawal.status === 'approved' ? 'text-green-600' :
                      selectedWithdrawal.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {selectedWithdrawal.status.charAt(0).toUpperCase() + selectedWithdrawal.status.slice(1)}
                    </span>
                  </div>
                </div>

                {selectedWithdrawal.status === 'rejected' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-red-600">Rejection Reason</h3>
                    <p className="text-red-600 bg-red-50 p-3 rounded">
                      {selectedWithdrawal.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Screenshot</h3>
                {selectedWithdrawal.screenshot ? (
                  <img 
                    src={selectedWithdrawal.screenshot} 
                    alt="Payment Screenshot" 
                    className="w-full rounded-lg border"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No screenshot available</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowViewDialog(false)
                  setSelectedWithdrawal(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] relative">
            <button 
              onClick={() => {
                setShowRejectDialog(false)
                setSelectedWithdrawal(null)
                setRejectionReason("")
              }}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">Reject Withdrawal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  placeholder="Enter reason for rejection"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowRejectDialog(false)
                    setSelectedWithdrawal(null)
                    setRejectionReason("")
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawals Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">UPI ID</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="border-b last:border-b-0">
                <td className="p-4">#{withdrawal.id}</td>
                <td className="p-4">{withdrawal.userName}</td>
                <td className="p-4">₹{withdrawal.amount}</td>
                <td className="p-4">{withdrawal.userUpiId}</td>
                <td className="p-4">{withdrawal.date}</td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-sm
                    ${withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}
                  >
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {withdrawal.status === "pending" && (
                      <>
                        <button 
                          onClick={() => handleApprove(withdrawal)}
                          className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded-full hover:bg-green-50"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal)
                            setShowRejectDialog(true)
                          }}
                          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-full hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal)
                        setShowViewDialog(true)
                      }}
                      className="px-3 py-1 text-sm border rounded-full hover:bg-gray-50"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
