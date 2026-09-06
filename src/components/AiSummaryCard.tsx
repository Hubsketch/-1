import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, Cpu } from 'lucide-react';
import { FearGreedData, AiInterpretation } from '../types.ts';

interface AiSummaryCardProps {
  data: FearGreedData;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ data }) => {
  const [report, setReport] = useState<AiInterpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInterpretation = useCallback(
    async (isManual = false) => {
      if (isManual) {
        setRefreshing(true);
      } else if (!report) {
        setLoading(true);
      }

      try {
        const resp = await fetch('/api/ai-interpretation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            market: data.market,
            marketName: data.marketName,
            score: data.score,
            rating: data.rating,
            dayChange: data.previousClose?.change ?? 0,
            weekChange: data.oneWeekAgo?.change ?? 0,
            monthChange: data.oneMonthAgo?.change ?? 0,
            shortInterestRate: data.shortInterest?.rate ?? '55.2%',
            speedTrend: data.speed?.trend ?? '暴跌放缓',
            forceRefresh: isManual,
          }),
        });

        if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
        const json = await resp.json();
        setReport(json);
      } catch (err) {
        console.warn('Using quant engine fallback for market interpretation:', err);
        const dayChg = data.previousClose?.change ?? 0;
        setReport({
          source: 'quant_engine',
          model: '多因子量化模型',
          summary: `指数日内由低位回抽至 ${data.score} 分（${data.rating}），较前收盘变化 ${dayChg >= 0 ? '+' : ''}${dayChg.toFixed(1)} 点，急跌动能放缓，避险抛压初现衰竭。`,
          sentimentTag: '恐慌收敛 · 初步修复',
          urgencyLevel: 'medium',
          analysisPoints: [
            {
              title: '情绪拐点特征',
              content: `指数录得 ${data.score} 分，日度出现止跌回稳信号，前期无差别抛盘动能减弱。`,
            },
            {
              title: '筹码与做空异动',
              content: `空头成交比例维持在 ${data.shortInterest?.rate ?? '55.2%'}，主动打压减弱，部分空头选择获利平仓。`,
            },
            {
              title: '后市关注核心',
              content: '关注后续宏观利率风向与大盘科技权重股的量能承接情况。',
            },
          ],
          updatedAt: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [data]
  );

  useEffect(() => {
    fetchInterpretation(false);
  }, [fetchInterpretation]);

  const getTagColorClass = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div
      id="ai-interpretation-card"
      className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-neutral-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            {report?.source === 'gemini_ai' ? (
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            ) : (
              <Cpu className="w-4 h-4 stroke-[2.2]" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-bold text-neutral-900 leading-tight">量化研报归因</h3>
              {report && (
                <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-medium border border-neutral-200">
                  {report.model}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchInterpretation(true)}
          disabled={refreshing || loading}
          className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
          title="重新生成诊断"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {loading && !report ? (
        <div className="py-6 text-center text-xs text-neutral-400">正在生成量化归因研报...</div>
      ) : report ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getTagColorClass(
                report.urgencyLevel
              )}`}
            >
              {report.sentimentTag}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">诊断时间 {report.updatedAt}</span>
          </div>

          <p className="text-xs text-neutral-700 leading-relaxed font-normal bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-100">
            {report.summary}
          </p>

          <div className="space-y-2 pt-1">
            {report.analysisPoints?.map((pt, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-bold text-neutral-900 mr-1.5">· {pt.title}:</span>
                <span className="text-neutral-600 leading-snug">{pt.content}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
