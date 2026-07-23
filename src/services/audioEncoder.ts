import { Buffer } from "buffer";

/**
 * react-native-live-audio-stream emits each PCM chunk as a base64 string.
 * Deepgram (and our backend) expect raw binary frames over the WebSocket,
 * so decode here before sending.
 */
export function base64ChunkToArrayBuffer(base64Chunk: string): ArrayBuffer {
  const buffer = Buffer.from(base64Chunk, "base64");
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

/** Audio format constants — must match what the backend/Deepgram config expects. */
export const AUDIO_CONFIG = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  audioSource: 6, // VOICE_RECOGNITION on Android
  bufferSize: 4096,
};
