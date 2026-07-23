import { useCallback, useRef } from "react";
import { Audio } from "expo-av";
import LiveAudioStream from "react-native-live-audio-stream";
import { base64ChunkToArrayBuffer, AUDIO_CONFIG } from "@/services/audioEncoder";

/**
 * Wraps react-native-live-audio-stream to capture raw 16kHz/16-bit/mono PCM
 * audio and stream it out in small chunks via onChunk. This requires a custom
 * dev client build (expo prebuild + expo run:ios/android) since the native
 * module isn't available in Expo Go.
 */
export function useAudioRecorder(onChunk: (chunk: ArrayBuffer) => void) {
  const isRecording = useRef(false);

  const requestPermission = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    return status === "granted";
  }, []);

  const start = useCallback(async () => {
    if (isRecording.current) return;

    const granted = await requestPermission();
    if (!granted) {
      throw new Error("Microphone permission not granted");
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    LiveAudioStream.init({
      sampleRate: AUDIO_CONFIG.sampleRate,
      channels: AUDIO_CONFIG.channels,
      bitsPerSample: AUDIO_CONFIG.bitsPerSample,
      audioSource: AUDIO_CONFIG.audioSource,
      bufferSize: AUDIO_CONFIG.bufferSize,
      wavFile: "", // not writing to file, streaming only
    });

    LiveAudioStream.on("data", (base64Chunk: string) => {
      const arrayBuffer = base64ChunkToArrayBuffer(base64Chunk);
      onChunk(arrayBuffer);
    });

    LiveAudioStream.start();
    isRecording.current = true;
  }, [onChunk, requestPermission]);

  const stop = useCallback(() => {
    if (!isRecording.current) return;
    LiveAudioStream.stop();
    isRecording.current = false;
  }, []);

  return { start, stop, isRecording: () => isRecording.current };
}
