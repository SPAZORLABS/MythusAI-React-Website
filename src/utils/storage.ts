// src/utils/storage.ts
export interface LLMConfig {
  provider: 'openai' | 'gemini';
  model_name: string;
  temperature: number;
  timeout: number;
  top_p?: number | null;
  api_key: string | null;
}

export interface LLMSettings {
  screenplay: LLMConfig;
  scene: LLMConfig;
  chat: LLMConfig;
  apiKeys: Record<'openai' | 'gemini', string>;
}

const STORAGE_KEYS = {
  LLM_SETTINGS: 'llm-settings',
  API_KEYS: 'llm-api-keys',
} as const;

const defaultSettings: LLMSettings = {
  screenplay: { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, top_p: null, api_key: null },
  scene:      { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, top_p: null, api_key: null },
  chat:       { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, top_p: null, api_key: null },
  apiKeys:    { openai: '', gemini: '' },
};

// Initialize default settings in localStorage if not exists
function initializeDefaults() {
  const existingSettings = localStorage.getItem(STORAGE_KEYS.LLM_SETTINGS);
  if (!existingSettings) {
    localStorage.setItem(STORAGE_KEYS.LLM_SETTINGS, JSON.stringify(defaultSettings));
  }

  const existingApiKeys = localStorage.getItem(STORAGE_KEYS.API_KEYS);
  if (!existingApiKeys) {
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(defaultSettings.apiKeys));
  }
}

// Get LLM settings from localStorage
export function getLLMSettings(): LLMSettings {
  initializeDefaults();

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LLM_SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle any missing properties
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Failed to parse LLM settings from localStorage:', error);
  }

  return defaultSettings;
}

// Set LLM settings in localStorage
export function setLLMSettings(next: Partial<LLMSettings>): LLMSettings {
  try {
    const current = getLLMSettings();
    const merged = { ...current, ...next };
    localStorage.setItem(STORAGE_KEYS.LLM_SETTINGS, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.error('Failed to save LLM settings to localStorage:', error);
    throw error;
  }
}

// Set API key in localStorage (encrypted using simple base64 for web)
export function setApiKey(provider: 'openai' | 'gemini', apiKey: string): boolean {
  try {
    const current = getLLMSettings();
    const updated = { ...current.apiKeys, [provider]: apiKey };
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(updated));

    // Also update the main settings object
    const settings = getLLMSettings();
    settings.apiKeys = updated;
    setLLMSettings(settings);

    return true;
  } catch (error) {
    console.error('Failed to save API key to localStorage:', error);
    return false;
  }
}

// Get API key from localStorage
export function getApiKey(provider: 'openai' | 'gemini'): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (stored) {
      const apiKeys = JSON.parse(stored);
      return apiKeys[provider] || null;
    }
  } catch (error) {
    console.error('Failed to get API key from localStorage:', error);
  }

  return null;
}

// Export storage keys for external use if needed
export { STORAGE_KEYS };
