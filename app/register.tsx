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

const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const canSubmit =
    isValidEmail(email) && password.length >= MIN_PASSWORD_LENGTH && !loading;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await register(email.trim(), password, fullName.trim() || undefined);
    } catch (error) {
      Alert.alert(
        "Registration failed",
        "That email may already be registered."
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
        Create Account
      </Text>
      <Text className="text-white/60 mb-8">
        Start capturing lectures with LecturerMind
      </Text>

      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full name (optional)"
        placeholderTextColor="#9ca3af"
        autoComplete="name"
        textContentType="name"
        accessibilityLabel="Full name"
        className="bg-white/10 text-white rounded-xl px-4 py-3.5 mb-3"
      />
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
        placeholder={`Password (min. ${MIN_PASSWORD_LENGTH} characters)`}
        placeholderTextColor="#9ca3af"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        accessibilityLabel="Password"
        onSubmitEditing={handleRegister}
        returnKeyType="go"
        className="bg-white/10 text-white rounded-xl px-4 py-3.5 mb-6"
      />

      <TouchableOpacity
        onPress={handleRegister}
        disabled={!canSubmit}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit, busy: loading }}
        className={`rounded-full py-3.5 items-center mb-4 ${
          canSubmit ? "bg-accent" : "bg-accent/40"
        }`}
      >
        <Text className="text-white font-semibold">
          {loading ? "Creating..." : "Create Account"}
        </Text>
      </TouchableOpacity>

      <Link href="/login" asChild>
        <TouchableOpacity accessibilityRole="link">
          <Text className="text-white/60 text-center">
            Already have an account?{" "}
            <Text className="text-accent">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </KeyboardAvoidingView>
  );
}