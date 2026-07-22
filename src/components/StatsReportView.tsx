import React from 'react';
import { BarChart3, Flame, Trophy, Award, Sparkles, TrendingUp, Zap, Clock, Brain } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { StudyStats } from '../types';
import { formatMinutes } from '../lib/plannerEngine';

interface StatsReportViewProps {
  stats: StudyStats;
}

export const StatsReportView: React.FC<StatsReportViewProps> = ({ stats }) => {
  return (
    <div className="space-y-6 pb-28 max-w-2xl mx-auto">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-r from-indigo-600 to-sky-600 text-white rounded-3xl p-5 shadow-sm space-y-2">
        <div className="flex justify-between items-center">
          <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-sm flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            공부 습관 분석 리포트
          </span>
          <span className="text-xs bg-amber-300 text-amber-950 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-950" />
            {stats.streakDays}일 연속
          </span>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight">나의 학습 습관 리포트 📊</h2>
        <p className="text-xs text-sky-100 font-medium">
          꾸준한 20~30분 분할 학습과 스마트 휴식이 만든 멋진 성과예요!
        </p>
      </section>

      {/* 2. Key Metrics Grid */}
      <section className="grid grid-cols-2 gap-3.5">
        <div className="bg-white rounded-3xl p-4 border border-sky-100 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">완수한 목표 과제</p>
            <p className="text-lg font-black text-slate-800">{stats.totalCompletedTasks}개</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-sky-100 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
            <Clock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">총 공부 시간</p>
            <p className="text-lg font-black text-slate-800">{formatMinutes(stats.totalStudyMinutes)}</p>
          </div>
        </div>
      </section>

      {/* 3. Weekly Study Time Chart */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            주간 공부 시간 추이 (분)
          </h3>
          <span className="text-xs text-slate-400 font-medium">최근 7일</span>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyLogs}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis hide />
              <Tooltip
                formatter={(val: number) => [`${val}분 (${Math.floor(val / 60)}시간 ${val % 60}분)`, '공부 시간']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="studyMinutes" radius={[8, 8, 0, 0]}>
                {stats.weeklyLogs.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === stats.weeklyLogs.length - 1 ? '#0058bd' : '#93c5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. Subject Distribution Breakdown */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-sky-600" />
          과목별 진도율 및 몰입 비율
        </h3>

        {stats.subjectStats.length === 0 ? (
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-center space-y-1">
            <p className="text-xs font-bold text-sky-900">아직 등록된 공부 과제가 없어요 ✏️</p>
            <p className="text-[11px] text-slate-500 font-medium">오늘의 과제를 직접 설정하고 타임라인을 시작하면 과목별 공부 기록이 표시됩니다!</p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {stats.subjectStats.map((sub, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{sub.subject}</span>
                  <span className="text-sky-700">{formatMinutes(sub.minutes)} ({sub.completionRate}% 달성)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${sub.completionRate}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Habit Coaching Insights */}
      <section className="bg-gradient-to-br from-amber-50 to-sky-50 rounded-3xl p-5 border border-amber-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
          페이스메이커의 공부 습관 분석 피드백
        </div>

        {stats.totalCompletedTasks === 0 ? (
          <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-100 text-xs text-slate-700 leading-relaxed font-medium flex items-start gap-2.5">
            <span className="text-base">🚀</span>
            <div>
              <strong className="text-slate-900 font-bold block mb-0.5">첫 공부를 시작해보세요!</strong>
              오늘의 공부 목표와 과제를 작성하고 첫 세션을 완수하면, 1:1 페이스메이커가 몰입 패턴과 휴식 준수율을 실시간으로 코칭해드려요! ✨
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed font-medium">
            <div className="bg-white/80 p-3 rounded-2xl border border-amber-100 flex items-start gap-2.5">
              <span className="text-base">🎯</span>
              <div>
                <strong className="text-slate-900 font-bold block mb-0.5">실시간 학습 과제 완수율</strong>
                오늘 목표 과제 중 <span className="text-sky-700 font-black">{stats.totalCompletedTasks}개 과제</span>를 성실히 완료했어요! 총 <span className="text-emerald-600 font-extrabold">{formatMinutes(stats.totalStudyMinutes)}</span> 몰입에 성공했습니다.
              </div>
            </div>

            <div className="bg-white/80 p-3 rounded-2xl border border-amber-100 flex items-start gap-2.5">
              <span className="text-base">☕</span>
              <div>
                <strong className="text-slate-900 font-bold block mb-0.5">2:1 공부/휴식 황금 비율</strong>
                공부와 5~10분 세분화 휴식의 균형을 유지하여 뇌에 과부하가 걸리지 않도록 페이스를 조절하고 있어요.
              </div>
            </div>

            <div className="bg-white/80 p-3 rounded-2xl border border-amber-100 flex items-start gap-2.5">
              <span className="text-base">⚡</span>
              <div>
                <strong className="text-slate-900 font-bold block mb-0.5">현재 러너 등급</strong>
                꾸준함이 쌓여 <span className="text-amber-600 font-extrabold">{stats.levelTitle}</span> 달성! 이 기세로 계속 도전해봐요! 🔥
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 6. Achievement Badges */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-sky-600" />
          획득한 학습 업적 뱃지
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {stats.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-2.5 transition-all ${
                badge.unlocked
                  ? 'bg-sky-50/50 border-sky-200'
                  : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
              }`}
            >
              <div className={`p-2 rounded-xl text-lg ${badge.unlocked ? 'bg-sky-100 text-sky-700' : 'bg-slate-200'}`}>
                🏆
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-800">{badge.title}</h4>
                <p className="text-[11px] text-slate-500 leading-tight">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
