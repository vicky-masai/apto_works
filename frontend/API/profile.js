import axios from 'axios';
import Cookies from 'js-cookie';
import { decryptPayload } from '../lib/crypto';
// Base URL for API requests, set via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const token = Cookies.get("token");
import { toast } from "@/hooks/use-toast"
export const getProfile = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/workers/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("response.data",response.data);
    console.log("response.data.data",decryptPayload(response.data));
    return decryptPayload(response.data);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
};


export const getNotification = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
};


export const updateProfile = async (data) => {
  try {
    const response = await axios.put(`${BASE_URL}/workers/profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};