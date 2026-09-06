import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ComparisonData {
  score: number;
  change: number;
}

interface ComparisonCardProps {
  previousClose: ComparisonData;
  oneWeekAgo: ComparisonData;
  oneMonthAgo: ComparisonData;
  oneYearAgo: ComparisonData;
}

function getScoreColorClass(score: number): string {
  if (score <= 24) return 'text-red-500';
  if (score <= 44) return 'text-amber-500';
  if (score <= 54) return 'text-yellow-600';
  if (score <= 74) return 'text-emerald-500';
  return 'text-teal-600';
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  previousClose,
  oneWeekAgo,
  oneMonthAgo,
  oneYearAgo,
}) => {
  const items = [
    { label: '前一日', data: previousClose },
    { label: '1周前', data: oneWeekAgo },
    { label: '1个月前', data: oneMonthAgo },
    { label: '1年前', data: oneYearAgo },
  ];

  return (
    <div
      id="comparison-card"
      className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80 transition-shadow hover:shadow-sm"
    >
      <h3 className="text-base font-bold text-neutral-900 mb-3">比较</h3>
      <div className="grid grid-cols-4 gap-2 text-center">
        {items.map((item, idx) => {
          const isUp = item.data.change >= 0;
          const absVal = Math.abs(item.data.change);
          return (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-xs text-neutral-400 font-medium mb-1.5">{item.label}</span>
              <span className={`text-2xl font-bold ${getScoreColorClass(item.data.score)} leading-tight`}>
                {item.data.score}
              </span>
              <div
                className={`flex items-center text-xs font-semibold mt-1 ${
                  isUp ? 'text-emerald-500' : 'text-red-400'
                }`}
              >
                {isUp ? (
                  <ArrowUp className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                )}
                <span>{absVal}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
