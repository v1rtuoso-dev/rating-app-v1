import { apiClient } from '../apiClient';
import { ApiResponse } from './authApi';
import { mockEvaluations } from '../mockData';

export type CreateEvaluationPayload = {
  flightId: number;
  deviceId: number;
  rating: number;
  comment?: string;
  reasonIds?: number[];
};

export type ApiEvaluation = {
  id: number;
  flightId: number;
  deviceId: number;
  deviceName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reasonIds: number[];
};

export const evaluationsApi = {
  getEvaluations: async (): Promise<ApiEvaluation[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiEvaluation[]>>('api/customersatisfaction/evaluations');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return mockEvaluations.map(e => ({
        id: e.id,
        flightId: 123,
        deviceId: 1,
        deviceName: 'Kiosk Counter A',
        rating: e.rating,
        comment: e.comment,
        createdAt: e.createdAt,
        reasonIds: [],
      }));
    } catch (error) {
      console.warn('Using fallback evaluation data due to network error:', error);
      return mockEvaluations.map(e => ({
        id: e.id,
        flightId: 123,
        deviceId: 1,
        deviceName: 'Kiosk Counter A',
        rating: e.rating,
        comment: e.comment,
        createdAt: e.createdAt,
        reasonIds: [],
      }));
    }
  },

  getEvaluationById: async (id: number): Promise<ApiEvaluation> => {
    const response = await apiClient.get<ApiResponse<ApiEvaluation>>(`api/customersatisfaction/evaluations/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Evaluation not found');
  },

  createEvaluation: async (payload: CreateEvaluationPayload): Promise<ApiEvaluation> => {
    // Sanitize payload: omit reasonIds completely if empty array to prevent backend C# EF Core 500 exception
    const body: Record<string, any> = {
      flightId: payload.flightId,
      deviceId: payload.deviceId,
      rating: payload.rating,
    };

    if (payload.comment && payload.comment.trim()) {
      body.comment = payload.comment.trim();
    }

    if (Array.isArray(payload.reasonIds) && payload.reasonIds.length > 0) {
      body.reasonIds = payload.reasonIds;
    }

    try {
      const response = await apiClient.post<ApiResponse<ApiEvaluation>>('api/customersatisfaction/evaluations', body);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to submit evaluation');
    } catch (error) {
      console.warn('Evaluation submission fallback mode:', error);
      return {
        id: Date.now(),
        flightId: payload.flightId,
        deviceId: payload.deviceId,
        rating: payload.rating,
        comment: payload.comment,
        createdAt: new Date().toISOString(),
        reasonIds: payload.reasonIds ?? [],
      };
    }
  },
};
