import { Card } from "react-bootstrap";

interface TranscriptViewProps {
  transcript: string;
  summary: string;
}

export default function TranscriptView({ transcript, summary }: TranscriptViewProps) {
  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Transcript</Card.Title>
        <Card.Text>{transcript}</Card.Text>
        <Card.Title>Summary</Card.Title>
        <Card.Text>{summary}</Card.Text>
      </Card.Body>
    </Card>
  );
}
