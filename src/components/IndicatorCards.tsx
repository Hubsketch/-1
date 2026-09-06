import React from 'react';
import { Activity, TrendingDown, Info } from 'lucide-react';
import { MarketType } from '../types.ts';

interface RsiCardProps {
  data: {
    value: number;
    rating: string;
    detail: string;
    comment: string;
  };
  market: MarketType;
  title?: string;
  onOpenInfo?: () => void;
}

export const RsiCard: React.FC<RsiCardProps> = ({ data, market, title, onOpenInfo }) => {
  const cardTitle =
    title ||
    (market === 'crypto'
      ? 'BTC RSI'
      : market === 'kospi'
      ? 'KOSPI RSI'
      : 'S&P500 RSI');

  return (
    <div
      id="rsi-card"
      className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="font-bold text-neutral-900 text-sm tracking-tight">{cardTitle}</span>
        </div>
        <button
          type="button"
          onClick={onOpenInfo}
          className="text-neutral-400 hover:text-neutral-700 transition-colors p-1 rounded-md hover:bg-neutral-100"
          aria-label="RSI 指标说明"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-baseline space-x-2 mb-1">
        <span className="text-xl font-extrabold text-neutral-900">{data.value}</span>
        <span className="text-sm font-medium text-neutral-500">{data.rating}</span>
      </div>
      <div className="text-xs text-neutral-400 mb-2">{data.detail}</div>
      <p className="text-xs text-neutral-600 leading-relaxed font-normal">{data.comment}</p>
    </div>
  );
};

interface ShortInterestCardProps {
  data: {
    rate: string;
    rating: string;
    detail: string;
    comment: string;
  };
  market: MarketType;
  title?: string;
  onOpenInfo?: () => void;
}

export const ShortInterestCard: React.FC<ShortInterestCardProps> = ({
  data,
  market,
  title,
  onOpenInfo,
}) => {
  const cardTitle =
    title ||
    (market === 'crypto'
      ? 'BTC 做空比例'
      : market === 'kospi'
      ? 'KOSPI 做空比例'
      : 'S&P500 做空比例');

  return (
    <div
      id="short-interest-card"
      className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="font-bold text-neutral-900 text-sm tracking-tight">{cardTitle}</span>
        </div>
        <button
          type="button"
          onClick={onOpenInfo}
          className="text-neutral-400 hover:text-neutral-700 transition-colors p-1 rounded-md hover:bg-neutral-100"
          aria-label="做空比例指标说明"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-baseline space-x-2 mb-1">
        <span className="text-xl font-extrabold text-neutral-900">{data.rate}</span>
        <span className="text-sm font-medium text-neutral-500">{data.rating}</span>
      </div>
      <div className="text-xs text-neutral-400 mb-2">{data.detail}</div>
      <p className="text-xs text-neutral-600 leading-relaxed font-normal">{data.comment}</p>
    </div>
  );
};
