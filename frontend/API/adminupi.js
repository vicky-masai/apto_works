import axios, { AxiosError } from 'axios';
import { encryptPayload, decryptPayload } from '../lib/crypto';
// Base URL for API requests, set via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000/api';
const ADMIN_BASE_URL = `${API_BASE_URL}/admin`;

// Get API config with provided token
const getApiConfig = (authToken) => {
  if (!authToken) {
    throw new Error('Authentication token is required');
  }
  return {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };
};

// Create a new admin UPI
export const createAdminUPI = async (authToken, upiData) => {
  try {
    const response = await axios.post(
      `${ADMIN_BASE_URL}/upi`,
      upiData,
      getApiConfig(authToken)
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get all admin UPIs (admin only)
export const getAllAdminUPIs = async (authToken) => {
  try {
    const response = await axios.get(
      `${ADMIN_BASE_URL}/upi/all`,
      getApiConfig(authToken)
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get active admin UPIs (public)
export const getActiveAdminUPIs = async () => {
  try {
    const response = await axios.get(
      `${ADMIN_BASE_URL}/upi/active`
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update admin UPI
export const updateAdminUPI = async (authToken, id, upiData) => {
  try {
    const response = await axios.put(
      `${ADMIN_BASE_URL}/upi/${id}`,
      upiData,
      getApiConfig(authToken)
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete admin UPI
export const deleteAdminUPI = async (authToken, id) => {
  try {
    const response = await axios.delete(
      `${ADMIN_BASE_URL}/upi/${id}`,
      getApiConfig(authToken)
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get UPI statistics
export const getUPIStatistics = async (authToken, id) => {
  try {
    const response = await axios.get(
      `${ADMIN_BASE_URL}/upi/statistics/${id}`,
      getApiConfig(authToken)
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Error handler
const handleApiError = (error) => {
  if (error instanceof AxiosError) {
    // Check if it's an authentication error
    if (error.response?.status === 401) {
      // Redirect to login or handle auth error
      window.location.href = '/login';
      return new Error('Authentication failed. Please login again.');
    }
    const errorMessage = error.response?.data?.error || 'An error occurred';
    return new Error(errorMessage);
  }
  return error;
};

