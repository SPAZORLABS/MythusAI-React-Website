// src/hooks/useLLMSettings.ts
import { useEffect, useState, useCallback } from 'react';
import { getLLMSettings, setLLMSettings, setApiKey, getApiKey } from '@/utils/storage';
import type { LLMSettings } from '@/utils/storage';

const defaultSettings: LLMSettings = {
  screenplay: { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, api_key: null },
  scene:      { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, api_key: null },
  chat:       { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, api_key: null },
  apiKeys:    { openai: '', gemini: '' },
};

export function useLLMSettings() {
  const [settings, setSettings] = useState<LLMSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = getLLMSettings();
      setSettings(s);
    } catch (e) {
      console.error('getLLMSettings failed', e);
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (next: Partial<LLMSettings>) => {
    try {
      const merged = setLLMSettings(next);
      setSettings(merged);
    } catch (e) {
      console.error('setLLMSettings failed', e);
    }
  }, []);

  useEffect(() => {
    // Dev: React 18 StrictMode will invoke this twice; logic must be idempotent
    load();
  }, [load]);

  return { settings, loading, save, setApiKey, getApiKey, reload: load };
}
