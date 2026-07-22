import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, RotateCcw, Coffee, Sparkles } from 'lucide-react';
import { TaskItem } from '../types';
import { triggerTaskConfetti } from '../lib/confetti';

interface ActiveTimerProps {
  currentTask: TaskItem | null;
  onCompleteTask: (taskId: string) => void;
  onNextTask?: () => void;
}

export const ActiveTimer: React.FC<ActiveTimerProps> = ({ currentTask, onCompleteTask, onNextTask }) => {
  if (!currentTask) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-emerald-50 rounded-3xl p-6 text-center border-2 border-dashed border-sky-200">
        <Sparkles className="w-8 h-8 text-sky-500 mx-auto mb-2 animate-bounce" />
        <h3 className="font-bold text-sky-900 text-lg">오늘의 모든 목표를 완수했어요! 🎉</h3>
        <p className="text-sm text-sky-600 mt-1">정말 멋져요! 학습 통계 리포트에서 나의 몰입 기록을 확인해보세요.</p>
      </div>
    );
  }

  const initialTotalSeconds = (currentTask.durationMinutes || 25) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(initialTotalSeconds);
  const [isRunning, setIsRunning] = useState(false);

  // Reset timer if task changes
  useEffect(() => {
    setRemainingSeconds((currentTask.durationMinutes || 25) * 60);
    setIsRunning(false);
  }, [currentTask.id]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && remainingSeconds > 0) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0 && isRunning) {
      setIsRunning(false);
      triggerTaskConfetti();
      onCompleteTask(currentTask.id);
    }
    return () => clearInterval(timer);
  }, [isRunning, remainingSeconds, currentTask.id, onCompleteTask]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatNum = (num: number) => num.toString().padStart(2, '0');

  const progressPercent = ((initialTotalSeconds - remainingSeconds) / initialTotalSeconds) * 100;
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  const handleTogglePlay = () => setIsRunning(!isRunning);

  const handleComplete = () => {
    setIsRunning(false);
    triggerTaskConfetti();
    onCompleteTask(currentTask.id);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(initialTotalSeconds);
  };

  return (
    <div className={`rounded-3xl p-6 border-2 transition-all ${
      currentTask.isBreak
        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        : 'bg-sky-50/80 border-sky-200 text-sky-950'
    } shadow-sm flex flex-col items-center relative overflow-hidden`}>

      {/* Header Tag */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
          currentTask.isBreak
            ? 'bg-emerald-200 text-emerald-800'
            : currentTask.difficulty === 'HIGH'
            ? 'bg-rose-100 text-rose-700'
            : 'bg-sky-200 text-sky-800'
        }`}>
          {currentTask.isBreak ? (
            <>
              <Coffee className="w-3.5 h-3.5" />
              휴식 세션 ({currentTask.durationMinutes}분)
            </>
          ) : (
            <>
              🔥 {currentTask.difficulty === 'HIGH' ? '고난도 과목 우선' : '몰입 세션'} ({currentTask.durationMinutes}분)
            </>
          )}
        </span>
      </div>

      <h3 className="font-bold text-lg text-center mb-1 text-slate-800">
        {currentTask.title}
      </h3>
      <p className="text-xs text-slate-600 text-center mb-4 max-w-sm">
        {currentTask.description}
      </p>

      {/* Circular Progress Ring */}
      <div className="relative w-44 h-44 my-2 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="88"
            cy="88"
            r="70"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-slate-200/60"
          />
          <circle
            cx="88"
            cy="88"
            r="70"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray="440"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${
              currentTask.isBreak ? 'text-emerald-500' : 'text-sky-600'
            }`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tight text-slate-800 font-mono">
            {formatNum(minutes)}:{formatNum(seconds)}
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
            {isRunning ? '열공 집중 중... ✍️' : '시작 준비 완료! 🚀'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleTogglePlay}
          className={`px-6 py-2.5 rounded-full font-bold text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95 text-white ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600'
              : currentTask.isBreak
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> 일시정지
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" /> 세션 시작
            </>
          )}
        </button>

        <button
          onClick={handleComplete}
          className="px-4 py-2.5 rounded-full font-bold text-sm bg-white text-emerald-700 border border-emerald-300 shadow-sm flex items-center gap-1.5 hover:bg-emerald-50 transition-all active:scale-95"
          title="과제 완수 처리"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          완수!
        </button>

        <button
          onClick={handleReset}
          className="p-2.5 rounded-full bg-white/80 text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 transition-all active:scale-95"
          title="시간 리셋"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
