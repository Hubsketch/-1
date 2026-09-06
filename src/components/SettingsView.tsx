import React from 'react';
import { Volume2, VolumeX, Bell, AlertTriangle, ShieldCheck, Trash2, Play } from 'lucide-react';
import { AlertSettings, AlertNotification } from '../types.ts';
import { playAlertChime } from '../utils/audio.ts';

interface SettingsViewProps {
  settings: AlertSettings;
  onUpdateSettings: (newSettings: Partial<AlertSettings>) => void;
  alertHistory: AlertNotification[];
  onClearAlertHistory: () => void;
  onSimulateScore: (score: number, reason: string) => void;
  onOpenValidation?: () => void;
  isValidationAbnormal?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  alertHistory,
  onClearAlertHistory,
  onSimulateScore,
  onOpenValidation,
  isValidationAbnormal = false,
}) => {
  const requestBrowserPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      onUpdateSettings({ browserNotifications: perm === 'granted' });
    }
  };

  const testAudio = () => {
    playAlertChime('warning');
  };

  return (
    <div id="settings-tab-view" className="space-y-4 pb-20">
      {/* Main Alert Master Switches */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">情绪变动实时预警</h3>
            <p className="text-xs text-neutral-400 mt-0.5">当指数突破设定极值时弹出警报</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Browser Notifications Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-neutral-500" />
            <div>
              <h4 className="text-xs font-bold text-neutral-800">系统级弹窗推送</h4>
              <p className="text-[10px] text-neutral-400">后台运行或最小化时保持通知</p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestBrowserPermission}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
              settings.browserNotifications
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
            }`}
          >
            {settings.browserNotifications ? '已开启' : '点击授权'}
          </button>
        </div>

        {/* Audio Chime Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-neutral-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            )}
            <div>
              <h4 className="text-xs font-bold text-neutral-800">警报提示音效</h4>
              <p className="text-[10px] text-neutral-400">极值突破时合成双频提示和弦</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={testAudio}
              className="text-xs text-blue-600 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 flex items-center space-x-1"
            >
              <Play className="w-3 h-3" />
              <span>试听</span>
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Threshold Sliders */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80 space-y-3.5">
        <h3 className="text-sm font-bold text-neutral-900 mb-1">个性化预警阈值设定</h3>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-rose-600">极度恐慌触发线 (买点关注)</span>
            <span className="font-mono text-neutral-800">≤ {settings.extremeFearThreshold} 分</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            value={settings.extremeFearThreshold}
            onChange={(e) => onUpdateSettings({ extremeFearThreshold: Number(e.target.value) })}
            className="w-full accent-rose-600 h-1.5 bg-neutral-100 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-blue-600">极度贪婪触发线 (风险防范)</span>
            <span className="font-mono text-neutral-800">≥ {settings.extremeGreedThreshold} 分</span>
          </div>
          <input
            type="range"
            min="70"
            max="95"
            value={settings.extremeGreedThreshold}
            onChange={(e) => onUpdateSettings({ extremeGreedThreshold: Number(e.target.value) })}
            className="w-full accent-blue-600 h-1.5 bg-neutral-100 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-amber-600">单日快速跳变触发线</span>
            <span className="font-mono text-neutral-800">|Δ| ≥ {settings.intradayChangeThreshold} 分</span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            value={settings.intradayChangeThreshold}
            onChange={(e) => onUpdateSettings({ intradayChangeThreshold: Number(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-neutral-100 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Simulation triggers */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80">
        <h3 className="text-sm font-bold text-neutral-900 mb-1">极端场景实盘模拟</h3>
        <p className="text-xs text-neutral-400 mb-3">实时注入模拟异动数据以验证警报逻辑</p>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onSimulateScore(18, '模拟海外黑天鹅极度恐慌')}
            className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
          >
            模拟暴跌 18分
          </button>
          <button
            type="button"
            onClick={() => onSimulateScore(82, '模拟资金狂热追涨极度贪婪')}
            className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
          >
            模拟暴涨 82分
          </button>
          <button
            type="button"
            onClick={() => onSimulateScore(42, '模拟盘中止跌企稳反弹')}
            className="py-2 px-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors"
          >
            恢复基准
          </button>
        </div>
      </div>

      {/* Data Validation Center Trigger */}
      {onOpenValidation && (
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isValidationAbnormal
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }`}
            >
              {isValidationAbnormal ? (
                <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 leading-tight">数据源极值自检中心</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isValidationAbnormal ? '⚠️ 发现偏离基准指标，需校准' : '多源极值完整性校验已通过'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenValidation}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
          >
            查看自检 &gt;
          </button>
        </div>
      )}

      {/* Alert History Logs */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-neutral-900">
            预警推送记录 ({alertHistory.length})
          </h3>
          {alertHistory.length > 0 && (
            <button
              type="button"
              onClick={onClearAlertHistory}
              className="text-neutral-400 hover:text-rose-500 text-xs font-semibold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空记录</span>
            </button>
          )}
        </div>

        {alertHistory.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400">暂无触发的预警通知</div>
        ) : (
          <div className="divide-y divide-neutral-100 space-y-2">
            {alertHistory.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800">{item.title}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">{item.timestamp}</span>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
