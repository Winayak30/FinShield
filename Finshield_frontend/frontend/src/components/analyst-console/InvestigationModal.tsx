import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Terminal,
  Cpu,
  Clock,
  Send,
  Zap,
  ChevronRight,
  FileText,
  UserCheck,
} from 'lucide-react';
import { HoldEvent } from '../../types/finshield';
import { useFinShield } from '../../context/FinShieldContext';
import { Badge } from '../common/Badge';

interface Props {
  hold: HoldEvent;
  onClose: () => void;
}

export const InvestigationModal: React.FC<Props> = ({ hold, onClose }) => {
  const { analystOverride, auditLogs } = useFinShield();
  const [activeTab, setActiveTab] = useState<'specialists' | 'reviewer' | 'explainer' | 'mcp' | 'audit'>('specialists');
  
  // Override form state
  const [overrideAction, setOverrideAction] = useState<'approve' | 'reject' | 'escalate'>('approve');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [analystName, setAnalystName] = useState<string>('Sarah Connor (Lead Fraud Analyst)');
  const [showOverrideConfirm, setShowOverrideConfirm] = useState<boolean>(false);

  const inv = hold.investigation;
  const holdAudits = auditLogs.filter(a => a.hold_id === hold.id);

  const handleExecuteOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    analystOverride(hold.id, overrideAction, overrideReason, analystName);
    setShowOverrideConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-white text-base">
                  Case Investigation: <span className="font-mono text-indigo-400">{hold.id}</span>
                </span>
                <Badge type="state" value={hold.state} size="sm" />
                <Badge type="verdict" value="HOLD" size="sm" />
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span>Customer: <strong className="text-slate-200">{hold.payer_name}</strong></span>
                <span>•</span>
                <span>Beneficiary: <span className="font-mono text-slate-200">{hold.payee_id}</span></span>
                <span>•</span>
                <span>Amount: <strong className="text-emerald-400 font-mono">₹{hold.amount.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Strip */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-4">
          <div className="flex items-center gap-6">
            <div>
              Risk Score: <strong className="font-mono text-rose-400 font-bold">{(hold.risk_score * 100).toFixed(0)}%</strong>
            </div>
            <div>
              Window Remaining:{' '}
              <span className="font-mono text-amber-300 font-semibold">
                {Math.max(0, Math.round((new Date(hold.expires_at).getTime() - Date.now()) / 60000))} minutes
              </span>
            </div>
            <div>
              Pipeline Model: <span className="font-mono text-indigo-300">{inv?.model_tier || 'Gemini 1.5 Flash'}</span>
            </div>
          </div>

          {inv && (
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>Tokens: {inv.token_usage.prompt_tokens} prompt / {inv.token_usage.cached_tokens} cached</span>
              <span>Cost: ${inv.token_usage.total_cost_usd}</span>
              <span>Duration: {inv.duration_ms}ms</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('specialists')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'specialists'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            Specialist Analysis
          </button>

          <button
            onClick={() => setActiveTab('reviewer')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'reviewer'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Quality Review
          </button>

          <button
            onClick={() => setActiveTab('explainer')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'explainer'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Customer Briefing
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'mcp'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Live Data Queries
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Audit Trail
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {!inv ? (
            <div className="p-12 text-center space-y-2 text-slate-400">
              <Clock className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
              <p className="font-semibold text-white text-sm">Multi-Agent Review Pipeline Running...</p>
              <p className="text-xs text-slate-400">Executing independent social engineering and device compromise assessments</p>
            </div>
          ) : (
            <>
              {/* TAB 1: Specialist Agents */}
              {activeTab === 'specialists' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Social Engineering Specialist */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">
                          Social Engineering &amp; Coercion Review
                        </div>
                        <div className="text-[11px] text-slate-400">Evaluates psychological manipulation, urgency, and pretexts</div>
                      </div>
                      <Badge type="risk" value={inv.specialists.social_engineering.risk_rating} size="sm" />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400 block">
                        Coercion Indicators:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {inv.specialists.social_engineering.flags.map((f, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-md bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
                            ⚠ {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400 block">
                        Investigator Findings:
                      </span>
                      <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        {inv.specialists.social_engineering.reasoning}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400 block">
                        Observed Evidence:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {inv.specialists.social_engineering.evidence.map((e, i) => (
                          <li key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Device Compromise Specialist */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">
                          Device Integrity &amp; Session Telemetry
                        </div>
                        <div className="text-[11px] text-slate-400">Evaluates remote software, screen mirroring, and accessibility abuse</div>
                      </div>
                      <Badge type="risk" value={inv.specialists.device_compromise.risk_rating} size="sm" />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400 block">
                        Compromise Indicators:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {inv.specialists.device_compromise.flags.map((f, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs">
                            🔍 {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400 block">
                        Investigator Findings:
                      </span>
                      <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        {inv.specialists.device_compromise.reasoning}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400 block">
                        Observed Evidence:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {inv.specialists.device_compromise.evidence.map((e, i) => (
                          <li key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2">
                            <span className="text-purple-400 font-bold">•</span>
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Reviewer Agent */}
              {activeTab === 'reviewer' && (
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="font-semibold text-white text-sm">Quality Review &amp; Schema Guard</span>
                        <p className="text-xs text-slate-400">Verifies factual grounding, schema validity, and absence of hallucinations</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono">
                      ✓ Validation Passed
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-300">Review Summary:</span>
                    <p className="text-xs text-slate-200 bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed font-mono">
                      {inv.reviewer.critique}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Consensus Action:</span>
                      <strong className="text-white ml-2 text-sm">{inv.reviewer.consensus_recommendation}</strong>
                    </div>
                    <span className="text-slate-400">Escalate to Senior Reviewer: <strong className="text-slate-200">{inv.reviewer.escalate_to_human ? 'Yes' : 'No'}</strong></span>
                  </div>
                </div>
              )}

              {/* TAB 3: Explainer Brief */}
              {activeTab === 'explainer' && (
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs text-indigo-400 font-mono font-semibold uppercase">Customer Facing Explanation</span>
                    <h3 className="text-base font-bold text-white mt-1">{inv.explainer.headline}</h3>
                    <p className="text-xs text-slate-200 mt-2 bg-slate-900 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                      {inv.explainer.plain_language_summary}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Suspicious Indicators Formatted for Customer / Trusted Contact:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {inv.explainer.suspicious_indicators.map((ind, i) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-start gap-2">
                          <span className="text-rose-400 font-bold shrink-0">!</span>
                          <span>{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
                    <strong className="text-white block mb-0.5">Recommended Action for Recipient:</strong>
                    {inv.explainer.advice_for_nominee}
                  </div>
                </div>
              )}

              {/* TAB 4: FastMCP Tool Logs */}
              {activeTab === 'mcp' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">Data Context &amp; Live Telemetry Queries</span>
                      <p className="text-slate-400 text-[11px]">Read-only queries bound securely to the investigation context</p>
                    </div>
                    <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/60 text-xs">
                      3 Queries Logged
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {inv.tool_calls.map((tc) => (
                      <div key={tc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-indigo-400 font-bold">{tc.tool}()</span>
                          <span className="text-[11px] text-slate-400">{tc.execution_time_ms} ms</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Hash: <span className="text-slate-300">{tc.result_hash}</span>
                        </div>
                        <div className="p-2.5 rounded bg-slate-900 border border-slate-800/70 text-slate-200 text-xs">
                          {tc.output_summary}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Audit Log */}
              {activeTab === 'audit' && (
                <div className="space-y-2.5">
                  <div className="text-xs text-slate-400 mb-2">
                    Immutable security audit trail for Case <span className="font-mono text-white">{hold.id}</span>:
                  </div>
                  {holdAudits.map((a) => (
                    <div key={a.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-indigo-400 font-semibold">{a.actor}</span>
                          <span className="text-slate-400 font-mono">
                            {a.from_state} → <strong className="text-white">{a.to_state}</strong>
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1">{a.reason}</p>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Bar: Action & Manual Resolution */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4">
          {!showOverrideConfirm ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Case Status:{' '}
                <strong className="text-white">{hold.state}</strong>
                {hold.resolved_by && ` • Resolved by: ${hold.resolved_by}`}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setOverrideAction('approve');
                    setShowOverrideConfirm(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve &amp; Release
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOverrideAction('reject');
                    setShowOverrideConfirm(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <XCircle className="w-4 h-4" />
                  Decline &amp; Refund
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleExecuteOverride} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Confirm Analyst Decision [{overrideAction.toUpperCase()}]
                </span>
                <button
                  type="button"
                  onClick={() => setShowOverrideConfirm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Analyst Profile</label>
                  <input
                    type="text"
                    value={analystName}
                    onChange={(e) => setAnalystName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Mandatory Resolution Notes (Logged permanently to audit record)
                  </label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Verified with customer directly on their primary phone line"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowOverrideConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 ${
                    overrideAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Commit Decision
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
