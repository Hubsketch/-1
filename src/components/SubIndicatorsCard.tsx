import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { SubIndicator, MarketType } from '../types.ts';

interface SubIndicatorsCardProps {
  subIndicators: SubIndicator[];
  market: MarketType;
}

export const SubIndicatorsCard: React.FC<SubIndicatorsCardProps> = ({
  subIndicators,
  market = 'us',
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!subIndicators || subIndicators.length === 0) return null;

  const displayList = expanded ? subIndicators : subIndicators.slice(0, 3);

  const title =
    market === 'crypto'
      ? `${subIndicators.length} 大核心情绪指标`
      : market === 'kospi'
      ? `KOSPI 信号分解 (${subIndicators.length}项)`
      : '7 大核心实时分项指标';

  const subtitle =
    market === 'crypto'
      ? '综合链上波动率、永续合约费率、主导地位及社交情绪'
      : market === 'kospi'
      ? 'KRX 韩国交易所、外资筹码流向与综合宏观模型信号分解'
      : 'CNN 官方实时采集的 7 个底层驱动数据源';

  const getScoreBadgeClass = (score: number) => {
    if (score <= 25) return 'bg-rose-50 text-rose-700';
    if (score <= 45) return 'bg-amber-50 text-amber-700';
    if (score <= 55) return 'bg-neutral-100 text-neutral-700';
    if (score <= 75) return 'bg-emerald-50 text-emerald-700';
    return 'bg-blue-50 text-blue-700';
  };

  const getProgressColor = (score: number) => {
    if (score <= 25) return '#e53e3e';
    if (score <= 45) return '#e07a14';
    if (score <= 55) return '#ecc94b';
    if (score <= 75) return '#38a169';
    return '#2b6cb0';
  };

  return (
    <div
      id="sub-indicators-card"
      className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80 transition-all"
    >
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-bold text-neutral-900 leading-none">{title}</h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold border border-emerald-200">
                实时采集
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-600 font-medium flex items-center space-x-1 hover:text-blue-700 py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <span>{expanded ? '收起' : `展开全部 (${subIndicators.length})`}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="divide-y divide-neutral-100 mt-1">
        {displayList.map((item) => (
          <div key={item.id} className="py-2.5 first:pt-2 last:pb-1">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="text-xs font-bold text-neutral-900 shrink-0">{item.name}</span>
                <span className="text-[10px] text-neutral-400 truncate hidden sm:inline">
                  ({item.nameEn})
                </span>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className="text-xs font-black font-mono text-neutral-900">{item.score}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getScoreBadgeClass(
                    item.score
                  )}`}
                >
                  {item.rating}
                </span>
              </div>
            </div>

            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(3, Math.min(100, item.score))}%`,
                  backgroundColor: item.color || getProgressColor(item.score),
                }}
              />
            </div>

            <p className="text-[11px] text-neutral-500 leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
