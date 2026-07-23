import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const canSubmit = isValidEmail(email) && password.length > 0 && !loading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert(
        "Login failed",
        "Check your email and password and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-night justify-center px-6"
    >
      <Text className="text-3xl font-bold text-white mb-1">
        LecturerMind
      </Text>
      <Text className="text-white/60 mb-8">Sign in to continue</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        accessibilityLabel="Email address"
        className="bg-white/10 text-white rounded-xl px-4 py-3.5 mb-3"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        accessibilityLabel="Password"
        onSubmitEditing={handleLogin}
        returnKeyType="go"
        className="bg-white/10 text-white rounded-xl px-4 py-3.5 mb-6"
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={!canSubmit}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit, busy: loading }}
        className={`rounded-full py-3.5 items-center mb-4 ${
          canSubmit ? "bg-accent" : "bg-accent/40"
        }`}
      >
        <Text className="text-white font-semibold">
          {loading ? "Signing in..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      <Link href="/register" asChild>
        <TouchableOpacity accessibilityRole="link">
          <Text className="text-white/60 text-center">
            Don&apos;t have an account?{" "}
            <Text className="text-accent">Register</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </KeyboardAvoidingView>
  );
}