from openai import OpenAI
from backend.app.core.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_summary(transcript: str):
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": """
                You are an academic assistant.
                Summarize lecture transcripts into:
                1. Brief Summary
                2. Key Points
                3. Important Concepts
                """
            },
            {
                "role": "user",
                "content": transcript
            }
        ]
    )

    return response.choices[0].message.content