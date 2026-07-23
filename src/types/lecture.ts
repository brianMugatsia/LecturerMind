export type LectureStatus = "recording" | "processing" | "completed";

export interface Lecture {
  id: string;
  title: string;
  status: LectureStatus;
  audio_url: string | null;
  created_at: string;
  ended_at: string | null;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  start_ms: number;
  end_ms: number;
  is_final: boolean;
  created_at: string;
}

export interface LectureDetail extends Lecture {
  segments: TranscriptSegment[];
}

export interface Note {
  id: string;
  content: string;
  created_at: string;
}

// WebSocket event payloads pushed from the backend
export type LectureSocketEvent =
  | {
      type: "transcript";
      text: string;
      is_final: boolean;
      start_ms: number;
      end_ms: number;
    }
  | { type: "notes"; content: string; created_at: string }
  | { type: "error"; detail: string };
