// src/auth/context.ts
import React, { createContext, useContext } from 'react';

export interface User {
  email: string;
  username: string;
  email_verified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
  getToken: () => Promise<string | null>;
  updateUser: (updates: Partial<User>) => void;
  signup?: (...args: any[]) => Promise<any>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};