import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';

export const PaymentHistory: React.FC = () => {
  const { paymentHistory, currentUser, setActiveView } = useFinShield();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'HELD_VERIFICATION' | 'REJECTED'>('ALL');

  const userPayments = paymentHistory.filter(p => p.payer_id === currentUser.id);

  const filteredPayments = userPayments.filter(p => {
    const matchesSearch =
      p.payee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.payee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.memo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payment History &amp; Security Audits</h2>
          <p className="text-xs text-slate-400 mt-1">
            Every transaction is verified in under 50ms against your 90-day baseline behavior and hardware session signals.
          </p>
        </div>

        <button
          onClick={() => setActiveView('make-payment')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <span>Send New Payment</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by payee name, UPI ID, or memo..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'COMPLETED', 'HELD_VERIFICATION', 'REJECTED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {s === 'ALL' ? 'All' : s === 'HELD_VERIFICATION' ? 'Held' : s === 'COMPLETED' ? 'Completed' : 'Rejected'}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table / List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="divide-y divide-slate-800">
          {filteredPayments.map(p => (
            <div key={p.id} className="p-5 hover:bg-slate-800/30 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    p.status === 'HELD_VERIFICATION'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : p.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {p.status === 'HELD_VERIFICATION' && <AlertTriangle className="w-5 h-5" />}
                    {p.status === 'COMPLETED' && <CheckCircle2 className="w-5 h-5" />}
                    {p.status === 'REJECTED' && <XCircle className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{p.payee_name}</span>
                      <span className="text-xs text-slate-400 font-mono">({p.payee_id})</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{p.memo}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                  <span className="text-base font-bold font-mono text-white">
                    ₹{p.amount.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      p.status === 'HELD_VERIFICATION'
                        ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                        : p.status === 'COMPLETED'
                        ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                        : 'bg-rose-400/10 text-rose-300 border border-rose-400/20'
                    }`}>
                      {p.status === 'HELD_VERIFICATION' ? 'Held for Nominee' : p.status === 'COMPLETED' ? 'Completed' : 'Declined'}
                    </span>
                    <span className="text-[11px] text-slate-400">{p.date}</span>
                  </div>
                </div>
              </div>

              {p.protection_details && (
                <div className="bg-slate-950/60 rounded-xl px-3.5 py-2 border border-slate-800/80 text-xs flex items-center gap-2 text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{p.protection_details}</span>
                </div>
              )}
            </div>
          ))}

          {filteredPayments.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No payments match your current search or filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

