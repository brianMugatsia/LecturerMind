export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  correct_index: number;
  explanation: string | null;
  order: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}
