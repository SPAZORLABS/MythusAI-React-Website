// src/hooks/useElectronAuth.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  username: string | null;
  isLoading: boolean;
}

export const useElectronAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
    username: null,
    isLoading: true,
  });

  useEffect(() => {
    // ✅ Check if running in Electron
    if (!window.electron?.auth) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // ✅ Check initial auth status with error handling
    window.electron.auth.check()
      .then((result: any) => {
        setAuthState({
          isAuthenticated: result.isAuthenticated,
          email: result.user?.email || null,
          username: result.user?.username || null,
          isLoading: false,
        });
      })
      .catch((error: any) => {
        setAuthState({
          isAuthenticated: false,
          email: null,
          username: null,
          isLoading: false,
        });
      });

    // Listen for auth success
    window.electron.auth.onAuthSuccess((data: any) => {
      setAuthState({
        isAuthenticated: true,
        email: data.email,
        username: data.username,
        isLoading: false,
      });
      navigate('/');
    });

    // Listen for auth errors
    window.electron.auth.onAuthError((error: string) => {
      alert(`Authentication failed: ${error}`);
    });

    // Listen for logout
    window.electron.auth.onAuthLogout(() => {
      setAuthState({
        isAuthenticated: false,
        email: null,
        username: null,
        isLoading: false,
      });
      navigate('/login');
    });

    // Listen for auth status updates
    window.electron.auth.onAuthStatus((data: any) => {
      if (data.isAuthenticated) {
        setAuthState({
          isAuthenticated: true,
          email: data.email,
          username: data.username,
          isLoading: false,
        });
      }
    });

    // Listen for navigation requests
    window.electron.auth.onNavigate((path: string) => {
      navigate(path);
    });
  }, [navigate]);

  const login = () => {
    if (window.electron?.auth) {
      window.electron.auth.login();
    }
  };

  const logout = () => {
    if (window.electron?.auth) {
      window.electron.auth.logout();
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (window.electron?.auth) {
      return await window.electron.auth.getToken();
    }
    return null;
  };

  return {
    ...authState,
    login,
    logout,
    getToken,
  };
};
