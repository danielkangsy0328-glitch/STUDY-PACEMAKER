import React from 'react';
import { Settings, Sparkles, Flame } from 'lucide-react';
import { UserProfile, StudyStats } from '../types';

interface HeaderProps {
  profile: UserProfile;
  stats: StudyStats;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, stats, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-sky-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mascot Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-sky-300 shadow-sm bg-sky-50 flex-shrink-0">
          <img
            src={profile.avatarIcon}
            alt="Mascot Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              // fallback if network image fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xl pointer-events-none -z-10">
            🤖
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-lg text-sky-900 tracking-tight">Study Pacemaker</h1>
            <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-200">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              {stats.streakDays}일 연속
            </span>
          </div>
          <p className="text-xs text-sky-600 font-medium flex items-center gap-1">
            <span>{profile.name}님</span>
            <span className="text-sky-300">•</span>
            <span className="text-emerald-600 font-semibold">{stats.levelTitle}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full text-sky-700 hover:bg-sky-50 transition-colors active:scale-95"
          title="설정 및 프로필"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
