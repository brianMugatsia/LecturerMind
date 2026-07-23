import { useCallback, useRef } from "react";
import Constants from "expo-constants"; // 👈 Added to read your app.json extra config
import { LectureSocket } from "@/services/websocket";
import { useLectureStore } from "@/store/lectureStore";
import { useAuthStore, getFreshToken } from "@/store/authStore";
import type { LectureSocketEvent } from "@/types/lecture";

// Dynamically extract the backend API base url from your app.json configuration values
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://192.168.137.1:8000";

export function useLectureSocket() {
  const socketRef = useRef<LectureSocket | null>(null);
  const { appendTranscript, setNotes, setStatus, lectureId } = useLectureStore();
  const token = useAuthStore((s) => s.token);

  const handleEvent = useCallback(
    (event: LectureSocketEvent) => {
      if (event.type === "transcript") {
        appendTranscript(event.text, event.is_final, event.start_ms);
      } else if (event.type === "notes") {
        setNotes([
          {
            id: `live-note-${event.lecture_id || Date.now()}`,
            lecture_id: event.lecture_id,
            content: event.content,
            created_at: event.created_at,
          },
        ]);
      } else if (event.type === "error") {
        setStatus("error");
      }
    },
    [appendTranscript, setNotes, setStatus]
  );

  const connect = useCallback(
    (targetLectureId: string) => {
      if (!token) throw new Error("Not authenticated");

      const socket = new LectureSocket(targetLectureId, token, handleEvent, (status) => {
        if (status === "open") setStatus("recording");
        else if (status === "connecting") setStatus("connecting");
        else if (status === "closed") {
          const current = useLectureStore.getState().status;
          if (current !== "processing" && current !== "error") {
            setStatus("stopped");
          }
        } else if (status === "error") setStatus("error");
      });
      socket.connect();
      socketRef.current = socket;
      return socket;
    },
    [token, handleEvent, setStatus]
  );

  const sendChunk = useCallback((chunk: ArrayBuffer) => {
    socketRef.current?.sendAudioChunk(chunk);
  }, []);

  const disconnect = useCallback(async () => {
    if (!socketRef.current) return;

    const idToSync = lectureId;

    socketRef.current.end();
    socketRef.current = null;

    if (!idToSync) {
      setStatus("idle");
      return;
    }

    try {
      setStatus("processing");

      // Pull the absolute freshest token directly from Zustand right now
      const activeToken = getFreshToken();

      // ✅ 1. Replaced localhost with your dynamic IP string variable
      await fetch(`${API_BASE_URL}/api/v1/lectures/${idToSync}/end`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeToken}`,
          "Content-Type": "application/json"
        }
      });

      // 2. Wait window for background Gemini task assembly
      await new Promise((resolve) => setTimeout(resolve, 14000));

      // Pull token again just in case a refresh loop processed during the 14-second wait
      const freshToken = getFreshToken();

      // ✅ 3. Replaced localhost here as well
      const response = await fetch(`${API_BASE_URL}/api/v1/lectures/${idToSync}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${freshToken}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200) {
        const data = await response.json();
        if (data && data.notes) {
          setNotes(data.notes);
        }
        setStatus("idle");
      } else {
        console.error(`Fetch data failed with status code: ${response.status}`);
        setStatus("error");
      }
    } catch (error) {
      console.error("Error finalizing lecture recording sequence:", error);
      setStatus("error");
    }
  }, [lectureId, setStatus, setNotes]);

  return { connect, sendChunk, disconnect };
}