import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  History,
  TrendingDown,
  UserX,
  User,
  ArrowUpRight,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';
import { HoldEvent, HoldState, UserAccount } from '../../types/finshield';
import { Badge } from '../common/Badge';
import { InvestigationModal } from './InvestigationModal';
import { UnfreezeModal } from './UnfreezeModal';

export const HoldsDashboard: React.FC = () => {
  const { holds, users, auditLogs } = useFinShield();

  const [filterState, setFilterState] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inspectingHold, setInspectingHold] = useState<HoldEvent | null>(null);
  const [unfreezingUser, setUnfreezingUser] = useState<UserAccount | null>(null);

  const activeHolds = holds.filter(h => h.state === 'PENDING' || h.state === 'AWAITING_NOMINEE');
  const rejectedCount = holds.filter(h => h.state === 'REJECTED').length;
  const releasedCount = holds.filter(h => h.state === 'RELEASED').length;
  const frozenUsers = Object.values(users).filter(u => u.state === 'FROZEN_SECURITY');

  const filteredHolds = holds.filter(h => {
    const matchesState = filterState === 'ALL' || h.state === filterState;
    const matchesSearch =
      h.payer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.payee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.memo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesState && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Fraud Operations Review Queue</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review high-risk transactions paused for suspected push payment fraud or device compromise.
          </p>
        </div>

        {frozenUsers.length > 0 && (
          <button
            onClick={() => setUnfreezingUser(frozenUsers[0])}
            className="px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 flex items-center gap-2 text-xs font-semibold transition"
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Manage Security Freeze ({frozenUsers.length} account locked)</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Holds */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Reviews
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{activeHolds.length}</span>
            <span className="text-xs text-amber-400 font-medium">Awaiting decision</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            15-minute verification window active
          </p>
        </div>

        {/* Prevented APP Frauds */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Fraud Prevented
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{rejectedCount}</span>
            <span className="text-xs text-rose-400 font-medium">Transactions declined</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Victim funds preserved from APP scams
          </p>
        </div>

        {/* Successfully Released */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Released Transfers
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{releasedCount}</span>
            <span className="text-xs text-emerald-400 font-medium">Verified &amp; cleared</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Confirmed via trusted contact or manual approval
          </p>
        </div>

        {/* Frozen Accounts */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Security Freeze
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{frozenUsers.length}</span>
            <span className="text-xs text-purple-300 font-medium">Active lockdowns</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Requires dual-analyst verification to unlock
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur">
        {/* Table Controls */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-white">Review Cases</h3>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
              {filteredHolds.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customer, beneficiary, memo..."
                className="bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
              />
            </div>

            {/* State Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'AWAITING_NOMINEE', label: 'Pending Approval' },
                { id: 'PENDING', label: 'Investigating' },
                { id: 'RELEASED', label: 'Released' },
                { id: 'REJECTED', label: 'Declined' },
                { id: 'EXPIRED', label: 'Expired' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFilterState(s.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    filterState === s.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Case ID &amp; Customer</th>
                <th className="py-3.5 px-5">Beneficiary Destination</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Risk Level</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Time Left</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredHolds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredHolds.map((h) => {
                  const minutesLeft = Math.max(
                    0,
                    Math.round((new Date(h.expires_at).getTime() - Date.now()) / 60000)
                  );
                  const isAwaiting = h.state === 'AWAITING_NOMINEE' || h.state === 'PENDING';

                  return (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Customer */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white text-xs">{h.payer_name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{h.id}</div>
                      </td>

                      {/* Beneficiary */}
                      <td className="py-4 px-5">
                        <div className="font-mono text-slate-200 text-xs truncate max-w-xs font-medium">
                          {h.payee_id}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          "{h.memo}"
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          ₹{h.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Risk Score */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-xs">
                            {(h.risk_score * 100).toFixed(0)}%
                          </span>
                          <div className="w-12 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                h.risk_score >= 0.7 ? 'bg-orange-500' : h.risk_score >= 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${h.risk_score * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <Badge type="state" value={h.state} size="sm" />
                      </td>

                      {/* Window */}
                      <td className="py-4 px-5">
                        {isAwaiting ? (
                          <span className="font-mono text-amber-300 flex items-center gap-1 text-[11px] font-medium">
                            <Clock className="w-3 h-3" />
                            {minutesLeft}m left
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">
                            {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setInspectingHold(h)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Case</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation Details Modal */}
      {inspectingHold && (
        <InvestigationModal
          hold={inspectingHold}
          onClose={() => setInspectingHold(null)}
        />
      )}

      {/* Unfreeze Modal */}
      {unfreezingUser && (
        <UnfreezeModal
          user={unfreezingUser}
          onClose={() => setUnfreezingUser(null)}
        />
      )}
    </div>
  );
};
