// src/lib/axiosClient.ts (or wherever this file is)
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8765';

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor - get token from Electron
axiosClient.interceptors.request.use(
  async (config: any) => {
    try {
      // ✅ Get token from Electron secure storage
      if (window.electron?.auth) {
        const token = await window.electron.auth.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
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

      // ✅ Logout user via Electron
      if (window.electron?.auth) {
        await window.electron.auth.logout();
      }

      // Redirect to login
      window.location.href = '/login';

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
