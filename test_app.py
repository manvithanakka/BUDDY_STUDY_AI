"""
Automated Verification & Test Suite for StudyMate AI
Tests all endpoints, validation logic, generator logic, and error handling.
"""

from datetime import datetime, timedelta
import json
from app import app

def run_tests():
    client = app.test_client()
    print("[*] Starting StudyMate AI Test Suite...\n")
    
    # Test 1: Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.get_json()
    assert data["status"] == "healthy"
    print("[PASS] Test 1: /api/health endpoint is working.")

    # Test 2: Index page renders HTML
    res = client.get("/")
    assert res.status_code == 200
    assert b"StudyMate" in res.data
    assert b"Personalized AI Study Planner" in res.data
    print("[PASS] Test 2: / (Index template) renders correctly.")

    # Test 3: Demo data endpoint
    res = client.get("/api/demo-data")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"
    assert data["data"]["student_name"] == "Manvitha"
    assert "Mathematics" in data["data"]["subjects"]
    print("[PASS] Test 3: /api/demo-data returns Manvitha's profile.")

    # Test 4: Generate plan with valid Manvitha profile
    future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    payload = {
        "student_name": "Manvitha",
        "exam_date": future_date,
        "study_hours_per_day": 4,
        "study_days": 7,
        "subjects": ["Mathematics", "Java", "Python", "Data Structures", "DBMS"],
        "weak_subjects": ["mathematics", "java"],
        "strong_subjects": ["python"],
        "preferred_time": "Morning",
        "break_preference": "15m",
        "goal": "Score high"
    }
    res = client.post("/api/generate", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.data}"
    plan = res.get_json()
    assert plan["status"] == "success"
    assert len(plan["daily_plans"]) == 7
    assert plan["summary"]["total_study_hours"] == 28.0
    assert plan["progress"]["total_planned_hours"] == 28.0
    
    # Check that weak subjects received higher allocation than strong
    alloc = plan["progress"]["subject_allocation"]
    assert alloc["Mathematics"] > alloc["Python"]
    assert alloc["Java"] > alloc["Python"]
    
    # Check today's focus
    assert "subject" in plan["today_focus"]
    assert "duration" in plan["today_focus"]
    assert "motivational_tip" in plan["today_focus"]
    
    # Check recommendations
    assert len(plan["recommendations"]) >= 3
    print("[PASS] Test 4: /api/generate produces valid personalized schedule, weights, and tips.")

    # Test 5: Validation - Past Exam Date
    past_date = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d")
    bad_payload = dict(payload)
    bad_payload["exam_date"] = past_date
    res = client.post("/api/generate", json=bad_payload)
    assert res.status_code == 400
    err = res.get_json()
    assert "cannot be in the past" in err["message"]
    print("[PASS] Test 5: Past exam date validation caught properly.")

    # Test 6: Validation - Non-positive study hours
    bad_payload = dict(payload)
    bad_payload["study_hours_per_day"] = 0
    res = client.post("/api/generate", json=bad_payload)
    assert res.status_code == 400
    assert "positive" in res.get_json()["message"]
    print("[PASS] Test 6: Non-positive study hours validation caught properly.")

    # Test 7: Validation - No subjects
    bad_payload = dict(payload)
    bad_payload["subjects"] = []
    res = client.post("/api/generate", json=bad_payload)
    assert res.status_code == 400
    assert "At least one subject is required" in res.get_json()["message"]
    print("[PASS] Test 7: Empty subjects validation caught properly.")

    print("\n[SUCCESS] ALL 7 TESTS PASSED! StudyMate AI backend is solid and workshop-ready.\n")

if __name__ == "__main__":
    run_tests()
