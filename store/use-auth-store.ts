import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('user_token', token);
    set({ user, token, isAuthenticated: true });
  },
  clearAuth: async () => {
    await SecureStore.deleteItemAsync('user_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
