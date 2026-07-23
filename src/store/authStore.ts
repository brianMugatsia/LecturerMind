import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "lecturermind_token";

interface AuthState {
  token: string | null;
  isHydrated: boolean;
}

interface AuthActions {
  hydrate: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  token: null,
  isHydrated: false,

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      set({ token, isHydrated: true });
    } catch (error) {
      // If secure storage read fails, fall back to logged-out rather than
      // leaving the app stuck on an un-hydrated splash state.
      set({ token: null, isHydrated: true });
    }
  },

  setToken: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null });
  },
}));

/**
 * Helper utility to extract the current token from the Zustand state instantly.
 * Perfect for use inside non-reactive closures like event listeners or async flow chains.
 */
export const getFreshToken = (): string | null => useAuthStore.getState().token;