import { apiClient } from '../apiClient';
import { ApiResponse } from './authApi';
import { mockReasons } from '../mockData';

export type UnsatisfiedReason = {
  id: number;
  reasonName: string;
  status: string;
};

export const reasonsApi = {
  getReasons: async (): Promise<UnsatisfiedReason[]> => {
    try {
      const response = await apiClient.get<ApiResponse<UnsatisfiedReason[]>>('api/customersatisfaction/reasons');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return mockReasons.map(r => ({ id: r.id, reasonName: r.label, status: 'active' }));
    } catch (error) {
      console.warn('Using fallback unsatisfied reasons due to network error:', error);
      return mockReasons.map(r => ({ id: r.id, reasonName: r.label, status: 'active' }));
    }
  },

  getReasonById: async (id: number): Promise<UnsatisfiedReason> => {
    const response = await apiClient.get<ApiResponse<UnsatisfiedReason>>(`api/customersatisfaction/reasons/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Reason not found');
  },

  createReason: async (reasonName: string): Promise<UnsatisfiedReason> => {
    const response = await apiClient.post<ApiResponse<UnsatisfiedReason>>('api/customersatisfaction/reasons', {
      reasonName,
      status: 'active',
    });
    return response.data.data;
  },

  updateReason: async (id: number, reasonName: string, status: string): Promise<UnsatisfiedReason> => {
    const response = await apiClient.put<ApiResponse<UnsatisfiedReason>>(`api/customersatisfaction/reasons/${id}`, {
      reasonName,
      status,
    });
    return response.data.data;
  },

  deleteReason: async (id: number): Promise<void> => {
    await apiClient.delete(`api/customersatisfaction/reasons/${id}`);
  },
};
