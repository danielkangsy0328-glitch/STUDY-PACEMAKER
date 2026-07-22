import React from 'react';
import { Target, Clock, Smile, Sparkles, CheckSquare, Coffee, Dumbbell, Calendar, Flame } from 'lucide-react';
import { StudyPlan, TaskItem, UserProfile } from '../types';
import { formatMinutes } from '../lib/plannerEngine';
import { triggerTaskConfetti } from '../lib/confetti';
import { ActiveTimer } from './ActiveTimer';
import { PlannerGeneratorView } from './PlannerGeneratorView';

interface TodayViewProps {
  plan: StudyPlan;
  profile: UserProfile;
  onToggleTask: (taskId: string) => void;
  onOpenGenerator: () => void;
  onPlanGenerated: (newPlan: StudyPlan) => void;
  onResetPlanKeepHistory?: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ plan, profile, onToggleTask, onOpenGenerator, onPlanGenerated, onResetPlanKeepHistory }) => {
  const completedCount = plan.tasks.filter((t) => t.completed).length;
  const totalCount = plan.tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Find the first uncompleted task for the active timer
  const currentActiveTask = plan.tasks.find((t) => !t.completed) || null;

  const handleCheckboxClick = (task: TaskItem) => {
    if (!task.completed) {
      triggerTaskConfetti();
    }
    onToggleTask(task.id);
  };

  const fatigueLabelMap: Record<number, { text: string; emoji: string }> = {
    0: { text: "최상! (맑음)", emoji: "😊" },
    20: { text: "좋음 (맑음)", emoji: "😃" },
    40: { text: "보통 (구름)", emoji: "😐" },
    60: { text: "조금 피곤", emoji: "🥱" },
    80: { text: "졸림 (흐림)", emoji: "😴" },
    100: { text: "방전 (비)", emoji: "😫" },
  };

  const currentCondition = fatigueLabelMap[plan.fatigueLevel] || { text: "좋음", emoji: "😊" };

  // If plan has no tasks yet, display the initial setup input form directly!
  if (plan.tasks.length === 0) {
    return (
      <div className="space-y-6 pb-24 max-w-2xl mx-auto">
        {/* Welcoming Banner */}
        <section className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-3xl p-6 shadow-xl shadow-sky-500/15 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="inline-block px-3.5 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-sm">
              1:1 맞춤 페이스메이커 🏃‍♂️
            </span>
            <h2 className="text-2xl font-black tracking-tight">
              반가워, {profile.name}! 오늘 공부를 시작해보자! ✨
            </h2>
            <p className="text-sky-100 text-xs font-medium leading-relaxed">
              아직 작성된 타임라인이 없어요. <br />
              오늘의 공부 시간, 컨디션, 그리고 과제별 예상 시간을 직접 적어주면 가장 완벽한 2:1 몰입 타임라인을 짜줄게요!
            </p>
          </div>
          <div className="absolute -right-6 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* Render Planner Generator Input Form Directly */}
        <PlannerGeneratorView onPlanGenerated={onPlanGenerated} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      <section className="bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-3xl p-5 shadow-lg shadow-sky-500/15 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-2 backdrop-blur-sm">
              1:1 공부 페이스메이커 🚀
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight mb-1">
              안녕, {profile.name}! 오늘의 공부 페이스메이커야!
            </h2>
            <p className="text-sky-100 text-sm font-medium">
              오늘도 너의 꿈을 향해 한 걸음 더 나아가보자! ✨
            </p>
          </div>
          <button
            onClick={onOpenGenerator}
            className="hidden sm:flex items-center gap-1.5 bg-white text-sky-800 hover:bg-sky-50 px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-md flex-shrink-0 transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            컨디션 & 시간 직접 입력 ✏️
          </button>
        </div>
        {/* Background decorative blob */}
        <div className="absolute -right-6 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Quick Setup Card */}
      <div className="bg-gradient-to-r from-amber-50/80 to-sky-50/80 rounded-2xl p-4 border border-sky-100 shadow-sm flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            오늘 공부할 과제, 예상 시간 & 컨디션 설정
          </h3>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">
            내가 직접 판단한 공부 예상 시간을 입력하면 2:1 공부/휴식 타임라인이 자동으로 짜여요.
          </p>
        </div>
        <button
          onClick={onOpenGenerator}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-colors flex-shrink-0"
        >
          직접 입력하기 ✏️
        </button>
      </div>

      {/* 2. Bento-style Summary Cards */}
      <section className="grid grid-cols-2 gap-3.5">
        <div className="col-span-2 bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-sky-100 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
            <Target className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500 font-semibold">오늘의 목표</p>
            <p className="text-base font-bold text-slate-800 truncate">{plan.mainGoal}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-sky-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Clock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">가용 시간</p>
            <p className="text-sm font-bold text-slate-800">{formatMinutes(plan.totalAvailableMinutes)}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-sky-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Smile className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">현재 컨디션</p>
            <p className="text-sm font-bold text-slate-800">{currentCondition.text}</p>
          </div>
        </div>
      </section>

      {/* 3. Today's Timeline Section */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-lg text-slate-800">오늘의 타임라인</h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-sky-100 text-sky-800 rounded-full">
            {completionPercentage}% 완료 ({completedCount}/{totalCount})
          </span>
        </div>

        {/* Vertical Timeline List */}
        <div className="relative space-y-3 pl-3 border-l-2 border-sky-200 ml-3 pt-1">
          {plan.tasks.map((task) => {
            const isHigh = task.difficulty === 'HIGH';
            const isMedium = task.difficulty === 'MEDIUM';

            if (task.isBreak) {
              return (
                <div key={task.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute -left-[19px] top-3 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-white" />

                  <div className="bg-emerald-50/80 border-l-4 border-emerald-500 rounded-2xl p-3.5 flex items-center justify-between italic text-slate-700 shadow-sm">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                        <Coffee className="w-4 h-4 text-emerald-600" />
                        <span>{task.title}</span>
                      </div>
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        {task.startTime} - {task.endTime} ({task.durationMinutes}분)
                      </p>
                      {task.breakTip && (
                        <p className="text-[11px] text-emerald-800 not-italic mt-1 font-semibold">
                          💡 Tip: {task.breakTip}
                        </p>
                      )}
                    </div>
                    <span className="text-xl">☕</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={task.id} className="relative pl-6">
                {/* Timeline dot */}
                <div className={`absolute -left-[19px] top-4 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                  task.completed ? 'bg-emerald-500' : isHigh ? 'bg-rose-500' : 'bg-sky-500'
                }`} />

                <div className={`bg-white rounded-2xl p-4 border-l-4 shadow-sm flex items-start justify-between transition-all hover:shadow-md ${
                  task.completed
                    ? 'border-emerald-500 bg-emerald-50/20 opacity-80'
                    : isHigh
                    ? 'border-rose-500'
                    : isMedium
                    ? 'border-sky-500'
                    : 'border-amber-400'
                }`}>
                  <div className="space-y-1 pr-3">
                    <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      isHigh
                        ? 'bg-rose-100 text-rose-700'
                        : isMedium
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {isHigh ? 'HIGH DIFFICULTY (고난도)' : isMedium ? 'MEDIUM (보통)' : 'EASY (기초)'}
                    </span>

                    <h4 className={`font-bold text-base text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h4>

                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {task.startTime} - {task.endTime} ({task.durationMinutes}분)
                    </p>
                  </div>

                  <button
                    onClick={() => handleCheckboxClick(task)}
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all active:scale-90 flex-shrink-0 mt-1 ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                        : 'border-slate-300 hover:border-sky-500 text-transparent'
                    }`}
                  >
                    ✓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Active Study Timer Widget */}
      <section className="pt-2">
        <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          현재 실행 몰입 타이머
        </h3>
        <ActiveTimer
          currentTask={currentActiveTask}
          onCompleteTask={onToggleTask}
        />
      </section>

      {/* Finish Timeline Banner */}
      {onResetPlanKeepHistory && (
        <section className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-100" />
              <h3 className="font-extrabold text-base">
                {completionPercentage === 100 ? '🎉 모든 공부 과제를 완료했어요!' : '오늘 공부 완료 & 새 타임라인 만들기'}
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-white/20 rounded-full">
              {completedCount}개 완료됨
            </span>
          </div>
          <p className="text-xs text-emerald-100 font-medium leading-relaxed">
            완수한 과제와 공부 시간은 학습 기록(Progress)에 안전하게 보존돼요! 타임라인을 초기화하고 새 공부 계획을 세워보세요.
          </p>
          <button
            onClick={onResetPlanKeepHistory}
            className="w-full bg-white text-emerald-800 hover:bg-emerald-50 py-3 rounded-2xl text-xs font-extrabold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            기록 보존하고 새 타임라인 만들기 ✏️
          </button>
        </section>
      )}

      {/* 5. Motivational Cheer Banner */}
      <section className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-3xl p-5 text-white shadow-md flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-bold text-base leading-snug italic">
            {plan.encouragementMsg}
          </p>
          <p className="text-xs text-sky-200">
            20~30분씩 작은 조각으로 나누면 아무리 어려운 공부도 쉬워진단다!
          </p>
        </div>
        <div className="text-4xl bg-white/20 p-3 rounded-2xl flex-shrink-0">
          💪
        </div>
      </section>
    </div>
  );
};
