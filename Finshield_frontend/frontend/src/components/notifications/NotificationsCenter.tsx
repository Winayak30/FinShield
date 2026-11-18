import React from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Clock,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';

export const NotificationsCenter: React.FC = () => {
  const {
    notifications,
    currentUser,
    openNotificationReview,
    markNotificationRead,
  } = useFinShield();

  const userNotifications = notifications.filter(
    n => n.recipient_user_id === currentUser.id || !n.recipient_user_id
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn py-2">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Notification Center</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time security alerts and out-of-band nominee approval requests.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Recipient:</span>
          <strong className="text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {currentUser.name}
          </strong>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md divide-y divide-slate-800">
        {userNotifications.map(n => (
          <div
            key={n.id}
            className={`p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              !n.is_read ? 'bg-slate-800/20' : 'hover:bg-slate-800/10'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === 'PAYMENT_APPROVAL_REQUIRED'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : n.type === 'PAYMENT_RELEASED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {n.type === 'PAYMENT_APPROVAL_REQUIRED' && <AlertTriangle className="w-5 h-5" />}
                {n.type === 'PAYMENT_RELEASED' && <CheckCircle2 className="w-5 h-5" />}
                {n.type === 'PAYMENT_REJECTED' && <XCircle className="w-5 h-5" />}
                {n.type === 'SECURITY_ALERT' && <ShieldAlert className="w-5 h-5" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-sm">{n.title}</h3>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{n.timestamp}</span>
                  <span className="text-slate-600">•</span>
                  <span>From: {n.sender_name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center shrink-0">
              {n.action_label && n.hold_id && (
                <button
                  onClick={() => openNotificationReview(n.id)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <span>{n.action_label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {!n.is_read && (
                <button
                  onClick={() => markNotificationRead(n.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Mark as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {userNotifications.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Bell className="w-8 h-8 text-slate-400 mx-auto" />
            <p>No notifications for {currentUser.name} at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

