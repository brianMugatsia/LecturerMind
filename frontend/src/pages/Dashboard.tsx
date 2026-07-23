import { useState } from "react";
import UploadForm from "../components/UploadForm";
import TranscriptView from "../components/TranscriptView";
import FlashcardsView from "../components/FlashcardsView";

// Define types for flashcards and backend response
interface Flashcard {
  question: string;
  answer: string;
}

interface TranscribeResult {
  transcript: string;
  summary: string;
  quiz: string;
  flashcards: Flashcard[];
}

export default function Dashboard() {
  const [result, setResult] = useState<TranscribeResult | null>(null);

  return (
    <div className="container mt-4">
      <UploadForm setResult={setResult} />
      {result && (
        <>
          <TranscriptView transcript={result.transcript} summary={result.summary} />
          <FlashcardsView flashcards={result.flashcards} />
        </>
      )}
    </div>
  );
}
