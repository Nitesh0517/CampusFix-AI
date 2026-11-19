"""
AWS Lambda Mangum Handler for CampusFix AI (Backend Root).
Translates AWS Lambda API Gateway events to FastAPI ASGI calls.
"""
from mangum import Mangum
from app.main import app

# Configured for AWS Lambda + Amazon API Gateway HTTP API v2 or REST v1
handler = Mangum(app, lifespan="off")
