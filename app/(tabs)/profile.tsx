import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";

function ProfileRow({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center bg-white border border-black/10 rounded-xl px-4 py-3.5 mb-3"
    >
      <Ionicons
        name={icon}
        size={18}
        color={destructive ? "#e94560" : "#16213e"}
        style={{ marginRight: 10 }}
      />
      <Text
        className={`font-semibold ${destructive ? "text-accent" : "text-ink"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuth();

  const confirmSignOut = () => {
    Alert.alert("Sign out?", "You'll need to sign in again to continue.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface px-6 pt-8">
      <View className="items-center mb-8">
        <View className="w-16 h-16 rounded-full bg-ink items-center justify-center mb-3">
          <Ionicons name="person" size={26} color="#fff" />
        </View>
        <Text className="text-lg font-semibold text-ink">Your Profile</Text>
      </View>

      <ProfileRow
        icon="log-out-outline"
        label="Sign Out"
        onPress={confirmSignOut}
        destructive
      />
    </SafeAreaView>
  );
}