import React, { useEffect } from 'react';
import { Bell, AlertTriangle, X } from 'lucide-react';
import { AlertNotification } from '../types.ts';

interface AlertBannerProps {
  notification: AlertNotification | null;
  onDismiss: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isExtreme =
    notification.type === 'extreme_fear' || notification.type === 'extreme_greed';

  return (
    <div
      id="alert-banner"
      className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-top-4 duration-300"
    >
      <div
        className={`rounded-2xl p-3.5 shadow-lg border flex items-start justify-between gap-3 ${
          notification.type === 'extreme_fear'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : notification.type === 'extreme_greed'
            ? 'bg-blue-50 border-blue-200 text-blue-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-start space-x-2.5">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              notification.type === 'extreme_fear'
                ? 'bg-rose-200 text-rose-800'
                : notification.type === 'extreme_greed'
                ? 'bg-blue-200 text-blue-800'
                : 'bg-amber-200 text-amber-800'
            }`}
          >
            {isExtreme ? (
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Bell className="w-4 h-4 stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold leading-tight">{notification.title}</h4>
              <span className="text-[10px] opacity-75 font-mono">{notification.timestamp}</span>
            </div>
            <p className="text-xs mt-0.5 opacity-90 leading-snug">{notification.message}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
