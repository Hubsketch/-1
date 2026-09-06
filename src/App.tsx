import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MarketType, MainTabType, FearGreedData, AlertSettings, AlertNotification } from './types.ts';
import { DEFAULT_DATA_MAP } from './data/defaultData.ts';
import { validateAndCorrectMarketData, saveValidationLog } from './utils/validation.ts';
import { playAlertChime } from './utils/audio.ts';

import { Navbar } from './components/Navbar.tsx';
import { MarketTabs } from './components/MarketTabs.tsx';
import { SpeedometerGauge } from './components/SpeedometerGauge.tsx';
import { ComparisonCard } from './components/ComparisonCard.tsx';
import { AiSummaryCard } from './components/AiSummaryCard.tsx';
import { RsiCard, ShortInterestCard } from './components/IndicatorCards.tsx';
import { SubIndicatorsCard } from './components/SubIndicatorsCard.tsx';
import { HistoricalMomentsCard } from './components/HistoricalMomentsCard.tsx';
import { ChartsView } from './components/ChartsView.tsx';
import { EtfView } from './components/EtfView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { AlertBanner } from './components/AlertBanner.tsx';
import { DetailModal } from './components/DetailModal.tsx';
import { DataValidationModal } from './components/DataValidationModal.tsx';

const DEFAULT_SETTINGS: AlertSettings = {
  enabled: true,
  browserNotifications: false,
  soundEnabled: true,
  extremeFearThreshold: 25,
  fearThreshold: 40,
  greedThreshold: 65,
  extremeGreedThreshold: 75,
  intradayChangeThreshold: 10,
  refreshIntervalSec: 30,
};

