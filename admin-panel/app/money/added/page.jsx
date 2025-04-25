"use client"

import Layout from "@/components/Layout"
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
  const [search, setSearch] = useState('')
  const [type, setType] = useState('Add')
  const [status, setStatus] = useState('')

  

  // Mock data for added money transactions
  const [transactions, setTransactions] = useState([])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await getTransactions(auth.getToken(), {
        type: type,
        status: status,
        search: search,
        page: 1,
        limit: 10000
      });
      setTransactions(response.transactions);
    } catch (error) {
      toast.error("Failed to fetch transactions")
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    fetchTransactions();
  }, [search, type, status]);

  // Add useEffect for escape key handling
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsViewDialogOpen(false)
        setIsRejectDialogOpen(false)
        setSelectedTransaction(null)
        setRejectReason("")
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const handleCloseDialogs = () => {
    setIsViewDialogOpen(false)
    setIsRejectDialogOpen(false)
    setSelectedTransaction(null)
    setRejectReason("")
  }

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
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {status}
      </span>
    );
  }

  return (
    <Layout>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
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
                        <td className="py-4 px-6 text-gray-600">{transaction.paymentDetails?.adminUpiId}</td>
                        <td className="py-4 px-6 text-gray-600">{transaction.paymentDetails?.userUpiId}</td>
                        <td className="py-4 px-6 font-mono text-sm text-gray-600">{transaction.upiRefNumber || transaction.paymentDetails?.upiRefNumber}</td>
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseDialogs}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-[500px] transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Reject Transaction</h2>
              <button
                onClick={handleCloseDialogs}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseDialogs}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-[800px] max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedTransaction.status)}
                <button
                  onClick={handleCloseDialogs}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Transaction Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Transaction ID</span>
                        <p className="font-mono text-gray-900">#{selectedTransaction.id}</p>
                      </div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Amount</span>
                        <p className="text-lg font-semibold text-gray-900">₹{selectedTransaction.amount.toFixed(2)}</p>
                      </div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Status</span>
                        <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Date & Time</span>
                        <p className="text-gray-900">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Reference Number</span>
                        <p className="font-mono text-gray-900">{selectedTransaction.paymentDetails.upiRefNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Name</span>
                        <p className="text-gray-900 font-medium">{selectedTransaction.user.name}</p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Email</span>
                        <p className="text-gray-900">{selectedTransaction.user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">User UPI ID</span>
                        <p className="font-mono text-gray-900">{selectedTransaction.paymentDetails.userUpiId || 'N/A'}</p>
                      </div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Payment Method</span>
                        <p className="text-gray-900">{selectedTransaction.paymentDetails.userPaymentMethod || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Admin UPI ID</span>
                        <p className="font-mono text-gray-900">{selectedTransaction.paymentDetails.adminUpiId || 'N/A'}</p>
                      </div>
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Admin Name</span>
                        <p className="text-gray-900">{selectedTransaction.paymentDetails.adminName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Proofs */}
                {selectedTransaction.proofImages && selectedTransaction.proofImages.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Proofs</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTransaction.proofImages.map((proof, index) => (
                        <div key={proof.id} className="relative group">
                          <img 
                            src={proof.imageUrl} 
                            alt={`Payment Proof ${index + 1}`}
                            className="w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 rounded-lg transition-opacity duration-200">
                            <a 
                              href={proof.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
                            >
                              View Full Size
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Details */}
                {selectedTransaction.status === "Rejected" && (
                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">Rejection Details</h3>
                    <div className="text-red-700">{selectedTransaction.rejectedReason || 'No reason provided'}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                {selectedTransaction.status === "Pending" && (
                  <>
                    <button 
                      className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
                      onClick={() => {
                        handleAccept(selectedTransaction)
                        handleCloseDialogs()
                      }}
                    >
                      Accept
                    </button>
                    <button 
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
                      onClick={() => {
                        handleReject(selectedTransaction)
                        handleCloseDialogs()
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
