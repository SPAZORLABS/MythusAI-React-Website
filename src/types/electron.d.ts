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
  }
}
