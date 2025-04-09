// Importing axios for making HTTP requests
import axios from 'axios';

// Base URL for API requests, set via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000/api/admin';

// Define API endpoints
const endpoints = {
  dashboard: 'dashboard',
  users: 'users',
  deleteUser: 'users',
};

// Function to handle user login
export const dashboard = async (authToken) => {
    try {
      const response = await axios.get(`${BASE_URL}/${endpoints.dashboard}`, {
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



  export const getUsers = async (authToken) => {
    try {
      const response = await axios.get(`${BASE_URL}/${endpoints.users}`, {
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



  export const deleteUser = async (authToken, userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${endpoints.deleteUser}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log(response.data);
      return response.data.msg;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  };
