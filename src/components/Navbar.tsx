import React, { useState } from 'react';
import { Bell, ShieldCheck, AlertTriangle, Share2, Check } from 'lucide-react';
import { MarketType } from '../types.ts';

interface NavbarProps {
  hasActiveAlerts: boolean;
  alertCount: number;
  onOpenAlerts: () => void;
  onOpenValidation?: () => void;
  isValidationAbnormal?: boolean;
  activeMarket: MarketType;
  score: number;
  rating: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  alertCount = 0,
  onOpenAlerts,
  onOpenValidation,
  isValidationAbnormal = false,
  activeMarket,
  score,
  rating,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const marketLabel =
      activeMarket === 'us'
        ? '美股 S&P 500'
        : activeMarket === 'crypto'
        ? '加密货币'
        : '韩国综合 KOSPI';

    const shareText = `【恐慌与贪婪指数】${marketLabel}实时读数：${score}分 (${rating})。波动监测与盘中情绪已开启。`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '恐慌与贪婪指数',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header
      id="top-header"
      className="sticky top-0 z-30 bg-[#f6f7f9]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-neutral-200/80 max-w-md mx-auto w-full"
    >
      <div className="flex items-center space-x-1">
        <button
          type="button"
          id="header-bell-btn"
          onClick={onOpenAlerts}
          className="relative p-2 text-neutral-700 hover:text-neutral-900 transition-colors rounded-full active:bg-neutral-200/60"
          aria-label="预警提醒设置与记录"
        >
          <Bell className="w-5 h-5 stroke-[2]" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {onOpenValidation && (
          <button
            type="button"
            id="header-validation-btn"
            onClick={onOpenValidation}
            className={`p-2 transition-colors rounded-full active:bg-neutral-200/60 relative ${
              isValidationAbnormal ? 'text-amber-600 hover:text-amber-700' : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title={isValidationAbnormal ? '⚠️ 数据校验发现基准偏离' : '数据源极值校验通过'}
          >
            {isValidationAbnormal ? (
              <>
                <AlertTriangle className="w-5 h-5 stroke-[2.2] animate-bounce" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              </>
            ) : (
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            )}
          </button>
        )}
      </div>

      <h1 className="text-lg font-bold text-neutral-900 tracking-tight">恐慌与贪婪指数</h1>

      <button
        type="button"
        id="header-share-btn"
        onClick={handleShare}
        className="relative p-2 text-neutral-700 hover:text-neutral-900 transition-colors rounded-full active:bg-neutral-200/60"
        aria-label="分享"
      >
        {copied ? (
          <Check className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
        ) : (
          <Share2 className="w-5 h-5 stroke-[2]" />
        )}
      </button>
    </header>
  );
};
