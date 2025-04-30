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
  profitPercent: 'profit-percent',
  earnings: 'earnings',
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

// Function to add a new profit percentage
export const addProfitPercent = async (authToken, profitPercent) => {
  try {
    const response = await axios.post(`${ADMIN_BASE_URL}/${endpoints.profitPercent}`, {
      profitPercent
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding profit percent:', error);
    throw error;
  }
};

// Function to get all profit percentages
export const getProfitPercents = async (authToken) => {
  try {
    const response = await axios.get(`${ADMIN_BASE_URL}/${endpoints.profitPercent}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profit percents:', error);
    throw error;
  }
};

// Function to update a profit percentage using POST without id
export const updateProfitPercent = async (authToken, profitPercent) => {
  try {
    const response = await axios.post(`${ADMIN_BASE_URL}/${endpoints.profitPercent}`, {
      profitPercent
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profit percent:', error);
    throw error;
  }
};

export const getEarnings = async (fromDate, toDate) => {
  try {
    // First get the completed tasks with their earnings
    const tasksResponse = await axios.get(`${ADMIN_BASE_URL}/earnings`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        status: 'Completed',
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      }
    });

    // Get all transactions for additional earnings info
    const transactionsResponse = await axios.get(`${ADMIN_BASE_URL}/${endpoints.transactions}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      params: {
        type: 'Earning',
        status: 'Completed'
      }
    });

    const tasks = tasksResponse.data.tasks || [];
    const transactions = transactionsResponse.data.transactions || [];

    // Calculate today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEarnings = transactions
      .filter(t => new Date(t.createdAt) >= today)
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate yesterday's earnings
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    const yesterdayEarnings = transactions
      .filter(t => {
        const date = new Date(t.createdAt);
        return date >= yesterday && date <= yesterdayEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total earnings
    const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Format earnings data
    const earnings = tasks.map(task => ({
      id: task.id,
      taskId: task.id,
      taskName: task.taskTitle,
      userName: task.user?.name || 'Unknown User',
      amount: task.totalAmount,
      date: task.createdAt
    }));

    return {
      earnings,
      summary: {
        today: todayEarnings,
        yesterday: yesterdayEarnings,
        total: totalEarnings
      }
    };
  } catch (error) {
    console.error('Error fetching earnings:', error);
    throw error;
  }
};


export const fetchEarningsData = async () => {
  try {
    const response = await axios.get(`${ADMIN_BASE_URL}/earnings-v2`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching earnings data:", error);
    throw error;
  }
}; 

