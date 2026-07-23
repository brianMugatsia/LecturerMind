import uuid
import logging

import boto3
from botocore.client import Config

from app.config import settings

logger = logging.getLogger(__name__)

_s3_client = None


def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT_URL or None,
            aws_access_key_id=settings.S3_ACCESS_KEY_ID or None,
            aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY or None,
            region_name=settings.S3_REGION or None,
            config=Config(signature_version="s3v4"),
        )
    return _s3_client


def upload_audio(lecture_id: uuid.UUID, file_bytes: bytes, content_type: str = "audio/wav") -> str:
    client = get_s3_client()
    key = f"lectures/{lecture_id}/audio.wav"
    client.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{key}"
    logger.info("Uploaded audio for lecture=%s to %s", lecture_id, url)
    return url
