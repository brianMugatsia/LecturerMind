# LecturerMind Mobile (React Native / Expo)

Split-screen lecture recorder: live transcript on top, AI-generated short notes on the
bottom, a "Quiz Me" button that generates 10 questions from the lecture, and a chat
field to ask questions about the material.

## Stack
- **Expo** (SDK 51) + **expo-router** (file-based navigation)
- **react-native-live-audio-stream** — raw PCM mic capture for streaming to the backend
- **Zustand** — auth + lecture/transcript/notes/quiz state
- **NativeWind** (Tailwind for RN) — styling
- **expo-secure-store** — JWT storage

## ⚠️ Important: requires a custom dev client

`react-native-live-audio-stream` is a native module and **will not run in Expo Go**.
You need to build a custom dev client once:

```bash
npm install
npx expo prebuild
npx expo run:ios       # or: npx expo run:android
```

After that, `npx expo start --dev-client` works like normal Expo Go for day-to-day
development — you only need to rebuild the native app when native dependencies change.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Point the app at your backend
Edit `app.json` → `expo.extra`:
```json
"extra": {
  "apiUrl": "http://YOUR_BACKEND_HOST:8000",
  "wsUrl": "ws://YOUR_BACKEND_HOST:8000"
}
```
If testing on a physical device, `localhost` won't reach your dev machine — use your
machine's LAN IP (e.g. `http://192.168.1.20:8000`) or a tunnel like ngrok.

### 3. Build the dev client and run
```bash
npx expo prebuild
npx expo run:ios     # or run:android
```

Subsequent runs:
```bash
npx expo start --dev-client
```

## How recording works

1. `useAudioRecorder` captures mic audio as 16kHz/16-bit/mono PCM via
   `react-native-live-audio-stream`, matching what the backend's Deepgram config expects.
2. Each chunk is base64-decoded to an `ArrayBuffer` (`audioEncoder.ts`) and sent as a
   binary WebSocket frame via `useLectureSocket`.
3. The backend streams it to Deepgram and pushes back JSON events:
   - `{"type": "transcript", ...}` → rendered live in `TranscriptPane` (upper section)
   - `{"type": "notes", ...}` → appended in `NotesPane` (lower section)
4. Tapping **Quiz Me** calls `POST /lectures/{id}/quiz/generate` and opens `QuizModal`.
5. The chat field at the bottom calls `POST /lectures/{id}/chat`, which is RAG'd against
   the transcript server-side.

## Project Structure

```
mobile/
├── app/                     # expo-router file-based routes
│   ├── index.tsx            # redirect based on auth state
│   ├── login.tsx / register.tsx
│   ├── (tabs)/               # home / history / profile
│   └── lecture/[id].tsx      # the split-screen recording screen
├── src/
│   ├── components/           # TranscriptPane, NotesPane, RecordButton, ChatInput, QuizModal
│   ├── hooks/                 # useAudioRecorder, useLectureSocket, useAuth
│   ├── services/               # api.ts (REST), websocket.ts, audioEncoder.ts
│   ├── store/                   # zustand: authStore, lectureStore
│   └── types/                    # shared TS types matching the backend schemas
```

## Notes / Next Steps
- Auth screens store the JWT in `expo-secure-store`; all REST calls and the WebSocket
  connection attach it automatically.
- Reconnect logic in `LectureSocket` retries with exponential backoff (up to 5 attempts)
  if the connection drops mid-lecture.
- `NotesPane` renders markdown from Claude directly — no client-side formatting needed.
- For production, replace the placeholder icons in `/assets` and lock down `apiUrl`
  behind environment-specific `app.config.js` (dev/staging/prod).
