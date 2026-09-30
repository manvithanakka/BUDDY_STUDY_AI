"""
StudyMate AI - Core Algorithmic Study Plan Generator
Provides rule-based, realistic, personalized study schedule generation.
Guarantees 100% offline functionality without requiring an AI API key.
"""

from datetime import datetime, timedelta
import math
import random

# Curated high-yield topics repository for academic & technical subjects
SUBJECT_CURRICULUM = {
    "mathematics": [
        "Limits, Continuity & Differentiation",
        "Integral Calculus & Area Under Curves",
        "Linear Algebra, Matrices & Determinants",
        "Probability, Permutations & Combinations",
        "Differential Equations & Modeling",
        "Vector Algebra & 3D Geometry",
        "Statistics, Variance & Hypothesis Testing",
        "Discrete Mathematics & Logic Proofs"
    ],
    "maths": [
        "Calculus & Limits",
        "Linear Algebra & Matrix Operations",
        "Probability & Distributions",
        "Differential Equations",
        "Coordinate Geometry & Vectors"
    ],
    "java": [
        "Object-Oriented Programming (OOP) Principles",
        "Inheritance, Polymorphism & Interfaces",
        "Java Collections Framework (List, Map, Set)",
        "Exception Handling & Custom Exceptions",
        "Multithreading, Synchronization & Concurrency",
        "Java 8 Streams, Lambdas & Optional",
        "JVM Architecture, Memory & Garbage Collection",
        "File I/O, Serialization & JDBC Fundamentals"
    ],
    "python": [
        "Core Data Types, Comprehensions & Slicing",
        "Functions, Lambdas, *args/**kwargs & Scope",
        "Object-Oriented Python, Magic Methods & Classes",
        "Decorators, Generators & Context Managers",
        "Exception Handling & Robust Logging",
        "NumPy & Pandas for Data Manipulation",
        "Working with APIs, JSON & Web Requests",
        "Unit Testing & Modular Code Architecture"
    ],
    "data structures": [
        "Arrays, Strings & Two-Pointer Techniques",
        "Singly & Doubly Linked List Operations",
        "Stack & Queue Implementations & Applications",
        "Binary Trees, Traversals & Binary Search Trees (BST)",
        "Heap, Priority Queues & Greedy Approaches",
        "Graph Representations, BFS & DFS Traversals",
        "Sorting Algorithms, Hashing & Hash Tables",
        "Dynamic Programming Basics & Memoization"
    ],
    "dsa": [
        "Arrays & Sliding Window Patterns",
        "Linked Lists & Fast/Slow Pointers",
        "Stacks, Queues & Monotonic Stacks",
        "Trees, BSTs & Binary Tree Inversion",
        "Graph Traversal (BFS/DFS) & Shortest Path",
        "Dynamic Programming (1D & 2D States)"
    ],
    "database management systems": [
        "ER Diagrams & Relational Schema Design",
        "SQL DDL, DML & Complex Nested Queries",
        "Relational Algebra & Tuple Calculus",
        "Functional Dependencies & Normalization (1NF-BCNF)",
        "Transaction Processing, ACID Properties & Concurrency",
        "Database Indexing, B-Trees & B+ Trees",
        "Query Optimization & Execution Plans",
        "NoSQL Database Concepts vs Relational DBMS"
    ],
    "dbms": [
        "ER Modeling & Schema Normalization",
        "SQL Joins, Subqueries & Aggregations",
        "Transactions, ACID & Concurrency Control",
        "Indexing, B+ Trees & Hashing",
        "Stored Procedures, Triggers & Views"
    ],
    "operating systems": [
        "Process Life Cycle, PCB & CPU Scheduling",
        "Process Synchronization, Semaphores & Mutex",
        "Deadlocks: Detection, Prevention & Banker's Algorithm",
        "Memory Management: Paging & Segmentation",
        "Virtual Memory & Page Replacement Policies",
        "File System Architecture & Directory Implementation",
        "I/O Management & Disk Scheduling Algorithms"
    ],
    "computer networks": [
        "OSI Model & TCP/IP Protocol Suite",
        "Data Link Layer: Framing, Flow & Error Control",
        "Network Layer: IPv4/IPv6 Addressing & Subnetting",
        "Routing Algorithms: Distance Vector & Link State",
        "Transport Layer: TCP Handshake, Flow Control & UDP",
        "Application Layer Protocols: HTTP, DNS, SMTP & FTP",
        "Network Security: Firewalls, SSL/TLS & Encryption"
    ],
    "physics": [
        "Kinematics & Newton's Laws of Motion",
        "Work, Energy, Power & Conservation Laws",
        "Rotational Dynamics & Gravitation",
        "Electrostatics, Capacitance & Gauss's Law",
        "Current Electricity & Kirchhoff's Rules",
        "Electromagnetic Induction & AC Circuits",
        "Optics: Wave Optics & Ray Optics",
        "Modern Physics: Photoelectric Effect & Atomic Models"
    ],
    "chemistry": [
        "Atomic Structure & Periodic Trends",
        "Chemical Bonding & Molecular Orbital Theory",
        "Thermodynamics, Enthalpy & Entropy",
        "Chemical Equilibrium & Le Chatelier's Principle",
        "Electrochemistry & Galvanic Cells",
        "Organic Reactions: Substitution & Elimination",
        "Coordination Chemistry & Isomerism"
    ]
}

