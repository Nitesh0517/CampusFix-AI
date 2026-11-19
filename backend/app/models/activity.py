from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ComplaintActivity(Base):
    __tablename__ = "complaint_activities"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    user_role = Column(String(32), nullable=False)
    action = Column(String(64), nullable=False)  # "CREATED", "STATUS_CHANGE", "ASSIGNED", "NOTE_ADDED", "FEEDBACK_SUBMITTED"
    from_status = Column(String(64), nullable=True)
    to_status = Column(String(64), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    complaint = relationship("Complaint", back_populates="activities")
