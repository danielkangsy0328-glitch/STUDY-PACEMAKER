import React, { useState } from 'react';
import { Flag, Clock, Bolt, Sparkles, CheckCircle2, Plus, Trash2, CalendarRange, ShieldCheck } from 'lucide-react';
import { StudyPlan, DifficultyLevel } from '../types';
import { generateRuleBasedPlan } from '../lib/plannerEngine';

interface PlannerGeneratorViewProps {
  onPlanGenerated: (newPlan: StudyPlan) => void;
}

export const PlannerGeneratorView: React.FC<PlannerGeneratorViewProps> = ({ onPlanGenerated }) => {
  const [mainGoal, setMainGoal] = useState("");
  const [hours, setHours] = useState("2");
  const [minutes, setMinutes] = useState("30");
  const [isLongTermPlan, setIsLongTermPlan] = useState(false);
  const [fatigueLevel, setFatigueLevel] = useState(20); // 0 to 100
  const [isGenerating, setIsGenerating] = useState(false);

  // Custom subjects list with estimatedMinutes and breakMinutes
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; difficulty: DifficultyLevel; details: string; estimatedMinutes: number; breakMinutes: number }>>([
    { id: 's1', name: '수학', difficulty: 'HIGH', details: '문제집 및 개념 풀기', estimatedMinutes: 60, breakMinutes: 15 },
    { id: 's2', name: '영어', difficulty: 'MEDIUM', details: '단어 암기 & 독해', estimatedMinutes: 45, breakMinutes: 10 }
  ]);

  const [newSubName, setNewSubName] = useState("");
  const [newSubDiff, setNewSubDiff] = useState<DifficultyLevel>("MEDIUM");
  const [newSubDetails, setNewSubDetails] = useState("");
  const [newSubMins, setNewSubMins] = useState(45);
  const [newSubBreakMins, setNewSubBreakMins] = useState(15);

  const fatigueStates = [
    { label: "최고! (맑음)", emoji: "😊", color: "bg-emerald-100 text-emerald-800" },
    { label: "괜찮아요", emoji: "😃", color: "bg-sky-100 text-sky-800" },
    { label: "조금 피곤함", emoji: "🥱", color: "bg-amber-100 text-amber-800" },
    { label: "졸려요", emoji: "😴", color: "bg-orange-100 text-orange-800" },
    { label: "완전 방전", emoji: "😫", color: "bg-rose-100 text-rose-800" }
  ];

  const currentFatigueIndex = Math.min(Math.floor(fatigueLevel / 21), 4);
  const currentFatigueState = fatigueStates[currentFatigueIndex];

  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    const finalMins = newSubMins >= 10 ? newSubMins : 30;
    setSubjects([
      ...subjects,
      {
        id: `custom-${Date.now()}`,
        name: newSubName.trim(),
        difficulty: newSubDiff,
        details: newSubDetails.trim() || `${newSubName.trim()} 문제 풀기 및 개념 정리`,
        estimatedMinutes: finalMins,
        breakMinutes: newSubBreakMins
      }
    ]);
    setNewSubName("");
    setNewSubDetails("");
    setNewSubMins(45);
    setNewSubBreakMins(15);
  };

  const getRecommendedBreakMins = (studyMins: number): number => {
    if (studyMins <= 25) return 5;
    if (studyMins <= 40) return 10;
    if (studyMins <= 60) return 15;
    if (studyMins <= 90) return 20;
    if (studyMins <= 120) return 30;
    if (studyMins <= 180) return 45;
    return 60; // Max 1 hour break recommendation
  };

  const handleUpdateSubjectMins = (id: string, mins: number) => {
    const validMins = Math.max(10, mins);
    const recBreak = getRecommendedBreakMins(validMins);
    setSubjects(subjects.map(s => s.id === id ? { ...s, estimatedMinutes: validMins, breakMinutes: recBreak } : s));
  };

  const handleUpdateSubjectBreakMins = (id: string, breakMins: number) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, breakMinutes: Math.max(0, breakMins) } : s));
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const totalMins = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);

    try {
      // First attempt Gemini API endpoint
      const response = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainGoal,
          totalAvailableMinutes: totalMins > 0 ? totalMins : 150,
          fatigueLevel,
          startTimeStr: "16:00",
          isLongTermPlan,
          customSubjects: subjects
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.plan) {
          const aiPlan: StudyPlan = {
            id: `plan-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            mainGoal: data.plan.mainGoal || mainGoal,
            totalAvailableMinutes: totalMins > 0 ? totalMins : 150,
            isLongTermPlan,
            fatigueLevel,
            encouragementMsg: data.plan.encouragementMsg || "\"너의 노력을 응원해! 할 수 있어! ✨\"",
            createdAt: new Date().toISOString(),
            tasks: data.plan.tasks.map((t: any, idx: number) => ({
              id: t.id || `task-${idx}`,
              subject: t.subject,
              title: t.title,
              description: t.description,
              difficulty: t.difficulty as DifficultyLevel,
              startTime: t.startTime,
              endTime: t.endTime,
              durationMinutes: t.durationMinutes,
              isBreak: t.isBreak || false,
              completed: false,
              breakTip: t.breakTip
            }))
          };
          onPlanGenerated(aiPlan);
          setIsGenerating(false);
          return;
        }
      }
    } catch (e) {
      console.log("Server API error fallback to rule engine:", e);
    }

    // Fallback to local rule engine
    const localPlan = generateRuleBasedPlan({
      mainGoal,
      totalAvailableMinutes: totalMins > 0 ? totalMins : 150,
      fatigueLevel,
      startTimeStr: "16:00",
      isLongTermPlan,
      customSubjects: subjects
    });

    onPlanGenerated(localPlan);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 pb-28 max-w-2xl mx-auto">
      {/* Header */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-1">
        <h2 className="text-xl font-extrabold text-sky-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
          오늘의 공부 페이스 정하기
        </h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          큰 목표부터 작은 조각까지, 5가지 규칙에 맞춰 1:1 맞춤형 타임라인을 만들어드릴게요.
        </p>
      </section>

      {/* 1. Goal Input */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
        <label className="text-xs font-bold text-sky-800 uppercase flex items-center gap-1.5">
          <Flag className="w-4 h-4 text-sky-600" />
          오늘 할 공부 목표
        </label>
        <input
          type="text"
          value={mainGoal}
          onChange={(e) => setMainGoal(e.target.value)}
          placeholder="예: 수학 익힘책 10쪽 풀기 및 영어 단어 30개 암기"
          className="w-full bg-sky-50/60 border border-sky-200 rounded-2xl py-3.5 px-4 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400"
        />
      </section>

      {/* 2. Total Time Picker */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-sky-800 uppercase flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-600" />
            사용 가능한 총 시간
          </label>

          {/* Long term timeline toggle */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !isLongTermPlan;
              setIsLongTermPlan(nextVal);
              if (nextVal) {
                setHours("6");
                setMinutes("00");
              } else {
                setHours("2");
                setMinutes("30");
              }
            }}
            className={`text-xs font-bold px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${
              isLongTermPlan
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            {isLongTermPlan ? '주말/시험기간 긴 시간 플랜 (6~12시간)' : '일반 일일 플랜 (1~4시간)'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center bg-sky-50/60 rounded-2xl px-4 py-3 border border-sky-200">
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="bg-transparent text-slate-800 font-extrabold text-lg w-full text-center focus:outline-none"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="text-xs font-bold text-slate-500 ml-1">시간</span>
          </div>

          <div className="flex items-center bg-sky-50/60 rounded-2xl px-4 py-3 border border-sky-200">
            <select
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="bg-transparent text-slate-800 font-extrabold text-lg w-full text-center focus:outline-none"
            >
              {[0, 15, 20, 30, 45, 50].map((m) => (
                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-xs font-bold text-slate-500 ml-1">분</span>
          </div>
        </div>
      </section>

      {/* 3. Fatigue Level Slider */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-sky-800 uppercase flex items-center gap-1.5">
            <Bolt className="w-4 h-4 text-sky-600" />
            현재 피로도 / 컨디션
          </label>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentFatigueState.color}`}>
            {currentFatigueState.label}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={fatigueLevel}
          onChange={(e) => setFatigueLevel(parseInt(e.target.value))}
          className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between items-center text-xl pt-1 px-1">
          {fatigueStates.map((st, idx) => {
            const isSelected = idx === currentFatigueIndex;
            return (
              <span
                key={idx}
                onClick={() => setFatigueLevel(idx * 25)}
                className={`cursor-pointer transition-transform duration-200 ${
                  isSelected ? 'scale-125 opacity-100' : 'opacity-40 grayscale hover:opacity-80'
                }`}
                title={st.label}
              >
                {st.emoji}
              </span>
            );
          })}
        </div>
      </section>

      {/* 4. Custom Direct Task Input (공부할 거 & 예상 시간 직접 입력) */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-sky-800 uppercase flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-sky-600" />
            오늘 공부할 거 & 예상 공부 시간 직접 입력
          </label>
          <span className="text-[11px] text-slate-400 font-medium">*자신이 더 잘 아는 예상 시간을 직접 설정하세요</span>
        </div>

        {/* Task List */}
        <div className="space-y-2.5">
          {subjects.map((sub) => (
            <div key={sub.id} className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    sub.difficulty === 'HIGH'
                      ? 'bg-rose-100 text-rose-700'
                      : sub.difficulty === 'MEDIUM'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {sub.difficulty === 'HIGH' ? '🔥 HIGH' : sub.difficulty === 'MEDIUM' ? '📘 MEDIUM' : '📗 EASY'}
                  </span>
                  <span className="font-extrabold text-sm text-slate-800">{sub.name}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium pl-0.5">{sub.details}</p>
              </div>

              {/* User Estimated Study Time & Break Time Input */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-[11px] font-bold text-slate-500">공부:</span>
                  <input
                    type="number"
                    min="10"
                    max="360"
                    step="5"
                    value={sub.estimatedMinutes}
                    onChange={(e) => handleUpdateSubjectMins(sub.id, parseInt(e.target.value) || 30)}
                    className="w-12 text-center text-xs font-extrabold text-sky-900 focus:outline-none bg-transparent"
                  />
                  <span className="text-[11px] font-bold text-slate-700">분</span>
                </div>

                <div className="flex items-center gap-1 bg-emerald-50/80 border border-emerald-200 px-2.5 py-1.5 rounded-xl shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-700">☕ 휴식:</span>
                  <select
                    value={sub.breakMinutes}
                    onChange={(e) => handleUpdateSubjectBreakMins(sub.id, parseInt(e.target.value))}
                    className="bg-transparent font-extrabold text-xs text-emerald-900 focus:outline-none"
                  >
                    <option value={0}>휴식 없음</option>
                    <option value={5}>5분</option>
                    <option value={10}>10분</option>
                    <option value={15}>15분</option>
                    <option value={20}>20분</option>
                    <option value={30}>30분</option>
                    <option value={45}>45분</option>
                    <option value={60}>60분 (1시간)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSubject(sub.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new task inputs with Estimated Time and Break Time */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 pt-3">
          <p className="text-xs font-bold text-slate-700">➕ 새 공부 과제 및 유동적 휴식시간 추가하기</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="과목명 (예: 수학)"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              className="col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
            />
            <select
              value={newSubDiff}
              onChange={(e) => setNewSubDiff(e.target.value as DifficultyLevel)}
              className="col-span-1 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-700"
            >
              <option value="HIGH">🔥 어려운 과제 (HIGH)</option>
              <option value="MEDIUM">📘 보통 과제 (MEDIUM)</option>
              <option value="EASY">📗 쉬운 과제 (EASY)</option>
            </select>
            <div className="col-span-1 flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1.5">
              <span className="text-[11px] font-bold text-slate-500 mr-1 whitespace-nowrap">공부:</span>
              <select
                value={newSubMins}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setNewSubMins(val);
                  setNewSubBreakMins(getRecommendedBreakMins(val));
                }}
                className="bg-transparent font-extrabold text-xs text-sky-800 focus:outline-none w-full"
              >
                <option value={30}>30분 공부</option>
                <option value={45}>45분 공부</option>
                <option value={60}>60분 공부 (1시간)</option>
                <option value={90}>90분 공부 (1.5시간)</option>
                <option value={120}>120분 공부 (2시간)</option>
                <option value={180}>180분 공부 (3시간)</option>
                <option value={240}>240분 공부 (4시간)</option>
              </select>
            </div>
            <div className="col-span-1 flex items-center bg-emerald-50/80 border border-emerald-200 rounded-xl px-2 py-1.5 relative">
              <span className="text-[11px] font-bold text-emerald-700 mr-1 whitespace-nowrap">☕ 휴식:</span>
              <select
                value={newSubBreakMins}
                onChange={(e) => setNewSubBreakMins(parseInt(e.target.value))}
                className="bg-transparent font-extrabold text-xs text-emerald-900 focus:outline-none w-full"
              >
                <option value={0}>휴식 없음</option>
                <option value={5}>5분 (추천)</option>
                <option value={10}>10분 (추천)</option>
                <option value={15}>15분 (추천)</option>
                <option value={20}>20분 (추천)</option>
                <option value={30}>30분 (추천)</option>
                <option value={45}>45분 (추천)</option>
                <option value={60}>60분 (1시간 추천)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="세부 공부 내용 (예: 개념서 20~25쪽 문제풀기)"
              value={newSubDetails}
              onChange={(e) => setNewSubDetails(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={handleAddSubject}
              className="bg-sky-600 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1 hover:bg-sky-700 shadow-sm"
            >
              <Plus className="w-4 h-4" /> 추가
            </button>
          </div>
        </div>
      </section>

      {/* 5. Rule Verification Badges */}
      <section className="bg-emerald-50/80 rounded-3xl p-4 border border-emerald-200 space-y-2 text-emerald-900">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          타임라인 자동 적용 규칙 (Rules Enforced)
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-white/80 p-2 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>기본 공부 30분 이상 (30~45분)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 p-2 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>난이도별 맞춤 휴식 (5~15분)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 p-2 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>공부시간 ≥ 휴식시간 × 2 보장</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 p-2 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>어려운 과제 우선배치</span>
          </div>
        </div>
      </section>

      {/* 6. Generate Action Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-sky-600 hover:bg-sky-700 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            1:1 AI 맞춤 타임라인 생성 중...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            맞춤 플랜 만들기
          </>
        )}
      </button>
    </div>
  );
};
