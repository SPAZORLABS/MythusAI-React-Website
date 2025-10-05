// src/auth/AuthProvider.tsx
import React, { useState } from 'react';
import { useElectronAuth } from '@/hooks/useElectronAuth';
import { AuthContext, AuthContextType, User } from './context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const electronAuth = useElectronAuth();
  const [userOverride, setUserOverride] = useState<User | null>(null);

  const baseUser: User | null = (electronAuth.email && electronAuth.username)
    ? { email: electronAuth.email, username: electronAuth.username }
    : null;

  const mergedUser: User | null = userOverride
    ? (baseUser ? { ...baseUser, ...userOverride } : userOverride)
    : baseUser;

  const updateUser = (updates: Partial<User>) => {
    setUserOverride(prev => {
      const current: User | null = prev ?? baseUser;
      if (!current) return prev;
      return { ...current, ...updates };
    });
  };

  const value: AuthContextType = {
    user: mergedUser,
    isAuthenticated: electronAuth.isAuthenticated,
    isLoading: electronAuth.isLoading,
    loading: electronAuth.isLoading,
    login: electronAuth.login,
    logout: electronAuth.logout,
    getToken: electronAuth.getToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
