import axios from 'axios';
import Cookies from 'js-cookie';

// Base URL for API requests, set via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const token = Cookies.get("token");

// Function to get accepted tasks for a worker
export const getAcceptedTasks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/workers/accepted-tasks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching accepted tasks:', error);
    throw error;
  }
};
