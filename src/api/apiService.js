import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Send OTP
  sendOTP: async (email) => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (otpData) => {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (emailOrPhone) => {
    const response = await api.post('/auth/forgot-password', { emailOrPhone });
    return response.data;
  },

  // Forgot user ID
  forgotUserId: async (emailOrPhone) => {
    const response = await api.post('/auth/forgot-user-id', { emailOrPhone });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  // Change user ID
  changeUserId: async (userIdData) => {
    const response = await api.post('/auth/change-user-id', userIdData);
    return response.data;
  },

  // Get countries
  getCountries: async () => {
    const response = await api.get('/auth/countries');
    return response.data;
  },

  // Get states
  getStates: async (countryId) => {
    const response = await api.post('/auth/states', { countryId });
    return response.data;
  }
};

// Farmers API calls
export const farmersAPI = {
  // Get all farmers
  getAllFarmers: async (filters = {}) => {
    const response = await api.get('/farmers', { params: filters });
    return response.data;
  },

  // Get farmer by ID
  getFarmerById: async (id) => {
    const response = await api.get(`/farmers/${id}`);
    return response.data;
  },

  // Create farmer
  createFarmer: async (farmerData) => {
    const response = await api.post('/farmers', farmerData);
    return response.data;
  },

  // Update farmer
  updateFarmer: async (id, farmerData) => {
    const response = await api.put(`/farmers/${id}`, farmerData);
    return response.data;
  },

  // Delete farmer
  deleteFarmer: async (id) => {
    const response = await api.delete(`/farmers/${id}`);
    return response.data;
  },

  // Assign farmer to employee
  assignFarmer: async (farmerId, employeeId) => {
    const response = await api.post(`/farmers/${farmerId}/assign`, { employeeId });
    return response.data;
  },

  // Get farmer statistics
  getFarmerStats: async () => {
    const response = await api.get('/farmers/stats');
    return response.data;
  }
};

// Employees API calls
export const employeesAPI = {
  // Get all employees
  getAllEmployees: async (filters = {}) => {
    const response = await api.get('/employees', { params: filters });
    return response.data;
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create employee
  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Get assigned farmers for employee
  getAssignedFarmers: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/assigned-farmers`);
    return response.data;
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    const response = await api.get('/employees/stats');
    return response.data;
  }
};

// Registrations API calls
export const registrationsAPI = {
  // Get all registrations
  getAllRegistrations: async (filters = {}) => {
    const response = await api.get('/registrations', { params: filters });
    return response.data;
  },

  // Get registration by ID
  getRegistrationById: async (id) => {
    const response = await api.get(`/registrations/${id}`);
    return response.data;
  },

  // Approve registration
  approveRegistration: async (id, approvalData) => {
    const response = await api.post(`/registrations/${id}/approve`, approvalData);
    return response.data;
  },

  // Reject registration
  rejectRegistration: async (id, rejectionData) => {
    const response = await api.post(`/registrations/${id}/reject`, rejectionData);
    return response.data;
  },

  // Get registration statistics
  getRegistrationStats: async () => {
    const response = await api.get('/registrations/stats');
    return response.data;
  }
};

// KYC API calls
export const kycAPI = {
  // Upload KYC documents
  uploadDocuments: async (farmerId, documents) => {
    const formData = new FormData();
    Object.keys(documents).forEach(key => {
      if (documents[key]) {
        formData.append(key, documents[key]);
      }
    });
    
    const response = await api.post(`/kyc/${farmerId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Approve KYC
  approveKYC: async (farmerId, approvalData) => {
    const response = await api.post(`/kyc/${farmerId}/approve`, approvalData);
    return response.data;
  },

  // Reject KYC
  rejectKYC: async (farmerId, rejectionData) => {
    const response = await api.post(`/kyc/${farmerId}/reject`, rejectionData);
    return response.data;
  },

  // Refer back KYC
  referBackKYC: async (farmerId, referBackData) => {
    const response = await api.post(`/kyc/${farmerId}/refer-back`, referBackData);
    return response.data;
  },

  // Get KYC status
  getKYCStatus: async (farmerId) => {
    const response = await api.get(`/kyc/${farmerId}/status`);
    return response.data;
  },

  // Get KYC documents
  getKYCDocuments: async (farmerId) => {
    const response = await api.get(`/kyc/${farmerId}/documents`);
    return response.data;
  }
};

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get admin dashboard data
  getAdminDashboardData: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  // Get super admin dashboard data
  getSuperAdminDashboardData: async () => {
    const response = await api.get('/dashboard/super-admin');
    return response.data;
  },

  // Get employee dashboard data
  getEmployeeDashboardData: async (employeeId) => {
    const response = await api.get(`/dashboard/employee/${employeeId}`);
    return response.data;
  }
};

export default api; 