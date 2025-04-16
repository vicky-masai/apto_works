// Importing axios for making HTTP requests
import axios from 'axios';

// Base URL for API requests, set via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000/api/admin';

// Define API endpoints
const endpoints = {
  dashboard: 'dashboard',
  users: 'users',
  tasks: 'tasks',
  deleteUser: 'users',
  getAllWithDrawal: 'withdrawals',
  login: 'auth/login',
  taskPUT: 'tasks',
};


export const login = async (email, password) => {
  try {
    const response = await axios.post(`http://localhost:4000/api/${endpoints.login}`, {
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
      
      // Map sortBy correctly (frontend value may be different than backend)
      if (params.sortBy) {
        // Check if sortBy is 'role' - which needs to be mapped to 'userType' in backend
        queryParams.sortBy = params.sortBy;
      }
      
      console.log("Search params:", queryParams); // For debugging
      
      const response = await axios.get(`${BASE_URL}/${endpoints.users}`, {
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
      console.log("pandey")
      const response = await axios.get(`${BASE_URL}/${endpoints.tasks}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        params: {
          page: params.page || 1,
          search: params.search || ''
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
    console.log(userId,"suraj");
    try {
      const response = await axios.delete(`${BASE_URL}/${endpoints.deleteUser}/${userId}`, {
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


  export const getAllWithDrawal = async (authToken) => {
    // console.log(userId,"suraj");
    try {
      const response = await axios.delete(`${BASE_URL}/${endpoints.getAllWithDrawal}/${userId}`, {
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


export const approveTask = async (authToken, taskId) => {
  try {
    const response = await axios.put(`${BASE_URL}/${endpoints.taskPUT}/${taskId}`, {
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
    const response = await axios.put(`${BASE_URL}/${endpoints.taskPUT}/${taskId}`, {
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


const updateUser = async (authToken, userId, userData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${endpoints.users}/${userId}`, userData, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
  
