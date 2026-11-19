"""
AWS Lambda Mangum Handler for CampusFix AI.
Allows the FastAPI backend to run serverlessly on AWS Lambda + Amazon API Gateway.
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from mangum import Mangum
from app.main import app

# Mangum wrapper for AWS Lambda HTTP/REST event translation
handler = Mangum(app, lifespan="off")
