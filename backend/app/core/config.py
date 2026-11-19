import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusFix AI"
    PROJECT_TAGLINE: str = "Smart Campus. Smarter Solutions."
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "campusfix-super-secret-jwt-key-2026-techfest-iitb")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (uses absolute path for consistency regardless of current working directory)
    _default_db = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "campusfix.db").replace("\\", "/")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_default_db}")
    
    # AI Integration
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    
    # Upload storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads"))
    
    # AWS Ready Settings (For Techfest AWS ShipIt deployment)
    AWS_REGION: str = os.getenv("AWS_REGION", "ap-south-1")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "campusfix-evidence-uploads")
    AWS_DYNAMODB_TABLE: str = os.getenv("AWS_DYNAMODB_TABLE", "CampusFixComplaints")
    USE_AWS_STORAGE: bool = os.getenv("USE_AWS_STORAGE", "false").lower() == "true"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
