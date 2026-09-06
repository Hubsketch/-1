import React from 'react';
import { Gauge, LineChart, TrendingUp, Settings } from 'lucide-react';
import { MainTabType } from '../types.ts';

interface BottomNavProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  hasUnreadAlerts?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  hasUnreadAlerts = false,
}) => {
  const tabs: Array<{ id: MainTabType; label: string; icon: any }> = [
    { id: 'home', label: '首页', icon: Gauge },
    { id: 'charts', label: '图表', icon: LineChart },
    { id: 'etf', label: 'ETF', icon: TrendingUp },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#f6f7f9]/95 backdrop-blur-md border-t border-neutral-200/80 max-w-md mx-auto"
    >
      <div className="flex items-center justify-around py-2 px-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive ? 'text-blue-600 font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.id === 'settings' && hasUnreadAlerts && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
