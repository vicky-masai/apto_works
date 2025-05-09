import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const fetchEarningsData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/earnings-v2`);
    return response.data;
  } catch (error) {
    console.error("Error fetching earnings data:", error);
    throw error;
  }
}; 