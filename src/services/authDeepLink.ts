// src/services/authDeepLink.ts
import { app, BrowserWindow, shell } from 'electron';
import { TokenStorageService } from './tokenStorage';
import path from 'node:path';

export class AuthDeepLinkHandler {
  private static mainWindow: BrowserWindow | null = null;

  /**
   * Initialize auth deep link handler
   */
  static initialize(window: BrowserWindow) {
    this.mainWindow = window;
    this.setupDeepLinking();
  }

  /**
   * Setup deep linking for OAuth callback
   */
  private static setupDeepLinking() {
    // Register protocol
    if (process.defaultApp) {
      // Development mode
      if (process.argv.length >= 2) {
        // ✅ Use resolved path to avoid system32
        const appPath = path.resolve(process.argv[1]);
        console.log('🔧 Registering protocol (dev):', process.execPath, appPath);
        
        try {
          app.setAsDefaultProtocolClient('mythusai', process.execPath, [appPath]);
        } catch (error) {
          console.warn('⚠️ Failed to register protocol in dev mode:', error);
        }
      }
    } else {
      // Production mode
      console.log('🔧 Registering protocol (prod)');
      app.setAsDefaultProtocolClient('mythusai');
    }

    // Handle deep link on macOS
    app.on('open-url', (event, url) => {
      event.preventDefault();
      this.handleAuthCallback(url);
    });

    // Handle deep link on Windows/Linux (second instance)
    app.on('second-instance', (event, commandLine) => {
      const url = commandLine.find((arg) => arg.startsWith('mythusai://'));
      if (url) {
        this.handleAuthCallback(url);
      }

      // Focus the window
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore();
        }
        this.mainWindow.focus();
      }
    });
  }

  /**
   * Handle OAuth callback from deep link
   */
  private static handleAuthCallback(url: string) {
    console.log('🔗 Deep link received:', url);

    try {
      const urlObj = new URL(url);
      
      // Check if it's an auth callback
      if (urlObj.pathname === '/auth' || urlObj.host === 'auth') {
        const token = urlObj.searchParams.get('token');
        const email = urlObj.searchParams.get('email');
        const username = urlObj.searchParams.get('username');

        if (token && email && username) {
          // Store the token securely
          TokenStorageService.storeAuthData(
            token,
            decodeURIComponent(email),
            decodeURIComponent(username)
          );

          console.log('✅ Auth data stored successfully');

          // Notify renderer process
          this.mainWindow?.webContents.send('auth-success', {
            email: decodeURIComponent(email),
            username: decodeURIComponent(username),
          });

          // Navigate to dashboard
          this.mainWindow?.webContents.send('navigate', '/');
        } else {
          console.error('❌ Missing auth parameters');
          this.mainWindow?.webContents.send('auth-error', 'Invalid auth callback');
        }
      }
    } catch (error) {
      console.error('❌ Failed to parse auth callback:', error);
      this.mainWindow?.webContents.send('auth-error', 'Failed to process auth callback');
    }
  }

  /**
   * Open login URL in browser
   */
  static openLogin() {
    const loginUrl = 'https://mythusai.vercel.app/';
    shell.openExternal(loginUrl);
  }

  /**
   * Logout and clear token
   */
  static logout() {
    TokenStorageService.clearAuthData();
    this.mainWindow?.webContents.send('auth-logout');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return TokenStorageService.isAuthenticated();
  }

  /**
   * Get current user info
   */
  static getUserInfo() {
    return TokenStorageService.getUserInfo();
  }
}
