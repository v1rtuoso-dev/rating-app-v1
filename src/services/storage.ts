import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'hgs_access_token';
const REFRESH_TOKEN_KEY = 'hgs_refresh_token';
const ACTIVE_SESSION_KEY = 'hgs_active_session';

// Memory fallback store
const memoryStore: Record<string, string> = {};

let secureStoreModule: typeof import('expo-secure-store') | null = null;
let isSecureStoreAvailable = false;

if (Platform.OS !== 'web') {
  try {
    secureStoreModule = require('expo-secure-store');
    if (secureStoreModule?.isAvailableAsync) {
      secureStoreModule.isAvailableAsync().then((avail) => {
        isSecureStoreAvailable = avail;
      }).catch(() => {
        isSecureStoreAvailable = false;
      });
    }
  } catch {
    secureStoreModule = null;
    isSecureStoreAvailable = false;
  }
}

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch {
        return memoryStore[key] ?? null;
      }
    }

    if (secureStoreModule && isSecureStoreAvailable) {
      try {
        return await secureStoreModule.getItemAsync(key);
      } catch (err) {
        console.warn('SecureStore.getItemAsync error, fallback to memory:', err);
      }
    }

    return memoryStore[key] ?? null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch {
        memoryStore[key] = value;
      }
      return;
    }

    if (secureStoreModule && isSecureStoreAvailable) {
      try {
        await secureStoreModule.setItemAsync(key, value);
        return;
      } catch (err) {
        console.warn('SecureStore.setItemAsync error, fallback to memory:', err);
      }
    }

    memoryStore[key] = value;
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch {
        delete memoryStore[key];
      }
      return;
    }

    if (secureStoreModule && isSecureStoreAvailable) {
      try {
        await secureStoreModule.deleteItemAsync(key);
        return;
      } catch (err) {
        console.warn('SecureStore.deleteItemAsync error, fallback to memory:', err);
      }
    }

    delete memoryStore[key];
  },

  getTokens: async () => {
    const accessToken = await storage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  },

  setTokens: async (accessToken: string, refreshToken: string) => {
    await storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: async () => {
    await storage.removeItem(ACCESS_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
  },

  getActiveSession: async () => {
    const json = await storage.getItem(ACTIVE_SESSION_KEY);
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  },

  setActiveSession: async (sessionData: any) => {
    await storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
  },

  clearActiveSession: async () => {
    await storage.removeItem(ACTIVE_SESSION_KEY);
  },
};
