from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.user import User
from app.models.complaint import Complaint
from app.models.activity import ComplaintActivity
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def format_relative_time(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = diff.total_seconds()
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        return f"{int(seconds // 60)}m ago"
    elif seconds < 86400:
        return f"{int(seconds // 3600)}h ago"
    else:
        return f"{int(seconds // 86400)}d ago"

@router.get("")
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns recent campus maintenance notifications relevant to the active user.
    For students: updates on their filed complaints.
    For admins: recent campus hazards, high-priority submissions, and student feedback.
    """
    if current_user.role == "admin":
        # Fetch the 10 most recent activities across all campus tickets
        activities = (
            db.query(ComplaintActivity, Complaint)
            .join(Complaint, ComplaintActivity.complaint_id == Complaint.id)
            .order_by(desc(ComplaintActivity.created_at))
            .limit(10)
            .all()
        )
    else:
        # Fetch activities on tickets authored by this student
        activities = (
            db.query(ComplaintActivity, Complaint)
            .join(Complaint, ComplaintActivity.complaint_id == Complaint.id)
            .filter(Complaint.user_id == current_user.id)
            .order_by(desc(ComplaintActivity.created_at))
            .limit(10)
            .all()
        )

    notifications = []
    for act, comp in activities:
        title = "Ticket Status Update"
        if act.action == "CREATED":
            title = "Ticket Submitted"
        elif act.action == "STATUS_CHANGE":
            title = f"Status: {act.to_status}"
        elif act.action == "FEEDBACK_SUBMITTED":
            title = "Student Feedback Received"

        notifications.append({
            "id": act.id,
            "title": title,
            "message": f"[{comp.ticket_number}] {act.notes or comp.title}",
            "ticket_number": comp.ticket_number,
            "complaint_id": comp.id,
            "action": act.action,
            "priority": comp.priority,
            "created_at": act.created_at.isoformat(),
            "time_ago": format_relative_time(act.created_at),
            "read": False
        })

    return notifications
