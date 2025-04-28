import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

// Base URL for API requests, set via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const token = Cookies.get("token");

// Response interfaces
export interface BalanceResponse {
  balance: number;
  userId: string;
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface BalanceHistoryResponse {
  transactions: Transaction[];
  earnings: Transaction[];
  combinedHistory: Transaction[];
}

export interface Transaction {
  id: string;
  type: "Deposit" | "Withdraw" | "Earning";
  date: string;
  amount: number;
  status: "Completed" | "Rejected" | "Review" | "Pending";
  method?: string;
  taskTitle?: string;
  category: "transaction" | "earning";
}

export interface UserBalanceResponse {
  userId: string;
  availableBalance: number;
  totalEarnings: number;
  pending: number;
  earningsHistory: Array<{
    taskName: string;
    date: string;
    amount: number;
    status: string;
    taskId: string;
  }>;
}

export interface DepositRequestPayload {
  amount: number;
  upiId: string;
  adminUpiId: string;
  upiRefNumber: string;
  proofImages: Array<{
    fileName: string;
    base64Data: string;
  }>;
}

export interface DepositResponse {
  success: boolean;
  message: string;
  transaction: {
    id: string;
    amount: number;
    status: string;
    upiRefNumber: string;
    adminUpiId: string;
    userUpiId: string;
    proofImages: Array<{
      id: string;
      imageUrl: string;
      fileName: string;
    }>;
  };
}

// Function to get user balance
export const getBalance = async (): Promise<BalanceResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

// Function to get user balance history
export const getBalanceHistory = async (): Promise<BalanceHistoryResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/balance/money-history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching balance history:', error);
    throw error;
  }
};

// Function to get user profile
export const getUserBalance = async (): Promise<UserBalanceResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/balance/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Function to submit a deposit request
export const requestDeposit = async (depositData: DepositRequestPayload): Promise<DepositResponse> => {
  try {
    // Validate the deposit data
    if (!depositData.amount || depositData.amount <= 0) {
      throw new Error('Invalid amount');
    }
    if (!depositData.upiId) {
      throw new Error('UPI ID is required');
    }
    if (!depositData.adminUpiId) {
      throw new Error('Admin UPI ID is required');
    }
    if (!depositData.upiRefNumber) {
      throw new Error('UPI Reference number is required');
    }
    if (!depositData.proofImages || depositData.proofImages.length === 0) {
      throw new Error('Payment proof images are required');
    }

    // Format the request data according to backend expectations
    const formattedData = {
      amount: Number(depositData.amount),
      upiId: depositData.upiId,
      adminUpiId: depositData.adminUpiId,
      upiRefNumber: depositData.upiRefNumber,
      proofImages: depositData.proofImages.map(img => ({
        fileName: img.fileName,
        base64Data: img.base64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
      }))
    };

    // Make the API request
    const response = await axios.post(
      `${BASE_URL}/balance/deposit`,
      formattedData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout for large images
      }
    );

    return {
      success: true,
      message: response.data.message || 'Deposit request submitted successfully',
      transaction: response.data.transaction
    };
  } catch (error) {
    console.error('Error submitting deposit request:', error);
    
    if (axios.isAxiosError(error)) {
      // Handle specific API errors
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Failed to submit deposit request';
        throw new Error(errorMessage);
      }
      // Handle network errors
      throw new Error('Network error occurred while submitting deposit request');
    }
    
    // Re-throw validation errors
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle unexpected errors
    throw new Error('An unexpected error occurred while submitting deposit request');
  }
};

// Function to get user withdrawal requests
export const getUserWithdrawalRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/balance/withdrawal-requests/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user withdrawal requests:', error);
    throw error;
  }
}; 


export const requestWithdrawAPI = async (withdrawAmount: number) => {
  try {
    const response = await axios.post(`${BASE_URL}/balance/withdraw`, {
      amount: withdrawAmount
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting withdrawal request:', error);
    throw error;  
  }
};

export default requestWithdrawAPI;
