import React, { useState } from 'react';
import { User, Shield, Volume2, RotateCcw, Check, LogOut, KeyRound } from 'lucide-react';
import { UserProfile, StudyStats } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  stats: StudyStats;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, stats, onUpdateProfile, onResetData, onLogout }) => {
  const [name, setName] = useState(profile.name);
  const [grade, setGrade] = useState(profile.grade);
  const [targetGoal, setTargetGoal] = useState(profile.targetGoal);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      name,
      grade,
      targetGoal,
      soundEnabled
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28 max-w-2xl mx-auto">
      {/* Profile Card */}
      <section className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
          <img src={profile.avatarIcon} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-xs font-bold px-2.5 py-0.5 bg-white/20 rounded-full inline-block mb-1">
            {stats.levelTitle}
          </span>
          <h2 className="text-xl font-black">{profile.name} 학생</h2>
          <p className="text-xs text-sky-100 font-medium">{profile.grade} • {profile.targetGoal}</p>
        </div>
      </section>

      {/* Edit Form */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
          <User className="w-4 h-4 text-sky-600" />
          내 정보 수정
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-600 mb-1 block">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 mb-1 block">학년</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 mb-1 block">나의 공부 목표</label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-sm"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" /> 저장되었습니다!
            </>
          ) : (
            '변경 사항 저장'
          )}
        </button>
      </section>

      {/* Preferences */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-sky-600" />
          앱 설정 및 알림
        </h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <span className="font-bold text-slate-700">효과음 및 완수 알림</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 ${soundEnabled ? 'bg-sky-600' : 'bg-slate-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      {/* Account Management & Logout */}
      <section className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-sky-600" />
          내 계정 관리
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          현재 로그인 계정: <span className="font-bold text-slate-800">{profile.name}</span>
        </p>
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-500" /> 로그아웃 / 다른 계정 로그인
          </button>
        )}
      </section>

      {/* Danger Zone / Reset */}
      <section className="bg-rose-50/50 rounded-3xl p-5 border border-rose-100 space-y-2">
        <h3 className="font-bold text-xs text-rose-800 flex items-center gap-1.5 uppercase">
          <Shield className="w-4 h-4 text-rose-600" />
          데이터 관리
        </h3>
        <p className="text-xs text-rose-600 font-medium leading-relaxed">
          샘플 데이터로 초기화하거나 모든 공부 기록을 다시 설정할 수 있습니다.
        </p>
        <button
          onClick={onResetData}
          className="bg-white text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 초기화하기
        </button>
      </section>
    </div>
  );
};