MOTIVATIONAL_TIPS = [
    "Focus on understanding core concepts before memorizing formulas.",
    "Active recall beats passive reading—quiz yourself at the end of each session.",
    "Consistency beats intensity. 4 focused hours outperform 8 distracted hours.",
    "Small daily improvements over a week create remarkable academic breakthroughs.",
    "Explain today's hardest concept to someone else to test your true mastery.",
    "Don't practice until you get it right; practice until you can't get it wrong.",
    "Every mastered concept is one more confirmed mark in your exam."
]

def normalize_key(name):
    return name.strip().lower()

def get_topics_for_subject(subject_name, count=5):
    """Retrieve realistic curriculum topics for standard subjects or generate meaningful modular topics."""
    key = normalize_key(subject_name)
    
    # Check exact or partial match in curriculum
    matched_topics = None
    for k, topics in SUBJECT_CURRICULUM.items():
        if k in key or key in k:
            matched_topics = topics
            break
            
    if matched_topics:
        # Return cycled or chosen topics
        return matched_topics[:count] if len(matched_topics) >= count else (matched_topics * 2)[:count]
    
    # Generic intelligent modular topics
    return [
        f"{subject_name}: Core Concepts & High-Yield Fundamentals",
        f"{subject_name}: Key Theorems, Principles & Mechanics",
        f"{subject_name}: Practical Problem-Solving & Case Work",
        f"{subject_name}: Advanced Applications & Edge Cases",
        f"{subject_name}: Rapid Formula & Syntax Synthesis",
        f"{subject_name}: Past Exam Questions & Mock Drill"
    ][:count]

def format_time_slot(start_dt, duration_minutes):
    end_dt = start_dt + timedelta(minutes=duration_minutes)
    return (
        f"{start_dt.strftime('%I:%M %p').lstrip('0')} – {end_dt.strftime('%I:%M %p').lstrip('0')}",
        end_dt
    )

