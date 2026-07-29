import { apiClient } from '../apiClient';
import { storage } from '../storage';

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
};

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponseData> => {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('auth/login', credentials);
    if (response.data.success && response.data.data) {
      await storage.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponseData> => {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('auth/refresh-token', { refreshToken });
    if (response.data.success && response.data.data) {
      await storage.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Token refresh failed');
  },

  logout: async (): Promise<void> => {
    const { refreshToken } = await storage.getTokens();
    if (refreshToken) {
      try {
        await apiClient.post('auth/logout', { refreshToken });
      } catch (err) {
        console.warn('Logout endpoint error:', err);
      }
    }
    await storage.clearTokens();
    await storage.clearActiveSession();
  },
};
