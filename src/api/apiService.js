import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Use relative URL since we have proxy configured
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token');
    if (error.response?.status === 401 && token) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getUserProfile = async () => {
  return api.get('/user/profile'); // Adjust endpoint if needed
};

export const refreshToken = async () => {
  return api.post('/auth/refresh'); // If your backend supports token refresh
};

export default api;



