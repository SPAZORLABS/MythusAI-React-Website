// src/services/webBackend.ts
import axios from 'axios';

interface BackendStatus {
  running: boolean;
  url?: string;
  error?: string;
}

class WebBackendService {
  private baseUrl: string;
  private status: BackendStatus = { running: false };
  private statusListeners: ((status: BackendStatus) => void)[] = [];
  private errorListeners: ((error: string) => void)[] = [];

  constructor() {
    // Use environment variable or default to localhost
    this.baseUrl = import.meta.env.VITE_API_BASE || 'https://mythusai-python-backend-production.up.railway.app';
    this.checkBackendStatus();
  }

  // Check if backend is running
  async checkBackendStatus(): Promise<BackendStatus> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000,
      });
      
      if (response.status === 200) {
        this.status = { running: true, url: this.baseUrl };
      } else {
        this.status = { running: false, error: 'Backend not responding' };
      }
    } catch (error) {
      this.status = { 
        running: false, 
        error: error instanceof Error ? error.message : 'Backend connection failed' 
      };
    }

    // Notify listeners
    this.statusListeners.forEach(listener => listener(this.status));
    
    return this.status;
  }

  // Get backend URL
  getUrl(): string {
    return this.baseUrl;
  }

  // Get current status
  getStatus(): BackendStatus {
    return this.status;
  }

  // Add status listener
  onStatus(callback: (status: BackendStatus) => void): void {
    this.statusListeners.push(callback);
  }

  // Add error listener
  onError(callback: (error: string) => void): void {
    this.errorListeners.push(callback);
  }

  // Remove all listeners
  removeAllListeners(): void {
    this.statusListeners.length = 0;
    this.errorListeners.length = 0;
  }

  // Periodically check backend status
  startStatusMonitoring(intervalMs: number = 30000): void {
    setInterval(() => {
      this.checkBackendStatus();
    }, intervalMs);
  }

  // Test backend connection
  async testConnection(): Promise<boolean> {
    const status = await this.checkBackendStatus();
    return status.running;
  }
}

// Export singleton instance
export const webBackendService = new WebBackendService();

// Start monitoring backend status
webBackendService.startStatusMonitoring();

export default webBackendService;