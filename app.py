"""
StudyMate AI – Personal Study Planner
Flask Application Server & API Endpoints
"""

import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from ai_service import generate_plan

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["SECRET_KEY"] = os.urandom(24)

DEMO_DATA = {
    "student_name": "Manvitha",
    "subjects": ["Mathematics", "Java", "Python", "Data Structures", "DBMS"],
    "weak_subjects": ["Mathematics", "Java"],
    "strong_subjects": ["Python"],
    "study_hours_per_day": 4,
    "study_days": 7,
    "preferred_time": "Morning",
    "break_preference": "15m",
    "goal": "Score high",
    "exam_date": (datetime.now()).strftime("%Y-%m-%d")
}


@app.route("/")
def index():
    """Serves the main application dashboard."""
    return render_template("index.html")


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "app": "StudyMate AI",
        "version": "1.0.0"
    })


@app.route("/api/demo-data", methods=["GET"])
def get_demo_data():
    """Returns pre-configured demo student profile for workshop demonstration."""
    return jsonify({
        "status": "success",
        "data": DEMO_DATA
    })


@app.route("/api/generate", methods=["POST"])
def generate():
    """
    Validates form data and generates the personalized study plan.
    """
    try:
        data = request.get_json(silent=True) or {}

        # Validation 1: Student Name
        student_name = data.get("student_name", "").strip()
        if not student_name:
            student_name = "Student"

        # Validation 2: Exam Date cannot be in the past
        exam_date_str = data.get("exam_date", "").strip()
        if exam_date_str:
            try:
                exam_date = datetime.strptime(exam_date_str, "%Y-%m-%d").date()
                today = datetime.now().date()
                if exam_date < today:
                    return jsonify({
                        "status": "error",
                        "message": "Exam date cannot be in the past. Please choose today or a future date."
                    }), 400
            except ValueError:
                return jsonify({
                    "status": "error",
                    "message": "Invalid exam date format. Please use YYYY-MM-DD."
                }), 400

        # Validation 3: Available Study Hours must be positive
        try:
            study_hours = float(data.get("study_hours_per_day", 0))
            if study_hours <= 0:
                return jsonify({
                    "status": "error",
                    "message": "Available study hours per day must be a positive number (e.g. 2 - 12 hours)."
                }), 400
            if study_hours > 16:
                return jsonify({
                    "status": "error",
                    "message": "Daily study hours cannot exceed 16 hours to maintain healthy rest and sleep."
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "message": "Please enter a valid numeric value for study hours per day."
            }), 400

        # Validation 4: Study Days must be positive
        try:
            study_days = int(data.get("study_days", 0))
            if study_days <= 0:
                return jsonify({
                    "status": "error",
                    "message": "Number of study days must be at least 1 day."
                }), 400
            if study_days > 90:
                return jsonify({
                    "status": "error",
                    "message": "Please select a study duration of 90 days or fewer for optimal schedule granularity."
                }), 400
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "message": "Please enter a valid integer for study days."
            }), 400

        # Validation 5: At least one subject is required
        raw_subjects = data.get("subjects", [])
        if isinstance(raw_subjects, str):
            subjects = [s.strip() for s in raw_subjects.split(",") if s.strip()]
        elif isinstance(raw_subjects, list):
            subjects = [str(s).strip() for s in raw_subjects if str(s).strip()]
        else:
            subjects = []

        if not subjects:
            return jsonify({
                "status": "error",
                "message": "At least one subject is required to generate your study plan."
            }), 400

        # Optional custom API key from client request header or payload
        custom_key = request.headers.get("X-API-Key") or data.get("api_key")

        # Generate plan via AI service (with guaranteed local fallback)
        plan = generate_plan(data, custom_api_key=custom_key)

        return jsonify(plan)

    except Exception as e:
        app.logger.error(f"Error during plan generation: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": f"An unexpected error occurred while generating the plan: {str(e)}"
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n[*] StudyMate AI is running at: http://127.0.0.1:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=True)
