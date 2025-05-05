"use client"

import { useEffect, useState, useMemo, Key } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, CreditCard, DollarSign, Plus, Wallet, X } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import Leftsidebar from "@/components/Leftsidebar"
import { getBalance, getBalanceHistory, requestWithdrawAPI ,getUserWithdrawalRequests, requestDeposit, type DepositRequestPayload, type Transaction } from "@/API/money_api"
import { getAllPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, getActiveAdminUPIs } from "@/API/payment_method.js"
// Mock transaction data


// Add UPI Account interface
interface UPIAccount {
  id: number;
  upiId: string;
  isDefault: boolean;
  isActive?: boolean;
  methodType?: string;
}


// Add AdminUPI interface
interface AdminUPI {
  id: Key | null | undefined
  upiId: string;
  name: string;
  isActive: boolean;
}

// Function to compress image
const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          0.7 // compression quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// Function to convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

interface APIError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [totalDeposits, setTotalDeposits] = useState(0)
  const [totalWithdrawals, setTotalWithdrawals] = useState(0)
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
  const [transactions, setTransactions] = useState<{
    transactions: Transaction[];
    earnings: Transaction[];
    combinedHistory: Transaction[];
  }>({
    transactions: [],
    earnings: [],
    combinedHistory: []
  })
  const [filter, setFilter] = useState("all")
  const [upiAccounts, setUpiAccounts] = useState<UPIAccount[]>([])
  const [newUpiId, setNewUpiId] = useState("")
  const [openAddUpiDialog, setOpenAddUpiDialog] = useState(false)
  const [depositStep, setDepositStep] = useState(1)
  const [transactionRef, setTransactionRef] = useState("")
  const [paymentScreenshots, setPaymentScreenshots] = useState<Array<{ file: File; preview: string }>>([])
  const [selectedAdminUpi, setSelectedAdminUpi] = useState<string>("")
  const [adminUPIs, setAdminUPIs] = useState<AdminUPI[]>([])
  const [selectedUserUpiId, setSelectedUserUpiId] = useState<string>("")


  const withdrawRequest = async () => {
    try {
      console.log("selectedUserUpiId",selectedUserUpiId);
      const response = await requestWithdrawAPI(Number(withdrawAmount),selectedUserUpiId);
      console.log("Withdrawal request submitted successfully:", response);
    } catch (error) {
      console.error("Error submitting withdrawal request:", error); 
    }
  };
  

  console.log("adminUPIs",adminUPIs);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceData, paymentMethods, activeAdminUPIs] = await Promise.all([
          getBalance(),
          getAllPaymentMethods(),
          getActiveAdminUPIs(),
        ]);
        
        setBalance(balanceData.balance);
        setTotalDeposits(balanceData.totalDeposits);
        setTotalWithdrawals(balanceData.totalWithdrawals);
        setUpiAccounts(paymentMethods);
        setAdminUPIs(activeAdminUPIs);
        const defaultUpiAccount = paymentMethods.find((account: UPIAccount) => account.isDefault);
        console.log("defaultUpiAccount",defaultUpiAccount);
        setSelectedUserUpiId(defaultUpiAccount?.id);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load some data. Please try again.');
      }
    };

    fetchData();
    
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsData = await getBalanceHistory();
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions. Please try again.');
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.combinedHistory.filter((item) => {
      if (filter === "all") return true;
      return item.type === filter;
    });
  }, [filter, transactions.combinedHistory]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const handleDeposit = async () => {
    try {
      setIsDepositing(true);

      // Validate all required fields
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        toast.error("Please enter a valid amount");
        setIsDepositing(false);
        return;
      }

      if (!selectedUserUpiId) {
        toast.error("Please enter or select your UPI ID");
        setIsDepositing(false);
        return;
      }

      if (!selectedAdminUpi) {
        toast.error("Please select an admin UPI ID to pay to");
        setIsDepositing(false);
        return;
      }

      // If user doesn't have any saved UPI IDs, save the entered UPI ID
      if (upiAccounts.length === 0 && selectedUserUpiId) {
        try {
          await addPaymentMethod({
            upiId: selectedUserUpiId,
            methodType: "UPI",
            isDefault: true
          });
          
          // Refresh payment methods
          const paymentMethods = await getAllPaymentMethods();
          setUpiAccounts(paymentMethods);
        } catch (error) {
          console.error('Failed to save new UPI ID:', error);
          toast.error("Failed to save UPI ID, but continuing with deposit");
        }
      }

      if (!transactionRef || transactionRef.trim() === '') {
        toast.error("Please enter UPI reference number");
        setIsDepositing(false);
        return;
      }

      if (paymentScreenshots.length === 0) {
        toast.error("Please upload payment screenshot");
        setIsDepositing(false);
        return;
      }

      // Log the values for debugging
      console.log('Deposit Data:', {
        amount: depositAmount,
        userUpiId: selectedUserUpiId,
        adminUpiId: selectedAdminUpi,
        upiRefNumber: transactionRef,
        screenshots: paymentScreenshots.length
      });

      // Process images
      const base64Images = await Promise.all(
        paymentScreenshots.map(async (screenshot) => {
          try {
            const compressedBlob = await compressImage(screenshot.file);
            const base64Data = await blobToBase64(compressedBlob);
            return {
              fileName: screenshot.file.name,
              base64Data: base64Data.split(',')[1] // Remove data:image/jpeg;base64, prefix
            };
          } catch (error) {
            console.error('Error processing image:', error);
            throw new Error('Failed to process payment screenshot');
          }
        })
      );

      // Prepare request payload
      const depositData: DepositRequestPayload = {
        amount: parseFloat(depositAmount),
        upiId: selectedUserUpiId,
        adminUpiId: selectedAdminUpi,
        upiRefNumber: transactionRef.trim(),
        proofImages: base64Images
      };

      // Make API call
      const response = await requestDeposit(depositData);

      setDepositSuccess(true);

      // Update UI with new transaction
      const newTransaction: Transaction = {
        id: response.transaction.id,
        type: "Deposit",
        amount: parseFloat(depositAmount),
        date: new Date().toISOString(),
        status: "Pending",
        method: `UPI (${selectedUserUpiId})`,
        category: "transaction"
      };

      // Update transactions state safely
      setTransactions(prev => {
        const updatedTransactions = Array.isArray(prev.transactions) ? prev.transactions : [];
        const updatedCombinedHistory = Array.isArray(prev.combinedHistory) ? prev.combinedHistory : [];
        
        return {
          ...prev,
          transactions: [newTransaction, ...updatedTransactions],
          combinedHistory: [newTransaction, ...updatedCombinedHistory],
          earnings: Array.isArray(prev.earnings) ? prev.earnings : []
        };
      });

      // Reset form after success
      setTimeout(() => {
        setOpenDepositDialog(false);
        setDepositSuccess(false);
        setDepositAmount("");
        setTransactionRef("");
        setSelectedAdminUpi("");
        setSelectedUserUpiId("");
        setPaymentScreenshots([]);
        setDepositStep(1);
      }, 2000);

    } catch (error) {
      console.error('Deposit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process deposit');
      setDepositSuccess(false);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = () => {
    setIsWithdrawing(true)

    withdrawRequest()
      .then(() => {
        setIsWithdrawing(false)
        setWithdrawSuccess(true)

        // Update balance
        const amount = Number.parseFloat(withdrawAmount)
        setBalance((prevBalance) => prevBalance - amount)

        // Add transaction
        const newTransaction: Transaction = {
          id: (transactions.transactions.length + 1).toString(),
          type: "Withdraw",
          amount: amount,
          date: new Date().toISOString(),
          status: "Pending",
          method: "UPI",
          category: "transaction"
        }

        setTransactions(prev => ({
          ...prev,
          transactions: [newTransaction, ...prev.transactions],
          combinedHistory: [newTransaction, ...prev.combinedHistory]
        }))

        // Reset after showing success message
        setTimeout(() => {
          setOpenWithdrawDialog(false)
          setWithdrawSuccess(false)
          setWithdrawAmount("")
        }, 2000)
      })
      .catch((error: unknown) => {
        console.error("Error processing withdrawal:", error);
        const apiError = error as APIError;
        toast.error(apiError?.response?.data?.error || "Failed to process withdrawal. Please try again.");
        setIsWithdrawing(false);
      });
  }

  const handleAddUpi = async () => {
    if (!newUpiId.trim()) {
      toast.error("Please enter a valid UPI ID")
      return
    }

    // Check for duplicate UPI
    if (upiAccounts.some(acc => acc.upiId === newUpiId)) {
      toast.error("This UPI ID already exists")
      return
    }

    try {
      const isFirst = upiAccounts.length === 0;
      
      // Call the API to add payment method
      await addPaymentMethod({
        upiId: newUpiId,
        methodType: "UPI",
        isDefault: isFirst // Only set as default if it's the first UPI ID
      });
      
      // Refresh payment methods
      const paymentMethods = await getAllPaymentMethods();
      setUpiAccounts(paymentMethods);
      
      setNewUpiId("");
      setOpenAddUpiDialog(false);
      toast.success("UPI ID added successfully");
    } catch (error: unknown) {
      console.error('Failed to add UPI ID:', error);
      const apiError = error as APIError;
      toast.error(apiError?.response?.data?.error || "Failed to add UPI ID. Please try again.");
    }
  };

  const handleMakeDefault = async (account: UPIAccount) => {
    try {
      // First, find the current default UPI
      const currentDefault = upiAccounts.find(acc => acc.isDefault);
      
      if (currentDefault?.id === account.id) {
        return;
      }

      // Update the selected UPI to be default
      await updatePaymentMethod(account.id.toString(), { isDefault: true });
      
      // Refresh payment methods
      const paymentMethods = await getAllPaymentMethods();
      setUpiAccounts(paymentMethods);
      toast.success("Default UPI updated successfully");
    } catch (error: unknown) {
      console.error('Failed to set default UPI ID:', error);
      const apiError = error as APIError;
      toast.error(apiError?.response?.data?.error || "Failed to update default UPI. Please try again.");
    }
  };

  const handleDeleteUpi = async (id: number) => {
    try {
      const upiToDelete = upiAccounts.find(acc => acc.id === id);
      
      if (!upiToDelete) {
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
    } catch (error: unknown) {
      console.error('Failed to delete UPI ID:', error);
      const apiError = error as APIError;
      toast.error(apiError?.response?.data?.error || "Failed to delete UPI ID. Please try again.");
    }
  };

  // Clean up previews when component unmounts
  useEffect(() => {
    return () => {
      paymentScreenshots.forEach(screenshot => {
        URL.revokeObjectURL(screenshot.preview)
      })
    }
  }, [paymentScreenshots])

  // Reset states when dialog closes
  useEffect(() => {
    if (!openDepositDialog) {
      setDepositStep(1)
      setDepositAmount("")
      setTransactionRef("")
      paymentScreenshots.forEach(screenshot => {
        URL.revokeObjectURL(screenshot.preview)
      })
      setPaymentScreenshots([])
      setDepositSuccess(false)
    }
  }, [openDepositDialog])

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newScreenshots = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setPaymentScreenshots(prev => [...prev, ...newScreenshots])
    e.target.value = '' // Reset input
  }

  const removeScreenshot = (index: number) => {
    setPaymentScreenshots(prev => {
      const newScreenshots = [...prev]
      URL.revokeObjectURL(newScreenshots[index].preview)
      newScreenshots.splice(index, 1)
      return newScreenshots
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
                          {depositStep === 1 ? 
                            "Enter the amount and select admin UPI to add funds to your wallet." :
                            "Please provide your transaction details for verification."
                          }
                        </DialogDescription>
                      </DialogHeader>
                      {!depositSuccess ? (
                        <>
                          {depositStep === 1 ? (
                            <>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <label htmlFor="amount" className="text-sm font-medium">
                                    Amount ({currencyTypes[0]?.symbol})
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
                                  <label htmlFor="admin-upi" className="text-sm font-medium">
                                    Select Admin UPI to Pay
                                  </label>
                                  <Select
                                    value={selectedAdminUpi}
                                    onValueChange={(value) => {
                                      console.log('Selected Admin UPI:', value);
                                      setSelectedAdminUpi(value);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Admin UPI" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {adminUPIs.map((adminUpi) => (
                                        <SelectItem
                                          key={adminUpi.id}
                                          value={adminUpi.upiId}
                                        >
                                          {adminUpi.upiId}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2">
                                  <label htmlFor="user-upi" className="text-sm font-medium">
                                    Your UPI ID
                                  </label>
                                  {upiAccounts.length > 0 ? (
                                    <Select
                                      value={selectedUserUpiId}
                                      onValueChange={(value) => {
                                        console.log('Selected UPI ID:', value);
                                        setSelectedUserUpiId(value);
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select UPI ID" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {upiAccounts.map(acc => (
                                          <SelectItem key={acc.id} value={acc.upiId}>
                                            {acc.upiId}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <div className="space-y-2">
                                      <Input
                                        placeholder="Enter your UPI ID"
                                        value={selectedUserUpiId}
                                        onChange={(e) => setSelectedUserUpiId(e.target.value)}
                                      />
                                      <p className="text-xs text-gray-500">
                                        This UPI ID will be saved for future transactions
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                  setOpenDepositDialog(false);
                                  setDepositStep(1);
                                }}>
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => setDepositStep(2)}
                                  disabled={!depositAmount || Number(depositAmount) <= 0 || !selectedAdminUpi}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Proceed to Payment
                                </Button>
                              </DialogFooter>
                            </>
                          ) : (
                            <>
                              <div className="grid gap-4 py-4">
                                <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                                  <AlertTitle className="text-blue-800">Payment Instructions</AlertTitle>
                                  <AlertDescription className="text-blue-700">
                                    <p>Please complete the payment of {currencyTypes[0]?.symbol}{depositAmount} to:</p>
                                    <p className="font-medium mt-2">{selectedAdminUpi}</p>
                                    <p className="text-sm mt-2">After payment, provide the transaction details below.</p>
                                  </AlertDescription>
                                </Alert>
                                <div className="grid gap-2">
                                  <label htmlFor="ref-number" className="text-sm font-medium">
                                    UPI Reference Number
                                  </label>
                                  <Input
                                    id="ref-number"
                                    placeholder="Enter UPI reference number"
                                    value={transactionRef}
                                    onChange={(e) => setTransactionRef(e.target.value)}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <label htmlFor="screenshot" className="text-sm font-medium">
                                    Payment Screenshots
                                  </label>
                                  <Input
                                    id="screenshot"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleScreenshotUpload}
                                    className="cursor-pointer"
                                    multiple
                                  />
                                  <p className="text-xs text-gray-500">
                                    Upload screenshots of your payment confirmation
                                  </p>
                                  
                                  {/* Screenshot Previews */}
                                  {paymentScreenshots.length > 0 && (
                                    <div className="mt-4 grid gap-4">
                                      <div className="text-sm font-medium">Uploaded Screenshots:</div>
                                      <div className="grid grid-cols-2 gap-4">
                                        {paymentScreenshots.map((screenshot, index) => (
                                          <div key={index} className="relative group">
                                            <img
                                              src={screenshot.preview}
                                              alt={`Screenshot ${index + 1}`}
                                              className="w-full h-40 object-cover rounded-lg border"
                                            />
                                            <button
                                              onClick={() => removeScreenshot(index)}
                                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full 
                                                opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            >
                                              <X className="h-4 w-4" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setDepositStep(1)}
                                >
                                  Back
                                </Button>
                                <Button
                                  onClick={handleDeposit}
                                  disabled={isDepositing || !transactionRef || paymentScreenshots.length === 0}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {isDepositing ? "Processing..." : "Submit for Verification"}
                                </Button>
                              </DialogFooter>
                            </>
                          )}
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
                          <h3 className="text-xl font-medium text-center">Payment Verification Submitted!</h3>
                          <p className="text-center text-gray-500">
                            Your payment of {currencyTypes[0]?.symbol}{Number(depositAmount).toFixed(2)} is being verified. Funds will be added to your wallet once verified.
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
                                Amount (Available: {currencyTypes[0]?.symbol}{balance.toFixed(2)})
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
                              <Select defaultValue={upiAccounts.find(acc => acc.isDefault)?.id.toString()} onValueChange={(value) => setSelectedUserUpiId(value)}>
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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currencyTypes[0]?.symbol}{balance.toFixed(2)}</div>
                    <p className="text-xs text-gray-500">Available for tasks and withdrawals</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currencyTypes[0]?.symbol}{totalDeposits.toFixed(2)}</div>
                    <p className="text-xs text-gray-500">All-time deposits</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currencyTypes[0]?.symbol}{totalWithdrawals.toFixed(2)}</div>
                    <p className="text-xs text-gray-500">All-time withdrawals</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Transaction History</CardTitle>
                    <Select 
                      defaultValue="all" 
                      value={filter}
                      onValueChange={handleFilterChange}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="Deposit">Deposits</SelectItem>
                        <SelectItem value="Withdraw">Withdrawals</SelectItem>
                        <SelectItem value="Earning">Earnings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <CardDescription>View all your wallet transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-6 bg-muted/50 p-3 text-sm font-medium">
                        <div>Transaction ID</div>
                        <div>Type</div>
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Method</div>
                        <div>Status</div>
                      </div>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                          <div 
                            key={`${transaction.category}-${transaction.id || transaction.date}`} 
                            className="grid grid-cols-6 items-center p-3 text-sm border-t"
                          >
                            <div className="text-gray-600 font-mono text-xs">
                              {transaction.id || `EARN-${transaction.date.substring(0, 10)}`}
                            </div>
                            <div className="font-medium flex items-center">
                              {transaction.type === "Deposit" ? (
                                <ArrowUp className="h-4 w-4 text-green-500 mr-2" />
                              ) : transaction.type === "Withdraw" ? (
                                <ArrowDown className="h-4 w-4 text-red-500 mr-2" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-blue-500 mr-2" />
                              )}
                              {transaction.type}
                            </div>
                            <div className="text-gray-500">{new Date(transaction.date).toLocaleDateString()}</div>
                            <div
                              className={`font-medium ${
                                transaction.type === "Deposit" || transaction.type === "Earning"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "Deposit" || transaction.type === "Earning" ? "+" : "-"}{currencyTypes[0]?.symbol}
                              {transaction.amount.toFixed(2)}
                            </div>
                            <div>{transaction.method}</div>
                            <div>
                              <Badge
                                className={
                                  transaction.status === "Completed"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                                    : transaction.status === "Rejected"
                                    ? "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
                                }
                              >
                                {transaction.status}
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

              <Card>
                <CardHeader>
                  <CardTitle>UPI Accounts</CardTitle>
                  <CardDescription>Manage your UPI IDs for deposits and withdrawals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upiAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-md">
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
                              className="text-blue-600 dark:text-blue-400"
                            >
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">{account.upiId}</div>
                            <div className="text-sm text-muted-foreground">UPI ID</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {account.isDefault ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">Default</Badge>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMakeDefault(account)}
                              >
                                Make Default
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleDeleteUpi(account.id)}
                              >
                                Delete
                              </Button>
                            </>
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
                            onClick={handleAddUpi}
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
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
