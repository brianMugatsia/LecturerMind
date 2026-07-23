import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
// Import the authentic type straight from your newly updated store!
import type { RecordingStatus } from "@/store/lectureStore";

interface RecordButtonProps {
  status: RecordingStatus;
  onPress: () => void;
}

// Partial prevents TypeScript from crashing over unmapped keys like "stopped" or "error"
const LABELS: Partial<Record<RecordingStatus, string>> = {
  recording: "Stop Recording",
  connecting: "Connecting…",
  processing: "Processing Notes…",
  idle: "Start Recording",
};

export function RecordButton({ status, onPress }: RecordButtonProps) {
  const isRecording = status === "recording";
  const isConnecting = status === "connecting";
  const isProcessing = status === "processing";
  const isDisabled = isConnecting || isProcessing;

  // Fallback string protect against unmapped statuses rendering empty space
  const displayLabel = LABELS[status] || "Start Recording";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isDisabled }}
      accessibilityLabel={displayLabel}
      className={`mx-4 mb-4 rounded-full py-3.5 flex-row items-center justify-center ${
        isRecording ? "bg-accent" : "bg-ink"
      } ${isDisabled ? "opacity-60" : ""}`}
    >
      {isDisabled && (
        <ActivityIndicator color="#fff" size="small" className="mr-2" />
      )}
      <Text className="text-white font-semibold text-base">
        {displayLabel}
      </Text>
    </TouchableOpacity>
  );
}