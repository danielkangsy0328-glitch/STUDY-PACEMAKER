import React, { useState, useEffect } from 'react';
import { StudyPlan, StudyStats, UserProfile, UserAccount } from './types';
import { getDefaultInitialPlan, getDefaultStats, getDefaultProfile, updateStatsOnTaskToggle } from './lib/plannerEngine';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { TodayView } from './components/TodayView';
import { PlannerGeneratorView } from './components/PlannerGeneratorView';
import { TimelineView } from './components/TimelineView';
import { StatsReportView } from './components/StatsReportView';
import { ProfileView } from './components/ProfileView';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('today');

  // User Account Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('sp_logged_user_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const activeUserId = currentUser ? (currentUser.id || currentUser.username) : 'guest';

  // Load persistent state from LocalStorage or fallbacks based on current activeUserId
  const [plan, setPlan] = useState<StudyPlan>(() => {
    try {
      const saved = localStorage.getItem(`sp_plan_${activeUserId}`);
      return saved ? JSON.parse(saved) : getDefaultInitialPlan();
    } catch {
      return getDefaultInitialPlan();
    }
  });

  const [stats, setStats] = useState<StudyStats>(() => {
    try {
      const saved = localStorage.getItem(`sp_stats_${activeUserId}`);
      return saved ? JSON.parse(saved) : getDefaultStats();
    } catch {
      return getDefaultStats();
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`sp_profile_${activeUserId}`);
      return saved ? JSON.parse(saved) : getDefaultProfile();
    } catch {
      return getDefaultProfile();
    }
  });

  // When activeUserId changes, reload isolated data for that user
  useEffect(() => {
    // Load Plan
    try {
      const savedPlan = localStorage.getItem(`sp_plan_${activeUserId}`);
      setPlan(savedPlan ? JSON.parse(savedPlan) : getDefaultInitialPlan());
    } catch {
      setPlan(getDefaultInitialPlan());
    }

    // Load Stats
    try {
      const savedStats = localStorage.getItem(`sp_stats_${activeUserId}`);
      setStats(savedStats ? JSON.parse(savedStats) : getDefaultStats());
    } catch {
      setStats(getDefaultStats());
    }

    // Load Profile
    try {
      const savedProfile = localStorage.getItem(`sp_profile_${activeUserId}`);
      const baseProfile = savedProfile ? JSON.parse(savedProfile) : getDefaultProfile();
      setProfile({
        ...baseProfile,
        name: currentUser ? (currentUser.name || baseProfile.name) : baseProfile.name,
        grade: currentUser ? (currentUser.grade || baseProfile.grade) : baseProfile.grade,
        targetGoal: currentUser ? (currentUser.targetGoal || baseProfile.targetGoal) : baseProfile.targetGoal,
      });
    } catch {
      setProfile({
        ...getDefaultProfile(),
        name: currentUser?.name || '학생',
        grade: currentUser?.grade || '중학교 2학년',
        targetGoal: currentUser?.targetGoal || '목표 설정하기',
      });
    }
  }, [activeUserId]);

  // Save logged user state
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sp_logged_user_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sp_logged_user_v2');
    }
  }, [currentUser]);

  // Save plan, stats, profile per activeUserId
  useEffect(() => {
    localStorage.setItem(`sp_plan_${activeUserId}`, JSON.stringify(plan));
  }, [plan, activeUserId]);

  useEffect(() => {
    localStorage.setItem(`sp_stats_${activeUserId}`, JSON.stringify(stats));
  }, [stats, activeUserId]);

  useEffect(() => {
    localStorage.setItem(`sp_profile_${activeUserId}`, JSON.stringify(profile));
  }, [profile, activeUserId]);

  const handleLoginSuccess = (account: UserAccount) => {
    setCurrentUser(account);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Task completion toggle with cumulative stats updating
  const handleToggleTask = (taskId: string) => {
    const targetTask = plan.tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const newCompletedState = !targetTask.completed;

    const updatedTasks = plan.tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: newCompletedState,
          completedAt: newCompletedState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        };
      }
      return task;
    });

    setPlan((prevPlan) => ({
      ...prevPlan,
      tasks: updatedTasks,
    }));

    setStats((prevStats) => updateStatsOnTaskToggle(targetTask, newCompletedState, prevStats, plan.tasks));
  };

  // Plan generated callback
  const handlePlanGenerated = (newPlan: StudyPlan) => {
    setPlan(newPlan);
    setActiveTab('today');
  };

  // Keep completed tasks in stats, then clear timeline to start a new plan
  const handleClearAndCreateNewPlan = () => {
    // Current stats are already updated via recalculateStats
    setPlan(getDefaultInitialPlan());
    setActiveTab('generator');
  };

  // Profile update callback
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  // Reset Data callback
  const handleResetData = () => {
    const initPlan = getDefaultInitialPlan();
    const initStats = getDefaultStats();
    const initProfile = getDefaultProfile();
    setPlan(initPlan);
    setStats(initStats);
    setProfile(initProfile);
    if (currentUser) {
      const currentUserId = currentUser.id || currentUser.username;
      localStorage.removeItem(`sp_plan_${currentUserId}`);
      localStorage.removeItem(`sp_stats_${currentUserId}`);
      localStorage.removeItem(`sp_profile_${currentUserId}`);
    }
    setActiveTab('today');
  };

  // Render AuthScreen if user is not logged in
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-sky-200">
      {/* Sticky Top Header */}
      <Header
        profile={profile}
        stats={stats}
        onOpenSettings={() => setActiveTab('profile')}
      />

      {/* Main Content Area */}
      <main className="px-4 pt-4 pb-20">
        {activeTab === 'today' && (
          <TodayView
            plan={plan}
            profile={profile}
            onToggleTask={handleToggleTask}
            onOpenGenerator={() => setActiveTab('generator')}
            onPlanGenerated={handlePlanGenerated}
            onResetPlanKeepHistory={handleClearAndCreateNewPlan}
          />
        )}

        {activeTab === 'generator' && (
          <PlannerGeneratorView onPlanGenerated={handlePlanGenerated} />
        )}

        {activeTab === 'timeline' && (
          <TimelineView plan={plan} onToggleTask={handleToggleTask} />
        )}

        {activeTab === 'stats' && <StatsReportView stats={stats} />}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            stats={stats}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetData}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onQuickCreate={() => setActiveTab('generator')}
      />
    </div>
  );
}
