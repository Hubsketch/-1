import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Clock, PieChart, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ETF_LIST } from '../data/etfs.ts';
import { FearGreedData, ETFItem } from '../types.ts';

interface EtfViewProps {
  data: FearGreedData;
}

export const EtfView: React.FC<EtfViewProps> = ({ data }) => {
  const [selectedTicker, setSelectedTicker] = useState('QQQ');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [userVote, setUserVote] = useState<'buy' | 'wait' | 'sell' | null>(null);
  const [pollCounts, setPollCounts] = useState({ buy: 142, wait: 88, sell: 39 });

  const categories = [
    '全部',
    '美股大盘',
    '杠杆做多',
    '反向做空',
    '行业半导体',
    '债券黄金',
    '加密资产',
    '韩国资产',
  ];

  const currentEtf = useMemo(() => {
    return ETF_LIST.find((e) => e.ticker === selectedTicker) || ETF_LIST[0];
  }, [selectedTicker]);

  // Fetch live quote & history for current ETF
  useEffect(() => {
    let isMounted = true;
    async function loadEtf() {
      try {
        const [qRes, hRes] = await Promise.all([
          fetch(`/api/etf/quote?ticker=${selectedTicker}`),
          fetch(`/api/etf/history?ticker=${selectedTicker}`),
        ]);
        if (qRes.ok) {
          const qJson = await qRes.json();
          if (isMounted) setQuote(qJson);
        }
        if (hRes.ok) {
          const hJson = await hRes.json();
          if (isMounted) setHistory(hJson);
        }
      } catch (err) {
        console.warn('Error fetching ETF data:', err);
      }
    }
    loadEtf();
    const interval = setInterval(loadEtf, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedTicker]);

  // Filtered ETF list for selector
  const filteredEtfs = useMemo(() => {
    return ETF_LIST.filter((item) => {
      const matchCat = selectedCategory === '全部' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        item.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameCn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Strategy advice based on current score
  const allocationStrategy = useMemo(() => {
    const s = data.score;
    if (s <= 25) {
      return {
        title: '极度恐慌筑底期：左侧分批定投布局',
        badge: '极具性价比',
        badgeColor: 'bg-emerald-100 text-emerald-800',
        content:
          '当前市场处于极度恐慌估值洼地，历史上此类区间持有1年胜率超过85%。建议优先定投大盘宽基（如 QQQ、VOO），避免盲目全仓高倍杠杆反向标的。',
        suggestedRatio: '宽基 ETF 70% + 防守现金额度 20% + 适度进攻 10%',
      };
    } else if (s <= 45) {
      return {
        title: '恐慌修复期：回撤逢低分步加仓',
        badge: '逢低吸纳',
        badgeColor: 'bg-blue-100 text-blue-800',
        content:
          '情绪处于恐慌收敛阶段，空头杀跌意愿衰减。可沿20日均线或回踩支撑位分批加仓核心科技龙头ETF。',
        suggestedRatio: '核心大盘 60% + 行业半导体 25% + 现金储备 15%',
      };
    } else if (s <= 55) {
      return {
        title: '中性平衡期：耐心持仓等待右侧信号',
        badge: '多空博弈',
        badgeColor: 'bg-yellow-100 text-yellow-800',
        content:
          '指数多空力量均衡，追高与做空均无明显赔率优势。保持中性组合配置，以静制动。',
        suggestedRatio: '股票资产 50% + 债券黄金 30% + 现金 20%',
      };
    } else if (s <= 75) {
      return {
        title: '贪婪扩张期：顺势持有，逐步上移止损线',
        badge: '顺势而为',
        badgeColor: 'bg-amber-100 text-amber-800',
        content:
          '市场风险偏好旺盛，动量效应显著。建议继续持有趋势完好标的，严控追涨仓位，注意分批锁定浮盈。',
        suggestedRatio: '大盘核心 45% + 止盈兑现 35% + 防守标的 20%',
      };
    } else {
      return {
        title: '极度贪婪狂热期：逢高防御，警惕技术性反杀',
        badge: '防范回调',
        badgeColor: 'bg-rose-100 text-rose-800',
        content:
          '情绪处于历史狂热分位，做空做多比极度分化。建议规避高杠杆追多，可逢高减仓或增配避险标的（如 TLT、GLD）。',
        suggestedRatio: '现金/短期国债 50% + 防守黄金 25% + 保留底仓 25%',
      };
    }
  }, [data.score]);

  const handleVote = (type: 'buy' | 'wait' | 'sell') => {
    if (userVote) return;
    setUserVote(type);
    setPollCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const totalVotes = pollCounts.buy + pollCounts.wait + pollCounts.sell;
  const buyPct = Math.round((pollCounts.buy / totalVotes) * 100);
  const waitPct = Math.round((pollCounts.wait / totalVotes) * 100);
  const sellPct = 100 - buyPct - waitPct;

  const currentPrice = quote?.currentPrice ?? currentEtf.currentPrice;
  const changePct = quote?.changePct ?? currentEtf.changePct;
  const isPositive = changePct >= 0;

  return (
    <div id="etf-tab-view" className="space-y-4 pb-20">
      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ETF Search & Selector */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-neutral-200/80 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索代码或名称（如 QQQ, 标普, 杠杆...）"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-800 placeholder-neutral-400"
          />
        </div>

        {/* Quick Tickers Carousel */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
          {filteredEtfs.map((item) => (
            <button
              key={item.ticker}
              type="button"
              onClick={() => setSelectedTicker(item.ticker)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                selectedTicker === item.ticker
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <span>{item.ticker}</span>
              <span
                className={`text-[10px] ${
                  selectedTicker === item.ticker
                    ? 'text-blue-100'
                    : item.changePct >= 0
                    ? 'text-emerald-600'
                    : 'text-rose-500'
                }`}
              >
                {item.changePct >= 0 ? '+' : ''}
                {item.changePct}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected ETF Quote Card */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-neutral-900">{currentEtf.ticker}</h2>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-medium">
                {currentEtf.category}
              </span>
              {currentEtf.badge && (
                <span className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                  {currentEtf.badge}
                </span>
              )}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5 font-medium">{currentEtf.nameCn}</div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-neutral-900 tracking-tight">
              ${Number(currentPrice).toFixed(2)}
            </div>
            <div
              className={`flex items-center justify-end text-xs font-bold mt-0.5 ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              <span>
                {isPositive ? '+' : ''}
                {Number(changePct).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-600 bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-100 mt-3 leading-relaxed">
          {currentEtf.description}
        </p>

        {/* 52-Week Range & Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-neutral-100 text-center">
          <div>
            <span className="text-[10px] text-neutral-400 block">标的资产</span>
            <span className="text-xs font-bold text-neutral-800">{currentEtf.underlying}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block">管理费率</span>
            <span className="text-xs font-bold text-neutral-800">{currentEtf.feeRate || '0.20%'}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block">发行机构</span>
            <span className="text-xs font-bold text-neutral-800">{currentEtf.issuer || 'State Street'}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block">市盈率估值</span>
            <span className="text-xs font-bold text-neutral-800">{currentEtf.pe || 28.5}x</span>
          </div>
        </div>
      </div>

      {/* Candlestick / Price Sparkline chart */}
      {history?.candles && history.candles.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-neutral-900">15日价格走势 & 成交动量</h3>
            <span className="text-[10px] text-neutral-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>日K连续</span>
            </span>
          </div>

          <div className="h-36 w-full relative flex items-end justify-between pt-4 pb-1">
            {history.candles.map((c: any, idx: number) => {
              const maxH = 120;
              const isUp = c.close >= c.open;
              const range = 15; // approximate range
              const minBase = Math.min(...history.candles.map((x: any) => x.low));
              const maxBase = Math.max(...history.candles.map((x: any) => x.high));
              const spread = Math.max(1, maxBase - minBase);
              const heightPct = Math.max(10, ((c.close - minBase) / spread) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className={`w-2.5 rounded-t transition-all ${
                      isUp ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[8px] text-neutral-400 mt-1 scale-90">{c.time?.slice(-2)}</span>

                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-neutral-900 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20">
                    ${c.close} ({c.time})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fear & Greed Tactical Allocation Advice */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 leading-tight">量化情绪策略指南</h3>
              <span className="text-[11px] text-neutral-400">基于 {data.score}分 动态仓位推演</span>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${allocationStrategy.badgeColor}`}>
            {allocationStrategy.badge}
          </span>
        </div>

        <h4 className="text-xs font-bold text-neutral-900 mt-2 mb-1">
          {allocationStrategy.title}
        </h4>
        <p className="text-xs text-neutral-600 leading-relaxed font-normal">
          {allocationStrategy.content}
        </p>

        <div className="mt-3 p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-700 flex items-center space-x-1">
            <PieChart className="w-3.5 h-3.5 text-blue-600" />
            <span>参考仓位配置:</span>
          </span>
          <span className="text-neutral-600 font-medium">{allocationStrategy.suggestedRatio}</span>
        </div>
      </div>

      {/* Community Sentiment Voting Poll */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-neutral-900">今日投资意愿投票 ({totalVotes}人)</h3>
          <span className="text-[11px] text-neutral-400">
            {userVote ? '您已完成投票' : '匿名投票'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleVote('buy')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              userVote === 'buy'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 mb-1">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold">看多逢低买</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">{buyPct}%</span>
          </button>

          <button
            type="button"
            onClick={() => handleVote('wait')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              userVote === 'wait'
                ? 'bg-amber-50 border-amber-500 text-amber-800'
                : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold">观望持币</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600">{waitPct}%</span>
          </button>

          <button
            type="button"
            onClick={() => handleVote('sell')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              userVote === 'sell'
                ? 'bg-rose-50 border-rose-500 text-rose-800'
                : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-800'
            }`}
          >
            <div className="flex items-center justify-center space-x-1 mb-1">
              <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-xs font-bold">防守减仓</span>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600">{sellPct}%</span>
          </button>
        </div>
      </div>
    </div>
  );
};
