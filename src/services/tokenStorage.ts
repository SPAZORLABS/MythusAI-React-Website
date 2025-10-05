// src/services/tokenStorage.ts
import { safeStorage } from 'electron';
import Store from 'electron-store';

interface AuthData {
  token: string;
  email: string;
  username: string;
  expiresAt: number;
}

const store = new Store({
  name: 'mythusai-auth',
});

export class TokenStorageService {
  private static readonly TOKEN_KEY = 'encrypted_auth_data';
  private static readonly TOKEN_EXPIRY_DAYS = 30;

  /**
   * Store authentication data securely
   */
  static storeAuthData(token: string, email: string, username: string): void {
    const expiresAt = Date.now() + (this.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    
    const authData: AuthData = {
      token,
      email,
      username,
      expiresAt,
    };

    // Encrypt the data using OS-level encryption
    const encrypted = safeStorage.encryptString(JSON.stringify(authData));
    
    // Store encrypted data
    store.set(this.TOKEN_KEY, encrypted.toString('base64'));
    
    console.log('✅ Auth data stored securely');
  }

  /**
   * Retrieve and decrypt authentication data
   */
  static getAuthData(): AuthData | null {
    try {
      const encryptedBase64 = store.get(this.TOKEN_KEY) as string;
      
      if (!encryptedBase64) {
        console.log('No auth data found');
        return null;
      }

      // Decrypt the data
      const encrypted = Buffer.from(encryptedBase64, 'base64');
      const decrypted = safeStorage.decryptString(encrypted);
      const authData: AuthData = JSON.parse(decrypted);

      // Check if token is expired
      if (Date.now() > authData.expiresAt) {
        console.log('Token expired');
        this.clearAuthData();
        return null;
      }

      return authData;
    } catch (error) {
      console.error('Failed to retrieve auth data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const authData = this.getAuthData();
    return authData !== null;
  }

  /**
   * Clear stored authentication data
   */
  static clearAuthData(): void {
    store.delete(this.TOKEN_KEY);
    console.log('✅ Auth data cleared');
  }

  /**
   * Get token only (for API calls)
   */
  static getToken(): string | null {
    const authData = this.getAuthData();
    return authData?.token || null;
  }

  /**
   * Get user info
   */
  static getUserInfo(): { email: string; username: string } | null {
    const authData = this.getAuthData();
    if (!authData) return null;
    
    return {
      email: authData.email,
      username: authData.username,
    };
  }
}
