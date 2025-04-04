// Importing axios for making HTTP requests
const axios = require('axios');

// Base URL for API requests, set via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Define API endpoints for Worker and TaskProvider
const endpoints = {
  Worker: {
    login: 'auth/worker/login',
    register: 'auth/worker/register',
    verifyOTP: 'auth/worker/verify-otp',
    forgotPassword: 'auth/worker/forgot-password',
    resetPassword: 'auth/worker/reset-password',
  },
  TaskProvider: {
    login: 'auth/task-provider/login',
    register: 'auth/task-provider/register',
    verifyOTP: 'auth/task-provider/verify-otp',
    forgotPassword: 'auth/task-provider/forgot-password',
    resetPassword: 'auth/task-provider/reset-password',
  },
};

// Function to handle user login
export const login = async (email, password, userType) => {
  console.log("email, password, userType", email, password, userType);
  
  try {
    // Determine the correct endpoint based on userType
    const endpoint = endpoints[userType].login;
    console.log("endpoint", BASE_URL + endpoint);
    
    // Make POST request to login endpoint
    const response = await axios.post(`${BASE_URL}/${endpoint}`, {
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
export const register = async (userData, userType) => {
  try {

    const endpoint = endpoints[userType].register;
    
    console.log("Making registration request:", {
      url: `${BASE_URL}/${endpoint}`,
      data: userData
    });


    const response = await axios.post(`${BASE_URL}/${endpoint}`, userData, {
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

// Function to verify OTP for a user
export const verifyOTP = async (email, otp, userType) => {
  try {
    // Determine the correct endpoint based on userType
    const endpoint = endpoints[userType].verifyOTP;
    
    // Make POST request to verify OTP endpoint
    const response = await axios.post(`${BASE_URL}/${endpoint}`, { email, otp });

    return response.data;
  } catch (error) {
    console.error('Error during OTP verification:', error);
    throw error;
  }
};

// Function to handle forgot password requests
export const forgotPassword = async (email, userType) => {
  try {
    // Determine the correct endpoint based on userType
    const endpoint = endpoints[userType].forgotPassword;
    
    // Make POST request to forgot password endpoint
    const response = await axios.post(`${BASE_URL}/${endpoint}`, { email });

    return response.data;
  } catch (error) {
    console.error('Error during password reset request:', error);
    throw error;
  }
};

// Function to reset user password
export const resetPassword = async (email, otp, newPassword, userType) => {
  try {
    // Determine the correct endpoint based on userType
    const endpoint = endpoints[userType].resetPassword;
    
    // Make POST request to reset password endpoint
    const response = await axios.post(`${BASE_URL}/${endpoint}`, { email, otp, newPassword });

    return response.data;
  } catch (error) {
    console.error('Error during password reset:', error);
    throw error;
  }
};


export const resendVerifyWorkerOtp = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/worker/resend-otp`, { email });
    return response.data;
  } catch (error) {
    console.error('Error resending OTP:', error);

// Function to create a new task
export const createTask = async (taskData, authToken) => {
  try {
    // Make POST request to create task endpoint
    const response = await axios.post(`${BASE_URL}/tasks`, taskData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error during task creation:', error);

    throw error;
  }
};


export const resendTaskProviderOtp = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/task-provider/resend-otp`, { email });
    return response.data;
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error;
  }
};

// Function to get all tasks without authentication token
export const getAllTasks = async () => {
  try {
    // Make GET request to get all tasks endpoint
    const response = await axios.get(`${BASE_URL}/tasks`);

    return response.data;
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    throw error;
  }
};

