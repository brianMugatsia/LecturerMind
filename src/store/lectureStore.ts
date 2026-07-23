import { create } from "zustand";
import type { Note } from "@/types/lecture";
import type { QuizQuestion, ChatMessage } from "@/types/quiz";

export type RecordingStatus =
  | "idle"
  | "connecting"
  | "recording"
  | "processing" // Added to handle the 12-second LLM compilation window smoothly
  | "stopped"
  | "error";

interface FinalSegment {
  id: string;
  text: string;
  start_ms: number;
}

interface LectureState {
  lectureId: string | null;
  status: RecordingStatus;
  finalSegments: FinalSegment[];
  interimText: string;
  notes: Note[];
  quiz: QuizQuestion[];
  chat: ChatMessage[];
}

interface LectureActions {
  setLectureId: (id: string) => void;
  setStatus: (status: RecordingStatus) => void;
  appendTranscript: (text: string, isFinal: boolean, startMs: number) => void;
  appendNote: (note: Note) => void;
  setNotes: (notes: Note[]) => void; // Added to replace/hydrate the full list from a GET request
  setQuiz: (quiz: QuizQuestion[]) => void;
  appendChatMessage: (message: ChatMessage) => void;
  setChat: (messages: ChatMessage[]) => void;
  reset: () => void;
}

const initialState: LectureState = {
  lectureId: null,
  status: "idle",
  finalSegments: [],
  interimText: "",
  notes: [],
  quiz: [],
  chat: [],
};

export const useLectureStore = create<LectureState & LectureActions>(
  (set) => ({
    ...initialState,

    setLectureId: (id) => set({ lectureId: id }),
    setStatus: (status) => set({ status }),

    appendTranscript: (text, isFinal, startMs) =>
      set((state) =>
        isFinal
          ? {
              finalSegments: [
                ...state.finalSegments,
                { id: `${startMs}-${Date.now()}`, text, start_ms: startMs },
              ],
              interimText: "",
            }
          : { interimText: text }
      ),

    appendNote: (note) =>
      set((state) => ({ notes: [...state.notes, note] })),

    setNotes: (notes) => set({ notes }),

    setQuiz: (quiz) => set({ quiz }),

    appendChatMessage: (message) =>
      set((state) => ({ chat: [...state.chat, message] })),

    setChat: (messages) => set({ chat: messages }),

    reset: () => set(initialState),
  })
);