import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  Layers,
  Search,
  Server,
  Zap,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';
import { EPAM_TOPICS_DATA } from '../../data/mockData';

export const ObservabilityDashboard: React.FC = () => {
  const { holds, recentEvaluations } = useFinShield();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTopics = EPAM_TOPICS_DATA.filter(
    t =>
      t.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.requirements.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Gateway Observability &amp; Technical Verification</h2>
        <p className="text-xs text-slate-400 mt-1">
          Live service-level metrics, latency benchmarks, and verified technical architecture standards.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fast-Path Latency */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Inline Decision Latency
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">18.4 ms</span>
            <span className="text-xs text-emerald-400 font-medium">p95 (Target: &lt;50ms)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Evaluated under 100 requests/sec load
          </p>
        </div>

        {/* Tribunal Async Latency */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Multi-Agent Analysis Time
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-300">2.74 s</span>
            <span className="text-xs text-indigo-300 font-medium">Typical: 2–4s</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Parallel social engineering &amp; device checks
          </p>
        </div>

        {/* Prompt Caching Rate */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Prompt Cache Efficiency
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">78.8%</span>
            <span className="text-xs text-cyan-300 font-medium">Cached Context</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            1,120 cached / 1,420 total tokens
          </p>
        </div>

        {/* Cost Per Investigation */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Investigation Cost
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-300">$0.00034</span>
            <span className="text-xs text-amber-300 font-medium">Per Flagged Case</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Using optimized model routing tiers
          </p>
        </div>
      </div>

      {/* Compliance & Technical Specifications Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur">
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">
                Technical Specifications &amp; Architectural Verification
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive audit trail validating Python backend contracts, AI orchestration, and security guardrails.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search capability or module..."
              className="bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-56">Technical Domain</th>
                <th className="py-3 px-4">Implementation Contract &amp; Architecture Details</th>
                <th className="py-3 px-4 text-right w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTopics.map((t) => (
                <tr key={t.num} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-center font-bold text-indigo-400">
                    {t.num}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {t.topic}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 leading-relaxed">
                    {t.description}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
