import React from 'react';
import { Calendar, Target, Clock, BarChart3, User, Plus } from 'lucide-react';

export type TabType = 'today' | 'generator' | 'timeline' | 'stats' | 'profile';

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onQuickCreate: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onChangeTab, onQuickCreate }) => {
  const tabs = [
    { id: 'today' as TabType, label: 'Today', icon: Calendar },
    { id: 'generator' as TabType, label: 'Goals', icon: Target },
    { id: 'timeline' as TabType, label: 'Timeline', icon: Clock },
    { id: 'stats' as TabType, label: 'Progress', icon: BarChart3 },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Floating Action Button (+) for quick plan creation when on Today view */}
      {activeTab === 'today' && (
        <button
          onClick={onQuickCreate}
          className="fixed bottom-20 right-5 z-40 w-14 h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg shadow-sky-600/30 flex items-center justify-center transition-all duration-200 active:scale-90"
          title="새 공부 목표 설정하기"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-sky-100 px-3 py-2 flex justify-around items-center max-w-2xl mx-auto shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-sky-100 text-sky-800 font-bold scale-105'
                  : 'text-slate-500 hover:text-sky-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[11px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