export function App() {
  const [activeMarket, setActiveMarket] = useState<MarketType>('us');
  const [activeTab, setActiveTab] = useState<MainTabType>('home');
  const [marketDataMap, setMarketDataMap] = useState<Record<MarketType, FearGreedData>>({
    us: DEFAULT_DATA_MAP.us,
    kospi: DEFAULT_DATA_MAP.kospi,
    crypto: DEFAULT_DATA_MAP.crypto,
  });

  const [alertSettings, setAlertSettings] = useState<AlertSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fg_alert_settings');
        if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  const [alertHistory, setAlertHistory] = useState<AlertNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fg_alert_history');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [currentAlert, setCurrentAlert] = useState<AlertNotification | null>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [detailModalType, setDetailModalType] = useState<string | null>(null);

  const prevScoreRef = useRef<number | null>(null);

  // Active raw data
  const rawData = marketDataMap[activeMarket] || DEFAULT_DATA_MAP[activeMarket];

  // Run validation & auto-correction
  const validationResult = validateAndCorrectMarketData(rawData);
  const currentData: FearGreedData = validationResult.correctedData || rawData;

  // Fetch market data from server
  const fetchMarketData = useCallback(async (market: MarketType) => {
    try {
      const resp = await fetch(`/api/fear-greed?market=${market}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: FearGreedData = await resp.json();

      // 同步请求最新的AI情绪趋势预测数据 (5D/20D/60D与Fan Chart)
      try {
        const forecastResp = await fetch('/api/trend-forecast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            market,
            score: data.score,
            rating: data.rating,
            historicalData: data.history || data.historicalData || [],
            subIndicators: data.subIndicators || [],
          }),
        });
        if (forecastResp.ok) {
          const forecastData = await forecastResp.json();
          data.trendForecast = forecastData;
        }
      } catch (fErr) {
        console.warn(`[App] Failed to fetch AI trend forecast for ${market}:`, fErr);
      }

      setMarketDataMap((prev) => ({
        ...prev,
        [market]: data,
      }));

      // Run validation and save log
      const res = validateAndCorrectMarketData(data);
      saveValidationLog(res, market);
    } catch (err) {
      console.warn(`Failed to fetch live market data for ${market}:`, err);
    }
  }, []);

  // Check alert thresholds
  const checkAlertThresholds = useCallback(
    (score: number, marketName: string) => {
      if (!alertSettings.enabled) return;

      const prevScore = prevScoreRef.current;
      prevScoreRef.current = score;

      let newNotification: AlertNotification | null = null;
      const nowStr = new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' });

      if (score <= alertSettings.extremeFearThreshold) {
        newNotification = {
          id: `alert-${Date.now()}`,
          type: 'extreme_fear',
          title: `⚠️ ${marketName} 触发极度恐慌预警`,
          message: `当前情绪跌破设定的极值买点阈值（当前: ${score} 分 ≤ 阈值 ${alertSettings.extremeFearThreshold} 分），历史统计此区间具极高胜率。`,
          score,
          timestamp: nowStr,
        };
      } else if (score >= alertSettings.extremeGreedThreshold) {
        newNotification = {
          id: `alert-${Date.now()}`,
          type: 'extreme_greed',
          title: `🚨 ${marketName} 触发极度贪婪预警`,
          message: `当前情绪突破狂热阈值（当前: ${score} 分 ≥ 阈值 ${alertSettings.extremeGreedThreshold} 分），请严控追高仓位，防范获利盘踩踏。`,
          score,
          timestamp: nowStr,
        };
      } else if (prevScore !== null && Math.abs(score - prevScore) >= alertSettings.intradayChangeThreshold) {
        const delta = score - prevScore;
        newNotification = {
          id: `alert-${Date.now()}`,
          type: 'rapid_change',
          title: `⚡ ${marketName} 盘中情绪超常跳变`,
          message: `检测到盘中单日剧烈异动 ${delta >= 0 ? '+' : ''}${delta.toFixed(1)} 分，超出异动阈值 (${alertSettings.intradayChangeThreshold}分)。`,
          score,
          timestamp: nowStr,
        };
      }

      if (newNotification) {
        setCurrentAlert(newNotification);
        setAlertHistory((prev) => {
          const updated = [newNotification!, ...prev.slice(0, 49)];
          try {
            localStorage.setItem('fg_alert_history', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        if (alertSettings.soundEnabled) {
          playAlertChime(newNotification.type === 'extreme_fear' ? 'critical' : 'warning');
        }

        if (
          alertSettings.browserNotifications &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted'
        ) {
          try {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
            });
          } catch {}
        }
      }
    },
    [alertSettings]
  );

  // Initial fetch and polling
  useEffect(() => {
    fetchMarketData(activeMarket);
    const interval = setInterval(() => {
      fetchMarketData(activeMarket);
    }, (alertSettings.refreshIntervalSec || 30) * 1000);

    return () => clearInterval(interval);
  }, [activeMarket, alertSettings.refreshIntervalSec, fetchMarketData]);

  // Monitor score changes for alert triggering
  useEffect(() => {
    if (currentData.score !== undefined) {
      checkAlertThresholds(currentData.score, currentData.marketName);
    }
  }, [currentData.score, currentData.marketName, checkAlertThresholds]);

  // Settings update handler
  const handleUpdateSettings = (newSettings: Partial<AlertSettings>) => {
    setAlertSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('fg_alert_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Clear alert history
  const handleClearAlertHistory = () => {
    setAlertHistory([]);
    try {
      localStorage.removeItem('fg_alert_history');
    } catch {}
  };

  // Simulate score trigger
  const handleSimulateScore = (simulatedScore: number, reason: string) => {
    setMarketDataMap((prev) => {
      const existing = prev[activeMarket];
      const cloned = JSON.parse(JSON.stringify(existing));
      cloned.score = simulatedScore;
      cloned.rating =
        simulatedScore <= 25
          ? '极度恐慌'
          : simulatedScore <= 45
          ? '恐慌'
          : simulatedScore <= 55
          ? '中性'
          : simulatedScore <= 75
          ? '贪婪'
          : '极度贪婪';
      cloned.color =
        simulatedScore <= 25
          ? '#e53e3e'
          : simulatedScore <= 45
          ? '#e07a14'
          : simulatedScore <= 55
          ? '#ecc94b'
          : simulatedScore <= 75
          ? '#38a169'
          : '#2b6cb0';

      return {
        ...prev,
        [activeMarket]: cloned,
      };
    });

    checkAlertThresholds(simulatedScore, `${currentData.marketName} (${reason})`);
  };

  // Simulate anomaly for validation test
  const handleSimulateAnomaly = (type: 'min_offset' | 'spike_jump' | 'reset') => {
    if (type === 'reset') {
      fetchMarketData(activeMarket);
      return;
    }

    setMarketDataMap((prev) => {
      const existing = prev[activeMarket];
      const cloned = JSON.parse(JSON.stringify(existing));

      if (type === 'min_offset') {
        // Shift history to test min deviation
        cloned.history = cloned.history.map((h: any) => ({
          ...h,
          value: Math.max(35, h.value),
        }));
      } else if (type === 'spike_jump') {
        // Create an abnormal spike
        if (cloned.history.length > 5) {
          cloned.history[cloned.history.length - 1].value = 99;
          cloned.history[cloned.history.length - 2].value = 10;
        }
      }

      return {
        ...prev,
        [activeMarket]: cloned,
      };
    });
  };

  // Auto correct triggered from modal
  const handleAutoCorrect = () => {
    if (validationResult.correctedData) {
      setMarketDataMap((prev) => ({
        ...prev,
        [activeMarket]: validationResult.correctedData!,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-neutral-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Slide-down Alert Banner */}
      <AlertBanner notification={currentAlert} onDismiss={() => setCurrentAlert(null)} />

      {/* Detail Modal */}
      <DetailModal
        type={detailModalType}
        onClose={() => setDetailModalType(null)}
        market={activeMarket}
      />

      {/* Data Validation Modal */}
      <DataValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        validationResult={validationResult}
        onAutoCorrect={handleAutoCorrect}
        onSimulateAnomaly={handleSimulateAnomaly}
      />

      {/* App Container */}
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Sticky Top Header */}
        <Navbar
          hasActiveAlerts={alertSettings.enabled}
          alertCount={alertHistory.length}
          onOpenAlerts={() => setActiveTab('settings')}
          onOpenValidation={() => setIsValidationModalOpen(true)}
          isValidationAbnormal={validationResult.hasAbnormalDeviation}
          activeMarket={activeMarket}
          score={currentData.score}
          rating={currentData.rating}
        />

        {/* Tab Views */}
        <main className="flex-1 px-4 pt-3">
          {activeTab === 'home' && (
            <div className="space-y-4 pb-20">
              {/* Market Switcher */}
              <MarketTabs activeMarket={activeMarket} onChangeMarket={setActiveMarket} />

              {/* Central Speedometer Gauge */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-neutral-200/80">
                <SpeedometerGauge
                  score={currentData.score}
                  rating={currentData.rating}
                  color={currentData.color}
                  marketName={currentData.marketName}
                />

                <div className="text-center mt-3 pt-2 border-t border-neutral-100">
                  <span className="text-[11px] text-neutral-400 font-medium">
                    更新于 {currentData.updatedAt} · 盘中实时更新
                  </span>
                </div>
              </div>

              {/* 4-Period Comparison Card */}
              <ComparisonCard
                previousClose={currentData.previousClose}
                oneWeekAgo={currentData.oneWeekAgo}
                oneMonthAgo={currentData.oneMonthAgo}
                oneYearAgo={currentData.oneYearAgo}
              />

              {/* AI & Quantitative Interpretation */}
              <AiSummaryCard data={currentData} />

              {/* Technical Indicators: RSI & Short Interest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentData.rsi && (
                  <RsiCard
                    data={currentData.rsi}
                    market={activeMarket}
                    onOpenInfo={() => setDetailModalType('rsi_info')}
                  />
                )}
                {currentData.shortInterest && (
                  <ShortInterestCard
                    data={currentData.shortInterest}
                    market={activeMarket}
                    onOpenInfo={() => setDetailModalType('short_info')}
                  />
                )}
              </div>

              {/* Sub-Indicators Breakdown (7 CNN or KOSPI / Crypto components) */}
              {currentData.subIndicators && (
                <SubIndicatorsCard
                  subIndicators={currentData.subIndicators}
                  market={activeMarket}
                />
              )}

              {/* Historical Similar Moments */}
              {currentData.similarMoments && (
                <HistoricalMomentsCard
                  data={currentData.similarMoments}
                  market={activeMarket}
                  onOpenDetail={() => setDetailModalType('what_if_buy')}
                />
              )}

              {/* Bottom Disclaimer */}
              <div className="text-center pt-2 pb-4">
                <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xs mx-auto">
                  恐慌与贪婪指数基于多源量化模型与宏观情绪加权实时计算，仅供参考，不构成任何投资咨询或买卖决策建议。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <ChartsView
              data={currentData}
              onOpenModal={(type) => setDetailModalType(type)}
            />
          )}

          {activeTab === 'etf' && <EtfView data={currentData} />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={alertSettings}
              onUpdateSettings={handleUpdateSettings}
              alertHistory={alertHistory}
              onClearAlertHistory={handleClearAlertHistory}
              onSimulateScore={handleSimulateScore}
              onOpenValidation={() => setIsValidationModalOpen(true)}
              isValidationAbnormal={validationResult.hasAbnormalDeviation}
            />
          )}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          hasUnreadAlerts={alertHistory.length > 0}
        />
      </div>
    </div>
  );
}

export default App;
