// Types
export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    email: string;
    token: string;
  };
}

export interface Cow {
  id: number;
  farmerId: number;
  name: string;
  createdAt: string;
  devices?: Device[];
}

export interface Device {
  id: number;
  deviceId: string;
  cowId: number | null;
  cow: Cow;
  isActive: boolean;
  createdAt: string;
}

export interface SensorReading {
  id: number;
  deviceId: string;
  readingId: number | null;
  temperature: number | null;
  heartRate: number | null;
  spo2: number | null;
  latitude: number | null;
  longitude: number | null;
  rssi: number | null;
  device: Device;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  saveAuth: (user: User, token: string) => Promise<void>;
  loadAuth: () => Promise<void>;
  logout: () => Promise<void>;
}
