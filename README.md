# 🎓 StudyMate AI – Personal Study Planner

> **A polished, AI-powered study schedule generator built for students.**  
> Transforms exam dates, available daily hours, subject strengths, and weaknesses into a realistic, pedagogically balanced study timetable.

---

## 🚀 2-Minute Workshop Demonstration Script

Follow these 4 simple steps to showcase StudyMate AI during your presentation:

1. **Launch the Web App**:
   - Run `python app.py` and open `http://127.0.0.1:5000` (or double-click `index.html`).
   - You will see the modern **Landing Page** with glowing gradient accents and 3 feature cards (*Personalized Planning*, *Smart Time Management*, *AI Recommendations*).

2. **Trigger the 1-Click Demo**:
   - Click the prominent **"⚡ Quick Demo"** button on the navbar or hero section.
   - It instantly fills the form with **Manvitha's profile**:
     - **Subjects**: Mathematics, Java, Python, Data Structures, DBMS
     - **Weak Subjects**: Mathematics, Java (High Priority 🔴)
     - **Strong Subjects**: Python (Low Priority 🟢)
     - **Daily Study Hours**: 4 hours/day
     - **Study Days**: 7 days (Total 28 hours)
     - **Goal**: Score High

3. **Generate the Personalized Plan**:
   - Click **"✨ Generate My AI Study Plan"**.
   - Review the generated **Results Dashboard**:
     - **Summary Cards**: Total subjects, daily study hours, study days, and main goal.
     - **AI Study Strategy**: Explains how weak subjects receive higher weighting and final days are reserved for mock tests.
     - **🎯 Today's Focus Card**: Highlights the prime topic, activity, and motivational tip.
     - **Progress & Allocation Section**: Visual breakdown showing Concept Learning (40%), Practice (35%), and Revision (25%), alongside a subject allocation chart.
     - **Day-by-Day Cards**: Filter by *Day 1, Day 2, ..., All Days*. Each session has exact times, priority badges, and an interactive **Mark Done** checkbox!

4. **Showcase the Interactive Pomodoro Study Timer**:
   - Click **"⏱️ Start Today's Session"**.
   - An interactive study timer modal opens with a **25-minute focus session** and **5-minute break**.
   - Click **"▶ Start Focus"** to demonstrate the animated circular countdown ring and audio chime support.

---

## 📁 Project Structure

```text
studymate-ai/
├── app.py                     # Flask web server & REST API endpoints
├── generator.py               # Main algorithmic scheduling & priority engine
├── ai_service.py              # LLM integration (Gemini / OpenAI) with safe fallback
├── test_app.py                # Automated 7-test verification suite
├── requirements.txt           # Python dependencies (Flask, requests)
├── README.md                  # Complete documentation and presentation guide
├── index.html                 # Standalone root file (direct browser launchable)
├── templates/
│   └── index.html             # Flask Jinja2 template layout
└── static/
    ├── css/
    │   └── style.css          # Design system, gradients, shadows, print styles
    └── js/
        └── app.js             # Interactive SPA logic, timer, Chart.js, fallback
```

---

## 🛠️ How to Run the Project

### Option A: Run via Python / Flask (Recommended)

1. Open your terminal or PowerShell in the project directory:
   ```powershell
   cd C:\Users\manvi\.gemini\antigravity\scratch\studymate-ai
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the application:
   ```bash
   python app.py
   ```

4. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

### Option B: Run Standalone (Zero-Setup / Offline)

You can also directly double-click `index.html` in file explorer, or open it in any web browser (`file:///.../studymate-ai/index.html`). The built-in client engine runs completely offline with full interactivity!

---

## 🧠 Which File Contains the Main Logic?

- **Core Algorithmic Scheduling Logic**: [`generator.py`](generator.py)
  - **Subject Weighting**: Weak subjects receive `2.0x` weight (High Priority 🔴), medium subjects `1.2x` (🟡), and strong subjects `0.8x` (🟢).
  - **Zero Over-Scheduling Guarantee**: Computes exact session durations and strictly honors `study_hours_per_day`.
  - **Restorative Breaks**: Inserts 10–15 min refreshment blocks according to student preference.
  - **Phase Progression**: Early days focus on *Concept Learning*, middle days on *Problem Solving*, and final 1–2 days on *Timed Mock Tests & High-Yield Revision*.
  - **Curriculum Repository**: Includes curated topic pools for common technical and academic subjects.

- **Frontend Interactivity**: [`static/js/app.js`](static/js/app.js)
  - Handles dynamic subject tag addition/removal, form validation, animated transitions, Pomodoro timer state machine, and Chart.js rendering.

---

## 🔑 How to Connect an AI API Later

StudyMate AI comes with pre-configured hooks for **Google Gemini** and **OpenAI**:

### Method 1: Environment Variable (Server-side)
Set your Gemini API key in your terminal before running `app.py`:
```powershell
$env:GEMINI_API_KEY="AIzaSyYourActualGeminiKeyHere"
python app.py
```
Or for OpenAI:
```powershell
$env:OPENAI_API_KEY="sk-YourActualOpenAIKeyHere"
python app.py
```

### Method 2: Via the Web UI (No server restart needed)
1. Click the **"🔑 AI Key"** button in the top navigation bar.
2. Paste your Google Gemini (`AIza...`) or OpenAI (`sk-...`) key.
3. Click **"Save & Apply"**.

> **Note:** If no API key is provided, the application automatically uses the local rule-based engine in `generator.py`. It never crashes, never throws unhandled errors, and provides instant responses during workshops.

---

## 🧪 Running the Test Suite

To verify that all endpoints, validation rules, and algorithms are functioning:
```bash
python test_app.py
```

All 7 test cases will run and report:
- `[PASS] Test 1: /api/health endpoint is working.`
- `[PASS] Test 2: / (Index template) renders correctly.`
- `[PASS] Test 3: /api/demo-data returns Manvitha's profile.`
- `[PASS] Test 4: /api/generate produces valid personalized schedule, weights, and tips.`
- `[PASS] Test 5: Past exam date validation caught properly.`
- `[PASS] Test 6: Non-positive study hours validation caught properly.`
- `[PASS] Test 7: Empty subjects validation caught properly.`
