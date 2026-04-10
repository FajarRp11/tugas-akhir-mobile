import { AuthState, User } from "@/types";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  saveAuth: async (user: User, token: string) => {
    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    set({ user, token });
  },

  loadAuth: async () => {
    const token = await SecureStore.getItemAsync("token");
    const userStr = await SecureStore.getItemAsync("user");
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr) as User });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    set({ user: null, token: null });
  },
}));
