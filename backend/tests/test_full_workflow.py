import httpx

BASE_URL = "http://127.0.0.1:8000"

def run_integration_tests():
    print("\n=======================================================")
    print("RUNNING LIVE END-TO-END WORKFLOW INTEGRATION AUDIT")
    print("=======================================================")

    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Health check
        r_health = client.get("/api/health")
        assert r_health.status_code == 200, f"Health check failed: {r_health.text}"
        print("  ✓ 1. Health Check passed (Status: 200 OK)")

        # 2. Authentication: Student Login
        r_slogin = client.post("/api/auth/login", json={"email": "student@campusfix.edu", "password": "StudentDemo123!"})
        assert r_slogin.status_code == 200, f"Student login failed: {r_slogin.text}"
        student_token = r_slogin.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}
        print("  ✓ 2. Student Authentication passed (JWT issued)")

        # 3. Authentication: Admin Login
        r_alogin = client.post("/api/auth/login", json={"email": "admin@campusfix.edu", "password": "AdminDemo123!"})
        assert r_alogin.status_code == 200, f"Admin login failed: {r_alogin.text}"
        admin_token = r_alogin.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("  ✓ 3. Admin Authentication passed (Role: admin)")

        # 4. Profile ME
        r_me = client.get("/api/auth/me", headers=student_headers)
        assert r_me.status_code == 200 and r_me.json()["email"] == "student@campusfix.edu"
        print("  ✓ 4. Auth Profile Verification passed")

        # 5. AI Triage Engine
        r_ai = client.post(
            "/api/ai/analyze",
            json={"description": "Hostel 14 2nd floor corridor access point is offline and dropping packets.", "campus_location": "Hostel 14"},
            headers=student_headers
        )
        assert r_ai.status_code == 200
        ai_out = r_ai.json()
        assert ai_out["category"] == "Internet/Wi-Fi"
        print(f"  ✓ 5. AI Triage Engine passed ({ai_out['category']} | {ai_out['priority']} | {ai_out['source']})")

        # 6. Student creates complaint
        new_ticket = {
            "title": "Water cooler leaking profusely near Room 302",
            "description": "Drainage pipe cracked and leaking clean water all over the hallway floor creating slipping hazard.",
            "category": "Water Supply",
            "campus_location": "Hostel 14",
            "building_block": "3rd Floor Wing B",
            "priority": "Urgent",
            "ai_summary": "Drinking water cooler pipe leakage on 3rd floor hallway.",
            "ai_suggested_category": "Water Supply",
            "ai_suggested_priority": "Urgent"
        }
        r_create = client.post("/api/complaints", json=new_ticket, headers=student_headers)
        assert r_create.status_code == 201, f"Failed creation: {r_create.text}"
        ticket_data = r_create.json()
        cid = ticket_data["id"]
        tnum = ticket_data["ticket_number"]
        print(f"  ✓ 6. Complaint Submission passed (Created: {tnum})")

        # 7. Student lists complaints (my_only=true)
        r_my = client.get("/api/complaints?my_only=true", headers=student_headers)
        assert r_my.status_code == 200 and len(r_my.json()) >= 1
        print(f"  ✓ 7. Student Personal Dashboard query passed ({len(r_my.json())} tickets)")

        # 8. Admin lists all complaints
        r_all = client.get("/api/complaints", headers=admin_headers)
        assert r_all.status_code == 200 and len(r_all.json()) >= 1
        print(f"  ✓ 8. Admin All-Complaints Management query passed ({len(r_all.json())} tickets)")

        # 9. Security Test: Student tries to update status (should be 403 Forbidden!)
        r_hack = client.patch(
            f"/api/complaints/{cid}/status",
            json={"status": "Resolved"},
            headers=student_headers
        )
        assert r_hack.status_code == 403, f"Security breach! Student was allowed to modify status: {r_hack.status_code}"
        print("  ✓ 9. Security RBAC Protection verified: Student unauthorized to update status (403 Forbidden)")

        # 10. Admin updates status to In Progress and assigns team
        r_assign = client.patch(
            f"/api/complaints/{cid}/status",
            json={
                "status": "In Progress",
                "priority": "Urgent",
                "assigned_to": "Estate Plumbing Division - Shift 1",
                "resolution_notes": "Plumber dispatched with replacement PVC elbow joint."
            },
            headers=admin_headers
        )
        assert r_assign.status_code == 200 and r_assign.json()["status"] == "In Progress"
        print(f"  ✓ 10. Admin Triage & Assignment passed (Status: In Progress | Assigned: {r_assign.json()['assigned_to']})")

        # 11. Admin resolves complaint
        r_resolve = client.patch(
            f"/api/complaints/{cid}/status",
            json={
                "status": "Resolved",
                "resolution_notes": "Cracked pipe replaced, tested under full water pressure. Leak sealed."
            },
            headers=admin_headers
        )
        assert r_resolve.status_code == 200 and r_resolve.json()["status"] == "Resolved"
        print("  ✓ 11. Admin Resolution passed (Status: Resolved)")

        # 12. Student provides feedback rating
        r_feed = client.post(
            f"/api/complaints/{cid}/feedback",
            json={"feedback_rating": 5, "feedback_comment": "Super fast repair by the plumbing team!"},
            headers=student_headers
        )
        assert r_feed.status_code == 200 and r_feed.json()["feedback_rating"] == 5
        print(f"  ✓ 12. Student Resolution Feedback passed (Rated: 5/5 stars)")

        # 13. Notifications check
        r_notif = client.get("/api/notifications", headers=student_headers)
        assert r_notif.status_code == 200 and len(r_notif.json()) >= 1
        print(f"  ✓ 13. Campus Notifications passed ({len(r_notif.json())} alerts generated)")

        # 14. Campus Analytics check
        r_ana = client.get("/api/analytics", headers=admin_headers)
        assert r_ana.status_code == 200
        ana_data = r_ana.json()
        assert ana_data["overview"]["total_complaints"] >= 1
        assert len(ana_data["by_category"]) >= 1
        assert len(ana_data["monthly_trends"]) == 6
        print(f"  ✓ 14. Recharts Analytics API passed (Total: {ana_data['overview']['total_complaints']} | Resolution Rate: {ana_data['overview']['resolution_rate_percent']}%)")

    print("\n=======================================================")
    print("ALL 14 INTEGRATION WORKFLOW AUDIT CHECKS PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    run_integration_tests()
