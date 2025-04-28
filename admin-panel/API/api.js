// Importing axios for making HTTP requests
import axios from 'axios';
import Cookies from 'js-cookie';
// Base URL for API requests, set via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000/api';
const ADMIN_BASE_URL = `${API_BASE_URL}/admin`;
const authToken = Cookies.get('adminToken');

// Define API endpoints
const endpoints = {
  dashboard: 'dashboard',
  users: 'users',
  tasks: 'tasks',
  deleteUser: 'users',
  getAllWithDrawal: 'withdrawals',
  login: 'auth/login',
  taskPUT: 'tasks',
  transactions: 'transactions',
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${endpoints.login}`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Function to handle user login
export const dashboard = async (authToken) => {
  try {
    const response = await axios.get(`${ADMIN_BASE_URL}/${endpoints.dashboard}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    throw error;
  }
};

export const getUsers = async (authToken, params = {}) => {
  try {
    // Map frontend params to backend expected params
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || '',
      searchBy: params.searchField || 'name',
      sortOrder: params.sortOrder || 'desc'
    };
    
    // Only add these params if they have values
    if (params.role) queryParams.role = params.role;
    if (params.status) queryParams.status = params.status;
    
    // Map sortBy correctly
    if (params.sortBy) {
      queryParams.sortBy = params.sortBy;
    }
    
    const response = await axios.get(`${ADMIN_BASE_URL}/${endpoints.users}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: queryParams
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getTasks = async (authToken, params = {}) => {
  try {
    const response = await axios.get(`${ADMIN_BASE_URL}/${endpoints.tasks}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        page: params.page || 1,
        search: params.search || ''
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const deleteUser = async (authToken, userId) => {
  try {
    const response = await axios.delete(`${ADMIN_BASE_URL}/${endpoints.deleteUser}/${userId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data.msg;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getAllWithDrawal = async (authToken) => {
  try {
    const response = await axios.get(`${ADMIN_BASE_URL}/${endpoints.getAllWithDrawal}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    throw error;
  }
};

export const approveTask = async (authToken, taskId) => {
  try {
    const response = await axios.put(`${ADMIN_BASE_URL}/${endpoints.taskPUT}/${taskId}`, {
      taskStatus: "Published"
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectTask = async (authToken, taskId, rejectedReason) => {
  try {
    const response = await axios.put(`${ADMIN_BASE_URL}/${endpoints.taskPUT}/${taskId}`, {
      taskStatus: "Rejected",
      rejectedReason: rejectedReason
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (authToken, userId, userData) => {
  try {
    const response = await axios.put(`${ADMIN_BASE_URL}/${endpoints.users}/${userId}`, userData, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTransactions = async (authToken, params = {}) => {
  try {
    const response = await axios.get(`${ADMIN_BASE_URL}/${endpoints.transactions}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        type: params.type || 'Add',
        status: params.status || '',
        search: params.search || ''
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAddMoneyTransactionStatus = async (transactionId, status, reason = '') => {
  try {
    const response = await axios.put(`${ADMIN_BASE_URL}/${endpoints.transactions}/${transactionId}`, {
      status,
      reason
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const updateWithdrawalTransactionStatus = async (transactionId, status, reason = '') => {
  try {
    console.log("transactionIds",transactionId);
    const response = await axios.put(`${ADMIN_BASE_URL}/${endpoints.transactions}/${transactionId}`, {
      status,
      reason
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const approveTransactionWithProof = async (transactionId, status, proofImage,upiReference) => {
  console.log("transactionId",transactionId);
  console.log("status",status);
  console.log("proofImage",proofImage);
  console.log("upiReference",upiReference);
  try {
    const response = await axios.post(`${ADMIN_BASE_URL}/${endpoints.transactions}/${transactionId}/approve`, {
      status,
      proofImage,
      upiReference
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
