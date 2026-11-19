import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.core.database import get_db
from app.models.user import User
from app.models.complaint import Complaint
from app.models.activity import ComplaintActivity
from app.schemas.complaint import (
    ComplaintCreate, ComplaintResponse, ComplaintStatusUpdate, 
    ComplaintFeedback, ActivityResponse
)
from app.api.deps import get_current_user, get_current_admin
from app.services.storage import get_storage_service

router = APIRouter(prefix="/complaints", tags=["Complaints"])

def generate_ticket_number(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    # Try until unique
    for _ in range(10):
        rand_num = random.randint(1000, 9999)
        ticket = f"CF-{year}-{rand_num}"
        if not db.query(Complaint).filter(Complaint.ticket_number == ticket).first():
            return ticket
    return f"CF-{year}-{random.randint(10000, 99999)}"

def format_complaint_response(complaint: Complaint) -> ComplaintResponse:
    student = complaint.student
    activities = [
        ActivityResponse(
            id=act.id,
            user_name=act.user_name,
            user_role=act.user_role,
            action=act.action,
            from_status=act.from_status,
            to_status=act.to_status,
            notes=act.notes,
            created_at=act.created_at
        ) for act in complaint.activities
    ]
    return ComplaintResponse(
        id=complaint.id,
        ticket_number=complaint.ticket_number,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        campus_location=complaint.campus_location,
        building_block=complaint.building_block,
        priority=complaint.priority,
        status=complaint.status,
        image_url=complaint.image_url,
        ai_summary=complaint.ai_summary,
        ai_suggested_category=complaint.ai_suggested_category,
        ai_suggested_priority=complaint.ai_suggested_priority,
        user_id=complaint.user_id,
        student_name=student.full_name if student else "Unknown Student",
        student_email=student.email if student else "",
        student_id=student.student_id if student else "",
        student_department=student.department if student else "",
        assigned_to=complaint.assigned_to,
        resolution_notes=complaint.resolution_notes,
        resolved_at=complaint.resolved_at,
        feedback_rating=complaint.feedback_rating,
        feedback_comment=complaint.feedback_comment,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        activities=activities
    )

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket_num = generate_ticket_number(db)
    
    complaint = Complaint(
        ticket_number=ticket_num,
        title=payload.title.strip(),
        description=payload.description.strip(),
        category=payload.category.strip(),
        campus_location=payload.campus_location.strip(),
        building_block=payload.building_block.strip() if payload.building_block else None,
        priority=payload.priority.strip() if payload.priority else "Medium",
        status="Submitted",
        image_url=payload.image_url,
        ai_summary=payload.ai_summary,
        ai_suggested_category=payload.ai_suggested_category,
        ai_suggested_priority=payload.ai_suggested_priority,
        user_id=current_user.id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Initial activity log
    activity = ComplaintActivity(
        complaint_id=complaint.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="CREATED",
        from_status=None,
        to_status="Submitted",
        notes=f"Complaint filed under category: {complaint.category} (Priority: {complaint.priority}).",
        created_at=datetime.now(timezone.utc)
    )
    db.add(activity)
    db.commit()
    db.refresh(complaint)

    return format_complaint_response(complaint)

@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_filter: Optional[str] = Query(None, alias="category"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    search: Optional[str] = Query(None),
    my_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Complaint)

    # If student, or if explicitly requested my_only, filter by user_id
    if current_user.role != "admin" or my_only:
        query = query.filter(Complaint.user_id == current_user.id)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(Complaint.status == status_filter)

    if category_filter and category_filter.lower() != "all":
        query = query.filter(Complaint.category == category_filter)

    if priority_filter and priority_filter.lower() != "all":
        query = query.filter(Complaint.priority == priority_filter)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.ticket_number.ilike(search_pattern),
                Complaint.title.ilike(search_pattern),
                Complaint.description.ilike(search_pattern),
                Complaint.campus_location.ilike(search_pattern),
                Complaint.building_block.ilike(search_pattern)
            )
        )

    complaints = query.order_by(desc(Complaint.created_at)).all()
    return [format_complaint_response(c) for c in complaints]

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    # Access control: students can only see their own complaints
    if current_user.role != "admin" and complaint.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this complaint.")

    return format_complaint_response(complaint)

@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    old_status = complaint.status
    new_status = payload.status
    
    complaint.status = new_status
    if payload.priority:
        complaint.priority = payload.priority
    if payload.assigned_to is not None:
        complaint.assigned_to = payload.assigned_to
    if payload.resolution_notes is not None:
        complaint.resolution_notes = payload.resolution_notes
        
    if new_status == "Resolved" and not complaint.resolved_at:
        complaint.resolved_at = datetime.now(timezone.utc)
        
    complaint.updated_at = datetime.now(timezone.utc)
    db.commit()

    # Log status change in timeline
    note_msg = payload.resolution_notes or f"Status updated from {old_status} to {new_status}."
    if payload.assigned_to:
        note_msg += f" (Assigned to: {payload.assigned_to})"

    activity = ComplaintActivity(
        complaint_id=complaint.id,
        user_name=admin_user.full_name,
        user_role="admin",
        action="STATUS_CHANGE",
        from_status=old_status,
        to_status=new_status,
        notes=note_msg,
        created_at=datetime.now(timezone.utc)
    )
    db.add(activity)
    db.commit()
    db.refresh(complaint)

    return format_complaint_response(complaint)

@router.post("/{complaint_id}/feedback", response_model=ComplaintResponse)
def submit_feedback(
    complaint_id: int,
    payload: ComplaintFeedback,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if complaint.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the reporting student can submit feedback.")

    if complaint.status != "Resolved":
        raise HTTPException(status_code=400, detail="Feedback can only be provided for resolved complaints.")

    complaint.feedback_rating = payload.feedback_rating
    complaint.feedback_comment = payload.feedback_comment
    complaint.updated_at = datetime.now(timezone.utc)
    db.commit()

    # Log feedback in timeline
    activity = ComplaintActivity(
        complaint_id=complaint.id,
        user_name=current_user.full_name,
        user_role=current_user.role,
        action="FEEDBACK_SUBMITTED",
        from_status=complaint.status,
        to_status=complaint.status,
        notes=f"Student rated resolution {payload.feedback_rating}/5 stars. Feedback: '{payload.feedback_comment or 'No extra comment'}'",
        created_at=datetime.now(timezone.utc)
    )
    db.add(activity)
    db.commit()
    db.refresh(complaint)

    return format_complaint_response(complaint)

@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (JPG, PNG, WebP) are permitted.")
        
    storage = get_storage_service()
    file_url = await storage.save_file(file)
    return {"image_url": file_url}

@router.delete("/{complaint_id}")
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if current_user.role != "admin" and (complaint.user_id != current_user.id or complaint.status != "Submitted"):
        raise HTTPException(status_code=403, detail="Cannot delete this complaint.")

    db.delete(complaint)
    db.commit()
    return {"message": "Complaint removed successfully."}
