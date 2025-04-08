// Importing axios for making HTTP requests
import axios from 'axios';

// Base URL for API requests, set via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Define API endpoints
const endpoints = {
  login: 'auth/login',
  register: 'auth/register',
  verifyOTP: 'auth/verify-otp',
  forgotPassword: 'auth/forgot-password',
  resetPassword: 'auth/reset-password',
  resendOtp: 'auth/resend-otp',
};

// Function to handle user login
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/${endpoints.login}`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Function to handle user registration
export const register = async (userData) => {
  try {
    console.log("Making registration request:", {
      url: `${BASE_URL}/${endpoints.register}`,
      data: userData
    });

    const response = await axios.post(`${BASE_URL}/${endpoints.register}`, userData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    return response.data;
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      data: userData
    });
    throw error;
  }
};

// Function to verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${BASE_URL}/${endpoints.verifyOTP}`, { email, otp });
    return response.data;
  } catch (error) {
    console.error('Error during OTP verification:', error);
    throw error;
  }
};

// Function to handle forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/${endpoints.forgotPassword}`, { email });
    return response.data;
  } catch (error) {
    console.error('Error during password reset request:', error);
    throw error;
  }
};

// Function to reset password
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axios.post(`${BASE_URL}/${endpoints.resetPassword}`, { email, otp, newPassword });
    return response.data;
  } catch (error) {
    console.error('Error during password reset:', error);
    throw error;
  }
};

// Function to resend OTP
export const resendVerifyOtp = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/${endpoints.resendOtp}`, { email });
    return response.data;
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error;
  }
};

// Function to create task
export const createTask = async (taskData, authToken) => {
  try {
    const response = await axios.post(`${BASE_URL}/tasks`, taskData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Function to get all tasks without authentication token
export const getAllTasks = async (params) => {
  try {
    // Convert params to query string
    const queryParams = new URLSearchParams({
      category: params?.category || '',
      minPrice: params?.minPrice?.toString() || '',
      maxPrice: params?.maxPrice?.toString() || '',
      difficulty: params?.difficulty || '',
      sortBy: params?.sortBy || 'createdAt',
      sortOrder: params?.sortOrder || 'desc',
      page: params?.page?.toString() || '1',
      search: params?.search || '',
      filter: params?.filter || '',
      status: params?.status || 'Published'
    }).toString();

    // Make GET request to get all tasks endpoint with query params
    const response = await axios.get(`${BASE_URL}/tasks?${queryParams}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Function to get task by ID
export const getAcceptedTaskById = async (taskId, authToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/tasks/accepted/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

// Function to accept a task
export const acceptTask = async (taskId, authToken) => {
  try {
    const response = await axios.post(`${BASE_URL}/tasks/${taskId}/accept`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error accepting task:', error);
    throw error;
  }
};

// Function to submit proof for a task
export const submitProof = async (acceptedTaskId, file, describe, authToken) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('describe', describe);

    const response = await axios.post(
      `${BASE_URL}/tasks/${acceptedTaskId}/proof`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting proof:', error);
    throw error;
  }
};
