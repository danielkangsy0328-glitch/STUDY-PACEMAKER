import React, { useState } from 'react';
import { Clock, Filter, Coffee, Sparkles, Plus, Calendar } from 'lucide-react';
import { StudyPlan, TaskItem, DifficultyLevel } from '../types';
import { triggerTaskConfetti } from '../lib/confetti';

interface TimelineViewProps {
  plan: StudyPlan;
  onToggleTask: (taskId: string) => void;
  onAddTask?: (task: TaskItem) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ plan, onToggleTask }) => {
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'EASY' | 'BREAK'>('ALL');

  const filteredTasks = plan.tasks.filter((task) => {
    if (filter === 'ALL') return true;
    if (filter === 'BREAK') return task.isBreak;
    return task.difficulty === filter && !task.isBreak;
  });

  const handleTaskCheck = (task: TaskItem) => {
    if (!task.completed) {
      triggerTaskConfetti();
    }
    onToggleTask(task.id);
  };

  return (
    <div className="space-y-6 pb-28 max-w-2xl mx-auto">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white rounded-3xl p-5 shadow-sm space-y-2">
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-sm flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            시간대별 상세 타임라인
          </span>
          <span className="text-xs text-sky-200 font-semibold">{plan.date}</span>
        </div>
        <h2 className="text-xl font-extrabold">{plan.mainGoal}</h2>
        <p className="text-xs text-sky-100 font-medium italic">
          {plan.encouragementMsg}
        </p>
      </section>

      {/* Filter Tabs */}
      <section className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: '전체 타임라인' },
          { id: 'HIGH', label: '🔥 High (고난도)' },
          { id: 'MEDIUM', label: '📘 Medium (보통)' },
          { id: 'EASY', label: '📗 Easy (기초)' },
          { id: 'BREAK', label: '☕ 휴식 세션' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
              filter === tab.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* Connected Timeline List */}
      <section className="relative space-y-4 pl-4 border-l-2 border-sky-300 ml-4 pt-2">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            해당 조건의 타임라인 항목이 없어요.
          </div>
        ) : (
          filteredTasks.map((task) => {
            if (task.isBreak) {
              return (
                <div key={task.id} className="relative pl-6">
                  <div className="absolute -left-[23px] top-3 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <div className="bg-emerald-50/90 border-l-4 border-emerald-500 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                        <Coffee className="w-4 h-4 text-emerald-600" />
                        <span>{task.title}</span>
                      </div>
                      <p className="text-xs text-emerald-700 font-semibold mt-1">
                        ⏱️ {task.startTime} - {task.endTime} ({task.durationMinutes}분)
                      </p>
                      {task.breakTip && (
                        <p className="text-xs text-emerald-900 font-medium mt-1.5 italic">
                          💡 추천 휴식: {task.breakTip}
                        </p>
                      )}
                    </div>
                    <span className="text-2xl">☕</span>
                  </div>
                </div>
              );
            }

            const isHigh = task.difficulty === 'HIGH';
            const isMedium = task.difficulty === 'MEDIUM';

            return (
              <div key={task.id} className="relative pl-6">
                <div className={`absolute -left-[23px] top-4 w-4 h-4 rounded-full ring-4 ring-white ${
                  task.completed ? 'bg-emerald-500' : isHigh ? 'bg-rose-500' : 'bg-sky-500'
                }`} />

                <div className={`bg-white rounded-2xl p-4 border-l-4 shadow-sm space-y-2 transition-all hover:shadow-md ${
                  task.completed
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : isHigh
                    ? 'border-rose-500'
                    : isMedium
                    ? 'border-sky-500'
                    : 'border-amber-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        isHigh
                          ? 'bg-rose-100 text-rose-700'
                          : isMedium
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isHigh ? 'HIGH DIFFICULTY' : isMedium ? 'MEDIUM' : 'EASY'}
                      </span>
                      <h4 className={`font-bold text-base text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleTaskCheck(task)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all active:scale-90 flex-shrink-0 ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 text-transparent hover:border-sky-500'
                      }`}
                    >
                      ✓
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 font-semibold border-t border-slate-100">
                    <span className="flex items-center gap-1 text-sky-700">
                      <Clock className="w-3.5 h-3.5" />
                      {task.startTime} - {task.endTime} ({task.durationMinutes}분)
                    </span>
                    <span>•</span>
                    <span className="text-slate-600">{task.subject}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
