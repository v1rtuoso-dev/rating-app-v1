import { apiClient } from '../apiClient';
import { ApiResponse } from './authApi';
import { mockEvaluations } from '../mockData';

export type CreateEvaluationPayload = {
  id?: number;
  flightId: number;
  staffUserId?: number;
  deviceId: number;
  checkinCounterName?: string;
  ratingLevel?: number;
  rating?: number;
  evaluationType?: number;
  reasonIds?: number[];
};

export type ApiEvaluation = {
  id: number;
  flightId: number;
  staffUserId?: number;
  deviceId: number;
  deviceName?: string;
  checkinCounterName?: string;
  ratingLevel?: number;
  rating: number;
  evaluationType?: number;
  createdAt: string;
  reasonIds: number[];
};

export const evaluationsApi = {
  getEvaluations: async (): Promise<ApiEvaluation[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiEvaluation[]>>('api/customersatisfaction/evaluations');
      if (response.data.success && response.data.data) {
        return response.data.data.map(item => ({
          ...item,
          rating: item.ratingLevel ?? item.rating ?? 4,
        }));
      }
      return mockEvaluations.map(e => ({
        id: e.id,
        flightId: 123,
        staffUserId: 0,
        deviceId: 1,
        deviceName: 'Kiosk Counter A',
        checkinCounterName: 'Counter A',
        ratingLevel: e.rating,
        rating: e.rating,
        evaluationType: 0,
        createdAt: e.createdAt,
        reasonIds: [],
      }));
    } catch (error) {
      console.warn('Using fallback evaluation data due to network error:', error);
      return mockEvaluations.map(e => ({
        id: e.id,
        flightId: 123,
        staffUserId: 0,
        deviceId: 1,
        deviceName: 'Kiosk Counter A',
        checkinCounterName: 'Counter A',
        ratingLevel: e.rating,
        rating: e.rating,
        evaluationType: 0,
        createdAt: e.createdAt,
        reasonIds: [],
      }));
    }
  },

  getEvaluationById: async (id: number): Promise<ApiEvaluation> => {
    const response = await apiClient.get<ApiResponse<ApiEvaluation>>(`api/customersatisfaction/evaluations/${id}`);
    if (response.data.success && response.data.data) {
      const item = response.data.data;
      return {
        ...item,
        rating: item.ratingLevel ?? item.rating ?? 4,
      };
    }
    throw new Error('Evaluation not found');
  },

  createEvaluation: async (payload: CreateEvaluationPayload): Promise<ApiEvaluation> => {
    const finalRatingLevel = payload.ratingLevel ?? payload.rating ?? 4;
    const body = {
      flightId: payload.flightId,
      staffUserId: payload.staffUserId ?? 0,
      deviceId: payload.deviceId,
      checkinCounterName: payload.checkinCounterName ?? 'Counter A',
      ratingLevel: finalRatingLevel,
      evaluationType: payload.evaluationType ?? 0,
      reasonIds: payload.reasonIds ?? [],
    };

    console.log('Sending evaluations API body:', JSON.stringify(body, null, 2));

    try {
      const response = await apiClient.post<ApiResponse<ApiEvaluation>>('api/customersatisfaction/evaluations', body);
      if (response.data.success && response.data.data) {
        const resData = response.data.data;
        return {
          ...resData,
          rating: resData.ratingLevel ?? resData.rating ?? finalRatingLevel,
        };
      }
      throw new Error(response.data.message || 'Failed to submit evaluation');
    } catch (error) {
      console.warn('Evaluation submission fallback mode:', error);
      return {
        id: Date.now(),
        flightId: payload.flightId,
        staffUserId: body.staffUserId,
        deviceId: payload.deviceId,
        checkinCounterName: body.checkinCounterName,
        ratingLevel: finalRatingLevel,
        rating: finalRatingLevel,
        evaluationType: body.evaluationType,
        createdAt: new Date().toISOString(),
        reasonIds: payload.reasonIds ?? [],
      };
    }
  },
};
