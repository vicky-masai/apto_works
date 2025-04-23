// Importing axios for making HTTP requests
import axios from 'axios';
import Cookies from 'js-cookie';

// Base URL for API requests, set via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const token = Cookies.get("token");

// Function to get user balance
export const getBalance = async () => {
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
export const getBalanceHistory = async () => {
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
export const getUserBalance = async () => {
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

// Function to get user balance details
export const getUserBalanceDetails = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/balance/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user balance details:', error);
    throw error;
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

/**
 * Interface for the deposit request payload
 */
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

/**
 * Function to submit a deposit request
 * @param depositData - The deposit request data including amount, UPIs, and proof images
 * @returns The response from the server with transaction details
 */
export const requestDeposit = async (depositData: DepositRequestPayload) => {
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
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to submit deposit request');
    }
    throw new Error('Failed to submit deposit request');
  }
};

