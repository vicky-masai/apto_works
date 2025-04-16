"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { getTransactions, updateTransactionStatus } from "@/API/api"
import { auth } from "@/API/auth"
import { useEffect } from "react"
export default function AddedMoneyPage() {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  

  // Mock data for added money transactions
  const [transactions, setTransactions] = useState([])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await getTransactions(auth.getToken(),{type:'Add'});
      setTransactions(response.transactions);
    } catch (error) {
      toast.error("Failed to fetch transactions")
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAccept = async(transaction) => {
    // setTransactions(transactions.map(t => 
    //   t.id === transaction.id ? { ...t, status: "completed" } : t
    // ))

    const response = await updateTransactionStatus(auth.getToken(),transaction.id,"Approved",null);
    await fetchTransactions();
    if(response.success){
      toast.success("Transaction accepted successfully")
    }else{
      toast.error("Transaction not accepted")
    } 
  }

  const handleReject = (transaction) => {
    setSelectedTransaction(transaction)
    setIsRejectDialogOpen(true)
  }

  const handleRejectConfirm = async() => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    // setTransactions(transactions.map(t => 
    //   t.id === selectedTransaction.id 
    //     ? { ...t, status: "rejected", rejectReason: rejectReason } 
    //     : t
    // ))

    const response = await updateTransactionStatus(auth.getToken(),selectedTransaction.id,"Rejected",rejectReason);
    await fetchTransactions();
    if(response.success){
      toast.success("Transaction rejected successfully")
    }else{
      toast.error("Transaction not rejected")
    }
    setIsRejectDialogOpen(false)
    setRejectReason("")
    setSelectedTransaction(null)
    
  }

  const handleView = (transaction) => {
    setSelectedTransaction(transaction)
    setIsViewDialogOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return <Badge className="w-fit bg-green-500 px-3 py-1 text-white">Completed</Badge>
      case "Pending":
        return (
          <Badge variant="outline" className="w-fit px-3 py-1 text-yellow-500 border-yellow-500">
            Pending
          </Badge>
        )
      case "Rejected":
        return <Badge variant="destructive" className="w-fit bg-red-100 text-red-700 border border-red-200 px-3 py-1">Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Added Money List</h1>
            <p className="text-gray-500 mt-1">View all UPI transactions in the system</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-full font-medium transition-all duration-200 flex items-center gap-2 shadow-sm">
            Export Data
          </Button>
        </div>

        <div className="flex items-center gap-3 max-w-sm bg-white p-4 rounded-lg shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="search" 
              placeholder="Search transactions..." 
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            />
          </div>
          <Button variant="outline" className="border-gray-200 hover:bg-gray-50 rounded-full font-medium transition-all duration-200 flex items-center gap-2">
            Filter
          </Button>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800">All UPI Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">ID</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">User</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Company UPI</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">User UPI</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Reference</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">#{transaction.id}</td>
                        <td className="py-4 px-6 font-medium text-gray-900">{transaction.user.name}</td>
                        <td className="py-4 px-6 font-medium">₹{transaction.amount.toFixed(2)}</td>
                        <td className="py-4 px-6 text-gray-600">{transaction.companyUPI}</td>
                        <td className="py-4 px-6 text-gray-600">{transaction.userUPI}</td>
                        <td className="py-4 px-6 font-mono text-sm text-gray-600">{transaction.reference}</td>
                        <td className="py-4 px-6 text-gray-600">{transaction.createdAt}</td>
                        <td className="py-4 px-6">{getStatusBadge(transaction.status)}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button 
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                              onClick={() => handleView(transaction)}
                            >
                              View
                            </button>
                            {transaction.status === "Pending" && (
                              <>
                                <button 
                                  className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
                                  onClick={() => handleAccept(transaction)}
                                >
                                  Accept
                                </button>
                                <button 
                                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
                                  onClick={() => handleReject(transaction)}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Reject Dialog */}
      {isRejectDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Reject Transaction</h2>
              <p className="text-gray-500 mt-1">Please provide a reason for rejecting this transaction.</p>
            </div>
            <div className="p-6">
              <textarea
                className="w-full min-h-[120px] px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                onClick={() => {
                  setIsRejectDialogOpen(false)
                  setRejectReason("")
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
                onClick={handleRejectConfirm}
              >
                Reject Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced View Dialog */}
      {isViewDialogOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[800px] max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-gray-900">#{selectedTransaction.id}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">User:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-900">₹{selectedTransaction.amount}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Company UPI ID:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.companyUPI}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">User UPI ID:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.userUPI}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-mono text-gray-900">{selectedTransaction.reference}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.createdAt}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium">{selectedTransaction.status}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Screenshot</h3>
                  <img 
                    src={selectedTransaction.proof} 
                    alt="Payment Screenshot" 
                    className="w-full rounded-lg border border-gray-200 shadow-sm"
                  />
                </div>
                {selectedTransaction.status === "Rejected" && (
                  <div className="col-span-2 bg-red-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Rejection Reason</h3>
                    <p className="text-red-700">{selectedTransaction.rejectedReason}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setSelectedTransaction(null)
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
