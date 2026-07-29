import * as Device from 'expo-device';
import { apiClient } from '../apiClient';
import { storage } from '../storage';
import { ApiResponse } from './authApi';

export type ApiDevice = {
  id: number;
  deviceName: string;
  deviceIdentifier: string;
  status: string;
  lastSeenAt: string;
};

export type CreateDevicePayload = {
  deviceName: string;
  deviceIdentifier: string;
  status: string;
  lastSeenAt: string;
};

export async function getOrCreateDeviceIdentifier(): Promise<string> {
  let identifier = await storage.getItem('hgs_device_identifier');
  if (!identifier) {
    const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const model = (Device.modelName || Device.deviceName || 'TAB').replace(/\s+/g, '-').toUpperCase();
    identifier = `${model}-${randomId}`;
    await storage.setItem('hgs_device_identifier', identifier);
  }
  return identifier;
}

export const devicesApi = {
  getDevices: async (): Promise<ApiDevice[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ApiDevice[]>>('api/customersatisfaction/devices');
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.warn('devicesApi.getDevices error:', error);
      return [];
    }
  },

  getDeviceById: async (id: number): Promise<ApiDevice> => {
    const response = await apiClient.get<ApiResponse<ApiDevice>>(`api/customersatisfaction/devices/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Device not found');
  },

  createDevice: async (payload: CreateDevicePayload): Promise<ApiDevice> => {
    const response = await apiClient.post<ApiResponse<ApiDevice>>('api/customersatisfaction/devices', payload);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create device');
  },

  updateDevice: async (id: number, payload: CreateDevicePayload): Promise<ApiDevice> => {
    const response = await apiClient.put<ApiResponse<ApiDevice>>(`api/customersatisfaction/devices/${id}`, payload);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update device');
  },

  deleteDevice: async (id: number): Promise<void> => {
    await apiClient.delete(`api/customersatisfaction/devices/${id}`);
  },

  registerOrGetDevice: async (): Promise<ApiDevice> => {
    const identifier = await getOrCreateDeviceIdentifier();
    const deviceName = Device.modelName || Device.deviceName || 'Tablet Kiosk';
    const now = new Date().toISOString();

    const payload: CreateDevicePayload = {
      deviceName,
      deviceIdentifier: identifier,
      status: 'active',
      lastSeenAt: now,
    };

    try {
      // Step 1: Query existing devices to check if this device is already registered
      const allDevices = await devicesApi.getDevices();
      const existing = allDevices.find(
        (d) => d.deviceIdentifier === identifier || d.deviceIdentifier?.toUpperCase() === identifier.toUpperCase()
      );

      if (existing) {
        console.log('Device already registered on server. Updating lastSeenAt:', existing.id);
        try {
          const updated = await devicesApi.updateDevice(existing.id, payload);
          return updated;
        } catch (updateErr) {
          console.warn('Could not update device lastSeenAt, using existing record:', updateErr);
          return existing;
        }
      }

      // Step 2: Device not found on server -> Register new device
      console.log('Registering new device on server:', identifier);
      const created = await devicesApi.createDevice(payload);
      return created;
    } catch (err) {
      console.warn('Device registration fallback:', err);
      return {
        id: 1,
        deviceName,
        deviceIdentifier: identifier,
        status: 'active',
        lastSeenAt: now,
      };
    }
  },
};
