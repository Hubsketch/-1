import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle, Trash2, Wrench } from 'lucide-react';
import { ValidationResult, ValidationLogItem, FearGreedData } from '../types.ts';
import {
  MARKET_BENCHMARKS,
  getStoredValidationLogs,
  clearStoredValidationLogs,
} from '../utils/validation.ts';

interface DataValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationResult: ValidationResult;
  onAutoCorrect?: () => void;
  onSimulateAnomaly?: (type: 'min_offset' | 'spike_jump' | 'reset') => void;
}

export const DataValidationModal: React.FC<DataValidationModalProps> = ({
  isOpen,
  onClose,
  validationResult,
  onAutoCorrect,
  onSimulateAnomaly,
}) => {
  const [logs, setLogs] = useState<ValidationLogItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLogs(getStoredValidationLogs());
    }
  }, [isOpen, validationResult]);

  if (!isOpen) return null;

  const handleClearLogs = () => {
    clearStoredValidationLogs();
    setLogs([]);
  };

  const isAbnormal = validationResult.hasAbnormalDeviation;

  return (
    <div
      id="data-validation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl border border-neutral-200 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${
                isAbnormal
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }`}
            >
              {isAbnormal ? (
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 leading-tight">
                数据源极值自检中心
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                实时时序偏差比对与自动校准引擎
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Summary Card */}
        <div
          className={`p-3.5 rounded-2xl border ${
            isAbnormal
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs flex items-center space-x-1.5">
              {isAbnormal ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
              <span>{validationResult.marketName} 极值校验状态</span>
            </span>
            <span className="text-[10px] font-mono opacity-70">
              采样时间 {validationResult.evaluatedAt}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-black/5">
            <div>
              <span className="text-[10px] opacity-70 block">时序极小值</span>
              <span className="text-sm font-bold font-mono">{validationResult.minObserved} 分</span>
            </div>
            <div>
              <span className="text-[10px] opacity-70 block">时序极大值</span>
              <span className="text-sm font-bold font-mono">{validationResult.maxObserved} 分</span>
            </div>
            <div>
              <span className="text-[10px] opacity-70 block">样本点总计</span>
              <span className="text-sm font-bold font-mono">{validationResult.dataPointsCount} 点</span>
            </div>
          </div>
        </div>

        {/* Action button: Auto Correct */}
        {validationResult.autoCorrected && (
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span className="font-bold">
                已自动完成 {(validationResult.corrections || []).length} 处数据校准与平滑修复
              </span>
            </div>
          </div>
        )}

        {/* Detected Issues List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-neutral-800">
            校验指标分析 ({validationResult.issues.length})
          </h4>
          {validationResult.issues.length === 0 ? (
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-500 text-center">
              ✅ 所有历史分位数、跳变率与极值范围均在标准模型预期区间内。
            </div>
          ) : (
            <div className="space-y-2">
              {validationResult.issues.map((iss, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-xs space-y-1 ${
                    iss.level === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{iss.field}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/60">
                      {iss.level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-snug">{iss.message}</p>
                  <div className="flex justify-between text-[10px] opacity-75 font-mono pt-1">
                    <span>观测值: {iss.observedValue}</span>
                    <span>基准范围: {iss.benchmarkRange}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Simulation Controls */}
        {onSimulateAnomaly && (
          <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
            <span className="text-xs font-bold text-neutral-700 block">数据异常注入测试</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSimulateAnomaly('min_offset')}
                className="py-1.5 px-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-[11px] font-bold text-neutral-800"
              >
                模拟极小值偏高
              </button>
              <button
                type="button"
                onClick={() => onSimulateAnomaly('spike_jump')}
                className="py-1.5 px-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-100 text-[11px] font-bold text-neutral-800"
              >
                模拟单日跳变异常
              </button>
              <button
                type="button"
                onClick={() => onSimulateAnomaly('reset')}
                className="py-1.5 px-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[11px] font-bold text-blue-700"
              >
                恢复标准数据
              </button>
            </div>
          </div>
        )}

        {/* Historical Logs List */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-800">
              最近自检日志记录 ({logs.length})
            </h4>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                className="text-[11px] text-neutral-400 hover:text-rose-600 flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>清空日志</span>
              </button>
            )}
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {logs.length === 0 ? (
              <div className="text-[11px] text-neutral-400 py-3 text-center">暂无历史日志</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-xl bg-neutral-50 border border-neutral-100 text-[11px] space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800">{log.market}</span>
                    <span className="text-neutral-400 font-mono text-[10px]">{log.timestamp}</span>
                  </div>
                  <p className="text-neutral-600 text-[10px]">{log.summary}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors"
        >
          关闭自检中心
        </button>
      </div>
    </div>
  );
};
