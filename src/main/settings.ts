// main/settings.ts (Main process)
import Store from 'electron-store';
import { app, ipcMain, safeStorage } from 'electron';

// Types mirrored from your UI
type Provider = 'openai' | 'gemini';
type UseCase = 'screenplay' | 'scene' | 'chat';

interface LLMConfig {
  provider: Provider;
  model_name: string;
  temperature: number;
  timeout: number;
  top_p?: number | null;
}

interface LLMSettings {
  screenplay: LLMConfig;
  scene: LLMConfig;
  chat: LLMConfig;
}

const defaultSettings: LLMSettings = {
  screenplay: { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, top_p: null },
  scene:      { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, top_p: null },
  chat:       { provider: 'openai', model_name: 'gpt-4o-mini', temperature: 0.5, timeout: 30, top_p: null },
};

const settingsStore = new Store<LLMSettings>({
  name: 'llm-settings',
  defaults: defaultSettings,
});

// Optional: secrets via safeStorage (or use keytar)
const secretStore = new Store<Record<string, string>>({ name: 'llm-secrets' });

function setApiKey(provider: Provider, apiKey: string) {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(apiKey).toString('latin1');
    secretStore.set(provider, encrypted);
  } else {
    // Fallback: still obfuscated, but weaker on some Linux setups
    const encrypted = Buffer.from(apiKey, 'utf8').toString('base64');
    secretStore.set(provider, encrypted);
  }
}

function getApiKey(provider: Provider): string | null {
  const stored = secretStore.get(provider);
  if (!stored) return null;
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(stored, 'latin1'));
    }
    return Buffer.from(stored, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

// IPC handlers (keep narrow, no ipcRenderer exposure)
ipcMain.handle('settings:getLLMSettings', () => settingsStore.store);
ipcMain.handle('settings:setLLMSettings', (_e, next: Partial<LLMSettings>) => {
  const merged = { ...settingsStore.store, ...next };
  settingsStore.store = merged;
  return merged;
});

ipcMain.handle('secrets:setApiKey', (_e, provider: Provider, apiKey: string) => {
  setApiKey(provider, apiKey);
  return true;
});

ipcMain.handle('secrets:getApiKey', (_e, provider: Provider) => {
  return getApiKey(provider);
});
