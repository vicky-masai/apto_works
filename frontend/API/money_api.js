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
    const response = await axios.get(`${BASE_URL}/balance/history`, {
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

