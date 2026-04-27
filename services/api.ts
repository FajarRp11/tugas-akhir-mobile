import { useAuthStore } from "@/stores/authStore";
import {
  AuthPayload,
  AuthResponse,
  Cow,
  Device,
  RegisterPayload,
  SensorReading,
} from "@/types";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://cow-monitoring.vercel.app";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto attach JWT token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token exists but has expired or is invalid
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

// Auth
export const register = (data: RegisterPayload) =>
  api.post<AuthResponse>("/api/auth/register", data);

export const login = (data: AuthPayload) =>
  api.post<AuthResponse>("/api/auth/login", data);

// Cows
export const getCows = () =>
  api.get<{ success: boolean; data: Cow[] }>("/api/cows");

export const createCow = (data: { name: string }) =>
  api.post<{ success: boolean; data: Cow }>("/api/cows", data);

export const updateCow = (id: number, data: { name: string }) =>
  api.put<{ success: boolean; data: Cow }>(`/api/cows/${id}`, data);

export const deleteCow = (id: number) =>
  api.delete<{ success: boolean }>(`/api/cows/${id}`);

// Devices
export const getDevices = () =>
  api.get<{ success: boolean; data: Device[] }>("/api/devices");

export const createDevice = (data: { deviceId: string; cowId?: number }) =>
  api.post<{ success: boolean; data: Device }>("/api/devices", data);

export const updateDevice = (
  id: number,
  data: { cowId?: number; isActive?: boolean },
) => api.put<{ success: boolean; data: Device }>(`/api/devices/${id}`, data);

export const deleteDevice = (id: number) =>
  api.delete<{ success: boolean }>(`/api/devices/${id}`);

// Sensor Data
export const getSensorData = () =>
  api.get<{ success: boolean; data: SensorReading[] }>("/api/data");

export const getSensorDataByDevice = (deviceId: string) =>
  api.get<{ success: boolean; data: SensorReading[] }>(`/api/data/${deviceId}`);

// Anomalies (Beranda: hanya terbaru per device)
export const getLatestCowAnomalies = () =>
  api.get<{ success: boolean; data: SensorReading[] }>(
    "/api/data/anomalies/cows",
  );

// Anomalies History (Notifikasi: semua anomali 7 hari terakhir)
export const getAnomalyHistory = () =>
  api.get<{ success: boolean; data: SensorReading[] }>(
    "/api/data/anomalies/cows?mode=history",
  );

export default api;
