import React from 'react';
import { X, TrendingUp, HelpCircle, Activity, BarChart2 } from 'lucide-react';
import { MarketType } from '../types.ts';

interface DetailModalProps {
  type: string | null;
  onClose: () => void;
  market?: MarketType;
}

export const DetailModal: React.FC<DetailModalProps> = ({ type, onClose, market = 'us' }) => {
  if (!type) return null;

  const symbol = market === 'crypto' ? 'BTC' : market === 'kospi' ? 'KOSPI' : 'S&P 500';

  return (
    <div
      id="detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-neutral-200 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center space-x-2">
            {type === 'what_if_buy' ? (
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <TrendingUp className="w-4 h-4 stroke-[2.2]" />
              </div>
            ) : type === 'rsi_info' ? (
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <Activity className="w-4 h-4 stroke-[2.2]" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                <BarChart2 className="w-4 h-4 stroke-[2.2]" />
              </div>
            )}
            <h3 className="text-base font-bold text-neutral-900">
              {type === 'what_if_buy'
                ? '历史极低分位买入推演复盘'
                : type === 'rsi_info'
                ? '14日 RSI 相对强弱指标'
                : '全市场做空成交比例指标'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {type === 'what_if_buy' && (
          <div className="space-y-4 text-xs text-neutral-700">
            <p className="leading-relaxed bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              在指数跌入 <b>极度恐慌 (0–25分)</b> 时买入，从长周期统计看具有极高胜率。巴菲特名言“在他人恐惧时贪婪”在美股百年历史中被反复量化验证。
            </p>

            <div className="space-y-2">
              <h4 className="font-bold text-neutral-900 text-sm">经典历史极值底回测：</h4>

              <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 space-y-1">
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>2020.03 新冠疫情闪崩 (2分)</span>
                  <span className="text-emerald-600">1年 +58.9%</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  暴跌触发连续熔断，情绪探至2分极端冰点；买入后1个月+12.7%，3个月+26.4%，6个月+38.1%。
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 space-y-1">
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>2022.10 加息缩表流动性低谷 (17分)</span>
                  <span className="text-emerald-600">1年 +21.6%</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  CPI冲高与美联储激进加息75bp引发无底探盘，情绪筑底后开启AI大牛市主升浪。
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 space-y-1">
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>2024.08 日元套息交易逆转清仓 (17分)</span>
                  <span className="text-emerald-600">6M +14.8%</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  日央行加息导致全球杠杆急速去化，恐慌情绪3日内由中性断崖式跌至17分，随后V型反转。
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 space-y-1">
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>2025.02 关税冲击与宏观恐慌 (2.9分)</span>
                  <span className="text-emerald-600">当前左侧反弹中</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  近期创下历史极低分位，属于极度罕见的结构性非理性超跌时刻。
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <b>风险提示：</b> 极度恐慌出现并不代表左侧当天就是绝对底，通常伴随2-4周的底部反复震荡，建议采用分批网格或金字塔加仓法，避免一次性重仓单一高杠杆品种。
            </div>
          </div>
        )}

        {type === 'rsi_info' && (
          <div className="space-y-3 text-xs text-neutral-700 leading-relaxed">
            <p>
              <b>RSI (Relative Strength Index，相对强弱指标)</b> 衡量指定周期（通常14日）内价格上涨动能与下跌动能的比率，取值范围在 0 至 100 之间。
            </p>
            <div className="space-y-1.5 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span><b>RSI ≤ 30 (严重超卖)：</b> 卖方动能耗尽，易引发技术性强烈反弹。</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span><b>30 &lt; RSI &lt; 70 (中性常态)：</b> 动能平稳，顺应均线趋势运行。</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><b>RSI ≥ 70 (严重超买)：</b> 价格处于短期亢奋溢价区间，防范技术性回踩。</span>
              </div>
            </div>
            <p className="text-neutral-500 text-[11px]">
              本看板将多周期RSI与综合情绪指数进行联动印证，辅助判断多空拐点有效性。
            </p>
          </div>
        )}

        {type === 'short_info' && (
          <div className="space-y-3 text-xs text-neutral-700 leading-relaxed">
            <p>
              <b>做空比例 (Short Interest Rate)</b> 反映机构与对冲基金在交易所融券做空的持仓密度及日内做空成交占比。
            </p>
            <div className="space-y-1.5 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span><b>做空比例 &gt; 55%：</b> 空头筹码极度拥挤，随时可能触发空头踩踏式“逼空反轧 (Short Squeeze)”。</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span><b>做空比例 40% ~ 50%：</b> 正常多空套保与对冲区间。</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><b>做空比例 &lt; 35%：</b> 市场毫无防备，缺乏空头回补买盘托底。</span>
              </div>
            </div>
            <p className="text-neutral-500 text-[11px]">
              当极度恐慌伴随高做空比例时，往往是历史上最猛烈暴力反弹的温床。
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors"
        >
          我已知晓
        </button>
      </div>
    </div>
  );
};
