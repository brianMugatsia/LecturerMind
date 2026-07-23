import { useCallback, useEffect } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { api, ApiError } from "@/services/api";

export function useAuth() {
  const { token, isHydrated, hydrate, setToken, logout } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log("🔑 Attempting login with:", email);
      const { access_token } = await api.login(email, password);
      console.log("✅ Login success, token:", access_token);
      await setToken(access_token);
      router.replace("/(tabs)/home");
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("❌ Login failed:", err.status, err.message);
      } else {
        console.error("❌ Unexpected login error:", err);
      }
      throw err; // rethrow so UI can show alert
    }
  }, [setToken]);

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
        console.log("📝 Registering:", email);
        await api.register(email, password, fullName);
        console.log("✅ Registration success, now logging in...");
        await login(email, password);
      } catch (err) {
        console.error("❌ Registration failed:", err);
        throw err;
      }
    },
    [login]
  );

  const signOut = useCallback(async () => {
    console.log("🚪 Signing out");
    await logout();
    router.replace("/login");
  }, [logout]);

  return {
    token,
    isAuthenticated: !!token,
    isHydrated,
    login,
    register,
    signOut,
  };
}
