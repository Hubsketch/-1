import React from 'react';
import { SimilarMoments, MarketType } from '../types.ts';

interface HistoricalMomentsCardProps {
  data: SimilarMoments;
  market?: MarketType;
  onOpenDetail?: () => void;
}

export const HistoricalMomentsCard: React.FC<HistoricalMomentsCardProps> = ({
  data,
  market = 'us',
  onOpenDetail,
}) => {
  const symbol = market === 'crypto' ? 'BTC' : market === 'kospi' ? 'KOSPI' : 'S&P';

  return (
    <div
      id="historical-moments-card"
      className="bg-[#f2f3f7] rounded-3xl p-4 sm:p-5 border border-neutral-200/60 shadow-xs transition-shadow hover:shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">历史上的相似时刻</h3>
        <span className="text-xs text-neutral-400 font-medium">
          当前 {data.scoreStats.currentScore}分
        </span>
      </div>

      {/* Key Lows */}
      {data.keyLows && data.keyLows.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-neutral-400 font-medium mb-2.5">如果在关键低点买入</div>
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-100/80 divide-y divide-neutral-100">
            {data.keyLows.map((item, idx) => (
              <div
                key={idx}
                className="py-2.5 first:pt-0 last:pb-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={onOpenDetail}
              >
                <div className="font-bold text-sm text-neutral-900 tracking-tight leading-snug">
                  {item.name} — {item.score}分
                </div>
                <div className="text-xs text-neutral-500 font-medium mt-1">
                  1年回报 {symbol} {item.return1Y}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Intervals */}
      {data.similarIntervals && data.similarIntervals.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-neutral-400 font-medium mb-2.5 mt-4">相似区间</div>
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-100/80 divide-y divide-neutral-100">
            {data.similarIntervals.map((item, idx) => (
              <div
                key={idx}
                className="py-2.5 first:pt-0 last:pb-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={onOpenDetail}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900 tracking-tight leading-snug">
                    {item.name} — {item.score}分
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-md font-medium tracking-wide shrink-0 ${
                        item.badge === '非常相似' || item.badge === '相似'
                          ? 'bg-amber-100/80 text-amber-700'
                          : 'bg-amber-50 text-amber-700/80 border border-amber-100/80'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-500 font-medium mt-1">
                  1年回报 {symbol} {item.return1Y}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Average Stats */}
      {data.scoreStats && (
        <div className="pt-3 mt-1">
          <div className="flex items-start justify-between">
            <div className="font-bold text-sm text-neutral-900">
              {data.scoreStats.currentScore}分的平均值
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-neutral-900 leading-none">
                {data.scoreStats.avgReturn}
              </span>
              <div className="text-[11px] text-neutral-400 font-medium mt-1">
                1年平均回报 · 样本 {data.scoreStats.sampleCount}次
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-200/50">
            <div className="bg-white/70 p-2.5 rounded-xl border border-neutral-100">
              <div className="text-[10px] text-neutral-400 font-medium">历史最大回撤</div>
              <div className="text-xs font-bold text-neutral-800 mt-0.5">
                {data.scoreStats.maxDrawdown}
              </div>
            </div>
            <div className="bg-white/70 p-2.5 rounded-xl border border-neutral-100">
              <div className="text-[10px] text-neutral-400 font-medium">历史最佳表现</div>
              <div className="text-xs font-bold text-neutral-800 mt-0.5">
                {data.scoreStats.bestReturn}
              </div>
            </div>
          </div>

          {data.scoreStats.disclaimer && (
            <p className="text-[10px] text-neutral-400 text-center mt-3 font-normal">
              {data.scoreStats.disclaimer}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
