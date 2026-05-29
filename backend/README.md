📘 LecturerMind Backend


🎤 AI-Powered Lecture Transcription & Learning Assistant



LecturerMind is a backend API built with FastAPI that converts lecture audio into text using OpenAI Whisper, forming the foundation for AI-powered learning tools like summaries, notes, and Q&A systems.

🚀 Features
🎧 Upload audio files (MP3, WAV, etc.)
🤖 Transcribe speech to text using OpenAI Whisper
⚡ FastAPI REST API architecture
🧠 Clean modular backend structure (routes, services, core)
📁 Temporary file handling for uploads
🔐 Environment-based configuration
🏗️ Tech Stack



Python 3.10+
FastAPI
Uvicorn
OpenAI API (Whisper)
Python-dotenv
python-multipart




📂 Project Structure
backend/
│
├── app/
│   ├── main.py
│   ├── routes/
│   │   └── transcription.py
│   ├── services/
│   │   └── whisper_service.py
│   ├── core/
│   │   └── config.py
│   └── __init__.py
│
├── uploads/
├── requirements.txt
└── README.md



⚙️ Installation
1. Clone repository
git clone https://github.com/brianMugatsia/LecturerMind.git
cd LecturerMind/backend
2. Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
3. Install dependencies
pip install -r requirements.txt
4. Setup environment variables

Create a .env file:

OPENAI_API_KEY=your_openai_api_key_here




▶️ Running the server
uvicorn app.main:app --reload

or (safe option):

python -m uvicorn app.main:app --reload


📡 API Endpoints
🔹 Home
GET /

Response:

{
  "message": "LecturerMind running 🚀"
}


🔹 Transcribe Audio
POST /transcribe
Form Data:
file: audio file (mp3, wav, etc.)
Response:
{
  "filename": "lecture.mp3",
  "transcript": "Today we are learning about..."
}



🧠 How it works
Audio File
   ↓
FastAPI Upload Endpoint
   ↓
Temporary File Storage
   ↓
OpenAI Whisper API
   ↓
Text Transcript Returned




🔐 Environment Variables
Variable	Description
OPENAI_API_KEY	Your OpenAI API key


⚠️ Notes
Do NOT commit .env to GitHub
Large audio files may take longer to process
Requires internet connection for OpenAI API


🚀 Future Improvements
📄 AI lecture summarization (GPT-4o)
📚 Auto-generated notes & flashcards
❓ Q&A chatbot from transcripts
🌐 Frontend upload UI (React/Flutter)
☁️ Cloud deployment (Render / Railway)
👨‍💻 Author

Brian Mugatsia
Software Engineer | AI & Backend Developer
🇰🇪 Kenya

📜 License

This project is licensed under the MIT License.
