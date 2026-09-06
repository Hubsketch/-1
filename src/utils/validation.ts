import { FearGreedData, ValidationResult, ValidationIssue, ValidationCorrection, ValidationLogItem } from '../types.ts';

export const MARKET_BENCHMARKS: Record<string, {
  name: string;
  absoluteMin: number;
  absoluteMax: number;
  expectedMultiYearMin: { min: number; max: number; reference: string };
  expectedMultiYearMax: { min: number; max: number; reference: string };
  maxAllowedSingleDayJump: number;
  warningDeviationThresholdPct: number;
}> = {
  us: {
    name: '美股标普500情绪',
    absoluteMin: 0,
    absoluteMax: 100,
    expectedMultiYearMin: { min: 0.5, max: 12, reference: '2020疫情(2.0) / 2025关税(2.9)' },
    expectedMultiYearMax: { min: 75, max: 98, reference: '2024极度贪婪(83.0)' },
    maxAllowedSingleDayJump: 55,
    warningDeviationThresholdPct: 20,
  },
  crypto: {
    name: '加密货币情绪 (BTC)',
    absoluteMin: 0,
    absoluteMax: 100,
    expectedMultiYearMin: { min: 1, max: 15, reference: 'FTX暴雷(6.0)' },
    expectedMultiYearMax: { min: 80, max: 99, reference: '牛市峰值(95.0)' },
    maxAllowedSingleDayJump: 65,
    warningDeviationThresholdPct: 25,
  },
  kospi: {
    name: '韩国综合指数情绪',
    absoluteMin: 0,
    absoluteMax: 100,
    expectedMultiYearMin: { min: 5, max: 20, reference: '半导体下行底(10.0)' },
    expectedMultiYearMax: { min: 70, max: 92, reference: '出口繁荣高位(85.0)' },
    maxAllowedSingleDayJump: 55,
    warningDeviationThresholdPct: 25,
  },
};

const VALIDATION_LOGS_KEY = 'fg_data_validation_logs';

export function getStoredValidationLogs(): ValidationLogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VALIDATION_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load validation logs:', err);
    return [];
  }
}

