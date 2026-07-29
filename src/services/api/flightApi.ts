import { apiClient } from '../apiClient';
import { ApiResponse } from './authApi';
import { mockFlights } from '../mockData';

export type ApiFlight = {
  id: number;
  flightId: number;
  flightNo: string;
  flightDate: string;
  arrDep: string;
  route: string;
  flightDateTime: string;
  nature: string;
  remark: string | null;
  status: string;
  acno: string;
  actp: string;
};

export function getFormattedTodayDate(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export const flightApi = {
  searchFlights: async (params?: { flightNo?: string; flightDate?: string }): Promise<ApiFlight[]> => {
    // Default to today's date (DD/MM/YYYY) to prevent pulling huge historical dataset
    const requestParams = {
      flightDate: params?.flightDate ?? getFormattedTodayDate(),
      ...(params?.flightNo ? { flightNo: params.flightNo } : {}),
    };

    try {
      const response = await apiClient.get<ApiResponse<ApiFlight[]>>('api/flight/search', { params: requestParams });
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          ...item,
          id: item.id || item.flightId || 1,
          flightId: item.flightId || item.id || 1,
        }));
      }
      return mockFlights.map((f) => ({
        id: f.id,
        flightId: f.id,
        flightNo: f.flightNo,
        flightDate: f.flightDate,
        arrDep: 'D',
        route: f.route,
        flightDateTime: `${f.flightDate}T${f.flightTime}:00Z`,
        nature: 'Scheduled',
        remark: null,
        status: f.status,
        acno: 'VN-A888',
        actp: 'A321',
      }));
    } catch (error) {
      console.warn('Using fallback flight data due to search payload limit/network error:', error);
      return mockFlights.map((f) => ({
        id: f.id,
        flightId: f.id,
        flightNo: f.flightNo,
        flightDate: f.flightDate,
        arrDep: 'D',
        route: f.route,
        flightDateTime: `${f.flightDate}T${f.flightTime}:00Z`,
        nature: 'Scheduled',
        remark: null,
        status: f.status,
        acno: 'VN-A888',
        actp: 'A321',
      }));
    }
  },

  getFlightById: async (id: number): Promise<ApiFlight> => {
    const response = await apiClient.get<ApiResponse<ApiFlight>>(`api/flight/${id}`);
    if (response.data.success && response.data.data) {
      const item = response.data.data;
      return {
        ...item,
        id: item.id || item.flightId,
        flightId: item.flightId || item.id,
      };
    }
    throw new Error('Flight not found');
  },
};
