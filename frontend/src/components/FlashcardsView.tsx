import { Card } from "react-bootstrap";

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardsViewProps {
  flashcards: Flashcard[];
}

export default function FlashcardsView({ flashcards }: FlashcardsViewProps) {
  return (
    <div className="mt-3">
      <h3>Flashcards</h3>
      {flashcards.map((fc, idx) => (
        <Card key={idx} className="mb-2">
          <Card.Body>
            <strong>Q:</strong> {fc.question} <br />
            <strong>A:</strong> {fc.answer}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
