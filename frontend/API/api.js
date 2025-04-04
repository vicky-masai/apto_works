const axios = require('axios');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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

export const login = async (email, password, userType) => {
    console.log("email, password, userType",email,password,userType);
    
  try {
    const endpoint = endpoints[userType].login;
    console.log("endpoint",BASE_URL+endpoint);
    
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

export const verifyOTP = async (email, otp, userType) => {
  try {
    const endpoint = endpoints[userType].verifyOTP;
    const response = await axios.post(`${BASE_URL}/${endpoint}`, { email, otp });

    return response.data;
  } catch (error) {
    console.error('Error during OTP verification:', error);
    throw error;
  }
};

export const forgotPassword = async (email, userType) => {
  try {
    const endpoint = endpoints[userType].forgotPassword;
    const response = await axios.post(`${BASE_URL}/${endpoint}`, { email });

    return response.data;
  } catch (error) {
    console.error('Error during password reset request:', error);
    throw error;
  }
};

export const resetPassword = async (email, otp, newPassword, userType) => {
  try {
    const endpoint = endpoints[userType].resetPassword;
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