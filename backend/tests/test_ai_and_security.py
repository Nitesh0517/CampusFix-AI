import sys
import os
import asyncio

# Ensure app path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ai_service import ai_service, VALID_CATEGORIES, VALID_PRIORITIES
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.core.database import SessionLocal, Base, engine
from app.db.seed import seed_database
from app.models.user import User
from app.models.complaint import Complaint
from app.models.activity import ComplaintActivity

def test_ai_categorization():
    print("\n--- 1. Testing AI Categorization & Fallback ---")
    test_cases = [
        {
            "desc": "Hostel 14 Wi-Fi router is offline and dropping connection repeatedly since 9 AM.",
            "title": "Wi-Fi not connecting",
            "expected_cat": "Internet/Wi-Fi",
        },
        {
            "desc": "Fire sparks and burning smoke coming from power socket in Room 204 LHC!",
            "title": "Dangerous short circuit",
            "expected_cat": "Electricity",
            "expected_pri": "Urgent"
        },
        {
            "desc": "Drinking water cooler pipe burst and flooding corridor near library entrance.",
            "title": "Heavy water pipe burst",
            "expected_cat": "Water Supply",
            "expected_pri": "Urgent"
        },
        {
            "desc": "Insects found in rice and stale vegetables served in Hostel 12 Mess during lunch.",
            "title": "Food quality issue",
            "expected_cat": "Mess/Food",
            "expected_pri": "Urgent"
        },
        {
            "desc": "Digital projector in Lecture Hall Complex room 101 has dead lamp and audio mic has loud ground hum.",
            "title": "Projector failure",
            "expected_cat": "Classroom",
        },
        {
            "desc": "Stolen laptop from wing B common room and security guard not available at gate.",
            "title": "Theft in wing",
            "expected_cat": "Security",
            "expected_pri": "Urgent"
        },
        {
            "desc": "Core passenger lift stuck between 2nd and 3rd floor in Computer Science Dept.",
            "title": "Elevator issue",
            "expected_cat": "Infrastructure",
        }
    ]

    for tc in test_cases:
        res = asyncio.run(ai_service.analyze_complaint(tc["desc"], tc["title"]))
        assert res["category"] == tc["expected_cat"], f"Failed category for {tc['title']}: got {res['category']}"
        assert res["priority"] in VALID_PRIORITIES, f"Invalid priority: {res['priority']}"
        if "expected_pri" in tc:
            assert res["priority"] == tc["expected_pri"], f"Failed priority for {tc['title']}: got {res['priority']}"
        assert len(res["summary"]) > 5, "Summary too short"
        assert res["source"] == "heuristic-fallback", "Expected rule-based fallback without API key"
        print(f"  ✓ [{res['priority']}] {res['category']}: '{tc['title']}' -> '{res['summary']}'")
    print("All AI tests PASSED!")

def test_security_and_passwords():
    print("\n--- 2. Testing Password Hashing & JWT Security ---")
    password = "SuperSecretPassword123!"
    hashed = get_password_hash(password)
    assert hashed != password, "Password was not hashed!"
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$"), "Not a valid bcrypt hash"
    assert verify_password(password, hashed), "Password verification failed"
    assert not verify_password("WrongPassword", hashed), "Wrong password verified incorrectly"
    print("  ✓ Bcrypt password hashing & verification verified.")

    token = create_access_token(subject=101, role="student", name="Aarav Sharma")
    decoded = decode_access_token(token)
    assert decoded is not None, "JWT token decoding failed"
    assert decoded["sub"] == "101", f"Subject mismatch: {decoded['sub']}"
    assert decoded["role"] == "student", f"Role mismatch: {decoded['role']}"
    assert "exp" in decoded, "Token missing expiration claim"
    print("  ✓ JWT token generation and claims verified.")

def test_database_persistence():
    print("\n--- 3. Testing Database Persistence & Relationships ---")
    Base.metadata.create_all(bind=engine)
    seed_database()
    db = SessionLocal()
    try:
        users = db.query(User).all()
        assert len(users) >= 2, "Expected at least 2 demo users"
        admin = db.query(User).filter(User.role == "admin").first()
        student = db.query(User).filter(User.role == "student").first()
        assert admin is not None, "Missing admin user"
        assert student is not None, "Missing student user"
        print(f"  ✓ Users verified: {len(users)} users in database.")

        complaints = db.query(Complaint).all()
        assert len(complaints) >= 5, "Expected seeded complaints"
        print(f"  ✓ Complaints verified: {len(complaints)} complaints in database.")

        # Check relationships
        first_comp = complaints[0]
        assert first_comp.student is not None, "Complaint student relationship broken"
        assert len(first_comp.activities) >= 1, "Complaint activity relationship missing"
        print(f"  ✓ Relationships verified: Complaint {first_comp.ticket_number} has {len(first_comp.activities)} activities logged.")
    finally:
        db.close()
    print("Database persistence tests PASSED!")

if __name__ == "__main__":
    test_ai_categorization()
    test_security_and_passwords()
    test_database_persistence()
    print("\n==========================================")
    print("ALL AUDIT UNIT TESTS PASSED SUCCESSFULLY!")
    print("==========================================")
