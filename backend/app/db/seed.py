from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.complaint import Complaint
from app.models.activity import ComplaintActivity

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        admin = db.query(User).filter(User.email == "admin@campusfix.edu").first()
        if admin:
            return

        print("Seeding CampusFix AI demo database...")

        # 1. Create Users
        admin_user = User(
            email="admin@campusfix.edu",
            full_name="Dr. Rajesh Kulkarni",
            student_id="FAC-DIR-402",
            department="Campus Facilities & Student Affairs",
            role="admin",
            hashed_password=get_password_hash("AdminDemo123!"),
            created_at=datetime.now(timezone.utc) - timedelta(days=60)
        )
        db.add(admin_user)

        student_1 = User(
            email="student@campusfix.edu",
            full_name="Aarav Sharma",
            student_id="IITB-2024-CS101",
            department="Computer Science & Engineering",
            role="student",
            hashed_password=get_password_hash("StudentDemo123!"),
            created_at=datetime.now(timezone.utc) - timedelta(days=45)
        )
        db.add(student_1)

        student_2 = User(
            email="priya.patel@campusfix.edu",
            full_name="Priya Patel",
            student_id="IITB-2024-EE205",
            department="Electrical Engineering",
            role="student",
            hashed_password=get_password_hash("StudentDemo123!"),
            created_at=datetime.now(timezone.utc) - timedelta(days=40)
        )
        db.add(student_2)

        student_3 = User(
            email="rohit.verma@campusfix.edu",
            full_name="Rohit Verma",
            student_id="IITB-2023-ME310",
            department="Mechanical Engineering",
            role="student",
            hashed_password=get_password_hash("StudentDemo123!"),
            created_at=datetime.now(timezone.utc) - timedelta(days=35)
        )
        db.add(student_3)

        db.commit()
        db.refresh(admin_user)
        db.refresh(student_1)
        db.refresh(student_2)
        db.refresh(student_3)

        now = datetime.now(timezone.utc)

        # 2. Seed Realistic Complaints
        sample_complaints = [
            {
                "ticket_number": "CF-2026-1042",
                "title": "Severe Wi-Fi router flapping and disconnection in Hostel 14",
                "description": "The 5GHz access point on the 2nd floor corridor of Wing B has been dropping connections every 5 minutes since morning. Unable to attend lab lectures or access institute intranet servers.",
                "category": "Internet/Wi-Fi",
                "campus_location": "Hostel 14",
                "building_block": "Wing B - 2nd Floor",
                "priority": "High",
                "status": "In Progress",
                "ai_summary": "Intermittent Wi-Fi access point flapping on 2nd floor Wing B.",
                "ai_suggested_category": "Internet/Wi-Fi",
                "ai_suggested_priority": "High",
                "user_id": student_1.id,
                "assigned_to": "CC Network Operations (NOC)",
                "created_at": now - timedelta(hours=8),
                "activities": [
                    ("CREATED", student_1.full_name, "student", "Submitted", "Complaint registered via Student Portal.", now - timedelta(hours=8)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "Under Review", "Triaged by Campus IT desk.", now - timedelta(hours=6)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "In Progress", "Dispatched field technician to inspect switch & AP reboot.", now - timedelta(hours=3))
                ]
            },
            {
                "ticket_number": "CF-2026-1038",
                "title": "Continuous water cooler leakage causing flooding in corridor",
                "description": "The drinking water cooler near Room 204 has a burst drainage pipe. Water is pooling across the walkway creating slipping hazards for students walking towards classrooms.",
                "category": "Water Supply",
                "campus_location": "Lecture Hall Complex (LHC)",
                "building_block": "2nd Floor North Corridor",
                "priority": "Urgent",
                "status": "Resolved",
                "ai_summary": "Burst drainage pipe at water cooler causing water logging near Room 204.",
                "ai_suggested_category": "Water Supply",
                "ai_suggested_priority": "Urgent",
                "user_id": student_1.id,
                "assigned_to": "Estate Plumbing Division",
                "resolution_notes": "Replaced cracked PVC drain pipe and sanitized drainage trap. Tested water flow under full pressure.",
                "resolved_at": now - timedelta(hours=2),
                "feedback_rating": 5,
                "feedback_comment": "Super quick response! Maintenance team fixed the leak within 3 hours. Great job CampusFix!",
                "created_at": now - timedelta(days=2),
                "activities": [
                    ("CREATED", student_1.full_name, "student", "Submitted", "Issue flagged with urgent hazard tag.", now - timedelta(days=2)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "In Progress", "Plumbing team dispatched immediately.", now - timedelta(days=2, hours=-1)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "Resolved", "Pipe replaced and leak sealed.", now - timedelta(hours=2)),
                    ("FEEDBACK_SUBMITTED", student_1.full_name, "student", "Resolved", "Student provided 5-star rating.", now - timedelta(hours=1))
                ]
            },
            {
                "ticket_number": "CF-2026-1045",
                "title": "Central AC not cooling in 3rd Floor quiet study cubicles",
                "description": "Temperature inside the 3rd floor reading hall reached 31°C this afternoon. The duct airflow seems blocked or the compressor is tripping. Peak exam season makes this hall crowded and uncomfortably hot.",
                "category": "Library",
                "campus_location": "Central Library",
                "building_block": "3rd Floor Quiet Study Zone",
                "priority": "Medium",
                "status": "Under Review",
                "ai_summary": "Central AC failure in 3rd floor quiet study zone during peak study hours.",
                "ai_suggested_category": "Library",
                "ai_suggested_priority": "Medium",
                "user_id": student_2.id,
                "assigned_to": "HVAC Engineering Services",
                "created_at": now - timedelta(hours=18),
                "activities": [
                    ("CREATED", student_2.full_name, "student", "Submitted", "Reported by Priya Patel.", now - timedelta(hours=18)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "Under Review", "Escalated to Central HVAC supervisor for thermostat calibration.", now - timedelta(hours=12))
                ]
            },
            {
                "ticket_number": "CF-2026-1029",
                "title": "Digital projector flickering and audio hiss in Lecture Hall 101",
                "description": "During CSE301 lecture, the ceiling mounted projector kept losing HDMI signal every few minutes and the podium PA speakers produced a high-pitched ground hum.",
                "category": "Classroom",
                "campus_location": "Lecture Hall Complex (LHC)",
                "building_block": "Hall LHC-101",
                "priority": "High",
                "status": "Resolved",
                "ai_summary": "HDMI signal drop and ground loop hum on AV system in LHC-101.",
                "ai_suggested_category": "Classroom",
                "ai_suggested_priority": "High",
                "user_id": student_1.id,
                "assigned_to": "Audiovisual Maintenance Cell",
                "resolution_notes": "Replaced faulty HDMI transmitter cable in podium faceplate and calibrated audio isolator transformer.",
                "resolved_at": now - timedelta(days=1),
                "feedback_rating": 4,
                "feedback_comment": "Projector works without interruption now. Sound is clear.",
                "created_at": now - timedelta(days=3),
                "activities": [
                    ("CREATED", student_1.full_name, "student", "Submitted", "Lecture disruption reported.", now - timedelta(days=3)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "In Progress", "AV technician scheduled during lunch break.", now - timedelta(days=2)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "Resolved", "Cables swapped and checked.", now - timedelta(days=1))
                ]
            },
            {
                "ticket_number": "CF-2026-1051",
                "title": "Substandard hygiene and stale rotis in Hostel 12 Mess",
                "description": "Dinner served on Wednesday included undercooked rotis and stale dal. Furthermore, the salad bar did not have sneeze covers and flies were present around the serving trays.",
                "category": "Mess/Food",
                "campus_location": "Hostel 12 Mess",
                "building_block": "Dining Hall Counter 2",
                "priority": "High",
                "status": "In Progress",
                "ai_summary": "Food quality and hygiene violation in Hostel 12 Mess dining hall.",
                "ai_suggested_category": "Mess/Food",
                "ai_suggested_priority": "High",
                "user_id": student_3.id,
                "assigned_to": "Mess Council & Health Officer",
                "created_at": now - timedelta(hours=22),
                "activities": [
                    ("CREATED", student_3.full_name, "student", "Submitted", "Complaint registered with photos.", now - timedelta(hours=22)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "In Progress", "Surprise inspection conducted by Student Affairs Mess Warden.", now - timedelta(hours=14))
                ]
            },
            {
                "ticket_number": "CF-2026-1015",
                "title": "Sparking ceiling fan capacitor in Room 318, Hostel 12",
                "description": "The ceiling fan started emitting burning plastic smell and small visible sparks when switched to speed 4. Immediately turned off switch from MCB.",
                "category": "Electricity",
                "campus_location": "Hostel 12",
                "building_block": "3rd Floor - Room 318",
                "priority": "Urgent",
                "status": "Resolved",
                "ai_summary": "Electric spark and burnt capacitor in ceiling fan.",
                "ai_suggested_category": "Electricity",
                "ai_suggested_priority": "Urgent",
                "user_id": student_3.id,
                "assigned_to": "Hostel Electrical Shift",
                "resolution_notes": "Burned capacitor and motor coil replaced with new Orient BLDC unit. Tested wiring insulation resistance.",
                "resolved_at": now - timedelta(days=4),
                "feedback_rating": 5,
                "feedback_comment": "Electrician arrived within 25 minutes due to Urgent priority. Very safe now.",
                "created_at": now - timedelta(days=5),
                "activities": [
                    ("CREATED", student_3.full_name, "student", "Submitted", "Urgent electrical fire hazard logged.", now - timedelta(days=5)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "In Progress", "Emergency electrician dispatched.", now - timedelta(days=5, hours=-1)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "Resolved", "Motor and capacitor renewed.", now - timedelta(days=4))
                ]
            },
            {
                "ticket_number": "CF-2026-1060",
                "title": "Non-functional street lamps along Gymkhana to Hostel walkway",
                "description": "Three consecutive solar lamps are dead along the walkway connecting the sports ground to Hostel 15. The stretch is pitch dark after 8 PM raising safety concerns.",
                "category": "Security",
                "campus_location": "Gymkhana Grounds",
                "building_block": "North Perimeter Pathway",
                "priority": "High",
                "status": "Submitted",
                "ai_summary": "Dark walkway due to unlit street lamps on Gymkhana pathway.",
                "ai_suggested_category": "Security",
                "ai_suggested_priority": "High",
                "user_id": student_2.id,
                "assigned_to": "Estate Electrical Maintenance",
                "created_at": now - timedelta(hours=4),
                "activities": [
                    ("CREATED", student_2.full_name, "student", "Submitted", "Reported by Priya Patel.", now - timedelta(hours=4))
                ]
            },
            {
                "ticket_number": "CF-2026-1011",
                "title": "Deep pothole near Main Gate turning causing bike skidding",
                "description": "Recent rain has washed out gravel creating a 4-inch deep pothole right at the curve near Security Gate 2. Multiple cycle and scooter riders have lost balance.",
                "category": "Infrastructure",
                "campus_location": "Main Building",
                "building_block": "Near Security Gate 2",
                "priority": "High",
                "status": "Resolved",
                "ai_summary": "Dangerous road pothole at Security Gate 2 turn.",
                "ai_suggested_category": "Infrastructure",
                "ai_suggested_priority": "High",
                "user_id": student_1.id,
                "assigned_to": "Civil Works Division",
                "resolution_notes": "Filled with bituminous cold mix asphalt and compacted with roller.",
                "resolved_at": now - timedelta(days=6),
                "feedback_rating": 4,
                "feedback_comment": "Smooth road surface now, thanks for quick turnaround.",
                "created_at": now - timedelta(days=7),
                "activities": [
                    ("CREATED", student_1.full_name, "student", "Submitted", "Pothole hazard logged.", now - timedelta(days=7)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "Resolved", "Civil repair finished.", now - timedelta(days=6))
                ]
            },
            {
                "ticket_number": "CF-2026-1065",
                "title": "Uncleaned washroom and leaking flush valve in Wing D",
                "description": "The 1st floor common washroom in Hostel 16 has not been cleaned since yesterday. Flush valve in Cubicle 3 is leaking continuously onto floor.",
                "category": "Cleanliness",
                "campus_location": "Hostel 16",
                "building_block": "Wing D - 1st Floor Washroom",
                "priority": "Medium",
                "status": "Submitted",
                "ai_summary": "Sanitation and flush valve maintenance needed in Wing D washroom.",
                "ai_suggested_category": "Cleanliness",
                "ai_suggested_priority": "Medium",
                "user_id": student_3.id,
                "created_at": now - timedelta(hours=2),
                "activities": [
                    ("CREATED", student_3.full_name, "student", "Submitted", "Filed by Rohit Verma.", now - timedelta(hours=2))
                ]
            },
            {
                "ticket_number": "CF-2026-1070",
                "title": "Passenger elevator jerk and floor alignment error",
                "description": "Lift #2 in the New CSE Building stops 3 inches below the landing sill on the 4th floor, posing a tripping hazard when exiting.",
                "category": "Infrastructure",
                "campus_location": "Computer Science Dept",
                "building_block": "New CSE Building - Core Lift 2",
                "priority": "High",
                "status": "Under Review",
                "ai_summary": "Lift leveling misalignment on 4th floor landing.",
                "ai_suggested_category": "Infrastructure",
                "ai_suggested_priority": "High",
                "user_id": student_1.id,
                "assigned_to": "Otis / Elevator Maintenance Contractor",
                "created_at": now - timedelta(hours=14),
                "activities": [
                    ("CREATED", student_1.full_name, "student", "Submitted", "Filed by Aarav Sharma.", now - timedelta(hours=14)),
                    ("STATUS_CHANGE", admin_user.full_name, "admin", "Under Review", "Escalated to elevator maintenance contract vendor.", now - timedelta(hours=10))
                ]
            }
        ]

        for item in sample_complaints:
            acts = item.pop("activities")
            complaint = Complaint(**item)
            db.add(complaint)
            db.commit()
            db.refresh(complaint)

            for action, u_name, u_role, to_st, note, timestamp in acts:
                act = ComplaintActivity(
                    complaint_id=complaint.id,
                    user_name=u_name,
                    user_role=u_role,
                    action=action,
                    from_status=None,
                    to_status=to_st,
                    notes=note,
                    created_at=timestamp
                )
                db.add(act)
            db.commit()

        print("CampusFix AI database successfully seeded with demo accounts & realistic complaints!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
