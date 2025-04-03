const BASE_URL = process.env.BASE_URL;
const axios = require('axios');

const endpoints = {
  Worker: {
    login: 'worker/login',
    register: 'worker/register',
    verifyOTP: 'worker/verify-otp',
    forgotPassword: 'worker/forgot-password',
    resetPassword: 'worker/reset-password',
  },
  TaskProvider: {
    login: 'task-provider/login',
    register: 'task-provider/register',
    verifyOTP: 'task-provider/verify-otp',
    forgotPassword: 'task-provider/forgot-password',
    resetPassword: 'task-provider/reset-password',
  },
};

export const login = async (email, password, userType) => {
  try {
    const endpoint = endpoints[userType].login;
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
    const response = await axios.post(`${BASE_URL}/${endpoint}`, userData);

    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
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