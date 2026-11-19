from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(32), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(64), nullable=False, index=True)
    campus_location = Column(String(128), nullable=False, index=True)
    building_block = Column(String(128), nullable=True)
    priority = Column(String(32), default="Medium", nullable=False, index=True)  # Low, Medium, High, Urgent
    status = Column(String(32), default="Submitted", nullable=False, index=True)  # Submitted, Under Review, In Progress, Resolved, Rejected
    image_url = Column(String(512), nullable=True)
    
    # AI Analysis attributes
    ai_summary = Column(Text, nullable=True)
    ai_suggested_category = Column(String(64), nullable=True)
    ai_suggested_priority = Column(String(32), nullable=True)
    
    # User / Admin details
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to = Column(String(128), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Feedback
    feedback_rating = Column(Integer, nullable=True)
    feedback_comment = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("User", back_populates="complaints")
    activities = relationship("ComplaintActivity", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintActivity.created_at.desc()")
