export interface ElectronAPI {
  auth: {
    login: () => Promise<void>;
    logout: () => Promise<void>;
    check: () => Promise<{ isAuthenticated: boolean; user: any }>;
    getToken: () => Promise<string | null>;
    onAuthSuccess: (callback: (data: any) => void) => void;
    onAuthError: (callback: (error: string) => void) => void;
    onAuthLogout: (callback: () => void) => void;
    onAuthStatus: (callback: (data: any) => void) => void;
    onNavigate: (callback: (path: string) => void) => void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
    settings: {
      getLLMSettings: () => Promise<LLMSettings>;
      setLLMSettings: (next: Partial<LLMSettings>) => Promise<LLMSettings>;
    };
    secrets: {
      setApiKey: (provider: 'openai' | 'gemini', apiKey: string) => Promise<boolean>;
      getApiKey: (provider: 'openai' | 'gemini') => Promise<string | null>;
    };
  }
}

type Provider = 'openai' | 'gemini';
type UseCase = 'screenplay' | 'scene' | 'chat';

interface LLMConfig {
  provider: Provider;
  model_name: string;
  temperature: number;
  timeout: number;
  top_p?: number | null;
  api_key: string | null;
}

interface LLMSettings {
  screenplay: LLMConfig;
  scene: LLMConfig;
  chat: LLMConfig;
  apiKeys: Record<Provider, string>;
}