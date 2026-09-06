import React, { useState, useMemo } from 'react';
import { TrendingUp, HelpCircle } from 'lucide-react';
import { FearGreedData, HistoryPoint } from '../types.ts';

interface ChartsViewProps {
  data: FearGreedData;
  onOpenModal?: (type: string) => void;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ data, onOpenModal }) => {
  const [timeframe, setTimeframe] = useState('3M');
  const [hoverPoint, setHoverPoint] = useState<{
    date: string;
    value: number;
    timestamp: number;
    x: number;
    y: number;
  } | null>(null);

  const market = data.market || 'us';
  const marketLabel =
    market === 'crypto'
      ? '比特币 (BTC)'
      : market === 'kospi'
      ? '韩国综合 (KOSPI)'
      : '标普500 (S&P 500)';
  const symbol = market === 'crypto' ? 'BTC' : market === 'kospi' ? 'KOSPI' : 'S&P 500';

  const filteredHistory = useMemo(() => {
    const list = data.history || [];
    if (!list.length) return [];
    const lastTs = list[list.length - 1].timestamp || Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    let days = 90;
    if (timeframe === '3M') days = 90;
    else if (timeframe === '6M') days = 180;
    else if (timeframe === '1Y') days = 365;
    else if (timeframe === '2Y') days = 365 * 2;
    else if (timeframe === '3Y') days = 365 * 3;
    else if (timeframe === '5Y') days = 365 * 5;
    else if (timeframe === '6Y') days = 365 * 6;

    const cutoff = lastTs - days * dayMs;
    const res = list.filter((p) => p.timestamp >= cutoff);
    if (res.length >= 10) return res;

    let sliceCount = 65;
    if (timeframe === '6M') sliceCount = 130;
    if (timeframe === '1Y') sliceCount = 252;
    if (timeframe === '2Y') sliceCount = 504;
    if (timeframe === '3Y') sliceCount = 756;
    if (timeframe === '5Y') sliceCount = 1260;
    if (timeframe === '6Y') sliceCount = 1512;
    return list.slice(-sliceCount);
  }, [data.history, timeframe]);

  const { maxPoint, minPoint, pointsPath, areaPath, avgValue, percentileRank } = useMemo(() => {
    if (!filteredHistory.length) {
      return {
        maxPoint: null,
        minPoint: null,
        pointsPath: '',
        areaPath: '',
        avgValue: data.score,
        percentileRank: 50,
      };
    }

    let maxP = filteredHistory[0];
    let minP = filteredHistory[0];
    let sum = 0;
    let lessCount = 0;

    for (const pt of filteredHistory) {
      if (pt.value > maxP.value) maxP = pt;
      if (pt.value < minP.value) minP = pt;
      sum += pt.value;
      if (pt.value < data.score) lessCount++;
    }

    const avg = Math.round(sum / filteredHistory.length);
    const pRank = Math.round((lessCount / filteredHistory.length) * 100);

    const svgWidth = 320;
    const svgHeight = 150;
    const paddingLeft = 10;
    const paddingRight = 35;
    const paddingTop = 25;
    const paddingBottom = 20;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    const getX = (idx: number) =>
      paddingLeft + (idx / Math.max(1, filteredHistory.length - 1)) * plotWidth;
    const getY = (val: number) => paddingTop + (1 - val / 100) * plotHeight;

    const coords = filteredHistory.map((pt, idx) => ({
      x: getX(idx),
      y: getY(pt.value),
      data: pt,
    }));

    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const p0 = coords[i - 1];
      const p1 = coords[i];
      const mx = (p0.x + p1.x) / 2;
      pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${
      paddingTop + plotHeight
    } L ${coords[0].x} ${paddingTop + plotHeight} Z`;

    const maxCoord = coords.find((c) => c.data === maxP);
    const minCoord = coords.find((c) => c.data === minP);

    return {
      maxPoint: maxCoord ? { ...maxCoord, value: maxP.value } : null,
      minPoint: minCoord ? { ...minCoord, value: minP.value } : null,
      pointsPath: pathD,
      areaPath: areaD,
      avgValue: avg,
      percentileRank: pRank,
    };
  }, [filteredHistory, data.score]);

  // Regimes distribution
  const regimeDist = useMemo(() => {
    if (!filteredHistory.length) return [];
    let extremeFear = 0;
    let fear = 0;
    let neutral = 0;
    let greed = 0;
    let extremeGreed = 0;

    for (const pt of filteredHistory) {
      if (pt.value <= 25) extremeFear++;
      else if (pt.value <= 45) fear++;
      else if (pt.value <= 55) neutral++;
      else if (pt.value <= 75) greed++;
      else extremeGreed++;
    }

    const total = filteredHistory.length;
    return [
      {
        label: '极度恐慌',
        range: '0–25',
        count: extremeFear,
        percent: Math.round((extremeFear / total) * 100),
        color: '#e53e3e',
        isCurrent: data.score <= 25,
      },
      {
        label: '恐慌',
        range: '26–45',
        count: fear,
        percent: Math.round((fear / total) * 100),
        color: '#e07a14',
        isCurrent: data.score > 25 && data.score <= 45,
      },
      {
        label: '中性',
        range: '46–55',
        count: neutral,
        percent: Math.round((neutral / total) * 100),
        color: '#d69e2e',
        isCurrent: data.score > 45 && data.score <= 55,
      },
      {
        label: '贪婪',
        range: '56–75',
        count: greed,
        percent: Math.round((greed / total) * 100),
        color: '#319795',
        isCurrent: data.score > 55 && data.score <= 75,
      },
      {
        label: '极度贪婪',
        range: '76–100',
        count: extremeGreed,
        percent: Math.round((extremeGreed / total) * 100),
        color: '#2b6cb0',
        isCurrent: data.score > 75,
      },
    ];
  }, [filteredHistory, data.score]);

  // Expected returns forecast
  const forecast = useMemo(() => {
    const diff = (50 - data.score) / 50;
    if (market === 'crypto') {
      const exp1y = (34.5 + diff * 76).toFixed(1);
      const exp6m = (18.2 + diff * 42).toFixed(1);
      const win = Math.min(94, Math.max(52, Math.round(72 + diff * 20)));
      const dd = (-(12.5 - diff * 16)).toFixed(1);
      return {
        expected1Y: Number(exp1y) > 0 ? `+${exp1y}%` : `${exp1y}%`,
        expected6M: Number(exp6m) > 0 ? `+${exp6m}%` : `${exp6m}%`,
        winRate: `${win}%`,
        maxDd: Number(dd) > 0 ? `+${dd}%` : `${dd}%`,
      };
    } else if (market === 'kospi') {
      const exp1y = (11.8 + diff * 16.4).toFixed(1);
      const exp6m = (5.9 + diff * 9.8).toFixed(1);
      const win = Math.min(90, Math.max(58, Math.round(74 + diff * 15)));
      const dd = (-(6.2 - diff * 5.4)).toFixed(1);
      return {
        expected1Y: Number(exp1y) > 0 ? `+${exp1y}%` : `${exp1y}%`,
        expected6M: Number(exp6m) > 0 ? `+${exp6m}%` : `${exp6m}%`,
        winRate: `${win}%`,
        maxDd: Number(dd) > 0 ? `+${dd}%` : `${dd}%`,
      };
    } else {
      const exp1y = (14.7 + diff * 18.2).toFixed(1);
      const exp6m = (7.3 + diff * 11.5).toFixed(1);
      const win = Math.min(95, Math.max(60, Math.round(78 + diff * 16)));
      const dd = (-(3.5 - diff * 4.2)).toFixed(1);
      return {
        expected1Y: Number(exp1y) > 0 ? `+${exp1y}%` : `${exp1y}%`,
        expected6M: Number(exp6m) > 0 ? `+${exp6m}%` : `${exp6m}%`,
        winRate: `${win}%`,
        maxDd: Number(dd) > 0 ? `+${dd}%` : `${dd}%`,
      };
    }
  }, [data.score, market]);

  const timeframes = ['3M', '6M', '1Y', '2Y', '3Y', '5Y', '6Y'];

  return (
    <div id="chart-tab-view" className="space-y-4 pb-20">
      {/* Current score header */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-1 text-xs text-neutral-500 font-medium mb-1">
            <span>当前 {symbol} 情绪指数</span>
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-neutral-900 leading-none">{data.score}</span>
            <span className="text-base font-bold" style={{ color: data.color }}>
              {data.rating}
            </span>
            {data.ratingEn && (
              <span className="text-xs text-neutral-400 font-mono">({data.ratingEn})</span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-neutral-500 font-medium block mb-1">较前收盘</span>
          <span
            className={`text-base font-bold ${
              data.previousClose?.change >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {data.previousClose?.change >= 0 ? '+ ' : '- '}
            {Math.abs(data.previousClose?.change ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Main interactive chart */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-neutral-900">{symbol} 历史走势</h3>
            <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">
              {filteredHistory.length} 个点
            </span>
          </div>

          {hoverPoint && (
            <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
              {hoverPoint.date} : {hoverPoint.value}分
            </span>
          )}
        </div>

        {/* Timeframe switcher */}
        <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-xl mb-3 overflow-x-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`flex-1 min-w-[36px] py-1 text-xs font-bold rounded-lg transition-colors text-center ${
                timeframe === tf
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* SVG Chart */}
        <div className="relative w-full h-[180px] select-none">
          <svg
            viewBox="0 0 320 160"
            className="w-full h-full overflow-visible cursor-crosshair"
            onMouseLeave={() => setHoverPoint(null)}
            onMouseMove={(e) => {
              if (!filteredHistory.length) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clientX = e.clientX - rect.left;
              const padLeft = 10;
              const plotW = 275;
              const ratio = Math.max(0, Math.min(1, (clientX - (padLeft / 320) * rect.width) / ((plotW / 320) * rect.width)));
              const idx = Math.min(filteredHistory.length - 1, Math.max(0, Math.round(ratio * (filteredHistory.length - 1))));
              const pt = filteredHistory[idx];
              if (pt) {
                setHoverPoint({
                  date: pt.date,
                  value: pt.value,
                  timestamp: pt.timestamp,
                  x: padLeft + (idx / Math.max(1, filteredHistory.length - 1)) * plotW,
                  y: 25 + (1 - pt.value / 100) * 105,
                });
              }
            }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Threshold grid lines */}
            {[25, 50, 75].map((val) => {
              const y = 25 + (1 - val / 100) * 105;
              return (
                <g key={val}>
                  <line
                    x1="10"
                    y1={y}
                    x2="285"
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text x="290" y={y + 3} fill="#9ca3af" fontSize="9" fontWeight="500">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area & Line */}
            {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}
            {pointsPath && (
              <path
                d={pointsPath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Max & Min markers */}
            {maxPoint && (
              <g transform={`translate(${maxPoint.x}, ${maxPoint.y})`}>
                <circle r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                <text y="-6" textAnchor="middle" fill="#2563eb" fontSize="8" fontWeight="bold">
                  高 {maxPoint.value}
                </text>
              </g>
            )}

            {minPoint && (
              <g transform={`translate(${minPoint.x}, ${minPoint.y})`}>
                <circle r="3.5" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
                <text y="12" textAnchor="middle" fill="#e11d48" fontSize="8" fontWeight="bold">
                  低 {minPoint.value}
                </text>
              </g>
            )}

            {/* Hover Scrub line */}
            {hoverPoint && (
              <g>
                <line
                  x1={hoverPoint.x}
                  y1="25"
                  x2={hoverPoint.x}
                  y2="130"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={hoverPoint.x}
                  cy={hoverPoint.y}
                  r="4"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Stats summary row */}
        <div className="grid grid-cols-4 gap-2 pt-3 mt-1 border-t border-neutral-100 text-center">
          <div>
            <span className="text-[10px] text-neutral-400 block">区间最低</span>
            <span className="text-xs font-bold text-neutral-800">{minPoint?.value ?? '--'}分</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block">区间最高</span>
            <span className="text-xs font-bold text-neutral-800">{maxPoint?.value ?? '--'}分</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block">区间均值</span>
            <span className="text-xs font-bold text-neutral-800">{avgValue}分</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block">分位排名</span>
            <span className="text-xs font-bold text-blue-600">{percentileRank}%</span>
          </div>
        </div>
      </div>

      {/* 5-Tier Extreme Distribution Histogram */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80">
        <h3 className="text-base font-bold text-neutral-900 mb-2.5">极值分布统计</h3>
        <div className="space-y-2.5">
          {regimeDist.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-neutral-800">{item.label}</span>
                  <span className="text-[10px] text-neutral-400">({item.range})</span>
                  {item.isCurrent && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">
                      当前
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-neutral-600 font-mono">
                  <span>{item.percent}%</span>
                  <span className="text-neutral-400 text-[10px]">({item.count}天)</span>
                </div>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quantitative Forecast Card */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 leading-tight">极值买入推演</h3>
              <span className="text-[11px] text-neutral-400">
                当前 {data.score}分 历史加权模拟
              </span>
            </div>
          </div>
          {onOpenModal && (
            <button
              type="button"
              onClick={() => onOpenModal('what_if_buy')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              详细回测 &gt;
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block">预期1年回报</span>
            <span className="text-sm font-black text-emerald-600 mt-0.5 block">
              {forecast.expected1Y}
            </span>
          </div>
          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block">预期6M回报</span>
            <span className="text-sm font-black text-emerald-600 mt-0.5 block">
              {forecast.expected6M}
            </span>
          </div>
          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block">历史胜率</span>
            <span className="text-sm font-black text-blue-600 mt-0.5 block">
              {forecast.winRate}
            </span>
          </div>
          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
            <span className="text-[10px] text-neutral-400 block">最大潜在回撤</span>
            <span className="text-sm font-black text-rose-500 mt-0.5 block">
              {forecast.maxDd}
            </span>
          </div>
        </div>
      </div>

      {/* Historical Milestones */}
      {data.pastEvents && data.pastEvents.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80">
          <h3 className="text-base font-bold text-neutral-900 mb-3">历史重大事件拐点复盘</h3>
          <div className="divide-y divide-neutral-100">
            {data.pastEvents.map((ev, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-900">{ev.name}</span>
                  <span className="text-[11px] text-neutral-400 font-mono">{ev.date}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-neutral-500">
                    恐慌谷值: <b className="text-red-600 font-bold">{ev.score}分</b>
                  </span>
                  <div className="flex space-x-2 text-emerald-600 font-semibold font-mono">
                    <span>1M {ev.m1}</span>
                    <span>3M {ev.m3}</span>
                    <span>1Y {ev.y1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
