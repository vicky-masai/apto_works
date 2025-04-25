import axios from 'axios';
import Cookies from 'js-cookie';

// Base URL for API requests, set via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const token = Cookies.get("token");

// Function to get all payment methods for a user
export const getAllPaymentMethods = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/balance/payment-methods`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

// Function to delete a payment method by ID
export const deletePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/balance/payment-methods/${paymentMethodId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

// Function to add a new payment method
export const addPaymentMethod = async (paymentMethodData) => {
  try {
    const response = await axios.post(`${BASE_URL}/balance/payment-methods`, paymentMethodData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

// Function to get a payment method by ID
export const getPaymentMethodById = async (paymentMethodId) => {
  try {
    const response = await axios.get(`${BASE_URL}/balance/payment-methods/${paymentMethodId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment method:', error);
    throw error;
  }
};

// Function to update a payment method
export const updatePaymentMethod = async (paymentMethodId, updatedData) => {
  try {
    const response = await axios.put(`${BASE_URL}/balance/payment-methods/${paymentMethodId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Function to get active admin UPIs for public use
export const getActiveAdminUPIs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/upi/active`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching active admin UPIs:', error);
    throw error;
  }
};
