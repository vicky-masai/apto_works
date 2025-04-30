import axios from "axios";

export const fetchEarningsData = async () => {
  try {
    const response = await axios.get("http://localhost:4000/api/admin/earnings-v2");
    return response.data;
  } catch (error) {
    console.error("Error fetching earnings data:", error);
    throw error;
  }
}; 