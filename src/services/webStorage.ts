// src/services/webStorage.ts
// Web-compatible replacement for Electron Store

interface StorageOptions {
  name: string;
  defaults?: any;
}

class WebStore<T extends Record<string, any> = Record<string, any>> {
  private storageKey: string;
  private defaultValues: T;

  constructor(options: StorageOptions) {
    this.storageKey = `mythusai_${options.name}`;
    this.defaultValues = options.defaults || {} as T;
  }

  get store(): T {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return { ...this.defaultValues, ...JSON.parse(stored) };
      }
      return this.defaultValues;
    } catch (error) {
      console.error('Failed to get from storage:', error);
      return this.defaultValues;
    }
  }

  set store(value: T) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  get<K extends keyof T>(key: K): T[K] {
    const store = this.store;
    return store[key];
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    const store = this.store;
    store[key] = value;
    this.store = store;
  }

  delete<K extends keyof T>(key: K): void {
    const store = this.store;
    delete store[key];
    this.store = store;
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  has<K extends keyof T>(key: K): boolean {
    const store = this.store;
    return key in store;
  }
}

export default WebStore;