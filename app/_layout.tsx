import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/authStore";
import "../global.css";

const AUTH_ROUTES = new Set(["login", "register"]);

function useAuthRedirect() {
  const { token, isHydrated, hydrate } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = AUTH_ROUTES.has(segments[0]);

    if (!token && !inAuthGroup) {
      router.replace("/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [token, isHydrated, segments, router]);

  return isHydrated;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  useAuthRedirect();
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthGate>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="lecture/[id]"
          options={{ headerShown: false, presentation: "fullScreenModal" }}
        />
      </Stack>
    </AuthGate>
  );
}