// src/contexts/ScenesContextBase.ts
import { createContext, useContext } from 'react';

// Minimal base context separated from provider to satisfy React Fast Refresh
export const ScenesContext = createContext<any>(undefined);

export const useScenes = () => {
  const ctx = useContext(ScenesContext);
  if (ctx === undefined) {
    throw new Error('useScenes must be used within a ScenesProvider');
  }
  return ctx;
};