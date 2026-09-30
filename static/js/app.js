/**
 * StudyMate AI – Personal Study Planner
 * Interactive Client Application Logic
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  const state = {
    currentView: 'landing', // 'landing' | 'input' | 'dashboard'
    subjects: ['Mathematics', 'Java', 'Python', 'Data Structures', 'DBMS'],
    weakSubjects: ['mathematics', 'java'],
    strongSubjects: ['python'],
    currentPlan: null,
    activeDayFilter: 'all', // 'all' or day number e.g. 1
    customApiKey: localStorage.getItem('studymate_api_key') || '',
    timer: {
      mode: 'focus', // 'focus' | 'break'
      durationSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      isRunning: false,
      intervalId: null,
      soundEnabled: true,
      currentTask: 'Mathematics – Concept Learning'
    },
    chartInstance: null
  };

  // Preset demo data
  const DEMO_PROFILE = {
    student_name: 'Manvitha',
    study_hours_per_day: 4,
    study_days: 7,
    subjects: ['Mathematics', 'Java', 'Python', 'Data Structures', 'DBMS'],
    weak_subjects: ['mathematics', 'java'],
    strong_subjects: ['python'],
    preferred_time: 'Morning',
    break_preference: '15m',
    goal: 'Score high'
  };

  // ---------------------------------------------------------------------------
  // DOM Elements
  // ---------------------------------------------------------------------------
  const DOM = {
    // Views
    landingSection: document.getElementById('landing-section'),
    inputSection: document.getElementById('input-section'),
    dashboardSection: document.getElementById('dashboard-section'),

    // Nav
    navLandingBtn: document.getElementById('nav-landing-btn'),
    navPlannerBtn: document.getElementById('nav-planner-btn'),
    navDemoBtn: document.getElementById('nav-demo-btn'),
    navApiBtn: document.getElementById('nav-api-btn'),
    brandHomeBtn: document.getElementById('brand-home-btn'),

    // Hero
    heroCreateBtn: document.getElementById('hero-create-btn'),
    heroDemoBtn: document.getElementById('hero-demo-btn'),

    // Form
    form: document.getElementById('study-planner-form'),
    formFillDemoBtn: document.getElementById('form-fill-demo-btn'),
    studentNameInput: document.getElementById('student-name'),
    examDateInput: document.getElementById('exam-date'),
    examCountdownBadge: document.getElementById('exam-countdown-badge'),
    studyHoursInput: document.getElementById('study-hours'),
    studyDaysInput: document.getElementById('study-days'),
    newSubjectInput: document.getElementById('new-subject-input'),
    addSubjectBtn: document.getElementById('add-subject-btn'),
    subjectsChipList: document.getElementById('subjects-chip-list'),
    weakSubjectsContainer: document.getElementById('weak-subjects-container'),
    strongSubjectsContainer: document.getElementById('strong-subjects-container'),
    preferredTimeSelect: document.getElementById('preferred-time'),
    breakPrefSelect: document.getElementById('break-preference'),
    generatePlanBtn: document.getElementById('generate-plan-btn'),
    generateSpinner: document.getElementById('generate-spinner'),

    // Dashboard
    dashGreeting: document.getElementById('dash-student-greeting'),
    dashEngineSource: document.getElementById('dash-engine-source'),
    dashStrategyText: document.getElementById('dash-strategy-text'),
    summarySubjectsCount: document.getElementById('summary-subjects-count'),
    summaryDailyHours: document.getElementById('summary-daily-hours'),
    summaryDaysCount: document.getElementById('summary-days-count'),
    summaryTotalHours: document.getElementById('summary-total-hours'),
    summaryGoal: document.getElementById('summary-goal'),
    
    // Focus Card
    focusSubjectName: document.getElementById('focus-subject-name'),
    focusPriorityPill: document.getElementById('focus-priority-pill'),
    focusTopicName: document.getElementById('focus-topic-name'),
    focusActivityName: document.getElementById('focus-activity-name'),
    focusDurationText: document.getElementById('focus-duration-text'),
    focusMotivationalTip: document.getElementById('focus-motivational-tip'),
    focusLaunchTimerBtn: document.getElementById('focus-launch-timer-btn'),

    // Dashboard Actions
    dashTimerBtn: document.getElementById('dash-timer-btn'),
    dashRegenerateBtn: document.getElementById('dash-regenerate-btn'),
    dashEditBtn: document.getElementById('dash-edit-btn'),
    dashPrintBtn: document.getElementById('dash-print-btn'),

    // Progress & Allocation
    progressTotalPlannedHours: document.getElementById('progress-total-planned-hours'),
    conceptPctText: document.getElementById('concept-pct-text'),
    conceptPctBar: document.getElementById('concept-pct-bar'),
    practicePctText: document.getElementById('practice-pct-text'),
    practicePctBar: document.getElementById('practice-pct-bar'),
    revisionPctText: document.getElementById('revision-pct-text'),
    revisionPctBar: document.getElementById('revision-pct-bar'),
    allocationLegendList: document.getElementById('allocation-legend-list'),
    chartCanvas: document.getElementById('subjectHoursChart'),

    // Days & Recommendations
    dayFilterPills: document.getElementById('day-filter-pills'),
    daysContainer: document.getElementById('days-container'),
    recommendationsGrid: document.getElementById('recommendations-grid'),

    // Timer Modal
    timerModal: document.getElementById('timer-modal'),
    closeTimerBtn: document.getElementById('close-timer-btn'),
    modeFocusBtn: document.getElementById('mode-focus-btn'),
    modeBreakBtn: document.getElementById('mode-break-btn'),
    timerTaskTitle: document.getElementById('timer-task-title'),
    timerDigits: document.getElementById('timer-digits'),
    timerStateLabel: document.getElementById('timer-state-label'),
    timerProgressRing: document.getElementById('timer-progress-ring'),
    timerStartPauseBtn: document.getElementById('timer-start-pause-btn'),
    timerResetBtn: document.getElementById('timer-reset-btn'),
    timerSwitchBtn: document.getElementById('timer-switch-btn'),
    timerSoundChk: document.getElementById('timer-sound-chk'),

    // API Modal
    apiModal: document.getElementById('api-modal'),
    closeApiBtn: document.getElementById('close-api-btn'),
    customApiKeyInput: document.getElementById('custom-api-key'),
    saveApiKeyBtn: document.getElementById('save-api-key-btn'),
    clearApiKeyBtn: document.getElementById('clear-api-key-btn'),

    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  // ---------------------------------------------------------------------------
  // Audio Notification Helper (Web Audio API - 100% Offline & Reliable)
  // ---------------------------------------------------------------------------
  function playChime() {
    if (!state.timer.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio chime unsupported or blocked:', e);
    }
  }

  // ---------------------------------------------------------------------------
  // Toast Notification System
  // ---------------------------------------------------------------------------
  function showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'error') icon = '⚠️';
    if (type === 'success') icon = '✅';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 200ms ease-out';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // ---------------------------------------------------------------------------
  // View Routing & Transitions
  // ---------------------------------------------------------------------------
  function switchView(viewName) {
    state.currentView = viewName;

    DOM.landingSection.classList.remove('active');
    DOM.inputSection.classList.remove('active');
    DOM.dashboardSection.classList.remove('active');

    DOM.navLandingBtn.classList.remove('active');
    DOM.navPlannerBtn.classList.remove('active');

    if (viewName === 'landing') {
      DOM.landingSection.classList.add('active');
      DOM.navLandingBtn.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'input') {
      DOM.inputSection.classList.add('active');
      DOM.navPlannerBtn.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'dashboard') {
      DOM.dashboardSection.classList.add('active');
      DOM.navPlannerBtn.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ---------------------------------------------------------------------------
  // Subject Tags & Priority Chips
  // ---------------------------------------------------------------------------
  function renderSubjectsList() {
    DOM.subjectsChipList.innerHTML = '';
    
    if (state.subjects.length === 0) {
      DOM.subjectsChipList.innerHTML = '<span class="text-muted-empty">No subjects added yet. Type above or click suggestions.</span>';
    } else {
      state.subjects.forEach((subj) => {
        const chip = document.createElement('span');
        chip.className = 'subject-chip';
        chip.innerHTML = `
          <span>${escapeHtml(subj)}</span>
          <button type="button" class="chip-remove-btn" title="Remove ${escapeHtml(subj)}" data-subject="${escapeHtml(subj)}">✕</button>
        `;
        DOM.subjectsChipList.appendChild(chip);
      });
    }

    renderPrioritySelectors();
  }

  function renderPrioritySelectors() {
    // Weak Subjects
    DOM.weakSubjectsContainer.innerHTML = '';
    if (state.subjects.length === 0) {
      DOM.weakSubjectsContainer.innerHTML = '<span class="text-muted-empty">Add subjects above first.</span>';
    } else {
      state.subjects.forEach((subj) => {
        const isWeak = state.weakSubjects.includes(subj.toLowerCase());
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `toggle-chip ${isWeak ? 'selected-weak' : ''}`;
        btn.innerHTML = `${isWeak ? '🔴' : '○'} ${escapeHtml(subj)}`;
        btn.addEventListener('click', () => toggleWeakSubject(subj));
        DOM.weakSubjectsContainer.appendChild(btn);
      });
    }

    // Strong Subjects
    DOM.strongSubjectsContainer.innerHTML = '';
    if (state.subjects.length === 0) {
      DOM.strongSubjectsContainer.innerHTML = '<span class="text-muted-empty">Add subjects above first.</span>';
    } else {
      state.subjects.forEach((subj) => {
        const isStrong = state.strongSubjects.includes(subj.toLowerCase());
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `toggle-chip ${isStrong ? 'selected-strong' : ''}`;
        btn.innerHTML = `${isStrong ? '🟢' : '○'} ${escapeHtml(subj)}`;
        btn.addEventListener('click', () => toggleStrongSubject(subj));
        DOM.strongSubjectsContainer.appendChild(btn);
      });
    }
  }

  function addSubject(name) {
    const clean = name.trim();
    if (!clean) return;
    
    // Check duplication (case-insensitive)
    const exists = state.subjects.some(s => s.toLowerCase() === clean.toLowerCase());
    if (exists) {
      showToast(`"${clean}" is already in your subjects list.`, 'info');
      return;
    }

    state.subjects.push(clean);
    DOM.newSubjectInput.value = '';
    renderSubjectsList();
  }

  function removeSubject(name) {
    const norm = name.toLowerCase();
    state.subjects = state.subjects.filter(s => s.toLowerCase() !== norm);
    state.weakSubjects = state.weakSubjects.filter(w => w !== norm);
    state.strongSubjects = state.strongSubjects.filter(s => s !== norm);
    renderSubjectsList();
  }

  function toggleWeakSubject(subj) {
    const norm = subj.toLowerCase();
    if (state.weakSubjects.includes(norm)) {
      state.weakSubjects = state.weakSubjects.filter(w => w !== norm);
    } else {
      state.weakSubjects.push(norm);
      // Remove from strong if present
      state.strongSubjects = state.strongSubjects.filter(s => s !== norm);
    }
    renderPrioritySelectors();
  }

  function toggleStrongSubject(subj) {
    const norm = subj.toLowerCase();
    if (state.strongSubjects.includes(norm)) {
      state.strongSubjects = state.strongSubjects.filter(s => s !== norm);
    } else {
      state.strongSubjects.push(norm);
      // Remove from weak if present
      state.weakSubjects = state.weakSubjects.filter(w => w !== norm);
    }
    renderPrioritySelectors();
  }

  // ---------------------------------------------------------------------------
  // Demo Data Autofill
  // ---------------------------------------------------------------------------
  function loadDemoProfile() {
    DOM.studentNameInput.value = DEMO_PROFILE.student_name;
    
    // Calculate a realistic exam date 7 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + DEMO_PROFILE.study_days);
    const dateStr = targetDate.toISOString().split('T')[0];
    DOM.examDateInput.value = dateStr;
    updateExamCountdownBadge(dateStr);

    DOM.studyHoursInput.value = DEMO_PROFILE.study_hours_per_day;
    DOM.studyDaysInput.value = DEMO_PROFILE.study_days;

    state.subjects = [...DEMO_PROFILE.subjects];
    state.weakSubjects = [...DEMO_PROFILE.weak_subjects];
    state.strongSubjects = [...DEMO_PROFILE.strong_subjects];
    renderSubjectsList();

    DOM.preferredTimeSelect.value = DEMO_PROFILE.preferred_time;
    DOM.breakPrefSelect.value = DEMO_PROFILE.break_preference;

    // Check goal radio
    const goalRadio = document.querySelector(`input[name="study-goal"][value="${DEMO_PROFILE.goal}"]`);
    if (goalRadio) goalRadio.checked = true;

    showToast('Loaded demo data for Manvitha! Click "Generate" to create schedule.', 'success');
  }

  function updateExamCountdownBadge(dateStr) {
    if (!dateStr) {
      DOM.examCountdownBadge.textContent = 'Select date';
      DOM.examCountdownBadge.className = 'badge badge-subtle';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(dateStr + 'T00:00:00');

    const diffTime = examDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      DOM.examCountdownBadge.textContent = 'Past date';
      DOM.examCountdownBadge.className = 'badge badge-danger';
    } else if (diffDays === 0) {
      DOM.examCountdownBadge.textContent = 'Exam is Today!';
      DOM.examCountdownBadge.className = 'badge badge-danger';
    } else {
      DOM.examCountdownBadge.textContent = `${diffDays} days away`;
      DOM.examCountdownBadge.className = 'badge badge-success';
    }
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  function validateForm() {
    // 1. Exam Date check
    const examDateStr = DOM.examDateInput.value;
    if (examDateStr) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(examDateStr + 'T00:00:00');
      if (selected < today) {
        showToast('Exam date cannot be in the past. Please select today or a future date.', 'error');
        DOM.examDateInput.focus();
        return false;
      }
    }

    // 2. Study Hours check
    const hours = parseFloat(DOM.studyHoursInput.value);
    if (isNaN(hours) || hours <= 0) {
      showToast('Daily study hours must be a positive number (e.g. 2 to 12 hours).', 'error');
      DOM.studyHoursInput.focus();
      return false;
    }
    if (hours > 16) {
      showToast('Study hours cannot exceed 16 hours per day to ensure healthy sleep and rest.', 'error');
      DOM.studyHoursInput.focus();
      return false;
    }

    // 3. Study Days check
    const days = parseInt(DOM.studyDaysInput.value, 10);
    if (isNaN(days) || days <= 0) {
      showToast('Number of study days must be at least 1 day.', 'error');
      DOM.studyDaysInput.focus();
      return false;
    }

    // 4. Subjects check
    if (state.subjects.length === 0) {
      showToast('Please add at least one subject to generate your study plan.', 'error');
      DOM.newSubjectInput.focus();
      return false;
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // Plan Generation (API + Safe Browser Fallback)
  // ---------------------------------------------------------------------------
  async function handleGeneratePlan(e) {
    if (e) e.preventDefault();

    if (!validateForm()) return;

    // Build payload
    const selectedGoalEl = document.querySelector('input[name="study-goal"]:checked');
    const goalVal = selectedGoalEl ? selectedGoalEl.value : 'Score high';

    const payload = {
      student_name: DOM.studentNameInput.value.trim() || 'Student',
      exam_date: DOM.examDateInput.value || '',
      study_hours_per_day: parseFloat(DOM.studyHoursInput.value),
      study_days: parseInt(DOM.studyDaysInput.value, 10),
      subjects: state.subjects,
      weak_subjects: state.weakSubjects,
      strong_subjects: state.strongSubjects,
      preferred_time: DOM.preferredTimeSelect.value,
      break_preference: DOM.breakPrefSelect.value,
      goal: goalVal,
      api_key: state.customApiKey || undefined
    };

    // UI Loading State
    DOM.generatePlanBtn.disabled = true;
    DOM.generateSpinner.classList.remove('hidden');

    try {
      let result = null;

      // Attempt Flask Backend API
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(state.customApiKey ? { 'X-API-Key': state.customApiKey } : {})
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          result = await response.json();
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Server responded with ${response.status}`);
        }
      } catch (networkOrApiErr) {
        console.warn('Backend API request unavailable or returned error. Engaging client fallback engine:', networkOrApiErr);
        // Client-side deterministic algorithmic generator fallback
        result = clientFallbackGeneratePlan(payload);
      }

      if (result && result.status === 'success') {
        state.currentPlan = result;
        renderDashboard(result);
        switchView('dashboard');
        showToast('Your personalized study plan has been generated!', 'success');
      } else {
        showToast(result?.message || 'Could not generate study plan. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Plan generation failed:', err);
      showToast('Error: ' + err.message, 'error');
    } finally {
      DOM.generatePlanBtn.disabled = false;
      DOM.generateSpinner.classList.add('hidden');
    }
  }

  // ---------------------------------------------------------------------------
  // Client-Side Deterministic Algorithmic Generator (Zero-Failure Fallback)
  // ---------------------------------------------------------------------------
  function clientFallbackGeneratePlan(data) {
    const studentName = data.student_name || 'Student';
    const studyHours = data.study_hours_per_day || 4;
    const studyDays = data.study_days || 7;
    const subjects = data.subjects && data.subjects.length ? data.subjects : ['Mathematics', 'Java', 'Python', 'Data Structures', 'DBMS'];
    const weak = data.weak_subjects || [];
    const strong = data.strong_subjects || [];
    const goal = data.goal || 'Score high';
    const prefTime = data.preferred_time || 'Morning';
    const breakPref = data.break_preference || '15m';

    const totalHours = studyHours * studyDays;

    // Weighting
    let totalWeight = 0;
    const weights = {};
    const priorityMap = {};

    subjects.forEach(s => {
      const low = s.toLowerCase();
      if (weak.includes(low)) {
        weights[s] = 2.0;
        priorityMap[s] = 'High Priority';
      } else if (strong.includes(low)) {
        weights[s] = 0.8;
        priorityMap[s] = 'Low Priority';
      } else {
        weights[s] = 1.2;
        priorityMap[s] = 'Medium Priority';
      }
      totalWeight += weights[s];
    });

    const allocation = {};
    let allocSum = 0;
    subjects.forEach((s, idx) => {
      if (idx === subjects.length - 1) {
        allocation[s] = Math.max(0.5, Math.round((totalHours - allocSum) * 10) / 10);
      } else {
        const val = Math.round(((weights[s] / totalWeight) * totalHours) * 10) / 10;
        allocation[s] = val;
        allocSum += val;
      }
    });

    // Start hour
    let startHour = 9;
    if (prefTime === 'Afternoon') startHour = 14;
    if (prefTime === 'Evening') startHour = 18;
    if (prefTime === 'Flexible') startHour = 10;

    const breakMins = breakPref.includes('10') ? 10 : (breakPref.includes('20') ? 20 : 15);
    const dailyStudyMinutes = Math.round(studyHours * 60);

    const defaultTopics = {
      'mathematics': ['Limits & Continuity', 'Linear Algebra & Matrices', 'Probability & Statistics', 'Differential Equations', 'Vector Calculus'],
      'java': ['OOP Principles & Inheritance', 'Collections Framework', 'Exception Handling & Logging', 'Multithreading & Concurrency', 'Java 8 Streams & Lambdas'],
      'python': ['Data Structures & Comprehensions', 'Functions & Decorators', 'NumPy & Pandas', 'OOP in Python', 'APIs & Web Scraping'],
      'data structures': ['Arrays & Two Pointers', 'Linked Lists & Stacks', 'Binary Trees & BSTs', 'Graph Traversals (BFS/DFS)', 'Dynamic Programming'],
      'dbms': ['ER Modeling & Schema Design', 'SQL Joins & Aggregations', 'Normalization (1NF-BCNF)', 'Transactions & ACID', 'Indexing & B-Trees']
    };

    const dailyPlans = [];
    let conceptMins = 0;
    let practiceMins = 0;
    let revisionMins = 0;

    const todayDate = new Date();

    for (let d = 1; d <= studyDays; d++) {
      const curDate = new Date(todayDate);
      curDate.setDate(curDate.getDate() + (d - 1));
      const dateStr = curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const isFinal = d >= Math.max(2, studyDays - 1);
      const isEarly = d <= Math.ceil(studyDays * 0.4);

      let theme = 'In-Depth Problem Solving & Application';
      if (isFinal) theme = 'High-Yield Revision & Mock Exam Simulation';
      else if (isEarly) theme = 'Core Foundation & Concept Mastery';

      const sessions = [];
      let scheduled = 0;
      let clockMins = startHour * 60;

      let sIdx = (d - 1) % subjects.length;

      while (scheduled < dailyStudyMinutes) {
        const remaining = dailyStudyMinutes - scheduled;
        const blockLen = remaining <= 35 ? remaining : (remaining < 80 ? remaining : 60);

        const curSubj = subjects[sIdx % subjects.length];
        const pri = priorityMap[curSubj];

        // Format time
        const sh = Math.floor(clockMins / 60);
        const sm = clockMins % 60;
        const eh = Math.floor((clockMins + blockLen) / 60);
        const em = (clockMins + blockLen) % 60;

        const formatClock = (h, m) => {
          const ampm = h >= 12 ? 'PM' : 'AM';
          const dh = h % 12 || 12;
          const dm = m < 10 ? '0' + m : m;
          return `${dh}:${dm} ${ampm}`;
        };

        const timeStr = `${formatClock(sh, sm)} – ${formatClock(eh, em)}`;

        // Topics
        const subKey = curSubj.toLowerCase();
        const tList = defaultTopics[subKey] || [
          `${curSubj}: Core Concept Deep-Dive`,
          `${curSubj}: Solved Examples & Methodologies`,
          `${curSubj}: Advanced Application & Edge Cases`,
          `${curSubj}: Rapid Formula & Syntax Synthesis`
        ];
        const topic = tList[(d + sIdx) % tList.length];

        let act = 'Concept Learning & Foundation';
        if (isFinal) {
          act = scheduled === 0 ? 'Full Mock Test / Timed Practice' : 'High-Yield Revision & Error Log';
          revisionMins += blockLen;
        } else if (isEarly) {
          act = pri === 'High Priority' ? 'Concept Learning & Deep Theory' : 'Practice Problems & Exercises';
          if (pri === 'High Priority') conceptMins += blockLen;
          else practiceMins += blockLen;
        } else {
          act = pri === 'High Priority' ? 'Problem Solving & Exception Handling' : 'Practice Problems & Application';
          practiceMins += blockLen;
        }

        sessions.push({
          type: 'study',
          time: timeStr,
          subject: curSubj,
          topic: topic,
          activity: act,
          priority: pri,
          priority_badge: pri === 'High Priority' ? '🔴 High Priority' : (pri === 'Medium Priority' ? '🟡 Medium Priority' : '🟢 Low Priority'),
          duration_minutes: blockLen,
          completed: false
        });

        scheduled += blockLen;
        clockMins += blockLen;
        sIdx++;

        if (scheduled < dailyStudyMinutes) {
          const bsh = Math.floor(clockMins / 60);
          const bsm = clockMins % 60;
          const beh = Math.floor((clockMins + breakMins) / 60);
          const bem = (clockMins + breakMins) % 60;
          const breakTime = `${formatClock(bsh, bsm)} – ${formatClock(beh, bem)}`;

          sessions.push({
            type: 'break',
            time: breakTime,
            title: '☕ Break',
            activity: `Rest, Hydrate & Refresh (${breakMins} mins)`,
            duration_minutes: breakMins
          });
          clockMins += breakMins;
        }
      }

      dailyPlans.push({
        day_number: d,
        day_label: `Day ${d}`,
        date: dateStr,
        theme: theme,
        total_study_minutes: scheduled,
        total_study_hours: Math.round((scheduled / 60) * 10) / 10,
        sessions: sessions
      });
    }

    const totalRecMins = Math.max(1, conceptMins + practiceMins + revisionMins);
    const conceptPct = Math.round((conceptMins / totalRecMins) * 100);
    const practicePct = Math.round((practiceMins / totalRecMins) * 100);
    const revisionPct = Math.max(0, 100 - conceptPct - practicePct);

    const firstStudy = dailyPlans[0].sessions.find(s => s.type === 'study') || {
      subject: subjects[0],
      topic: 'Core Fundamentals',
      activity: 'Concept Learning',
      duration_minutes: 60
    };

    return {
      status: 'success',
      student_name: studentName,
      summary: {
        total_subjects: subjects.length,
        daily_study_hours: studyHours,
        total_study_days: studyDays,
        total_study_hours: totalHours,
        goal: goal,
        preferred_time: prefTime,
        break_preference: breakPref,
        exam_date: data.exam_date || 'Upcoming'
      },
      strategy_explanation: `Your weak subjects (${weak.map(w => w.toUpperCase()).join(', ') || 'selected topics'}) receive higher priority and dedicated deep-work blocks, while strong subjects are scheduled mainly for practice and rapid revision. The final two days are optimized for mock tests and comprehensive review.`,
      today_focus: {
        subject: firstStudy.subject,
        topic: firstStudy.topic,
        activity: firstStudy.activity,
        duration: `${firstStudy.duration_minutes} minutes`,
        motivational_tip: 'Focus on understanding concepts before memorizing formulas. Small consistent steps create massive results!'
      },
      daily_plans: dailyPlans,
      progress: {
        total_planned_hours: totalHours,
        subject_allocation: allocation,
        concept_percentage: conceptPct,
        practice_percentage: practicePct,
        revision_percentage: revisionPct
      },
      recommendations: [
        `Spend extra dedicated time on ${weak.length ? weak.join(' & ') : 'core topics'} because they are marked as weak subjects; master solved examples first.`,
        `Use the final two days primarily for timed revision and mock tests to simulate exam pressure.`,
        `Take a 10–15 minute break after every focused study session to avoid cognitive fatigue.`,
        `Since your goal is to '${goal}', focus on active recall and maintain an error log for missed problems.`
      ],
      source: 'StudyMate Algorithmic Core Engine (Local Rule-Based Fallback)'
    };
  }

  // ---------------------------------------------------------------------------
  // Results Dashboard Rendering
  // ---------------------------------------------------------------------------
  function renderDashboard(plan) {
    // 1. Header & Greeting
    DOM.dashGreeting.textContent = `Hi, ${plan.student_name}! 👋`;
    DOM.dashEngineSource.textContent = `⚡ ${plan.source || 'Powered by StudyMate Core Engine'}`;

    // 2. Summary Cards
    const summary = plan.summary || {};
    DOM.summarySubjectsCount.textContent = summary.total_subjects || state.subjects.length;
    DOM.summaryDailyHours.textContent = `${summary.daily_study_hours || 4} hrs`;
    DOM.summaryDaysCount.textContent = `${summary.total_study_days || 7} days`;
    DOM.summaryTotalHours.textContent = `${summary.total_study_hours || (summary.daily_study_hours * summary.total_study_days)} hrs total`;
    DOM.summaryGoal.textContent = summary.goal || 'Score High';

    // 3. Strategy text
    DOM.dashStrategyText.textContent = plan.strategy_explanation || 
      'Your weak subjects receive more study time, while strong subjects are scheduled mainly for revision and practice.';

    // 4. Today's Focus Card
    const focus = plan.today_focus || {};
    DOM.focusSubjectName.textContent = focus.subject || state.subjects[0];
    DOM.focusTopicName.textContent = focus.topic || 'Core Concept Learning';
    DOM.focusActivityName.textContent = `Activity: ${focus.activity || 'Concept Learning'}`;
    DOM.focusDurationText.textContent = focus.duration || '60 minutes';
    DOM.focusMotivationalTip.textContent = `"${focus.motivational_tip || 'Focus on understanding concepts before memorizing formulas.'}"`;

    // Determine badge priority for today's focus
    const isWeakFocus = state.weakSubjects.includes((focus.subject || '').toLowerCase());
    const isStrongFocus = state.strongSubjects.includes((focus.subject || '').toLowerCase());
    if (isWeakFocus) {
      DOM.focusPriorityPill.textContent = '🔴 High Priority';
      DOM.focusPriorityPill.className = 'focus-priority-pill';
    } else if (isStrongFocus) {
      DOM.focusPriorityPill.textContent = '🟢 Low Priority';
      DOM.focusPriorityPill.className = 'focus-priority-pill badge-success';
    } else {
      DOM.focusPriorityPill.textContent = '🟡 Medium Priority';
      DOM.focusPriorityPill.className = 'focus-priority-pill badge-danger';
    }

    // Set default timer task
    state.timer.currentTask = `${focus.subject} – ${focus.activity}`;
    DOM.timerTaskTitle.textContent = state.timer.currentTask;

    // 5. Progress Section
    const prog = plan.progress || {};
    DOM.progressTotalPlannedHours.textContent = `${prog.total_planned_hours || 28} hrs`;

    DOM.conceptPctText.textContent = `${prog.concept_percentage || 40}%`;
    DOM.conceptPctBar.style.width = `${prog.concept_percentage || 40}%`;

    DOM.practicePctText.textContent = `${prog.practice_percentage || 35}%`;
    DOM.practicePctBar.style.width = `${prog.practice_percentage || 35}%`;

    DOM.revisionPctText.textContent = `${prog.revision_percentage || 25}%`;
    DOM.revisionPctBar.style.width = `${prog.revision_percentage || 25}%`;

    // Render Chart & Subject allocation legend
    renderProgressChart(prog.subject_allocation || {});

    // 6. Day Filter Pills & Daily Cards
    renderDayFilters(plan.daily_plans || []);
    renderDailyPlans(plan.daily_plans || [], state.activeDayFilter);

    // 7. AI Recommendations
    renderRecommendations(plan.recommendations || []);
  }

  // ---------------------------------------------------------------------------
  // Chart & Subject Breakdown
  // ---------------------------------------------------------------------------
  function renderProgressChart(subjectAllocations) {
    const subjects = Object.keys(subjectAllocations);
    const hours = Object.values(subjectAllocations);

    const colors = [
      '#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b',
      '#ec4899', '#6366f1', '#14b8a6', '#84cc16', '#f97316'
    ];

    // Build Legend List
    DOM.allocationLegendList.innerHTML = '';
    subjects.forEach((subj, idx) => {
      const color = colors[idx % colors.length];
      const hr = subjectAllocations[subj];
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `
        <div class="legend-left">
          <span class="legend-color-dot" style="background-color: ${color}"></span>
          <span class="legend-name">${escapeHtml(subj)}</span>
        </div>
        <span class="legend-hours">${hr} hrs</span>
      `;
      DOM.allocationLegendList.appendChild(item);
    });

    // Render Canvas Chart via Chart.js
    if (window.Chart && DOM.chartCanvas) {
      if (state.chartInstance) {
        state.chartInstance.destroy();
      }

      state.chartInstance = new Chart(DOM.chartCanvas, {
        type: 'doughnut',
        data: {
          labels: subjects,
          datasets: [{
            data: hours,
            backgroundColor: colors.slice(0, subjects.length),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  return ` ${ctx.label}: ${ctx.raw} hrs`;
                }
              }
            }
          },
          cutout: '68%'
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Daily Timetable Rendering
  // ---------------------------------------------------------------------------
  function renderDayFilters(dailyPlans) {
    DOM.dayFilterPills.innerHTML = '';

    // "All Days" pill
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = `day-pill-btn ${state.activeDayFilter === 'all' ? 'active' : ''}`;
    allBtn.textContent = 'All Days';
    allBtn.addEventListener('click', () => {
      state.activeDayFilter = 'all';
      renderDayFilters(dailyPlans);
      renderDailyPlans(dailyPlans, 'all');
    });
    DOM.dayFilterPills.appendChild(allBtn);

    // Individual day pills
    dailyPlans.forEach((dp) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `day-pill-btn ${state.activeDayFilter === dp.day_number ? 'active' : ''}`;
      btn.textContent = dp.day_label || `Day ${dp.day_number}`;
      btn.addEventListener('click', () => {
        state.activeDayFilter = dp.day_number;
        renderDayFilters(dailyPlans);
        renderDailyPlans(dailyPlans, dp.day_number);
      });
      DOM.dayFilterPills.appendChild(btn);
    });
  }

  function renderDailyPlans(dailyPlans, filter) {
    DOM.daysContainer.innerHTML = '';

    const plansToRender = filter === 'all'
      ? dailyPlans
      : dailyPlans.filter(p => p.day_number === filter);

    if (plansToRender.length === 0) {
      DOM.daysContainer.innerHTML = '<p class="text-muted-empty">No schedule found for this day.</p>';
      return;
    }

    plansToRender.forEach((day) => {
      const dayCard = document.createElement('div');
      dayCard.className = 'day-card';

      // Header
      const headerHtml = `
        <div class="day-card-header">
          <div class="day-title-box">
            <span class="day-badge-label">${escapeHtml(day.day_label || 'Day ' + day.day_number)}</span>
            <span class="day-date-text">${escapeHtml(day.date || '')}</span>
          </div>
          <div class="day-meta-box">
            <span class="day-theme-tag">🎯 ${escapeHtml(day.theme || 'Focused Study')}</span>
            <span class="day-hours-tag">⏰ ${day.total_study_hours || 4} hrs planned</span>
          </div>
        </div>
      `;

      // Sessions List
      let sessionsHtml = '<div class="sessions-list">';
      (day.sessions || []).forEach((session, sIdx) => {
        if (session.type === 'break') {
          sessionsHtml += `
            <div class="session-item session-break">
              <div class="session-left">
                <span class="session-time-col">☕ ${escapeHtml(session.time)}</span>
                <div class="session-details">
                  <span class="session-topic-title">${escapeHtml(session.title || 'Break')}</span>
                  <span class="session-activity-desc">${escapeHtml(session.activity || 'Rest & hydrate')}</span>
                </div>
              </div>
            </div>
          `;
        } else {
          // Study session
          const pri = session.priority || 'Medium Priority';
          let priDot = '🟡';
          let priClass = 'subject-med';
          if (pri === 'High Priority') {
            priDot = '🔴';
            priClass = 'subject-high';
          } else if (pri === 'Low Priority') {
            priDot = '🟢';
            priClass = 'subject-low';
          }

          const sessionId = `day-${day.day_number}-session-${sIdx}`;

          sessionsHtml += `
            <div class="session-item ${session.completed ? 'completed' : ''}" id="${sessionId}-row">
              <div class="session-left">
                <span class="session-time-col">${escapeHtml(session.time)}</span>
                <span class="session-priority-dot" title="${escapeHtml(pri)}">${priDot}</span>
                <div class="session-details">
                  <span class="session-subject-tag ${priClass}">${escapeHtml(session.subject)} • ${escapeHtml(pri)}</span>
                  <span class="session-topic-title">${escapeHtml(session.topic)}</span>
                  <span class="session-activity-desc">${escapeHtml(session.activity)} (${session.duration_minutes}m)</span>
                </div>
              </div>
              <div class="session-right">
                <label class="session-check-label" for="${sessionId}-chk">
                  <input type="checkbox" id="${sessionId}-chk" class="session-check-input" ${session.completed ? 'checked' : ''} data-day="${day.day_number}" data-idx="${sIdx}">
                  <span>Mark Done</span>
                </label>
              </div>
            </div>
          `;
        }
      });
      sessionsHtml += '</div>';

      dayCard.innerHTML = headerHtml + sessionsHtml;
      DOM.daysContainer.appendChild(dayCard);
    });

    // Attach event listeners to checkboxes
    DOM.daysContainer.querySelectorAll('.session-check-input').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const row = e.target.closest('.session-item');
        if (row) {
          if (e.target.checked) {
            row.classList.add('completed');
          } else {
            row.classList.remove('completed');
          }
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Recommendations Rendering
  // ---------------------------------------------------------------------------
  function renderRecommendations(recs) {
    DOM.recommendationsGrid.innerHTML = '';
    recs.forEach((rec, idx) => {
      const card = document.createElement('div');
      card.className = 'rec-card';
      card.innerHTML = `
        <div class="rec-num-badge">${idx + 1}</div>
        <div class="rec-card-text">${escapeHtml(rec)}</div>
      `;
      DOM.recommendationsGrid.appendChild(card);
    });
  }

  // ---------------------------------------------------------------------------
  // Study Timer Logic (Pomodoro 25m Focus / 5m Break)
  // ---------------------------------------------------------------------------
  const RING_CIRCUMFERENCE = 2 * Math.PI * 95; // r=95 in SVG

  function initTimerRing() {
    if (DOM.timerProgressRing) {
      DOM.timerProgressRing.style.strokeDasharray = `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;
      DOM.timerProgressRing.style.strokeDashoffset = '0';
    }
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.timer.remainingSeconds / 60);
    const secs = state.timer.remainingSeconds % 60;
    DOM.timerDigits.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Update progress ring offset
    const fraction = state.timer.remainingSeconds / state.timer.durationSeconds;
    const offset = RING_CIRCUMFERENCE - (fraction * RING_CIRCUMFERENCE);
    if (DOM.timerProgressRing) {
      DOM.timerProgressRing.style.strokeDashoffset = offset.toString();
    }
  }

  function setTimerMode(mode) {
    state.timer.mode = mode;
    state.timer.isRunning = false;
    clearInterval(state.timer.intervalId);

    if (mode === 'focus') {
      state.timer.durationSeconds = 25 * 60;
      state.timer.remainingSeconds = 25 * 60;
      DOM.modeFocusBtn.classList.add('active');
      DOM.modeBreakBtn.classList.remove('active');
      DOM.timerSwitchBtn.textContent = '☕ Switch to Break';
      DOM.timerStateLabel.textContent = 'Focus Ready';
      DOM.timerStartPauseBtn.textContent = '▶ Start Focus';
      DOM.timerProgressRing.setAttribute('stroke', 'url(#timerGradient)');
    } else {
      state.timer.durationSeconds = 5 * 60;
      state.timer.remainingSeconds = 5 * 60;
      DOM.modeBreakBtn.classList.add('active');
      DOM.modeFocusBtn.classList.remove('active');
      DOM.timerSwitchBtn.textContent = '🧠 Switch to Focus';
      DOM.timerStateLabel.textContent = 'Break Ready';
      DOM.timerStartPauseBtn.textContent = '▶ Start Break';
      DOM.timerProgressRing.setAttribute('stroke', '#10b981');
    }

    updateTimerDisplay();
  }

  function toggleTimer() {
    if (state.timer.isRunning) {
      // Pause
      state.timer.isRunning = false;
      clearInterval(state.timer.intervalId);
      DOM.timerStartPauseBtn.textContent = '▶ Resume';
      DOM.timerStateLabel.textContent = 'Paused';
    } else {
      // Start
      state.timer.isRunning = true;
      DOM.timerStartPauseBtn.textContent = '⏸ Pause';
      DOM.timerStateLabel.textContent = state.timer.mode === 'focus' ? 'Focusing...' : 'Resting...';

      state.timer.intervalId = setInterval(() => {
        if (state.timer.remainingSeconds > 0) {
          state.timer.remainingSeconds--;
          updateTimerDisplay();
        } else {
          // Finished session
          clearInterval(state.timer.intervalId);
          state.timer.isRunning = false;
          playChime();

          if (state.timer.mode === 'focus') {
            showToast('🎉 Focus session completed! Great job! Time for a 5-minute break.', 'success');
            setTimerMode('break');
          } else {
            showToast('☕ Break finished! Ready to jump into your next focus block?', 'info');
            setTimerMode('focus');
          }
        }
      }, 1000);
    }
  }

  function resetTimer() {
    state.timer.isRunning = false;
    clearInterval(state.timer.intervalId);
    state.timer.remainingSeconds = state.timer.durationSeconds;
    DOM.timerStartPauseBtn.textContent = `▶ Start ${state.timer.mode === 'focus' ? 'Focus' : 'Break'}`;
    DOM.timerStateLabel.textContent = 'Reset';
    updateTimerDisplay();
  }

  function openTimerModal() {
    DOM.timerModal.classList.remove('hidden');
    updateTimerDisplay();
  }

  function closeTimerModal() {
    DOM.timerModal.classList.add('hidden');
  }

  // ---------------------------------------------------------------------------
  // AI Settings Modal
  // ---------------------------------------------------------------------------
  function openApiModal() {
    DOM.customApiKeyInput.value = state.customApiKey;
    DOM.apiModal.classList.remove('hidden');
  }

  function closeApiModal() {
    DOM.apiModal.classList.add('hidden');
  }

  function saveApiKey() {
    const key = DOM.customApiKeyInput.value.trim();
    state.customApiKey = key;
    if (key) {
      localStorage.setItem('studymate_api_key', key);
      showToast('API Key configured! Study plans will attempt real-time LLM reasoning.', 'success');
    } else {
      localStorage.removeItem('studymate_api_key');
      showToast('Cleared custom API key. Using built-in local engine.', 'info');
    }
    closeApiModal();
  }

  function clearApiKey() {
    state.customApiKey = '';
    DOM.customApiKeyInput.value = '';
    localStorage.removeItem('studymate_api_key');
    showToast('Cleared custom API key.', 'info');
  }

  // ---------------------------------------------------------------------------
  // Event Listeners Setup
  // ---------------------------------------------------------------------------
  function setupEventListeners() {
    // Navigation
    DOM.navLandingBtn.addEventListener('click', () => switchView('landing'));
    DOM.navPlannerBtn.addEventListener('click', () => switchView('input'));
    DOM.brandHomeBtn.addEventListener('click', () => switchView('landing'));

    // Hero CTAs
    DOM.heroCreateBtn.addEventListener('click', () => {
      switchView('input');
      DOM.studentNameInput.focus();
    });

    DOM.heroDemoBtn.addEventListener('click', () => {
      loadDemoProfile();
      switchView('input');
    });

    DOM.navDemoBtn.addEventListener('click', () => {
      loadDemoProfile();
      switchView('input');
    });

    DOM.formFillDemoBtn.addEventListener('click', loadDemoProfile);

    // Dynamic Subject Tag Input
    DOM.addSubjectBtn.addEventListener('click', () => {
      addSubject(DOM.newSubjectInput.value);
    });

    DOM.newSubjectInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSubject(DOM.newSubjectInput.value);
      }
    });

    // Remove chip via delegation
    DOM.subjectsChipList.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip-remove-btn')) {
        const subj = e.target.getAttribute('data-subject');
        if (subj) removeSubject(subj);
      }
    });

    // Quick subject suggestions
    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const s = chip.getAttribute('data-subject');
        if (s) addSubject(s);
      });
    });

    // Exam Date Countdown
    DOM.examDateInput.addEventListener('change', (e) => {
      updateExamCountdownBadge(e.target.value);
    });

    // Form Submit
    DOM.form.addEventListener('submit', handleGeneratePlan);

    // Dashboard Actions
    DOM.dashTimerBtn.addEventListener('click', openTimerModal);
    DOM.focusLaunchTimerBtn.addEventListener('click', openTimerModal);
    DOM.dashEditBtn.addEventListener('click', () => switchView('input'));

    DOM.dashRegenerateBtn.addEventListener('click', () => {
      showToast('Regenerating your study plan with fresh topic balancing...', 'info');
      handleGeneratePlan();
    });

    DOM.dashPrintBtn.addEventListener('click', () => {
      window.print();
    });

    // Timer Modal Controls
    DOM.closeTimerBtn.addEventListener('click', closeTimerModal);
    DOM.timerModal.addEventListener('click', (e) => {
      if (e.target === DOM.timerModal) closeTimerModal();
    });

    DOM.modeFocusBtn.addEventListener('click', () => setTimerMode('focus'));
    DOM.modeBreakBtn.addEventListener('click', () => setTimerMode('break'));
    DOM.timerStartPauseBtn.addEventListener('click', toggleTimer);
    DOM.timerResetBtn.addEventListener('click', resetTimer);
    DOM.timerSwitchBtn.addEventListener('click', () => {
      setTimerMode(state.timer.mode === 'focus' ? 'break' : 'focus');
    });

    DOM.timerSoundChk.addEventListener('change', (e) => {
      state.timer.soundEnabled = e.target.checked;
    });

    // API Settings Modal
    DOM.navApiBtn.addEventListener('click', openApiModal);
    DOM.closeApiBtn.addEventListener('click', closeApiModal);
    DOM.apiModal.addEventListener('click', (e) => {
      if (e.target === DOM.apiModal) closeApiModal();
    });
    DOM.saveApiKeyBtn.addEventListener('click', saveApiKey);
    DOM.clearApiKeyBtn.addEventListener('click', clearApiKey);

    // Set today as min date for exam picker
    const todayStr = new Date().toISOString().split('T')[0];
    DOM.examDateInput.min = todayStr;
  }

  // ---------------------------------------------------------------------------
  // Application Bootstrap
  // ---------------------------------------------------------------------------
  function init() {
    renderSubjectsList();
    initTimerRing();
    setTimerMode('focus');
    setupEventListeners();

    // Default to Landing view
    switchView('landing');

    console.log('✨ StudyMate AI Web Application Initialized Successfully.');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
