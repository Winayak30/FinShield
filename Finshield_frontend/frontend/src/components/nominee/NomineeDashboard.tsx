import React, { useState } from 'react';
import {
  UserCheck,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  PhoneCall,
  Lock,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';

export const NomineeDashboard: React.FC = () => {
  const {
    currentUser,
    holds,
    setActiveView,
    setActiveReviewHold,
    setSelectedHold,
  } = useFinShield();

  const [activeTab, setActiveTab] = useState<'incoming' | 'history'>('incoming');

  // Filter requests where this user is the registered nominee
  const pendingRequests = holds.filter(
    h => (h.state === 'PENDING' || h.state === 'AWAITING_NOMINEE') &&
         (h.nominee.nominee_user_id === currentUser.id || h.nominee.phone === currentUser.phone)
  );

  const pastDecisions = holds.filter(
    h => (h.state === 'RELEASED' || h.state === 'REJECTED' || h.state === 'EXPIRED') &&
         (h.nominee.nominee_user_id === currentUser.id || h.nominee.phone === currentUser.phone)
  );

  const openReview = (hold: typeof holds[0]) => {
    setActiveReviewHold(hold);
    setSelectedHold(hold);
    setActiveView('nominee-review');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${
              pendingRequests.length > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Trusted Approvals</h1>
                {pendingRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                    {pendingRequests.length} Awaiting Decision
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and authorize sensitive payments on behalf of family &amp; contacts who trust you.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition relative ${
              activeTab === 'incoming'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Pending Approvals</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 font-mono">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Past Decisions</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INCOMING REQUESTS */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {pendingRequests.map(hold => (
            <div
              key={hold.id}
              className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4 ring-1 ring-amber-500/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Authorization Required
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{hold.payer_name}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    ₹{hold.amount.toLocaleString()} to {hold.payee_name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    "{hold.memo}"
                  </p>
                </div>

                <button
                  onClick={() => openReview(hold)}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-md shadow-amber-400/20"
                >
                  <span>Review &amp; Decide</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Reasons preview */}
              <div className="bg-slate-950 rounded-xl p-3.5 text-xs text-slate-300 space-y-2 border border-slate-800">
                <div className="font-medium text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Why this payment was held:</span>
                </div>
                <ul className="space-y-1 text-slate-400 pl-6 list-disc">
                  {hold.reasons.slice(0, 3).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {pendingRequests.length === 0 && (
            <div className="py-16 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-white">No Pending Payment Requests</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All payments initiated by contacts who selected you as their nominee are currently in order.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAST DECISIONS */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="p-5 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">Past Decision History</h3>
          </div>

          <div className="divide-y divide-slate-800">
            {pastDecisions.map(h => (
              <div key={h.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-white">
                    {h.payer_name} &rarr; {h.payee_name}
                  </div>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    {h.resolution_reason || h.memo}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white">
                    ₹{h.amount.toLocaleString()}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    h.state === 'RELEASED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {h.state === 'RELEASED' ? 'Approved' : 'Declined'}
                  </span>
                </div>
              </div>
            ))}

            {pastDecisions.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No past decision records found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