export function saveValidationLog(result: ValidationResult, marketKey: string = 'us') {
  if (typeof window === 'undefined') return;
  try {
    const logs = getStoredValidationLogs();
    const benchmark = MARKET_BENCHMARKS[marketKey] || MARKET_BENCHMARKS.us;
    const fixText = result.autoCorrected ? ` [已自动修正 ${(result.corrections || []).length} 处]` : '';
    const summary = result.hasAbnormalDeviation
      ? `⚠️ 发现 ${result.issues.length} 项偏离历史基准的异常指标${fixText} (Min: ${result.minObserved}, Max: ${result.maxObserved})`
      : `✅ 数据校验通过 (Min: ${result.minObserved}, Max: ${result.maxObserved})`;

    const fixDetails = (result.corrections || []).map(
      (c) => `[AUTO-FIX] ${c.field}: 原始值(${c.originalValue}) -> 修正为(${c.correctedValue}) [${c.reason}]`
    );

    const newEntry: ValidationLogItem = {
      id: `val-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      market: result.marketName,
      hasAbnormalDeviation: result.hasAbnormalDeviation,
      minObserved: result.minObserved,
      maxObserved: result.maxObserved,
      benchmarkMin: benchmark.expectedMultiYearMin.min,
      benchmarkMax: benchmark.expectedMultiYearMax.max,
      issuesCount: result.issues.length,
      summary,
      details: [
        ...fixDetails,
        ...result.issues.map(
          (i) => `[${i.level.toUpperCase()}] ${i.field}: ${i.message} (观测值: ${i.observedValue}, 基准: ${i.benchmarkRange})`
        ),
      ],
    };

    localStorage.setItem(VALIDATION_LOGS_KEY, JSON.stringify([newEntry, ...logs.slice(0, 49)]));
  } catch (err) {
    console.error('Failed to persist validation log:', err);
  }
}

export function clearStoredValidationLogs() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(VALIDATION_LOGS_KEY);
  } catch {}
}

export function getScoreRating(score: number): string {
  if (score <= 24) return '极度恐慌';
  if (score <= 44) return '恐慌';
  if (score <= 55) return '中性';
  if (score <= 75) return '贪婪';
  return '极度贪婪';
}

export function validateAndCorrectMarketData(rawData: FearGreedData): ValidationResult {
  const issues: ValidationIssue[] = [];
  const corrections: ValidationCorrection[] = [];
  const marketKey = rawData.market || 'us';
  const benchmark = MARKET_BENCHMARKS[marketKey] || MARKET_BENCHMARKS.us;
  const nowStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const data: FearGreedData = JSON.parse(JSON.stringify(rawData));
  const history = data.history || [];
  const totalCount = history.length;

  let currentScore = data.score;
  if (typeof currentScore !== 'number' || isNaN(currentScore)) {
    const fallback = history.length > 0 && typeof history[history.length - 1].value === 'number'
      ? Math.max(0, Math.min(100, history[history.length - 1].value))
      : 50;
    issues.push({
      level: 'error',
      field: '当前综合分值 (Score)',
      message: '当前分数不是有效数值，已自动修复为最新时序值或基准 50',
      observedValue: String(currentScore),
      benchmarkRange: `[${benchmark.absoluteMin}, ${benchmark.absoluteMax}]`,
      timestamp: nowStr,
    });
    corrections.push({
      field: '当前综合分值 (Score)',
      originalValue: String(currentScore),
      correctedValue: fallback,
      reason: '数值为无效 NaN/null，自动修正回基准有效值',
    });
    data.score = fallback;
  } else if (currentScore < benchmark.absoluteMin) {
    issues.push({
      level: 'error',
      field: '当前综合分值 (Score)',
      message: `分值 (${currentScore}) 低于合法下限 0，已自动边界钳制为 0.0`,
      observedValue: currentScore,
      benchmarkRange: `[${benchmark.absoluteMin}, ${benchmark.absoluteMax}]`,
      timestamp: nowStr,
    });
    corrections.push({
      field: '当前综合分值 (Score)',
      originalValue: currentScore,
      correctedValue: 0,
      reason: '跌破合法下界 0，自动钳制修正为 0.0',
    });
    data.score = 0;
  } else if (currentScore > benchmark.absoluteMax) {
    issues.push({
      level: 'error',
      field: '当前综合分值 (Score)',
      message: `分值 (${currentScore}) 高于合法上限 100，已自动边界钳制为 100.0`,
      observedValue: currentScore,
      benchmarkRange: `[${benchmark.absoluteMin}, ${benchmark.absoluteMax}]`,
      timestamp: nowStr,
    });
    corrections.push({
      field: '当前综合分值 (Score)',
      originalValue: currentScore,
      correctedValue: 100,
      reason: '突破合法上界 100，自动钳制修正为 100.0',
    });
    data.score = 100;
  } else {
    data.score = Math.round(currentScore * 10) / 10;
  }

  // Check Rating calibration
  const expectedRating = getScoreRating(data.score);
  if (data.rating !== expectedRating) {
    corrections.push({
      field: '情绪评级标签 (Rating)',
      originalValue: data.rating || '未知',
      correctedValue: expectedRating,
      reason: `分值与评级不匹配，已自动重校准为【${expectedRating}】`,
    });
    data.rating = expectedRating;
  }

  // Check history sequence
  let minObs = data.score;
  let maxObs = data.score;
  let maxJump = 0;
  let invalidPointsCount = 0;
  const validHistory = [];

  for (let i = 0; i < history.length; i++) {
    const pt = history[i];
    let val = pt.value;
    let correctedVal = val;

    if (typeof val !== 'number' || isNaN(val)) {
      invalidPointsCount++;
      correctedVal = validHistory.length > 0 ? validHistory[validHistory.length - 1].value : data.score;
      corrections.push({
        field: `历史时序 [${pt.date || `第${i + 1}点`}]`,
        originalValue: String(val),
        correctedValue: correctedVal,
        reason: '数据点缺失或为 NaN，已通过前值自动插值平滑修复',
      });
    } else if (val < benchmark.absoluteMin) {
      correctedVal = 0;
      corrections.push({
        field: `历史时序 [${pt.date || `第${i + 1}点`}]`,
        originalValue: val,
        correctedValue: 0,
        reason: '时序点跌破下限 0，已自动钳制修正为 0.0',
      });
    } else if (val > benchmark.absoluteMax) {
      correctedVal = 100;
      corrections.push({
        field: `历史时序 [${pt.date || `第${i + 1}点`}]`,
        originalValue: val,
        correctedValue: 100,
        reason: '时序点超出上限 100，已自动钳制修正为 100.0',
      });
    } else {
      correctedVal = Math.round(val * 10) / 10;
    }

    if (correctedVal < minObs) minObs = correctedVal;
    if (correctedVal > maxObs) maxObs = correctedVal;

    if (i > 0 && validHistory.length > 0) {
      const jump = Math.abs(correctedVal - validHistory[validHistory.length - 1].value);
      if (jump > maxJump) maxJump = jump;
    }

    validHistory.push({
      date: pt.date || new Date(pt.timestamp || Date.now()).toISOString().split('T')[0],
      timestamp: pt.timestamp || Date.now(),
      value: correctedVal,
    });
  }

  data.history = validHistory;
  minObs = Math.round(minObs * 10) / 10;
  maxObs = Math.round(maxObs * 10) / 10;

  if (invalidPointsCount > 0) {
    issues.push({
      level: 'error',
      field: '时序完整性',
      message: `检测到 ${invalidPointsCount} 个非数值(NaN/null)点，已全部自动插值修正`,
      observedValue: invalidPointsCount,
      benchmarkRange: '0 个无效值',
      timestamp: nowStr,
    });
  }

  if (totalCount >= 300) {
    if (minObs > benchmark.expectedMultiYearMin.max + 15) {
      issues.push({
        level: 'warning',
        field: '历史极低点基准偏离 (Min Deviation)',
        message: `长周期历史极小值(${minObs})远高于基准范围(${benchmark.expectedMultiYearMin.min}~${benchmark.expectedMultiYearMin.max})，可能丢失关键恐慌筑底极值样本（如${benchmark.expectedMultiYearMin.reference}）`,
        observedValue: minObs,
        benchmarkRange: `${benchmark.expectedMultiYearMin.min} ~ ${benchmark.expectedMultiYearMin.max}`,
        timestamp: nowStr,
      });
    }
    if (maxObs < benchmark.expectedMultiYearMax.min - 15) {
      issues.push({
        level: 'warning',
        field: '历史极高点基准偏离 (Max Deviation)',
        message: `长周期历史极大值(${maxObs})远低于基准范围(${benchmark.expectedMultiYearMax.min}~${benchmark.expectedMultiYearMax.max})，可能历史高位采样截断`,
        observedValue: maxObs,
        benchmarkRange: `${benchmark.expectedMultiYearMax.min} ~ ${benchmark.expectedMultiYearMax.max}`,
        timestamp: nowStr,
      });
    }
  }

  if (maxJump > benchmark.maxAllowedSingleDayJump) {
    issues.push({
      level: 'warning',
      field: '单日异动跳变率 (Spike Delta)',
      message: `检测到单日发生 ${maxJump.toFixed(1)} 分的超常瞬时跳变，超出正常波动阈值 (${benchmark.maxAllowedSingleDayJump})，系统已记录预警`,
      observedValue: Math.round(maxJump * 10) / 10,
      benchmarkRange: `<= ${benchmark.maxAllowedSingleDayJump}`,
      timestamp: nowStr,
    });
  }

  const hasError = issues.some((i) => i.level === 'error');
  const isValid = !hasError;
  const autoCorrected = corrections.length > 0;

  return {
    isValid,
    hasAbnormalDeviation: hasError || issues.length > 0,
    issues,
    minObserved: minObs,
    maxObserved: maxObs,
    dataPointsCount: totalCount,
    evaluatedAt: nowStr,
    marketName: data.marketName || benchmark.name,
    autoCorrected,
    corrections,
    correctedData: data,
  };
}
