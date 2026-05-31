from openai import OpenAI
from backend.app.core.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_quiz(transcript: str):
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": """
                Generate 5 multiple choice questions from the lecture transcript.

                Return JSON format:

                [
                  {
                    "question": "...",
                    "options": ["A", "B", "C", "D"],
                    "answer": "..."
                  }
                ]
                """
            },
            {
                "role": "user",
                "content": transcript
            }
        ],
        temperature=0.3
    )

    return response.choices[0].message.content