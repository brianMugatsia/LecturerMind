import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/services/api";
import { useLectureStore } from "@/store/lectureStore";

export default function HomeScreen() {
  const [title, setTitle] = useState("");
  const [starting, setStarting] = useState(false);
  const { setLectureId, reset } = useLectureStore();

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const lecture = await api.startLecture(
        title.trim() || "Untitled Lecture"
      );
      reset();
      setLectureId(lecture.id);
      router.push(`/lecture/${lecture.id}`);
    } catch (error) {
      Alert.alert(
        "Couldn't start lecture",
        "Please check your connection and try again."
      );
    } finally {
      setStarting(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-6 justify-center"
      >
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-ink items-center justify-center mb-4">
            <Ionicons name="mic" size={28} color="#fff" />
          </View>
          <Text className="text-2xl font-bold text-ink mb-1 text-center">
            New Lecture
          </Text>
          <Text className="text-ink/50 text-center leading-5">
            Give it a title, then start recording. LecturerMind will
            transcribe live, take notes, and build a quiz as the lecture
            goes.
          </Text>
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Intro to Thermodynamics"
          placeholderTextColor="#9ca3af"
          returnKeyType="done"
          accessibilityLabel="Lecture title"
          className="bg-white rounded-xl px-4 py-3.5 mb-6 text-ink border border-black/10"
        />

        <TouchableOpacity
          onPress={handleStart}
          disabled={starting}
          accessibilityRole="button"
          accessibilityState={{ disabled: starting, busy: starting }}
          className={`rounded-full py-4 flex-row items-center justify-center ${
            starting ? "bg-ink/50" : "bg-ink"
          }`}
        >
          {!starting && (
            <Ionicons
              name="radio-button-on"
              size={16}
              color="#fff"
              style={{ marginRight: 8 }}
            />
          )}
          <Text className="text-white font-semibold text-base">
            {starting ? "Starting..." : "Start Recording"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}