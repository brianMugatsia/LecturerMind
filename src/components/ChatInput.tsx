import { useState } from "react";
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const canSend = text.trim().length > 0 && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    const message = text.trim();
    setText("");
    setSending(true);
    try {
      await onSend(message);
    } catch (error) {
      // Restore the draft so the user doesn't lose their message on failure
      setText(message);
      throw error;
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="flex-row items-center px-3 py-2 border-t border-black/10 bg-white">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Ask about this lecture..."
        placeholderTextColor="#9ca3af"
        editable={!sending}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        multiline={false}
        accessibilityLabel="Ask a question about this lecture"
        className="flex-1 bg-surface rounded-full px-4 py-2.5 text-sm text-ink mr-2"
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        accessibilityState={{ disabled: !canSend, busy: sending }}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          text.trim() ? "bg-accent" : "bg-gray-300"
        }`}
      >
        {sending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons name="arrow-up" size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}