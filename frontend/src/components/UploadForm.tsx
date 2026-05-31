import { useState } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";

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

interface UploadFormProps {
  setResult: (result: TranscribeResult) => void;
}

export default function UploadForm({ setResult }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Use Axios generics to type the response
    const res = await axios.post<TranscribeResult>(
      "http://127.0.0.1:8000/transcribe",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    setResult(res.data);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Upload Lecture Audio</Form.Label>
        <Form.Control
  type="file"
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  }}
/>

      </Form.Group>
      <Button type="submit" className="mt-3">
        Transcribe
      </Button>
    </Form>
  );
}
