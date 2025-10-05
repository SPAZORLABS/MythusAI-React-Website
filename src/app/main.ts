import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'node:path';
import axios from 'axios';
// @ts-ignore
import started from 'electron-squirrel-startup';
import { AuthDeepLinkHandler } from '../services/authDeepLink';
import { TokenStorageService } from '../services/tokenStorage';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let backendReady = false;

const BACKEND_PORT = 8765;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;

if (started) app.quit();

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.quit();

// Splash
function createSplashScreen() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashPath = path.join(__dirname, '../../public/splash.html');
  splashWindow.loadFile(splashPath).catch(() => {
    splashWindow?.loadURL(`data:text/html,
      <html><body style="margin:0;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif">
        <div style="text-align:center"><h1>MythusAI</h1><p>Loading...</p></div>
      </body></html>`);
  });

  splashWindow.on('closed', () => (splashWindow = null));
}

function closeSplashScreen() {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
  }
}

// Backend
async function startBackend(): Promise<void> {
  const isDev = !!MAIN_WINDOW_VITE_DEV_SERVER_URL;
  if (isDev) {
    console.log('Dev mode: expecting backend at', BACKEND_URL);
    return;
  }

  const backendPath = path.join(
    process.resourcesPath,
    'backend',
    process.platform === 'win32' ? 'mythusai-backend.exe' : 'mythusai-backend'
  );

  try {
    const fs = require('fs');
    if (!fs.existsSync(backendPath)) {
      console.log('No bundled backend found; continuing without managed backend');
      backendReady = true;
      return;
    }
  } catch {
    backendReady = true;
    return;
  }

  backendProcess = spawn(backendPath, [], {
    cwd: path.dirname(backendPath),
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  backendProcess.stdout?.on('data', d => console.log('[Backend]', d.toString().trim()));
  backendProcess.stderr?.on('data', d => console.error('[Backend Error]', d.toString().trim()));
  backendProcess.on('error', err => {
    console.error('Backend failed to start:', err);
    backendReady = true; // allow app to continue
    mainWindow?.webContents.send('backend-error', err.message);
  });
  backendProcess.on('exit', (code, signal) => {
    console.log(`Backend exited code=${code} signal=${signal}`);
    backendProcess = null;
    backendReady = false;
  });
}

async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await axios.get(`${BACKEND_URL}/health`, { timeout: 1500 });
    return res.data?.ready === true;
  } catch {
    return false;
  }
}

async function waitForBackend(maxAttempts = 40): Promise<void> {
  if (backendReady) {
    mainWindow?.webContents.send('backend-status', { status: 'ready', url: BACKEND_URL });
    setTimeout(closeSplashScreen, 300);
    return;
  }

  for (let i = 0; i < maxAttempts; i++) {
    mainWindow?.webContents.send('backend-status', {
      status: 'starting',
      attempt: i + 1,
      maxAttempts,
      progress: Math.round(((i + 1) / maxAttempts) * 100),
      message: 'Starting backend...',
    });

    if (await checkBackendHealth()) {
      backendReady = true;
      mainWindow?.webContents.send('backend-status', { status: 'ready', url: BACKEND_URL });
      setTimeout(closeSplashScreen, 300);
      return;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.warn('Backend not ready in time; continuing without it');
  backendReady = true;
  mainWindow?.webContents.send('backend-status', {
    status: 'ready',
    url: BACKEND_URL,
    message: 'Running without backend',
  });
  closeSplashScreen();
}

async function stopBackend() {
  if (!backendProcess) return;
  try {
    await axios.post(`${BACKEND_URL}/shutdown`, {}, { timeout: 2000 });
    await new Promise(r => setTimeout(r, 1000));
  } catch {
    // ignore
  }
  if (backendProcess && !backendProcess.killed) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(backendProcess.pid), '/f', '/t']);
    } else {
      backendProcess.kill('SIGTERM');
      setTimeout(() => backendProcess && !backendProcess.killed && backendProcess.kill('SIGKILL'), 1500);
    }
  }
  backendProcess = null;
  backendReady = false;
}

// IPC
function setupIPC() {
  ipcMain.handle('auth:login', async () => {
    try {
      AuthDeepLinkHandler.openLogin();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    try {
      AuthDeepLinkHandler.logout();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('auth:check', async () => {
    try {
      return {
        isAuthenticated: AuthDeepLinkHandler.isAuthenticated(),
        user: TokenStorageService.getUserInfo(),
      };
    } catch {
      return { isAuthenticated: false, user: null };
    }
  });

  ipcMain.handle('auth:getToken', async () => {
    try {
      return TokenStorageService.getToken();
    } catch {
      return null;
    }
  });

  ipcMain.handle('backend:check', async () => ({ ready: backendReady, url: BACKEND_URL }));
  ipcMain.handle('backend:url', () => BACKEND_URL);
}

// Window
function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../../public/icons/icon.png'),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'MythusAI',
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      // keep webSecurity true; file:// routing will be handled by HashRouter
    },
  });

  AuthDeepLinkHandler.initialize(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
    mainWindow.loadFile(indexPath);
  }

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  mainWindow.webContents.once('did-finish-load', () => {
    const authData = TokenStorageService.getUserInfo();
    if (authData) {
      mainWindow?.webContents.send('auth-status', { isAuthenticated: true, ...authData });
    }
  });

  mainWindow.on('closed', () => (mainWindow = null));
}

// App lifecycle
setupIPC();

app.whenReady().then(async () => {
  createSplashScreen();
  createWindow();
  await startBackend();
  await waitForBackend();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

let isQuitting = false;

app.on('before-quit', async (e) => {
  if (!isQuitting) {
    e.preventDefault();
    isQuitting = true;
    closeSplashScreen();
    await stopBackend();
    app.exit(0);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  closeSplashScreen();
  stopBackend();
  app.exit(1);
});
