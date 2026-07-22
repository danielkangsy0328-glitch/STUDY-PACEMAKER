export type DifficultyLevel = 'HIGH' | 'MEDIUM' | 'EASY';

export interface UserAccount {
  id: string;
  username: string; // ID or Email
  passwordHash: string;
  name: string;
  grade: string;
  targetGoal: string;
  avatarIcon: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  subject: string; // e.g., "수학", "영어", "국어", "과학", "사회", "휴식"
  title: string; // e.g., "수학 문제집 5장 (고난도) 📚"
  description: string;
  difficulty: DifficultyLevel;
  startTime: string; // e.g., "16:00"
  endTime: string; // e.g., "16:30"
  durationMinutes: number;
  isBreak: boolean;
  completed: boolean;
  completedAt?: string;
  breakTip?: string;
}

export interface StudyPlan {
  id: string;
  date: string;
  mainGoal: string;
  totalAvailableMinutes: number;
  isLongTermPlan: boolean; // extended plan (6h~12h)
  fatigueLevel: number; // 0 to 100
  tasks: TaskItem[];
  encouragementMsg: string;
  createdAt: string;
}

export interface DailyLog {
  day: string;
  date: string;
  studyMinutes: number;
  focusScore: number;
  completedTasks: number;
  totalTasks: number;
}

export interface SubjectStat {
  subject: string;
  minutes: number;
  completionRate: number;
  color: string;
}

export interface FatigueVsFocus {
  fatigueLabel: string;
  avgFocus: number;
  sessionCount: number;
}

export interface Badge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StudyStats {
  totalCompletedTasks: number;
  totalStudyMinutes: number;
  streakDays: number;
  level: number;
  levelTitle: string;
  weeklyLogs: DailyLog[];
  subjectStats: SubjectStat[];
  fatigueVsFocus: FatigueVsFocus[];
  badges: Badge[];
}

export interface UserProfile {
  name: string;
  grade: string;
  targetGoal: string;
  avatarIcon: string;
  soundEnabled: boolean;
  autoBreakAlert: boolean;
}
