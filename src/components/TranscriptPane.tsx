import { useEffect, useMemo, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLectureStore } from "@/store/lectureStore";

const EMPTY_STATE_MESSAGE =
  "Start recording to see the lecture transcribed here in real time...";

function RecordingIndicator() {
  return (
    <View
      className="flex-row items-center"
      accessibilityRole="text"
      accessibilityLabel="Recording in progress"
    >
      <View className="w-2 h-2 rounded-full bg-accent mr-1.5" />
      <Text className="text-xs text-white/60">Recording</Text>
    </View>
  );
}

function PaneHeader({ isRecording }: { isRecording: boolean }) {
  return (
    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-xs font-semibold text-white/60 uppercase tracking-wide">
        Live Transcript
      </Text>
      {isRecording && <RecordingIndicator />}
    </View>
  );
}

export function TranscriptPane() {
  const { finalSegments, interimText, status } = useLectureStore();
  const scrollRef = useRef<ScrollView>(null);

  const isRecording = status === "recording";
  const hasContent = finalSegments.length > 0 || Boolean(interimText);

  const finalizedText = useMemo(
    () => finalSegments.map((segment) => segment.text).join(" "),
    [finalSegments]
  );

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [finalSegments.length, interimText]);

  return (
    <View className="flex-1 bg-night px-4 pt-3 pb-2">
      <PaneHeader isRecording={isRecording} />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        accessibilityRole="text"
        accessibilityLabel="Live lecture transcript"
      >
        {hasContent ? (
          <Text className="text-white text-base leading-6">
            {finalizedText}
            {interimText ? (
              <Text className="text-white/50"> {interimText}</Text>
            ) : null}
          </Text>
        ) : (
          <Text className="text-white/40 text-base italic mt-4">
            {EMPTY_STATE_MESSAGE}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}