// src/hooks/useWebAuth.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  username: string | null;
  isLoading: boolean;
}

export const useWebAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
    username: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check if user has a valid token in localStorage
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        // Verify token with backend
        const response = await axiosClient.get('/auth/verify');
        if (response.data.success) {
          setAuthState({
            isAuthenticated: true,
            email: response.data.user?.email || null,
            username: response.data.user?.username || null,
            isLoading: false,
          });
        } else {
          // Invalid token, remove it
          localStorage.removeItem('auth_token');
          setAuthState({
            isAuthenticated: false,
            email: null,
            username: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        setAuthState({
          isAuthenticated: false,
          email: null,
          username: null,
          isLoading: false,
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      if (response.data.success && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        setAuthState({
          isAuthenticated: true,
          email: response.data.user?.email || null,
          username: response.data.user?.username || null,
          isLoading: false,
        });
        navigate('/');
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAuthState({
      isAuthenticated: false,
      email: null,
      username: null,
      isLoading: false,
    });
    navigate('/login');
  };

  const getToken = (): string | null => {
    return localStorage.getItem('auth_token');
  };

  return {
    ...authState,
    login,
    logout,
    getToken,
  };
};