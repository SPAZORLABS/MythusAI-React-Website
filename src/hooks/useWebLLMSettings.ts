// src/hooks/useWebLLMSettings.ts
import { useState, useEffect } from 'react';
import WebStore from '@/services/webStorage';

type Provider = 'openai' | 'gemini';
type UseCase = 'screenplay' | 'scene' | 'chat';

interface LLMConfig {
  provider: Provider;
  model_name: string;
  temperature: number;
  timeout: number;
  top_p?: number | null;
  api_key?: string | null;
}

interface LLMSettings {
  screenplay: LLMConfig;
  scene: LLMConfig;
  chat: LLMConfig;
}

// Defaults
const defaultSettings: LLMSettings = {
  screenplay: { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, top_p: null },
  scene:      { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, top_p: null },
  chat:       { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, top_p: null },
};

// Stores
const settingsStore = new WebStore<LLMSettings>({ name: 'llm-settings', defaults: defaultSettings });
const secretsStore = new WebStore<Record<string, string>>({ name: 'llm-secrets' });

// Simple encryption/decryption for API keys (basic obfuscation)
function encryptApiKey(apiKey: string): string {
  return btoa(apiKey); // Base64 encoding as basic obfuscation
}

function decryptApiKey(encrypted: string): string {
  try {
    return atob(encrypted); // Base64 decoding
  } catch {
    return encrypted; // Return as-is if decoding fails
  }
}

function setApiKey(provider: Provider, apiKey: string) {
  const encrypted = encryptApiKey(apiKey);
  secretsStore.set(provider, encrypted);
}

function getApiKey(provider: Provider): string | null {
  const encrypted = secretsStore.get(provider);
  if (!encrypted) return null;
  return decryptApiKey(encrypted);
}

export const useWebLLMSettings = () => {
  const [settings, setSettings] = useState<LLMSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from storage
    const loadSettings = () => {
      try {
        const storedSettings = settingsStore.store;
        setSettings(storedSettings);
      } catch (error) {
        console.error('Failed to load LLM settings:', error);
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = (newSettings: Partial<LLMSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    settingsStore.store = updatedSettings;
  };

  const updateApiKey = (provider: Provider, apiKey: string) => {
    setApiKey(provider, apiKey);
  };

  const getStoredApiKey = (provider: Provider): string | null => {
    return getApiKey(provider);
  };

  return {
    settings,
    isLoading,
    updateSettings,
    updateApiKey,
    getStoredApiKey,
  };
};