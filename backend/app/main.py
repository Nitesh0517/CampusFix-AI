import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.seed import seed_database
from app.api.auth import router as auth_router
from app.api.complaints import router as complaints_router
from app.api.ai import router as ai_router
from app.api.analytics import router as analytics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Automatically initialize and seed DB if empty
    try:
        seed_database()
    except Exception as e:
        print(f"Database seed initialization notice: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Smart Campus Issue Management System - Built for AWS ShipIt Challenge, Techfest IIT Bombay",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded media storage
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(complaints_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "status": "operational",
        "version": "1.0.0",
        "competition": "AWS ShipIt Challenge - Techfest IIT Bombay",
        "docs": "/docs",
        "ai_engine": "Gemini AI with Heuristic Fallback",
        "cloud_readiness": {
            "aws_lambda_adapter": "Ready (Mangum ASGI)",
            "aws_dynamodb_adapter": "Ready",
            "aws_s3_storage": "Ready",
            "active_mode": "Local Development (SQLite + Local Storage)"
        }
    }

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "ai_configured": bool(settings.GEMINI_API_KEY),
        "database": "connected"
    }
