import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Auth methods
  auth: {
    login: () => ipcRenderer.invoke('auth:login'),
    logout: () => ipcRenderer.invoke('auth:logout'),
    check: () => ipcRenderer.invoke('auth:check'),
    getToken: () => ipcRenderer.invoke('auth:getToken'),

    onAuthSuccess: (callback: (data: any) => void) => {
      ipcRenderer.on('auth-success', (_, data) => callback(data));
    },
    onAuthError: (callback: (error: string) => void) => {
      ipcRenderer.on('auth-error', (_, error) => callback(error));
    },
    onAuthLogout: (callback: () => void) => {
      ipcRenderer.on('auth-logout', () => callback());
    },
    onAuthStatus: (callback: (data: any) => void) => {
      ipcRenderer.on('auth-status', (_, data) => callback(data));
    },
    onNavigate: (callback: (path: string) => void) => {
      ipcRenderer.on('navigate', (_, path) => callback(path));
    },
  },

  // ✅ Backend methods
  backend: {
    check: () => ipcRenderer.invoke('backend:check'),
    getUrl: () => ipcRenderer.invoke('backend:url'),

    onStatus: (callback: (status: any) => void) => {
      ipcRenderer.on('backend-status', (_, status) => callback(status));
    },

    onError: (callback: (error: string) => void) => {
      ipcRenderer.on('backend-error', (_, error) => callback(error));
    },
  },
});