export interface WebAPI {
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
  backend: {
    check: () => Promise<any>;
    getUrl: () => Promise<string>;
    onStatus: (callback: (status: any) => void) => void;
    onError: (callback: (error: string) => void) => void;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
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