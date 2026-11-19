from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    student_id = Column(String(64), nullable=True)
    department = Column(String(128), nullable=True)
    role = Column(String(32), default="student", nullable=False)  # "student" or "admin"
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    complaints = relationship("Complaint", back_populates="student", cascade="all, delete-orphan")
