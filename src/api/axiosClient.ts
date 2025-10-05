// src/lib/axiosClient.ts (or wherever this file is)
import axios from 'axios';

// Use provided Railway backend by default; allow override via VITE_API_BASE
const DEFAULT_BACKEND = 'https://mythusai-python-backend-production.up.railway.app';
const API_BASE = typeof import.meta !== 'undefined'
  ? (import.meta.env.VITE_API_BASE ?? DEFAULT_BACKEND)
  : DEFAULT_BACKEND;

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor - get token from localStorage
axiosClient.interceptors.request.use(
  async (config: any) => {
    try {
      // ✅ Get token from localStorage
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get token for request:', error);
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - handle 401 (token expired)
axiosClient.interceptors.response.use(
  (response: any) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;

    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.error('❌ Token expired or invalid (401)');

      // ✅ Remove token from localStorage
      localStorage.removeItem('auth_token');

      // Redirect to login
      window.location.href = '/login';

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
