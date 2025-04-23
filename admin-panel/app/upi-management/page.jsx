"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-hot-toast"
import Layout from "@/components/Layout"
import { Plus, Pause, Play } from "lucide-react"
import { auth } from "@/API/auth"
import { 
  createAdminUPI, 
  getAllAdminUPIs, 
  updateAdminUPI, 
  deleteAdminUPI 
} from "@/API/upi"

export default function UPIManagementPage() {
  const [upiAccounts, setUpiAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUPI, setSelectedUPI] = useState(null)
  const [formData, setFormData] = useState({
    upiId: "",
    name: "",
    isActive: true
  })

  const fetchUPIAccounts = async () => {
    try {
      setIsLoading(true)
      const token = auth.getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const data = await getAllAdminUPIs(token)
      setUpiAccounts(data)
    } catch (error) {
      console.error('Error fetching UPI accounts:', error)
      toast.error('Failed to load UPI accounts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUPIAccounts()
  }, [])

  const handleAddUPI = async () => {
    try {
      if (!formData.upiId.trim() || !formData.name.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      const token = auth.getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      await createAdminUPI(token, formData)
      toast.success('UPI account added successfully')
      setIsAddDialogOpen(false)
      setFormData({ upiId: "", name: "", isActive: true })
      fetchUPIAccounts()
    } catch (error) {
      console.error('Error adding UPI:', error)
      toast.error(error.message || 'Failed to add UPI account')
    }
  }

  const handleUpdateUPI = async () => {
    try {
      if (!formData.upiId.trim() || !formData.name.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      const token = auth.getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      await updateAdminUPI(token, selectedUPI.id, formData)
      toast.success('UPI account updated successfully')
      setIsEditDialogOpen(false)
      setSelectedUPI(null)
      setFormData({ upiId: "", name: "", isActive: true })
      fetchUPIAccounts()
    } catch (error) {
      console.error('Error updating UPI:', error)
      toast.error(error.message || 'Failed to update UPI account')
    }
  }

  const handleDeleteUPI = async (upiId) => {
    if (!confirm('Are you sure you want to delete this UPI account?')) return

    try {
      const token = auth.getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      await deleteAdminUPI(token, upiId)
      toast.success('UPI account deleted successfully')
      fetchUPIAccounts()
    } catch (error) {
      console.error('Error deleting UPI:', error)
      toast.error(error.message || 'Failed to delete UPI account')
    }
  }

  const handleToggleActive = async (upi) => {
    try {
      const token = auth.getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      await updateAdminUPI(token, upi.id, { 
        ...upi, 
        isActive: !upi.isActive 
      })
      toast.success(`UPI account ${!upi.isActive ? 'activated' : 'paused'} successfully`)
      fetchUPIAccounts()
    } catch (error) {
      console.error('Error updating UPI status:', error)
      toast.error(error.message || 'Failed to update UPI status')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">UPI Management</h1>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add UPI
          </Button>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-800">All UPI Accounts</CardTitle>
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
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">UPI ID</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Total Received</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upiAccounts.map((upi) => (
                      <tr key={upi.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-900">{upi.upiId}</td>
                        <td className="py-4 px-6 text-gray-600">{upi.name}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant={upi.isActive ? "outline" : "default"}
                              onClick={() => handleToggleActive(upi)}
                              className={`flex items-center gap-2 ${
                                upi.isActive 
                                  ? 'text-green-600 border-green-600 hover:bg-green-50' 
                                  : 'bg-yellow-500 hover:bg-yellow-600 text-white border-none'
                              }`}
                            >
                              {upi.isActive ? (
                                <>
                                  <Play className="h-4 w-4" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <Pause className="h-4 w-4" />
                                  Paused
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium">₹{upi.totalReceived?.toFixed(2) || '0.00'}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUPI(upi)
                                setFormData({
                                  upiId: upi.upiId,
                                  name: upi.name,
                                  isActive: upi.isActive
                                })
                                setIsEditDialogOpen(true)
                              }}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUPI(upi.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </Button>
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

        {/* Add UPI Dialog */}
        {isAddDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-[500px] transform transition-all">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Add New UPI Account</h2>
                  <button
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setFormData({ upiId: "", name: "", isActive: true })
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <Input
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder="Enter UPI ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter name for this UPI"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      {formData.isActive ? 'Active' : 'Paused'}
                    </label>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setFormData({ upiId: "", name: "", isActive: true })
                  }}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddUPI}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add UPI
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit UPI Dialog */}
        {isEditDialogOpen && selectedUPI && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-[500px] transform transition-all">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Edit UPI Account</h2>
                  <button
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setSelectedUPI(null)
                      setFormData({ upiId: "", name: "", isActive: true })
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <Input
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder="Enter UPI ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter name for this UPI"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      {formData.isActive ? 'Active' : 'Paused'}
                    </label>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setSelectedUPI(null)
                    setFormData({ upiId: "", name: "", isActive: true })
                  }}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateUPI}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Update UPI
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 