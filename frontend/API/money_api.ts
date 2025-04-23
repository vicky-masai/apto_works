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
    const response = await axios.post(
      `${BASE_URL}/balance/deposit-request`,
      depositData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting deposit request:', error);
    if (axios.isAxiosError(error)) {
      // Handle Axios error with response
      if (error.response) {
        throw new Error(error.response.data.error || 'Failed to submit deposit request');
      }
      // Handle Axios error without response (network error)
      throw new Error('Network error occurred while submitting deposit request');
    }
    // Handle non-Axios error
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