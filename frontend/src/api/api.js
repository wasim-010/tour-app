// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('!!! AUTOMATIC LOGOUT TRIGGERED BY 401 ERROR !!!');
      console.error('Failed Request URL:', error.config.url);

      // Auto-logout if we get a 401 Unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      // window.location.href = '/login'; // DISABLED FOR DEBUGGING
      console.warn("Auto-logout suppressed. Please check Network tab for 401 details.");
    }
    return Promise.reject(error);
  }
);

export default api;
