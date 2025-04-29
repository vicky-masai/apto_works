"use client"

import Layout from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, CheckSquare, Square } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { getTransactions, updateWithdrawalTransactionStatus } from "@/API/api"
import { auth } from "@/API/auth"

// Helper function to get status chip color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'completed':
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'review':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isBulkRejectDialogOpen, setIsBulkRejectDialogOpen] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const [filter, setFilter] = useState("")
  const [selectedWithdrawals, setSelectedWithdrawals] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const fetchWithdrawals = async () => {
    setIsLoading(true)
    try {
      const response = await getTransactions(auth.getToken(), {
        type: 'Withdraw',
        status: filter,
        search: searchQuery,
        page: 1,
        limit: 100
      })
      
      if (response && response.transactions) {
        setWithdrawals(response.transactions)
      } else {
        setWithdrawals([])
        console.error('Invalid response format:', response)
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      toast.error("Failed to fetch withdrawals")
      setWithdrawals([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchWithdrawals()
    }
  }, [searchQuery, filter, mounted])

  const handleApprove = async (withdrawalId) => {
    try {
      console.log("withdrawalId",withdrawalId);
      const response = await updateWithdrawalTransactionStatus(withdrawalId, "Approved")
    
        await fetchWithdrawals()
        toast.success("Withdrawal approved successfully")
    
    } catch (error) {
      console.error('Error approving withdrawal:', error)
      toast.error("Failed to approve withdrawal")
    }
  }

  const handleBulkApprove = async () => {
    try {
      const pendingWithdrawals = selectedWithdrawals.filter(id => 
        withdrawals.find(w => w.id === id)?.status === "Pending"
      )
      
      if (pendingWithdrawals.length === 0) {
        toast.error("No pending withdrawals selected")
        return
      }

      setIsLoading(true)
      await Promise.all(pendingWithdrawals.map(id => 
        updateWithdrawalTransactionStatus(id, "Approved")
      ))
      await fetchWithdrawals()
      toast.success(`${pendingWithdrawals.length} withdrawals approved successfully`)
    } catch (error) {
      console.error('Error in bulk approve:', error)
      toast.error("Failed to approve some withdrawals")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    try {
      const pendingWithdrawals = selectedWithdrawals.filter(id => 
        withdrawals.find(w => w.id === id)?.status === "Pending"
      )
      
      if (pendingWithdrawals.length === 0) {
        toast.error("No pending withdrawals selected")
        return
      }

      setIsLoading(true)
      await Promise.all(pendingWithdrawals.map(id => 
        updateWithdrawalTransactionStatus(id, "Rejected", rejectReason)
      ))
      setIsBulkRejectDialogOpen(false)
      setRejectReason("")
      await fetchWithdrawals()
      toast.success(`${pendingWithdrawals.length} withdrawals rejected successfully`)
    } catch (error) {
      console.error('Error in bulk reject:', error)
      toast.error("Failed to reject some withdrawals")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = (withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setIsRejectDialogOpen(true)
  }

  const handleView = (withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setIsViewDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    try {
      console.log("selectedWithdrawal.id",selectedWithdrawal.id);
      const response = await updateWithdrawalTransactionStatus(selectedWithdrawal.id, "Rejected", rejectReason) 
      console.log("suraj");
      console.log("response",response);
      console.log(response.success);
    
        await fetchWithdrawals()
        setIsRejectDialogOpen(false)
        setRejectReason("")
        setSelectedWithdrawal(null)
        toast.success("Withdrawal rejected successfully")
     
    } catch (error) {
      console.error('Error rejecting withdrawal:', error)
      toast.error("Failed to reject withdrawal")
    }
  }

  const toggleWithdrawalSelection = (id) => {
    setSelectedWithdrawals(prev => 
      prev.includes(id) 
        ? prev.filter(wId => wId !== id)
        : [...prev, id]
    )
  }

  const toggleAllWithdrawals = () => {
    if (selectedWithdrawals.length === withdrawals.length) {
      setSelectedWithdrawals([])
    } else {
      setSelectedWithdrawals(withdrawals.map(w => w.id))
    }
  }

  const selectedPendingCount = selectedWithdrawals.filter(id => 
    withdrawals.find(w => w.id === id)?.status === "Pending"
  ).length

  if (!mounted) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Withdrawals</CardTitle>
              <div className="flex gap-2">
                {selectedWithdrawals.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={handleBulkApprove}
                      disabled={selectedPendingCount === 0}
                    >
                      Approve Selected ({selectedPendingCount})
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setIsBulkRejectDialogOpen(true)}
                      disabled={selectedPendingCount === 0}
                    >
                      Reject Selected ({selectedPendingCount})
                    </Button>
                  </>
                )}
                <Button variant="outline">Export Data</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-3 max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="search" 
                    placeholder="Search withdrawals..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-4 px-6 text-sm font-semibold text-gray-600">
                          <button 
                            onClick={toggleAllWithdrawals}
                            className="hover:bg-gray-100 p-1 rounded"
                          >
                            {selectedWithdrawals.length === withdrawals.length ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">ID</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">User</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">UPI ID</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((withdrawal) => (
                        <tr key={withdrawal.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <button 
                              onClick={() => toggleWithdrawalSelection(withdrawal.id)}
                              className="hover:bg-gray-100 p-1 rounded"
                            >
                              {selectedWithdrawals.includes(withdrawal.id) ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-6">#{withdrawal.id}</td>
                          <td className="py-4 px-6 font-medium text-gray-900">{withdrawal.user?.name}</td>
                          <td className="py-4 px-6 font-medium">₹{withdrawal.amount?.toFixed(2)}</td>
                          <td className="py-4 px-6 text-gray-600">{withdrawal.paymentDetails?.userUpiId}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getStatusColor(withdrawal.status)
                            }`}>
                              {withdrawal.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleView(withdrawal)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                View
                              </Button>
                              {withdrawal.status === "Pending" && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleApprove(withdrawal.id)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleReject(withdrawal)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Reject
                                  </Button>
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
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        {isViewDialogOpen && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[800px] max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">View Withdrawal Details</h2>
                  <button 
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      setSelectedWithdrawal(null)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">User</h3>
                      <p className="mt-1">{selectedWithdrawal.user?.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Amount</h3>
                      <p className="mt-1">₹{selectedWithdrawal.amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">UPI ID</h3>
                      <p className="mt-1">{selectedWithdrawal.paymentDetails?.userUpiId}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Status</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        getStatusColor(selectedWithdrawal.status)
                      }`}>
                        {selectedWithdrawal.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Created At</h3>
                      <p className="mt-1">{new Date(selectedWithdrawal.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedWithdrawal.rejectionReason && (
                      <div className="col-span-2">
                        <h3 className="font-medium text-gray-900">Rejection Reason</h3>
                        <p className="mt-1 text-red-600">{selectedWithdrawal.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {selectedWithdrawal.status === "Pending" && (
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsViewDialogOpen(false)
                          setSelectedWithdrawal(null)
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => handleApprove(selectedWithdrawal.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve Withdrawal
                      </Button>
                      <Button
                        onClick={() => {
                          setIsViewDialogOpen(false)
                          handleReject(selectedWithdrawal)
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Reject Withdrawal
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Dialog */}
        {isRejectDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[500px]">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Reject Withdrawal</h2>
                  <button 
                    onClick={() => {
                      setIsRejectDialogOpen(false)
                      setRejectReason("")
                      setSelectedWithdrawal(null)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium">Rejection Reason</label>
                  <textarea
                    placeholder="Enter reason for rejection"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full min-h-[120px] mt-1.5 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsRejectDialogOpen(false)
                      setRejectReason("")
                      setSelectedWithdrawal(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRejectConfirm}
                    disabled={!rejectReason.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reject Withdrawal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Reject Dialog */}
        {isBulkRejectDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[500px]">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Reject Selected Withdrawals</h2>
                  <button 
                    onClick={() => {
                      setIsBulkRejectDialogOpen(false)
                      setRejectReason("")
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium">Rejection Reason (will be applied to all selected withdrawals)</label>
                  <textarea
                    placeholder="Enter reason for rejection"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full min-h-[120px] mt-1.5 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsBulkRejectDialogOpen(false)
                      setRejectReason("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkReject}
                    disabled={!rejectReason.trim() || selectedPendingCount === 0}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reject {selectedPendingCount} Withdrawals
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 