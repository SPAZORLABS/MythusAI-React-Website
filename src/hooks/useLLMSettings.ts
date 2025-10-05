// src/hooks/useLLMSettings.ts
import { useEffect, useState, useCallback } from 'react';
import type { LLMSettings } from '@/types/electron';

const defaultSettings: LLMSettings = {
  screenplay: { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, api_key: null },
  scene:      { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, api_key: null },
  chat:       { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, api_key: null },
  apiKeys:    { openai: '', gemini: '' },
};

export function useLLMSettings() {
  const [settings, setSettings] = useState<LLMSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const isBridge =
    typeof window !== 'undefined' &&
    !!(window as any).settings?.getLLMSettings &&
    !!(window as any).settings?.setLLMSettings;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (isBridge) {
        const s = await (window as any).settings.getLLMSettings();
        if (s) setSettings(s);
      } // else keep defaults for web/dev
    } catch (e) {
      console.error('getLLMSettings failed', e);
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, [isBridge]);

  const save = useCallback(async (next: Partial<LLMSettings>) => {
    try {
      if (isBridge) {
        const merged = await (window as any).settings.setLLMSettings(next);
        setSettings(merged);
      } else {
        // local fallback so UI keeps working
        setSettings(prev => ({ ...prev, ...next } as LLMSettings));
      }
    } catch (e) {
      console.error('setLLMSettings failed', e);
    }
  }, [isBridge]);

  const setApiKey = useCallback(async (provider: 'openai' | 'gemini', apiKey: string) => {
    if ((window as any).secrets?.setApiKey) {
      await (window as any).secrets.setApiKey(provider, apiKey);
    } else {
      console.warn('secrets bridge not available');
    }
  }, []);

  const getApiKey = useCallback(async (provider: 'openai' | 'gemini') => {
    if ((window as any).secrets?.getApiKey) {
      return (window as any).secrets.getApiKey(provider);
    }
    return null;
  }, []);

  useEffect(() => {
    // Dev: React 18 StrictMode will invoke this twice; logic must be idempotent
    load();
  }, [load]);

  return { settings, loading, save, setApiKey, getApiKey, reload: load };
}
