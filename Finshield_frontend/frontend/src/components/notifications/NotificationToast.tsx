import React from 'react';
import {
  Bell,
  AlertTriangle,
  ArrowRight,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';

export const NotificationToast: React.FC = () => {
  const {
    activeNotificationToast,
    dismissToast,
    openNotificationReview,
  } = useFinShield();

  if (!activeNotificationToast) return null;

  return (
    <div className="fixed top-5 right-5 sm:right-8 z-50 max-w-md w-full animate-slideDown shadow-2xl">
      <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-amber-500/10 ring-1 ring-amber-500/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  FinShield notification
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] text-slate-400 font-mono">Now</span>
              </div>

              <h4 className="text-sm font-bold text-white leading-tight">
                {activeNotificationToast.title}
              </h4>

              <p className="text-xs text-slate-300 leading-snug">
                {activeNotificationToast.message}
              </p>

              {activeNotificationToast.action_label && (
                <div className="pt-2">
                  <button
                    onClick={() => openNotificationReview(activeNotificationToast.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{activeNotificationToast.action_label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

