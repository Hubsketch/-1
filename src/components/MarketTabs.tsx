import React from 'react';
import { MarketType } from '../types.ts';

interface MarketTabsProps {
  activeMarket: MarketType;
  onChangeMarket: (market: MarketType) => void;
}

export const MarketTabs: React.FC<MarketTabsProps> = ({ activeMarket, onChangeMarket }) => {
  const tabs: Array<{ id: MarketType; label: string }> = [
    { id: 'us', label: '市场' },
    { id: 'kospi', label: '韩国综合' },
    { id: 'crypto', label: '加密货币' },
  ];

  return (
    <div id="market-tabs" className="bg-neutral-200/70 rounded-xl p-1 flex items-center mx-4 mb-3 shadow-xs">
      {tabs.map((tab) => {
        const isActive = activeMarket === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeMarket(tab.id)}
            className={`relative flex-1 py-2 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${
              isActive
                ? 'text-blue-600 bg-white shadow-xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-blue-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
