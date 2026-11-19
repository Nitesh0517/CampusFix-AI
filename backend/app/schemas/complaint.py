from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    category: str
    campus_location: str
    building_block: Optional[str] = None
    priority: str = "Medium"
    image_url: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_suggested_category: Optional[str] = None
    ai_suggested_priority: Optional[str] = None

class ComplaintStatusUpdate(BaseModel):
    status: str  # "Submitted", "Under Review", "In Progress", "Resolved", "Rejected"
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None

class ComplaintFeedback(BaseModel):
    feedback_rating: int = Field(..., ge=1, le=5)
    feedback_comment: Optional[str] = None

class ActivityResponse(BaseModel):
    id: int
    user_name: str
    user_role: str
    action: str
    from_status: Optional[str] = None
    to_status: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ComplaintResponse(BaseModel):
    id: int
    ticket_number: str
    title: str
    description: str
    category: str
    campus_location: str
    building_block: Optional[str] = None
    priority: str
    status: str
    image_url: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_suggested_category: Optional[str] = None
    ai_suggested_priority: Optional[str] = None
    user_id: int
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    student_id: Optional[str] = None
    student_department: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    feedback_rating: Optional[int] = None
    feedback_comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    activities: List[ActivityResponse] = []

    class Config:
        from_attributes = True

class AIAnalyzeRequest(BaseModel):
    description: str = Field(..., min_length=5)
    title: Optional[str] = None
    campus_location: Optional[str] = None

class AIAnalyzeResponse(BaseModel):
    category: str
    priority: str
    location_hint: Optional[str] = None
    summary: str
    confidence: float
    reasoning: str
    keywords: List[str] = []
    source: str = "ai"  # "gemini" or "heuristic-fallback"
