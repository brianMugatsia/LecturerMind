from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://lecturermind:lecturermind@localhost:5432/lecturermind"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://lecturermind:lecturermind@localhost:5432/lecturermind"

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Deepgram
    DEEPGRAM_API_KEY: str = ""

    # Claude
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-6"

    # Storage
    S3_ENDPOINT_URL: str = ""
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = "lecturermind-audio"
    S3_REGION: str = "auto"

    # Notes/quiz tuning
    NOTES_DEBOUNCE_SECONDS: int = 45
    QUIZ_QUESTION_COUNT: int = 10


settings = Settings()