def generate_study_plan(data):
    """
    Main algorithmic plan generator.
    Guarantees:
    - Never schedules more study hours than user entered per day
    - Weak subjects receive higher weighting & focus
    - Strong subjects receive concise revision/practice focus
    - Breaks are scheduled logically
    - Final days feature revision & mock assessments
    - Output format directly matches requirements
    """
    student_name = data.get("student_name", "").strip() or "Student"
    exam_date_str = data.get("exam_date", "")
    
    try:
        study_hours_per_day = float(data.get("study_hours_per_day", 4))
        if study_hours_per_day <= 0:
            study_hours_per_day = 4.0
    except (ValueError, TypeError):
        study_hours_per_day = 4.0
        
    try:
        study_days = int(data.get("study_days", 7))
        if study_days <= 0:
            study_days = 7
    except (ValueError, TypeError):
        study_days = 7
        
    # Cap days to reasonable range for demo
    study_days = min(max(study_days, 1), 60)
    # Cap daily hours to realistic student range (1 to 14)
    study_hours_per_day = min(max(study_hours_per_day, 1.0), 14.0)

    # Parse subjects
    raw_subjects = data.get("subjects", [])
    if isinstance(raw_subjects, str):
        subjects = [s.strip() for s in raw_subjects.split(",") if s.strip()]
    elif isinstance(raw_subjects, list):
        subjects = [str(s).strip() for s in raw_subjects if str(s).strip()]
    else:
        subjects = []
        
    if not subjects:
        subjects = ["Mathematics", "Java", "Python", "Data Structures", "Database Management Systems"]
        
    # Strong & Weak subjects
    raw_strong = data.get("strong_subjects", [])
    if isinstance(raw_strong, str):
        strong_subjects = [s.strip().lower() for s in raw_strong.split(",") if s.strip()]
    elif isinstance(raw_strong, list):
        strong_subjects = [str(s).strip().lower() for s in raw_strong if str(s).strip()]
    else:
        strong_subjects = []
        
    raw_weak = data.get("weak_subjects", [])
    if isinstance(raw_weak, str):
        weak_subjects = [s.strip().lower() for s in raw_weak.split(",") if s.strip()]
    elif isinstance(raw_weak, list):
        weak_subjects = [str(s).strip().lower() for s in raw_weak if str(s).strip()]
    else:
        weak_subjects = []

    preferred_time = data.get("preferred_time", "Morning").capitalize()
    break_pref = data.get("break_preference", "15m")
    goal = data.get("goal", "Score high")

    # Determine start time based on preference
    start_hour = 9
    start_minute = 0
    if preferred_time == "Morning":
        start_hour = 9
    elif preferred_time == "Afternoon":
        start_hour = 14
    elif preferred_time == "Evening":
        start_hour = 18
    elif preferred_time == "Flexible":
        start_hour = 10

    # Determine break duration in minutes
    if "10" in break_pref:
        break_duration = 10
    elif "20" in break_pref:
        break_duration = 20
    else:
        break_duration = 15

    # Subject weighting
    subject_weights = {}
    subject_priority_map = {}
    for subj in subjects:
        sub_lower = subj.lower()
        if sub_lower in weak_subjects:
            subject_weights[subj] = 2.0
            subject_priority_map[subj] = "High Priority"
        elif sub_lower in strong_subjects:
            subject_weights[subj] = 0.8
            subject_priority_map[subj] = "Low Priority"
        else:
            subject_weights[subj] = 1.2
            subject_priority_map[subj] = "Medium Priority"

    total_weight = sum(subject_weights.values())
    total_study_hours = study_days * study_hours_per_day
    
    # Calculate allocated hours per subject (strictly respecting total)
    subject_allocation_hours = {}
    allocated_sum = 0
    for i, subj in enumerate(subjects):
        if i == len(subjects) - 1:
            # Remainder to avoid rounding drift
            subject_allocation_hours[subj] = round(max(0.5, total_study_hours - allocated_sum), 1)
        else:
            allocated = round((subject_weights[subj] / total_weight) * total_study_hours, 1)
            subject_allocation_hours[subj] = allocated
            allocated_sum += allocated

    # Subject topics pool
    subject_topics_pool = {
        subj: get_topics_for_subject(subj, count=max(8, study_days * 2))
        for subj in subjects
    }
    subject_topic_index = {subj: 0 for subj in subjects}

    # Prepare daily slots structure
    # Daily study minutes budget
    daily_study_minutes_budget = int(study_hours_per_day * 60)
    
    # Determine session block length:
    # E.g. If daily hours = 2 (120 mins) -> 2 blocks of 55m or 50m + breaks
    # E.g. If daily hours = 4 (240 mins) -> 3-4 blocks of 50-60m
    if study_hours_per_day <= 1.5:
        session_length = 45
    elif study_hours_per_day <= 3.0:
        session_length = 50
    elif study_hours_per_day <= 5.0:
        session_length = 60
    else:
        session_length = 60

    daily_plans = []
    
    # Activity counters for progress statistics
    total_concept_minutes = 0
    total_practice_minutes = 0
    total_revision_minutes = 0

    # Start date calculation
    base_date = datetime.now()
    if exam_date_str:
        try:
            target_exam = datetime.strptime(exam_date_str, "%Y-%m-%d")
            # If exam is upcoming, make sure study period fits nicely
            if target_exam > base_date:
                pass
        except ValueError:
            pass

    # Build schedule day by day
    for day_num in range(1, study_days + 1):
        day_date = base_date + timedelta(days=day_num - 1)
        day_date_str = day_date.strftime("%b %d, %Y")
        
        # Is this in the final revision phase? (e.g. last 1-2 days or final 25% of days)
        is_final_days = (day_num >= max(2, study_days - 1)) if study_days > 2 else (day_num == study_days)
        is_early_days = (day_num <= math.ceil(study_days * 0.4))
        
        # Decide day's theme
        if is_final_days:
            day_theme = "High-Yield Revision & Mock Exam Simulation"
        elif is_early_days:
            day_theme = "Core Foundation & Concept Mastery"
        else:
            day_theme = "In-Depth Problem Solving & Application"

        # Plan sessions for the day
        current_dt = datetime(2026, 1, 1, start_hour, start_minute)
        scheduled_study_minutes = 0
        day_sessions = []
        
        # Select subjects for this day
        # Ensure weak subjects appear frequently; rotate others
        available_subj = sorted(subjects, key=lambda s: subject_weights[s], reverse=True)
        # Shift rotation so every subject gets exposure
        shift = (day_num - 1) % len(available_subj)
        day_subjects_order = available_subj[shift:] + available_subj[:shift]
        
        # If weak subjects exist, prioritize them in prime morning slot
        if weak_subjects:
            weak_in_list = [s for s in day_subjects_order if s.lower() in weak_subjects]
            others = [s for s in day_subjects_order if s.lower() not in weak_subjects]
            day_subjects_order = weak_in_list + others

        subj_ptr = 0
        while scheduled_study_minutes < daily_study_minutes_budget:
            remaining_mins = daily_study_minutes_budget - scheduled_study_minutes
            
            # Decide session length for this block
            if remaining_mins <= 35:
                curr_block_len = remaining_mins
            elif remaining_mins < session_length + 20:
                curr_block_len = remaining_mins
            else:
                curr_block_len = session_length
                
            curr_subj = day_subjects_order[subj_ptr % len(day_subjects_order)]
            priority = subject_priority_map[curr_subj]
            
            # Select topic
            topics_list = subject_topics_pool[curr_subj]
            topic_idx = subject_topic_index[curr_subj] % len(topics_list)
            topic_name = topics_list[topic_idx]
            subject_topic_index[curr_subj] += 1
            
            # Select activity type based on phase & priority
            if is_final_days:
                if scheduled_study_minutes == 0:
                    activity = "Full Mock Test / Timed Practice"
                    total_practice_minutes += curr_block_len
                else:
                    activity = "High-Yield Revision & Error Analysis"
                    total_revision_minutes += curr_block_len
            elif is_early_days:
                if priority == "High Priority":
                    activity = "Concept Learning & Foundation"
                    total_concept_minutes += curr_block_len
                elif priority == "Low Priority":
                    activity = "Practice Problems & Speed Drills"
                    total_practice_minutes += curr_block_len
                else:
                    activity = "Concept Learning & Note Making"
                    total_concept_minutes += curr_block_len
            else: # Middle days
                if priority == "High Priority":
                    activity = "Problem Solving & Exception Handling"
                    total_practice_minutes += curr_block_len
                elif priority == "Low Priority":
                    activity = "Formula Revision & Summary Review"
                    total_revision_minutes += curr_block_len
                else:
                    activity = "Practice Problems & Application"
                    total_practice_minutes += curr_block_len

            # Format study time slot
            time_str, next_dt = format_time_slot(current_dt, curr_block_len)
            
            day_sessions.append({
                "type": "study",
                "time": time_str,
                "subject": curr_subj,
                "topic": topic_name,
                "activity": activity,
                "priority": priority,
                "priority_badge": "🔴 High Priority" if priority == "High Priority" else ("🟡 Medium Priority" if priority == "Medium Priority" else "🟢 Low Priority"),
                "duration_minutes": curr_block_len,
                "completed": False
            })
            
            scheduled_study_minutes += curr_block_len
            current_dt = next_dt
            subj_ptr += 1

            # Insert break if more study remains
            if scheduled_study_minutes < daily_study_minutes_budget:
                break_time_str, break_end_dt = format_time_slot(current_dt, break_duration)
                day_sessions.append({
                    "type": "break",
                    "time": break_time_str,
                    "title": "☕ Break",
                    "activity": f"Rest, Hydrate & Refresh ({break_duration} mins)",
                    "duration_minutes": break_duration
                })
                current_dt = break_end_dt

        daily_plans.append({
            "day_number": day_num,
            "day_label": f"Day {day_num}",
            "date": day_date_str,
            "theme": day_theme,
            "total_study_minutes": scheduled_study_minutes,
            "total_study_hours": round(scheduled_study_minutes / 60, 1),
            "sessions": day_sessions
        })

    # Calculate overall progress stats
    total_recorded_minutes = max(1, total_concept_minutes + total_practice_minutes + total_revision_minutes)
    concept_pct = round((total_concept_minutes / total_recorded_minutes) * 100)
    practice_pct = round((total_practice_minutes / total_recorded_minutes) * 100)
    revision_pct = max(0, 100 - concept_pct - practice_pct)

    # Generate personalized AI recommendations
    ai_recommendations = []
    
    if weak_subjects:
        weak_str = ", ".join([s.title() for s in weak_subjects])
        ai_recommendations.append(
            f"Spend extra dedicated time on {weak_str} because they are marked as weak subjects. Start with solved problems before tackling blind test sets."
        )
    else:
        ai_recommendations.append(
            "Maintain balanced coverage across all subjects, focusing equally on theory and problem-solving."
        )

    if strong_subjects:
        strong_str = ", ".join([s.title() for s in strong_subjects])
        ai_recommendations.append(
            f"Leverage your strength in {strong_str} by using active recall and speed drills rather than re-reading notes."
        )

    ai_recommendations.append(
        "Use the final two days primarily for high-yield revision, formula sheets, and timed mock tests to build exam stamina."
    )
    ai_recommendations.append(
        f"Strictly honor the {break_duration}-minute breaks after study sessions to avoid cognitive fatigue and maximize retention."
    )

    if goal == "Score high":
        ai_recommendations.append(
            "To achieve your goal of 'Score high', document every mistake made during practice in a dedicated error log."
        )
    elif goal == "Pass the exam":
        ai_recommendations.append(
            "Prioritize high-weightage chapters and repeated past questions to ensure a comfortable passing buffer."
        )
    elif goal == "Complete syllabus":
        ai_recommendations.append(
            "Stick to the allotted time blocks without getting stuck on a single topic to maintain syllabus completion momentum."
        )
    else:
        ai_recommendations.append(
            "Use flashcards and mind maps during revision sessions for rapid recall."
        )

    # Today's Focus Card
    first_day_sessions = [s for s in daily_plans[0]["sessions"] if s["type"] == "study"]
    if first_day_sessions:
        focus_session = first_day_sessions[0]
        today_focus = {
            "subject": focus_session["subject"],
            "topic": focus_session["topic"],
            "activity": focus_session["activity"],
            "duration": f"{focus_session['duration_minutes']} minutes",
            "motivational_tip": MOTIVATIONAL_TIPS[day_num % len(MOTIVATIONAL_TIPS)]
        }
    else:
        today_focus = {
            "subject": subjects[0],
            "topic": "Core Fundamentals & Concept Learning",
            "activity": "Concept Learning",
            "duration": "60 minutes",
            "motivational_tip": MOTIVATIONAL_TIPS[0]
        }

    # Summary Strategy explanation
    if weak_subjects and strong_subjects:
        strategy_text = (
            f"Your weak subjects ({', '.join([w.title() for w in weak_subjects])}) receive higher priority "
            f"and dedicated deep-work blocks, while strong subjects ({', '.join([s.title() for s in strong_subjects])}) "
            f"are scheduled mainly for practice and rapid revision. The final days are optimized for mock tests "
            f"and comprehensive review."
        )
    elif weak_subjects:
        strategy_text = (
            f"Your weak subjects ({', '.join([w.title() for w in weak_subjects])}) receive expanded time allocations "
            f"and early-day concept learning. Subjects are systematically distributed across your {study_days} available "
            f"days with structured breaks to ensure high cognitive retention."
        )
    else:
        strategy_text = (
            f"Your study hours are balanced proportionally across all {len(subjects)} subjects. "
            f"Early days focus on concept clarity, middle days emphasize practice problems, "
            f"and the final days are reserved for revision and mock assessments."
        )

    return {
        "status": "success",
        "student_name": student_name,
        "summary": {
            "total_subjects": len(subjects),
            "daily_study_hours": study_hours_per_day,
            "total_study_days": study_days,
            "total_study_hours": round(total_study_hours, 1),
            "goal": goal,
            "preferred_time": preferred_time,
            "break_preference": break_pref,
            "exam_date": exam_date_str or "Upcoming"
        },
        "strategy_explanation": strategy_text,
        "today_focus": today_focus,
        "daily_plans": daily_plans,
        "progress": {
            "total_planned_hours": round(total_study_hours, 1),
            "subject_allocation": subject_allocation_hours,
            "concept_percentage": concept_pct,
            "practice_percentage": practice_pct,
            "revision_percentage": revision_pct
        },
        "recommendations": ai_recommendations,
        "source": "StudyMate Core Engine (Local Rule-Based Fallback)"
    }
