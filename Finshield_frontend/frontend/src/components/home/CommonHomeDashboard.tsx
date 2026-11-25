import React from 'react';
import {
  ShieldCheck,
  Send,
  Users,
  AlertTriangle,
  ArrowRight,
  Shield,
  Clock,
  ChevronRight,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  CreditCard,
  PhoneCall,
  UserCheck,
  Smartphone,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';

export const CommonHomeDashboard: React.FC = () => {
  const {
    currentUser,
    setActiveView,
    holds,
    notifications,
    openNotificationReview,
    paymentHistory,
    switchUser,
  } = useFinShield();

  // Find incoming requests where the current user is the nominated reviewer
  const pendingRequestsForMe = holds.filter(
    h => (h.state === 'PENDING' || h.state === 'AWAITING_NOMINEE') &&
         (h.nominee.nominee_user_id === currentUser.id || h.nominee.phone === currentUser.phone)
  );

  const primaryNominee = currentUser.registered_nominees?.[0];
  const userPayments = paymentHistory.filter(p => p.payer_id === currentUser.id);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* 1. Personal Header & Account Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {getGreeting()}, {currentUser.name.split(' ')[0]}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Protected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            FinShield is actively monitoring payments on this device.
          </p>
        </div>

        {/* Quick Identity Switcher for Demo testing */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-slate-400">Account:</span>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => switchUser('usr_diya')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                currentUser.id === 'usr_diya'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Diya
            </button>
            <button
              onClick={() => switchUser('usr_rahul')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                currentUser.id === 'usr_rahul'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rahul
            </button>
          </div>
        </div>
      </div>

      {/* 2. URGENT ACTION BANNER: If there is an approval request for this user */}
      {pendingRequestsForMe.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden ring-1 ring-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Approval Request Awaiting You
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">Time-sensitive</span>
                </div>
                <h3 className="text-base font-semibold text-white">
                  {pendingRequestsForMe[0].payer_name} sent ₹{pendingRequestsForMe[0].amount.toLocaleString()} to {pendingRequestsForMe[0].payee_name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  FinShield paused this payment due to detected remote-assistance software on the payer's phone. As their trusted contact, your authorization is required.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const notif = notifications.find(n => n.hold_id === pendingRequestsForMe[0].id);
                if (notif) {
                  openNotificationReview(notif.id);
                } else {
                  setActiveView('nominee-review');
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-amber-400/20"
            >
              <span>Review Request</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Account Balance & FinShield Protection Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Balance Card */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400">Total Available Balance</span>
              <div className="text-3xl font-bold font-mono text-white mt-1">
                ₹1,42,850<span className="text-slate-500 text-lg">.00</span>
              </div>
              <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                Primary Account •••• 4892 (Savings)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => setActiveView('make-payment')}
              className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Money</span>
            </button>

            <button
              onClick={() => setActiveView('manage-nominees')}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition border border-slate-700/60"
            >
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Trusted Contacts</span>
            </button>

            <button
              onClick={() => setActiveView('payer-dashboard')}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition border border-slate-700/60"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Security</span>
            </button>
          </div>
        </div>

        {/* Security Overview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">FinShield Defense</h3>
                <span className="text-[11px] text-emerald-400 font-medium">All systems active</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Remote App Guard</span>
                <span className="text-emerald-400 font-medium">Monitoring</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Call Coaching Shield</span>
                <span className="text-emerald-400 font-medium">Armed</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Trusted Contact</span>
                <span className="text-slate-200 font-medium">
                  {primaryNominee ? primaryNominee.name.split(' ')[0] : 'None'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('manage-nominees')}
            className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-indigo-400 text-xs font-medium transition text-center"
          >
            Manage Security Settings &rarr;
          </button>
        </div>
      </div>

      {/* 4. Recent Transactions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-white text-sm">Recent Transactions</h3>
          </div>
          <button
            onClick={() => setActiveView('payment-history')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {userPayments.slice(0, 4).map(record => (
            <div key={record.id} className="py-3.5 flex items-center justify-between gap-4 text-xs hover:bg-slate-800/20 px-2 rounded-xl transition">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  record.status === 'HELD_VERIFICATION'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : record.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {record.status === 'HELD_VERIFICATION' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-slate-200">{record.payee_name}</div>
                  <div className="text-slate-400 text-[11px] truncate max-w-xs">{record.memo}</div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-semibold text-white block">
                  ₹{record.amount.toLocaleString()}
                </span>
                <span className={`text-[10px] font-medium ${
                  record.status === 'HELD_VERIFICATION'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {record.status === 'HELD_VERIFICATION' ? 'Held for Review' : 'Verified'}
                </span>
              </div>
            </div>
          ))}

          {userPayments.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent payments recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
