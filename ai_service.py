"""
StudyMate AI - AI Integration Service
Optionally enriches study plans using Gemini / OpenAI LLM APIs if an API key is available.
If no API key is present or if any network error occurs, seamlessly falls back to
the deterministic, rule-based algorithmic generator in generator.py.
"""

import os
import json
import logging
import requests
from generator import generate_study_plan as fallback_generate_study_plan

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("StudyMateAI")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()

def generate_plan(data, custom_api_key=None):
    """
    Primary endpoint for plan generation.
    Attempts AI enhancement if an API key is provided, otherwise immediately uses
    the high-fidelity local algorithmic engine.
    """
    api_key = (custom_api_key or GEMINI_API_KEY or OPENAI_API_KEY or "").strip()
    
    # If no API key configured, use local engine immediately
    if not api_key:
        logger.info("No AI API key found. Using StudyMate algorithmic generator.")
        plan = fallback_generate_study_plan(data)
        plan["source"] = "StudyMate Algorithmic Engine (Local / Fallback Mode)"
        return plan

    # If Gemini API key is provided
    if api_key.startswith("AIza") or "gemini" in api_key.lower() or len(api_key) == 39:
        try:
            logger.info("Gemini API key detected. Attempting AI-enhanced generation...")
            ai_plan = call_gemini_api(data, api_key)
            if ai_plan and ai_plan.get("status") == "success":
                ai_plan["source"] = "StudyMate AI (Google Gemini 1.5 Flash)"
                return ai_plan
        except Exception as e:
            logger.warning(f"Gemini API request failed: {e}. Falling back to algorithmic engine.")

    # If OpenAI API key is provided
    elif api_key.startswith("sk-"):
        try:
            logger.info("OpenAI API key detected. Attempting AI-enhanced generation...")
            ai_plan = call_openai_api(data, api_key)
            if ai_plan and ai_plan.get("status") == "success":
                ai_plan["source"] = "StudyMate AI (OpenAI GPT-4o-mini)"
                return ai_plan
        except Exception as e:
            logger.warning(f"OpenAI API request failed: {e}. Falling back to algorithmic engine.")

    # Guaranteed fallback
    plan = fallback_generate_study_plan(data)
    plan["source"] = "StudyMate Algorithmic Engine (Safe Fallback)"
    return plan


def build_prompt_payload(data):
    """Creates a structured system prompt instructing the model to output strict JSON."""
    return f"""You are StudyMate AI, an expert academic planner and learning strategist.
Create a personalized, realistic study plan based on this student's profile:

Student Name: {data.get('student_name', 'Student')}
Exam Date: {data.get('exam_date', 'Upcoming')}
Available Study Hours Per Day: {data.get('study_hours_per_day', 4)}
Number of Study Days: {data.get('study_days', 7)}
Subjects: {json.dumps(data.get('subjects', []))}
Strong Subjects: {json.dumps(data.get('strong_subjects', []))}
Weak Subjects: {json.dumps(data.get('weak_subjects', []))}
Preferred Study Time: {data.get('preferred_time', 'Morning')}
Daily Break Preference: {data.get('break_preference', '15m')}
Main Goal: {data.get('goal', 'Score high')}

RULES:
1. Do not schedule more hours per day than entered.
2. Weak subjects must receive higher weighting and dedicated deep work.
3. Strong subjects should focus on rapid revision and mock tests.
4. Schedule realistic breaks between study blocks.
5. Final days should prioritize revision and mock assessments.
6. Return ONLY a single raw valid JSON object (no markdown, no backticks, no preamble) matching this schema:
{{
  "status": "success",
  "student_name": "{data.get('student_name', 'Student')}",
  "summary": {{
    "total_subjects": {len(data.get('subjects', []))},
    "daily_study_hours": {data.get('study_hours_per_day', 4)},
    "total_study_days": {data.get('study_days', 7)},
    "total_study_hours": {float(data.get('study_hours_per_day', 4)) * int(data.get('study_days', 7))},
    "goal": "{data.get('goal', 'Score high')}",
    "preferred_time": "{data.get('preferred_time', 'Morning')}",
    "break_preference": "{data.get('break_preference', '15m')}",
    "exam_date": "{data.get('exam_date', 'Upcoming')}"
  }},
  "strategy_explanation": "personalized explanation...",
  "today_focus": {{
    "subject": "Main Subject",
    "topic": "Topic Name",
    "activity": "Activity Name",
    "duration": "60 minutes",
    "motivational_tip": "Tip..."
  }},
  "daily_plans": [
    {{
      "day_number": 1,
      "day_label": "Day 1",
      "date": "Oct 01, 2026",
      "theme": "Theme...",
      "total_study_minutes": 240,
      "total_study_hours": 4.0,
      "sessions": [
        {{
          "type": "study",
          "time": "9:00 AM – 10:00 AM",
          "subject": "Subject Name",
          "topic": "Topic Name",
          "activity": "Concept Learning",
          "priority": "High Priority",
          "priority_badge": "🔴 High Priority",
          "duration_minutes": 60,
          "completed": false
        }},
        {{
          "type": "break",
          "time": "10:00 AM – 10:15 AM",
          "title": "☕ Break",
          "activity": "Rest & Refresh (15 mins)",
          "duration_minutes": 15
        }}
      ]
    }}
  ],
  "progress": {{
    "total_planned_hours": {float(data.get('study_hours_per_day', 4)) * int(data.get('study_days', 7))},
    "subject_allocation": {{}},
    "concept_percentage": 40,
    "practice_percentage": 35,
    "revision_percentage": 25
  }},
  "recommendations": [
    "Tip 1...",
    "Tip 2...",
    "Tip 3...",
    "Tip 4..."
  ]
}}"""


def call_gemini_api(data, api_key):
    """Calls Google Gemini REST API."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    prompt = build_prompt_payload(data)
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }
    
    resp = requests.post(url, json=payload, headers=headers, timeout=12)
    if resp.status_code == 200:
        result = resp.json()
        candidates = result.get("candidates", [])
        if candidates:
            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return parse_json_safely(text)
    return None


def call_openai_api(data, api_key):
    """Calls OpenAI Chat Completion REST API."""
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    prompt = build_prompt_payload(data)
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a professional study schedule AI that outputs valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }
    
    resp = requests.post(url, json=payload, headers=headers, timeout=12)
    if resp.status_code == 200:
        result = resp.json()
        text = result["choices"][0]["message"]["content"]
        return parse_json_safely(text)
    return None


def parse_json_safely(text):
    """Safely extracts JSON from raw or markdown-wrapped LLM text."""
    clean = text.strip()
    if clean.startswith("```json"):
        clean = clean[7:]
    if clean.startswith("```"):
        clean = clean[3:]
    if clean.endswith("```"):
        clean = clean[:-3]
    return json.loads(clean.strip())
