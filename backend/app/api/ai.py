from fastapi import APIRouter, Depends
from app.schemas.complaint import AIAnalyzeRequest, AIAnalyzeResponse
from app.services.ai_service import ai_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/analyze", response_model=AIAnalyzeResponse)
async def analyze_complaint(
    payload: AIAnalyzeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyzes complaint description in real-time.
    Auto-categorizes, calculates urgency/priority, suggests locations, and generates a concise summary.
    """
    result = await ai_service.analyze_complaint(
        description=payload.description,
        title=payload.title,
        campus_location=payload.campus_location
    )
    return AIAnalyzeResponse(**result)
