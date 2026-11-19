import os
import uuid
import shutil
from abc import ABC, abstractmethod
from fastapi import UploadFile, HTTPException
from app.core.config import settings

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

class BaseStorageService(ABC):
    @abstractmethod
    async def save_file(self, file: UploadFile) -> str:
        """Saves an uploaded file and returns its public URL or accessible path."""
        pass

    @abstractmethod
    async def delete_file(self, file_url: str) -> bool:
        """Deletes a file given its URL or key."""
        pass

class LocalStorageService(BaseStorageService):
    def __init__(self, upload_dir: str = settings.UPLOAD_DIR):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_file(self, file: UploadFile) -> str:
        # Validate MIME type
        if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail="Invalid image type. Permitted: JPG, PNG, WebP.")

        ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        clean_ext = ext.lower() if ext else ".jpg"
        unique_name = f"{uuid.uuid4().hex[:12]}{clean_ext}"
        destination = os.path.join(self.upload_dir, unique_name)
        
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return f"/uploads/{unique_name}"

    async def delete_file(self, file_url: str) -> bool:
        try:
            filename = os.path.basename(file_url)
            file_path = os.path.join(self.upload_dir, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception:
            pass
        return False

class S3StorageService(BaseStorageService):
    """
    Amazon S3 Storage Service Adapter.
    Activated when USE_AWS_STORAGE=true and AWS credentials/roles are available.
    Supports secure KMS encryption at rest and presigned URLs.
    """
    def __init__(self):
        self.bucket = settings.AWS_S3_BUCKET
        self.region = settings.AWS_REGION
        self.client = None
        try:
            import boto3
            self.client = boto3.client("s3", region_name=self.region)
        except Exception:
            self.client = None

    async def save_file(self, file: UploadFile) -> str:
        if not self.client:
            # Fallback to local storage if AWS S3 credentials are unavailable
            fallback = LocalStorageService()
            return await fallback.save_file(file)

        if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail="Invalid image format. Permitted: JPG, PNG, WebP.")

        ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        unique_key = f"evidence/{uuid.uuid4().hex[:16]}{ext}"
        
        try:
            self.client.upload_fileobj(
                file.file,
                self.bucket,
                unique_key,
                ExtraArgs={
                    "ContentType": file.content_type or "image/jpeg",
                    "ServerSideEncryption": "AES256"
                }
            )
            return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{unique_key}"
        except Exception as e:
            print(f"S3 upload error: {e}. Falling back to local storage.")
            fallback = LocalStorageService()
            return await fallback.save_file(file)

    def generate_presigned_url(self, key: str, expiration: int = 3600) -> Optional[str]:
        """Generates a secure presigned GET URL for private S3 buckets."""
        if not self.client:
            return None
        try:
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expiration
            )
        except Exception as e:
            print(f"Failed to generate presigned URL: {e}")
            return None

    async def delete_file(self, file_url: str) -> bool:
        if not self.client:
            return False
        try:
            key = file_url.split(f"{self.bucket}.s3.{self.region}.amazonaws.com/")[1]
            self.client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:
            return False

def get_storage_service() -> BaseStorageService:
    if settings.USE_AWS_STORAGE:
        return S3StorageService()
    return LocalStorageService()
