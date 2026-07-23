import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { TranscriptPane } from "@/components/TranscriptPane";
import { NotesPane } from "@/components/NotesPane";
import { RecordButton } from "@/components/RecordButton";
import { ChatInput } from "@/components/ChatInput";
import { QuizModal } from "@/components/QuizModal";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useLectureSocket } from "@/hooks/useLectureSocket";
import { useLectureStore } from "@/store/lectureStore";
import { api } from "@/services/api";

export default function LectureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    status,
    setStatus,
    setLectureId,
    quiz,
    setQuiz,
    appendChatMessage,
  } = useLectureStore();
  const [quizVisible, setQuizVisible] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const { connect, sendChunk, disconnect } = useLectureSocket();
  const { start: startMic, stop: stopMic } = useAudioRecorder(sendChunk);

  useEffect(() => {
    if (id) setLectureId(id);
    return () => {
      stopMic();
      disconnect();
    };
  }, [id]);

  const handleToggleRecording = useCallback(async () => {
    if (status === "recording" || status === "connecting") {
      stopMic();
      disconnect();
      try {
        await api.endLecture(id);
      } catch {
        // Non-fatal: lecture stays "recording" server-side, can be ended later.
      }
      setStatus("stopped");
    } else {
      try {
        connect(id);
        await startMic();
      } catch {
        Alert.alert(
          "Couldn't start recording",
          "Please check microphone permissions."
        );
        setStatus("error");
      }
    }
  }, [status, id, connect, startMic, stopMic, disconnect, setStatus]);

  const handleGenerateQuiz = useCallback(async () => {
    if (generatingQuiz) return;
    setGeneratingQuiz(true);
    try {
      const questions = await api.generateQuiz(id, 10);
      setQuiz(questions);
      setQuizVisible(true);
    } catch {
      Alert.alert(
        "Couldn't generate quiz",
        "Make sure some of the lecture has been transcribed first."
      );
    } finally {
      setGeneratingQuiz(false);
    }
  }, [id, generatingQuiz, setQuiz]);

  const handleAskQuestion = useCallback(
    async (message: string) => {
      appendChatMessage({
        id: `local-${Date.now()}`,
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
      });
      try {
        const reply = await api.askQuestion(id, message);
        appendChatMessage(reply);
      } catch {
        appendChatMessage({
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't reach the server. Please try again.",
          created_at: new Date().toISOString(),
        });
      }
    },
    [id, appendChatMessage]
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-night">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close lecture"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-down" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGenerateQuiz}
          disabled={generatingQuiz}
          accessibilityRole="button"
          accessibilityState={{ disabled: generatingQuiz, busy: generatingQuiz }}
          className={`rounded-full px-4 py-1.5 ${
            generatingQuiz ? "bg-accent/50" : "bg-accent/90"
          }`}
        >
          <Text className="text-white text-sm font-semibold">
            {generatingQuiz ? "Generating..." : "Quiz Me"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Upper section: live transcript */}
        <View className="flex-1">
          <TranscriptPane />
        </View>

        {/* Lower section: short notes + chat */}
        <View className="flex-[1.1] rounded-t-3xl overflow-hidden">
          <NotesPane />
          <ChatInput onSend={handleAskQuestion} />
        </View>
      </KeyboardAvoidingView>

      <RecordButton status={status} onPress={handleToggleRecording} />

      <QuizModal
        visible={quizVisible}
        questions={quiz}
        onClose={() => setQuizVisible(false)}
      />
    </SafeAreaView>
  );
}