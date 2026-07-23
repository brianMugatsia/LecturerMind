"""
Wraps the Deepgram real-time streaming transcription client.

Usage pattern (see app/websocket/audio_pipeline.py):
    stt = DeepgramStreamingClient(on_transcript=callback)
    await stt.start()
    await stt.send_audio(chunk_bytes)
    ...
    await stt.finish()
"""
import logging
from typing import Awaitable, Callable

from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveOptions,
)

from app.config import settings

logger = logging.getLogger(__name__)

# Signature: (text: str, is_final: bool, start_ms: int, end_ms: int) -> None
TranscriptCallback = Callable[[str, bool, int, int], Awaitable[None]]


class DeepgramStreamingClient:
    def __init__(self, on_transcript: TranscriptCallback):
        self._on_transcript = on_transcript
        self._client = DeepgramClient(
            settings.DEEPGRAM_API_KEY,
            DeepgramClientOptions(options={"keepalive": "true"}),
        )
        self._connection = None

    async def start(self) -> None:
        self._connection = self._client.listen.asynclive.v("1")

        async def handle_transcript(_, result, **kwargs):
            alt = result.channel.alternatives[0]
            text = alt.transcript
            if not text:
                return
            start_ms = int(result.start * 1000)
            end_ms = int((result.start + result.duration) * 1000)
            await self._on_transcript(text, result.is_final, start_ms, end_ms)

        async def handle_error(_, error, **kwargs):
            logger.error("Deepgram error: %s", error)

        self._connection.on(LiveTranscriptionEvents.Transcript, handle_transcript)
        self._connection.on(LiveTranscriptionEvents.Error, handle_error)

        options = LiveOptions(
            model="nova-2",
            language="en-US",
            smart_format=True,
            interim_results=True,
            encoding="linear16",
            sample_rate=16000,
            channels=1,
            punctuate=True,
            endpointing=300,  # ms of silence before finalizing a segment
        )
        started = await self._connection.start(options)
        if not started:
            raise RuntimeError("Failed to start Deepgram streaming connection")
        logger.info("Deepgram streaming connection started")

    async def send_audio(self, chunk: bytes) -> None:
        if self._connection:
            await self._connection.send(chunk)

    async def finish(self) -> None:
        if self._connection:
            await self._connection.finish()
            logger.info("Deepgram streaming connection closed")
