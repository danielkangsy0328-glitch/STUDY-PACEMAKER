import { StudyPlan, TaskItem, DifficultyLevel, StudyStats, UserProfile } from '../types';

export function formatMinutes(mins: number): string {
  const hours = Math.floor(mins / 60);
  const m = mins % 60;
  if (hours > 0 && m > 0) return `${hours}시간 ${m}분`;
  if (hours > 0) return `${hours}시간`;
  return `${m}분`;
}

export function formatTimeSlot(startTotalMins: number, durationMins: number): { startStr: string; endStr: string; nextStartMins: number } {
  const startHour = Math.floor(startTotalMins / 60) % 24;
  const startMin = startTotalMins % 60;
  const endTotalMins = startTotalMins + durationMins;
  const endHour = Math.floor(endTotalMins / 60) % 24;
  const endMin = endTotalMins % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const startStr = `${pad(startHour)}:${pad(startMin)}`;
  const endStr = `${pad(endHour)}:${pad(endMin)}`;

  return { startStr, endStr, nextStartMins: endTotalMins };
}

interface GeneratePlanParams {
  mainGoal: string;
  totalAvailableMinutes: number;
  fatigueLevel: number; // 0 (best) to 100 (exhausted)
  startTimeStr?: string; // default "16:00"
  isLongTermPlan?: boolean;
  customSubjects?: {
    name: string;
    difficulty: DifficultyLevel;
    details?: string;
    estimatedMinutes?: number;
    breakMinutes?: number;
  }[];
  customBreakMinutes?: number; // global break preference if chosen
}

