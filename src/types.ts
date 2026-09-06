export type MarketType = 'us' | 'kospi' | 'crypto';

export interface HistoryPoint {
  date: string;
  timestamp: number;
  value: number;
}

export interface SubIndicator {
  id: string;
  name: string;
  nameEn: string;
  score: number;
  rating: string;
  ratingEn?: string;
  color: string;
  desc: string;
}

export interface KeyLow {
  name: string;
  score: number;
  return1Y: string;
}

export interface SimilarInterval {
  name: string;
  score: number;
  badge?: string;
  return1Y: string;
}

export interface ScoreStats {
  currentScore: number;
  avgReturn: string;
  sampleCount: number;
  maxDrawdown: string;
  bestReturn: string;
  disclaimer?: string;
}

export interface SimilarMoments {
  keyLows: KeyLow[];
  similarIntervals: SimilarInterval[];
  scoreStats: ScoreStats;
}

export interface DrawdownAnalysis {
  m1: string;
  m3: string;
  m6: string;
  y1: string;
  avgReturn1Y: string;
}

export interface PastEvent {
  name: string;
  date: string;
  score: number;
  m1: string;
  m3: string;
  m6: string;
  y1: string;
}

export interface FearGreedData {
  market: MarketType;
  marketName: string;
  score: number;
  rating: string;
  ratingEn?: string;
  color: string;
  previousClose: { score: number; change: number };
  oneWeekAgo: { score: number; change: number };
  oneMonthAgo: { score: number; change: number };
  oneYearAgo: { score: number; change: number };
  rsi?: { value: number; rating: string; detail: string; comment: string };
  shortInterest: { rate: string; rating: string; detail: string; date?: string; comment: string };
  similarMoments?: SimilarMoments;
  speed?: {
    dayChange: number;
    weekChange: number;
    momentum: string;
    trend: string;
    recent15Days?: Array<{ day: number; value: number }>;
  };
  drawdownAnalysis?: DrawdownAnalysis;
  pastEvents?: PastEvent[];
  subIndicators?: SubIndicator[];
  updatedAt: string;
  history: HistoryPoint[];
  historicalData?: HistoryPoint[];
  trendForecast?: TrendForecastData;
}

export interface ETFItem {
  ticker: string;
  nameCn: string;
  category: string;
  description: string;
  underlying: string;
  currency: string;
  currentPrice: number;
  changePct: number;
  changeAmount: number;
  returns?: { d15?: number; m1?: number; m6?: number; y1?: number };
  pe?: number;
  peLabel?: string;
  feeRate?: string;
  issuer?: string;
  badge?: string;
}

export interface AlertSettings {
  enabled: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  extremeFearThreshold: number;
  fearThreshold: number;
  greedThreshold: number;
  extremeGreedThreshold: number;
  intradayChangeThreshold: number;
  refreshIntervalSec: number;
}

export interface AlertNotification {
  id: string;
  type: 'extreme_fear' | 'extreme_greed' | 'rapid_change';
  title: string;
  message: string;
  score: number;
  timestamp: string;
}

export interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  observedValue: string | number;
  benchmarkRange: string;
  timestamp: string;
}

export interface ValidationCorrection {
  field: string;
  originalValue: any;
  correctedValue: any;
  reason: string;
}

export interface ValidationResult {
  isValid: boolean;
  hasAbnormalDeviation: boolean;
  issues: ValidationIssue[];
  minObserved: number;
  maxObserved: number;
  dataPointsCount: number;
  evaluatedAt: string;
  marketName: string;
  autoCorrected: boolean;
  corrections?: ValidationCorrection[];
  correctedData?: FearGreedData;
}

export interface ValidationLogItem {
  id: string;
  timestamp: string;
  market: string;
  hasAbnormalDeviation: boolean;
  minObserved: number;
  maxObserved: number;
  benchmarkMin: number;
  benchmarkMax: number;
  issuesCount: number;
  summary: string;
  details: string[];
}

export interface AiInterpretation {
  source: string;
  model: string;
  summary: string;
  sentimentTag: string;
  urgencyLevel: 'high' | 'medium' | 'low';
  analysisPoints: Array<{ title: string; content: string }>;
  updatedAt: string;
}

export interface TrendForecastHorizon {
  daysLabel: string;
  winRate: number;
  expReturn: number;
  upside: number;
  downside: number;
  rrRatio: number;
  verdict: string;
  desc: string;
}

export interface TrendFanPoint {
  t: string;
  base: number;
  upper: number;
  lower: number;
}

export interface ScenarioItem {
  name: string;
  probability: number;
  tag: string;
  exp60: number;
  up60: number;
  down60: number;
  desc: string;
}

export interface FactorAttributionItem {
  name: string;
  score: number;
  weight: string;
  impact: string;
  desc: string;
}

export interface HistoricalAnalogItem {
  id: string;
  date: string;
  label: string;
  score: number;
  vix: number;
  macroEnv: string;
  r5d: number;
  r20d: number;
  r60d: number;
  maxDrawdown: number;
  pattern: string;
  takeaway: string;
}

export interface MacroContextData {
  monetaryCycle: string;
  treasury10Y: string;
  vixStatus: string;
  policyRisk: string;
  summary: string;
}

export interface TrendForecastData {
  source: string;
  model: string;
  updatedAt: string;
  target: string;
  market: string;
  currentScore: number;
  sentimentRegime: string;
  driftForce: string;
  horizons: {
    '5d': TrendForecastHorizon;
    '20d': TrendForecastHorizon;
    '60d': TrendForecastHorizon;
  };
  fanPoints: TrendFanPoint[];
  isAiGenerated?: boolean;
  summary?: string;
  macroContext?: MacroContextData;
  scenarios?: {
    base: ScenarioItem;
    bull: ScenarioItem;
    bear: ScenarioItem;
  };
  factors?: FactorAttributionItem[];
  historicalAnalogs?: HistoricalAnalogItem[];
}

export type MainTabType = 'home' | 'charts' | 'etf' | 'settings' | 'poll';

