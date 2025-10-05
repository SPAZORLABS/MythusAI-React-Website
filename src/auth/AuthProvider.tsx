// src/auth/AuthProvider.tsx
import React, { createContext, useContext } from 'react';
import { useElectronAuth } from '@/hooks/useElectronAuth';

interface User {
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  getToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const electronAuth = useElectronAuth();


  const value: AuthContextType = {
    user: electronAuth.email && electronAuth.username 
      ? { email: electronAuth.email, username: electronAuth.username }
      : null,
    isAuthenticated: electronAuth.isAuthenticated,
    isLoading: electronAuth.isLoading,
    login: electronAuth.login,
    logout: electronAuth.logout,
    getToken: electronAuth.getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
