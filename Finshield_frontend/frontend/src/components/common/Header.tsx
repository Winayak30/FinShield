import React, { useState } from 'react';
import {
  ShieldAlert,
  Smartphone,
  ShieldCheck,
  Code2,
  Activity,
  Server,
  Zap,
  Lock,
  ChevronDown,
  Bell,
  Home,
  UserCheck,
  Users,
  Settings,
  RefreshCw,
  Send,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    holds,
    config,
    updateConfig,
    tribunalLoadingStatus,
    currentUser,
    switchUser,
    notifications,
  } = useFinShield();

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Active holds in queue for analyst operations
  const activeHoldsCount = holds.filter(
    h => h.state === 'PENDING' || h.state === 'AWAITING_NOMINEE'
  ).length;

  // Pending requests awaiting the current user's nominee decision
  const pendingNomineeRequests = holds.filter(
    h => (h.state === 'PENDING' || h.state === 'AWAITING_NOMINEE') &&
         (h.nominee.nominee_user_id === currentUser.id || h.nominee.phone === currentUser.phone)
  ).length;

  const unreadNotifications = notifications.filter(
    n => (!n.is_read) && (n.recipient_user_id === currentUser.id || !n.recipient_user_id)
  ).length;

  const isInternalConsole = activeView === 'analyst-console' || activeView === 'observability' || activeView === 'sdk-hub';

  return (
    <header className="border-b border-slate-800/80 bg-slate-950 sticky top-0 z-40">
      {/* Top Utility Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/60 px-4 sm:px-6 lg:px-10 py-1 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">FinShield Engine:</span>
              <span className="text-emerald-400 font-mono">18ms p95 Latency</span>
            </div>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Hardware &amp; Call Coaching Protection Active</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveView('home')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                !isInternalConsole
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Customer App
            </button>
            <button
              onClick={() => setActiveView('analyst-console')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                activeView === 'analyst-console'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Fraud Ops</span>
              {activeHoldsCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
            <button
              onClick={() => setActiveView('sdk-hub')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                activeView === 'sdk-hub' || activeView === 'observability'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Developer Hub
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
        {/* Brand */}
        <div
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              FinShield
            </span>
          </div>
        </div>

        {/* Dynamic Contextual Navigation */}
        {!isInternalConsole ? (
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'home'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActiveView('make-payment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'make-payment'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              Send Money
            </button>

            <button
              onClick={() => setActiveView('nominee-dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition relative flex items-center gap-1.5 ${
                activeView === 'nominee-dashboard' || activeView === 'nominee-review'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>Approvals</span>
              {pendingNomineeRequests > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 font-mono">
                  {pendingNomineeRequests}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('manage-nominees')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'manage-nominees'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              Trusted Contacts
            </button>

            <button
              onClick={() => setActiveView('payment-history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'payment-history'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              Activity
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('analyst-console')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition relative flex items-center gap-1.5 ${
                activeView === 'analyst-console'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Review Queue</span>
              {activeHoldsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 font-mono">
                  {activeHoldsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('sdk-hub')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeView === 'sdk-hub'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>SDK Specs</span>
            </button>

            <button
              onClick={() => setActiveView('observability')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeView === 'observability'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Observability</span>
            </button>
          </nav>
        )}

        {/* Right Side: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={() => setActiveView('notifications')}
            className={`relative p-2 rounded-xl border transition ${
              activeView === 'notifications'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left hidden sm:block">
                <span className="font-semibold text-white text-xs block leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {currentUser.phone}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>Signed in account</span>
                </div>

                <button
                  onClick={() => {
                    switchUser('usr_diya');
                    setUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition ${
                    currentUser.id === 'usr_diya'
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>Diya Sharma</span>
                  {currentUser.id === 'usr_diya' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                <button
                  onClick={() => {
                    switchUser('usr_rahul');
                    setUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition ${
                    currentUser.id === 'usr_rahul'
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>Rahul Varma</span>
                  {currentUser.id === 'usr_rahul' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setActiveView('account-settings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Security &amp; Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