export function generateRuleBasedPlan(params: GeneratePlanParams): StudyPlan {
  const { mainGoal, totalAvailableMinutes, fatigueLevel, startTimeStr = "16:00", isLongTermPlan = false, customSubjects, customBreakMinutes } = params;

  // Calculate start minutes from HH:MM
  const [sh, sm] = startTimeStr.split(':').map(Number);
  let currentTotalMins = (isNaN(sh) ? 16 : sh) * 60 + (isNaN(sm) ? 0 : sm);

  // Subjects pool
  let subjectsToPlan: { name: string; difficulty: DifficultyLevel; details: string; estimatedMinutes?: number; breakMinutes?: number; icon: string }[] = [];

  if (customSubjects && customSubjects.length > 0) {
    subjectsToPlan = customSubjects.map(s => ({
      name: s.name,
      difficulty: s.difficulty,
      details: s.details || `${s.name} 핵심 문제 및 개념 정복`,
      estimatedMinutes: s.estimatedMinutes && s.estimatedMinutes >= 10 ? s.estimatedMinutes : undefined,
      breakMinutes: s.breakMinutes,
      icon: getSubjectIcon(s.name)
    }));
  } else {
    subjectsToPlan = extractSubjectsFromGoal(mainGoal);
  }

  // Rule: Place higher difficulty subjects first
  const diffOrder: Record<DifficultyLevel, number> = { HIGH: 1, MEDIUM: 2, EASY: 3 };
  subjectsToPlan.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);

  const tasks: TaskItem[] = [];
  let taskCounter = 1;

  const breakTips = [
    "기지개 켜기 & 시원한 물 한 잔 마시며 뇌 깨우기 💧",
    "좋아하는 게임이나 음악, 가벼운 산책으로 신나게 리프레시! 🎵",
    "눈 감고 10초간 깊게 숨 쉬기 (산소 공급!) 🧘‍♂️",
    "가벼운 스트레칭으로 피로 날려버리기 👟",
    "맛있는 간식 먹고 충분히 쉬어주기 🍎",
    "창문 열고 신선한 공기 마시기 🌿"
  ];

  // Loop through tasks provided by user
  for (let i = 0; i < subjectsToPlan.length; i++) {
    const currentSubject = subjectsToPlan[i];
    const diff = currentSubject.difficulty;

    // Flexible study duration directly from user or defaults
    let currentStudyDuration = currentSubject.estimatedMinutes 
      ? Math.max(15, currentSubject.estimatedMinutes)
      : (diff === 'HIGH' ? 45 : diff === 'MEDIUM' ? 35 : 30);

    const { startStr, endStr, nextStartMins } = formatTimeSlot(currentTotalMins, currentStudyDuration);
    currentTotalMins = nextStartMins;

    // Create study task
    const difficultyBadgeText = diff === 'HIGH' ? '🔥 HIGH (어려움)' : diff === 'MEDIUM' ? '📘 MEDIUM (보통)' : '📗 EASY (쉬움)';
    tasks.push({
      id: `task-${taskCounter}`,
      subject: currentSubject.name,
      title: `${currentSubject.name} - ${currentSubject.details}`,
      description: `${difficultyBadgeText}: 직접 설정한 ${formatMinutes(currentStudyDuration)} 집중 몰입 세션!`,
      difficulty: diff,
      startTime: startStr,
      endTime: endStr,
      durationMinutes: currentStudyDuration,
      isBreak: false,
      completed: false
    });
    taskCounter++;

    // Flexible break duration:
    // Respect subject specific breakMinutes or global customBreakMinutes or smart default
    let baseBreakMins = currentSubject.breakMinutes !== undefined
      ? currentSubject.breakMinutes
      : customBreakMinutes !== undefined
      ? customBreakMinutes
      : (diff === 'HIGH' ? 15 : diff === 'MEDIUM' ? 10 : 5);

    if (baseBreakMins > 0) {
      const breakTimes = formatTimeSlot(currentTotalMins, baseBreakMins);
      currentTotalMins = breakTimes.nextStartMins;

      const randomTip = breakTips[(taskCounter - 1) % breakTips.length];
      tasks.push({
        id: `break-${taskCounter}`,
        subject: "휴식",
        title: `자유로운 꿀맛 휴식 시간 (${formatMinutes(baseBreakMins)}) 🍎`,
        description: `${randomTip}`,
        difficulty: "EASY",
        startTime: breakTimes.startStr,
        endTime: breakTimes.endStr,
        durationMinutes: baseBreakMins,
        isBreak: true,
        completed: false,
        breakTip: randomTip
      });
      taskCounter++;
    }
  }

  const encouragementMessages = [
    "\"너의 노력을 응원해! 할 수 있어! ✨\" 자유로운 일정 속에서도 몰입을 완성해보자.",
    "\"유동적이고 스마트한 나만의 페이스! 🚀\" 끝까지 할 수 있다!",
    "\"충분한 휴식과 몰입의 완벽한 조화! 🔥\" 나만의 공부 라이프스타일을 완성해요!",
    "\"페이스메이커가 옆에서 끝까지 응원할게! 🏃‍♂️\" 힘차게 시작해볼까?"
  ];

  const randomEncouragement = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];

  return {
    id: `plan-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    mainGoal,
    totalAvailableMinutes,
    isLongTermPlan,
    fatigueLevel,
    tasks,
    encouragementMsg: randomEncouragement,
    createdAt: new Date().toISOString()
  };
}

function extractSubjectsFromGoal(goal: string): { name: string; difficulty: DifficultyLevel; details: string; icon: string }[] {
  const result: { name: string; difficulty: DifficultyLevel; details: string; icon: string }[] = [];

  const lowerGoal = goal.toLowerCase();

  if (lowerGoal.includes("수학") || lowerGoal.includes("math")) {
    result.push({ name: "수학", difficulty: "HIGH", details: "고난도 문제집 및 개념 완벽 정리 📚", icon: "functions" });
  }
  if (lowerGoal.includes("영어") || lowerGoal.includes("english")) {
    result.push({ name: "영어", difficulty: "MEDIUM", details: "핵심 단어 암기 & 독해 지문 풀기 🔤", icon: "translate" });
  }
  if (lowerGoal.includes("국어") || lowerGoal.includes("korean")) {
    result.push({ name: "국어", difficulty: "MEDIUM", details: "비문학 독해 & 문학 핵심 요약 📖", icon: "menu_book" });
  }
  if (lowerGoal.includes("과학") || lowerGoal.includes("science")) {
    result.push({ name: "과학", difficulty: "HIGH", details: "실험 원리 & 탐구 핵심 노트 정리 🧪", icon: "science" });
  }
  if (lowerGoal.includes("사회") || lowerGoal.includes("역사") || lowerGoal.includes("social")) {
    result.push({ name: "사회", difficulty: "EASY", details: "주요 개념 요약 정리 & 암기 📝", icon: "edit_note" });
  }

  // Fallback if no subjects matched directly in standard goal
  if (result.length === 0) {
    result.push(
      { name: "수학", difficulty: "HIGH", details: "문제 풀이 및 고난도 심화 📚", icon: "functions" },
      { name: "영어", difficulty: "MEDIUM", details: "단어 암기 & 독해 연습 🔤", icon: "translate" },
      { name: "사회", difficulty: "EASY", details: "핵심 요약 정리 📝", icon: "edit_note" }
    );
  }

  return result;
}

function getSubjectIcon(name: string): string {
  if (name.includes("수학")) return "functions";
  if (name.includes("영어")) return "translate";
  if (name.includes("국어")) return "menu_book";
  if (name.includes("과학")) return "science";
  if (name.includes("사회") || name.includes("역사")) return "edit_note";
  return "school";
}

export function updateStatsOnTaskToggle(
  task: TaskItem,
  newCompletedState: boolean,
  currentStats: StudyStats,
  allPlanTasks: TaskItem[]
): StudyStats {
  const base = currentStats || getDefaultStats();
  let totalCompletedTasks = base.totalCompletedTasks || 0;
  let totalStudyMinutes = base.totalStudyMinutes || 0;

  if (!task.isBreak) {
    if (newCompletedState) {
      totalCompletedTasks += 1;
      totalStudyMinutes += task.durationMinutes;
    } else {
      totalCompletedTasks = Math.max(0, totalCompletedTasks - 1);
      totalStudyMinutes = Math.max(0, totalStudyMinutes - task.durationMinutes);
    }
  }

  // Level calculation (30 mins per level)
  const level = Math.floor(totalStudyMinutes / 30) + 1;
  const levelTitle =
    level >= 10
      ? `LV. ${level} 마스터 러너 🏃‍♂️`
      : level >= 5
      ? `LV. ${level} 몰입 러너 🏃`
      : `LV. ${level} 비기너 러너 🏃‍♂️`;

  // Update subjectStats
  const subjectName = task.subject || '일반 공부';
  const colorMap: Record<string, string> = {
    수학: '#0058bd',
    영어: '#006b58',
    과학: '#a83206',
    사회: '#ca4a20',
    국어: '#7c3aed',
    역사: '#d97706',
  };

  let subjectStats = [...(base.subjectStats || [])];
  const existingSubIdx = subjectStats.findIndex((s) => s.subject === subjectName);

  if (!task.isBreak) {
    if (existingSubIdx >= 0) {
      const existing = subjectStats[existingSubIdx];
      const newMins = newCompletedState
        ? existing.minutes + task.durationMinutes
        : Math.max(0, existing.minutes - task.durationMinutes);
      subjectStats[existingSubIdx] = {
        ...existing,
        minutes: newMins,
        completionRate: newMins > 0 ? Math.min(100, Math.round((newMins / Math.max(newMins, 60)) * 100)) : 0,
      };
    } else {
      const color = colorMap[subjectName] || '#0058bd';
      subjectStats.push({
        subject: subjectName,
        minutes: newCompletedState ? task.durationMinutes : 0,
        completionRate: newCompletedState ? 100 : 0,
        color,
      });
    }
  }

  // Update weeklyLogs for today
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const todayDayName = dayNames[new Date().getDay()];

  const weeklyLogs = (base.weeklyLogs && base.weeklyLogs.length === 7)
    ? base.weeklyLogs
    : getDefaultStats().weeklyLogs;

  const updatedWeeklyLogs = weeklyLogs.map((log) => {
    if (log.day === todayDayName) {
      const addedMins = !task.isBreak ? (newCompletedState ? task.durationMinutes : -task.durationMinutes) : 0;
      const addedTasks = !task.isBreak ? (newCompletedState ? 1 : -1) : 0;
      const newStudyMins = Math.max(0, log.studyMinutes + addedMins);
      const newCompleted = Math.max(0, log.completedTasks + addedTasks);
      const nonBreakTotal = allPlanTasks.filter((t) => !t.isBreak).length;

      return {
        ...log,
        studyMinutes: newStudyMins,
        completedTasks: newCompleted,
        totalTasks: Math.max(log.totalTasks, nonBreakTotal),
        focusScore: newCompleted > 0 ? Math.min(100, 80 + newCompleted * 4) : 0,
      };
    }
    return log;
  });

  // Update badges
  const nonBreakTasks = allPlanTasks.filter((t) => !t.isBreak);
  const completedNonBreak = nonBreakTasks.filter((t) => (t.id === task.id ? newCompletedState : t.completed));

  const badges = (base.badges || getDefaultStats().badges).map((badge) => {
    let unlocked = badge.unlocked;
    if (badge.id === 'b1') {
      unlocked = unlocked || totalCompletedTasks > 0;
    } else if (badge.id === 'b2') {
      unlocked = unlocked || (!task.isBreak && task.subject.includes('수학') && task.difficulty === 'HIGH' && newCompletedState);
    } else if (badge.id === 'b3') {
      unlocked = unlocked || (task.isBreak && newCompletedState);
    } else if (badge.id === 'b4') {
      unlocked = unlocked || totalStudyMinutes >= 120;
    } else if (badge.id === 'b5') {
      unlocked = unlocked || (nonBreakTasks.length > 0 && completedNonBreak.length === nonBreakTasks.length);
    }
    return {
      ...badge,
      unlocked,
      unlockedAt: unlocked && !badge.unlockedAt ? new Date().toISOString().split('T')[0] : badge.unlockedAt,
    };
  });

  return {
    ...base,
    totalCompletedTasks,
    totalStudyMinutes,
    streakDays: totalCompletedTasks > 0 ? Math.max(base.streakDays || 1, 1) : base.streakDays,
    level,
    levelTitle,
    weeklyLogs: updatedWeeklyLogs,
    subjectStats,
    badges,
  };
}

export function recalculateStats(plan: StudyPlan, currentStats?: StudyStats): StudyStats {
  return currentStats || getDefaultStats();
}

export function getDefaultInitialPlan(): StudyPlan {
  return {
    id: "initial-plan-empty",
    date: new Date().toISOString().split('T')[0],
    mainGoal: "오늘의 공부 목표를 입력해보세요!",
    totalAvailableMinutes: 0,
    isLongTermPlan: false,
    fatigueLevel: 20, // Best (최상)
    encouragementMsg: "\"너의 노력을 응원해! 할 수 있어! ✨\" 오늘의 공부 시간과 과제를 입력하면 맞춤 타임라인이 완성돼요.",
    createdAt: new Date().toISOString(),
    tasks: [] // Clean initial state with no timeline tasks
  };
}

export function getDefaultStats(): StudyStats {
  return {
    totalCompletedTasks: 0,
    totalStudyMinutes: 0,
    streakDays: 0,
    level: 1,
    levelTitle: "LV. 1 비기너 러너 🏃‍♂️",
    weeklyLogs: [
      { day: "월", date: "07-16", studyMinutes: 0, focusScore: 0, completedTasks: 0, totalTasks: 0 },
      { day: "화", date: "07-17", studyMinutes: 0, focusScore: 0, completedTasks: 0, totalTasks: 0 },
      { day: "수", date: "07-18", studyMinutes: 0, focusScore: 0, completedTasks: 0, totalTasks: 0 },
      { day: "목", date: "07-19", studyMinutes: 0, focusScore: 0, completedTasks: 0, totalTasks: 0 },
      { day: "금", date: "07-20", studyMinutes: 0, focusScore: 0, completedTasks: 0, totalTasks: 0 },
      { day: "토", date: "07-21", studyMinutes: 0, focusScore: 0, completedTasks: 0, totalTasks: 0 },
      { day: "일", date: "07-22", studyMinutes: 0, focusScore: 0, completedTasks: 0, totalTasks: 0 }
    ],
    subjectStats: [
      { subject: "수학", minutes: 0, completionRate: 0, color: "#0058bd" },
      { subject: "영어", minutes: 0, completionRate: 0, color: "#006b58" },
      { subject: "과학", minutes: 0, completionRate: 0, color: "#a83206" },
      { subject: "사회", minutes: 0, completionRate: 0, color: "#ca4a20" }
    ],
    fatigueVsFocus: [
      { fatigueLabel: "최상 (맑음)", avgFocus: 100, sessionCount: 0 },
      { fatigueLabel: "좋음 (괜찮음)", avgFocus: 85, sessionCount: 0 },
      { fatigueLabel: "보통 (조금 피곤)", avgFocus: 75, sessionCount: 0 },
      { fatigueLabel: "피곤함", avgFocus: 60, sessionCount: 0 }
    ],
    badges: [
      { id: "b1", title: "첫 공부 시작", desc: "첫 번째 맞춤 타임라인을 완료해보세요!", icon: "local_fire_department", unlocked: false },
      { id: "b2", title: "고난도 수학 정복자", desc: "어려운 수학 세션을 완료!", icon: "military_tech", unlocked: false },
      { id: "b3", title: "스마트 휴식 마스터", desc: "휴식 규칙을 잘 지켰어요", icon: "spa", unlocked: false },
      { id: "b4", title: "주말 타임라인", desc: "긴 시간 확장 타임라인 완수!", icon: "sprint", unlocked: false },
      { id: "b5", title: "완벽주의 100%", desc: "하루 할당 과제를 모두 완수!", icon: "verified", unlocked: false }
    ]
  };
}

export function getDefaultProfile(): UserProfile {
  return {
    name: "민수",
    grade: "중학교 2학년",
    targetGoal: "중간고사 전과목 A등급 도전!",
    avatarIcon: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7S_7fWWOL2qz-pY_yGELajA-5VO-S1m5SCSIGI8vFjpRoxtE3aprrrWzkBtn9ggu5y9PBeQ2gkQMts7G0tJW1YVm-lGQHspu8p_J6qQz0lc_szUNbE9BhtYg-beXhE-UDJwnLle7wk5NGK43ODVFEjihGpEO7dyKkTtvt5Lonl0ofqifHMKmfPNH9DCW8qXBh9WHk69pMoZ0PXnrEMaKh6V6WwmRh6-LQxCdxq3UKMof17DXi05iQ",
    soundEnabled: true,
    autoBreakAlert: true
  };
}
