import { useEffect, useRef, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { useLectureStore } from "@/store/lectureStore";

const EMPTY_STATE_MESSAGE =
  "Key points will appear here as the lecture progresses.";

const MARKDOWN_STYLE = {
  body: { color: "#16213e", fontSize: 14, lineHeight: 20 },
  bullet_list_icon: { color: "#e94560" },
} as const;

export function NotesPane() {
  const { notes } = useLectureStore();
  const scrollRef = useRef<ScrollView>(null);

  // 1. Memoize the normalization so it only recalculates if the actual store state reference changes
  const notesArray = useMemo(() => {
    return Array.isArray(notes)
      ? notes
      : notes && typeof notes === "object" && "content" in notes
        ? [notes]
        : [];
  }, [notes]);

  // 2. Create a combined dependency string of all contents
  // This forces the auto-scroll to fire when characters append, even if notesArray.length stays at 1
  const serializedContent = useMemo(() => {
    return notesArray.map(note => note?.content || "").join("||");
  }, [notesArray]);

  // 3. React to actual content size/text mutations for scrolling
  useEffect(() => {
    // A small delay handles React Native's layout calculation racing conditions
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [serializedContent]);

  return (
    <View className="flex-1 bg-surface px-4 pt-3 pb-2">
      <Text className="text-xs font-semibold text-ink/60 uppercase tracking-wide mb-2">
        Short Notes
      </Text>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        accessibilityRole="text"
        accessibilityLabel="Lecture notes"
        // Also fire scrollToEnd if content sizing dynamically forces a container growth
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {notesArray.length === 0 ? (
          <Text className="text-ink/40 text-sm italic mt-4">
            {EMPTY_STATE_MESSAGE}
          </Text>
        ) : (
          notesArray.map((note, index) => (
            <View
              key={note?.id || `note-${index}`}
              className="mb-3 pb-3 border-b border-black/5"
            >
              <Markdown style={MARKDOWN_STYLE}>
                {note?.content || ""}
              </Markdown>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}