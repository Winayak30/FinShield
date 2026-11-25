import React, { useState } from 'react';
import {
  Smartphone,
  ShieldAlert,
  Send,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  UserCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  PhoneCall,
  Monitor,
  Radio,
  SlidersHorizontal,
  Info,
  Check,
  ArrowUpRight,
  Shield,
  CreditCard,
  Lock,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';
import { PaymentEvaluationRequest, DeviceSessionSignals } from '../../types/finshield';
import { ACCEPTANCE_SCENARIOS } from '../../data/scenarios';
import { Badge } from '../common/Badge';

export const PaymentAppSimulator: React.FC = () => {
  const {
    users,
    evaluatePayment,
    loadScenario,
    setActiveView,
    setActiveReviewHold,
    setSelectedHold,
    holds,
    tribunalLoadingStatus,
  } = useFinShield();

  // Form State
  const [payerId, setPayerId] = useState<string>('usr_diya');
  const [payeeId, setPayeeId] = useState<string>('apartment-rent@icici');
  const [amount, setAmount] = useState<number>(18000);
  const [currency] = useState<string>('INR');
  const [memo, setMemo] = useState<string>('Monthly flat rent payment');

  // SDK Telemetry Signals
  const [signals, setSignals] = useState<DeviceSessionSignals>({
    remote_access_tool_detected: false,
    remote_access_tool_name: 'AnyDesk Remote Client',
    screen_share_active: false,
    call_in_progress: false,
    accessibility_service_abuse: false,
    new_device: false,
    device_age_days: 380,
    source: 'finshield-mobile-sdk',
    confidence: 0.99,
  });

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [lastVerdict, setLastVerdict] = useState<any>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('scenario-a3');

  const activeUser = users[payerId] || Object.values(users)[0];

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedPresetId(scenarioId);
    const sc = loadScenario(scenarioId);
    if (!sc) return;
    setPayerId(sc.request.payer_id);
    setPayeeId(sc.request.payee_id);
    setAmount(sc.request.amount);
    setMemo(sc.request.memo);
    setSignals(sc.request.device_session);
  };

  const handleRunEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    setLastVerdict(null);

    const req: PaymentEvaluationRequest = {
      idempotency_key: 'idem_' + Math.random().toString(36).substring(2, 10),
      payer_id: payerId,
      amount: Number(amount),
      currency,
      payee_id: payeeId,
      memo,
      timestamp: new Date().toISOString(),
      device_session: signals,
    };

    try {
      const resp = await evaluatePayment(req);
      setLastVerdict(resp);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleResetClean = () => {
    setSelectedPresetId('');
    setPayerId('usr_diya');
    setPayeeId('apartment-rent@icici');
    setAmount(18000);
    setMemo('Monthly flat rent payment');
    setSignals({
      remote_access_tool_detected: false,
      remote_access_tool_name: '',
      screen_share_active: false,
      call_in_progress: false,
      accessibility_service_abuse: false,
      new_device: false,
      device_age_days: 380,
      source: 'finshield-mobile-sdk',
      confidence: 0.99,
    });
    setLastVerdict(null);
  };

  const latestHold = holds[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-white text-base">Payment Checkout</h2>
            <span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              FinShield SDK Protected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time fraud defense evaluates device signals and recipient risk before authorization.
          </p>
        </div>

        <button
          onClick={handleResetClean}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Natural Scenario Presets Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">
              Test Presets
            </span>
            <span className="text-[11px] text-slate-400">Select a scenario to populate test signals</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'scenario-a1', label: 'Coerced Remote Scam (₹25k)' },
              { id: 'scenario-a2', label: 'Phone Call Impersonation (₹48k)' },
              { id: 'scenario-a3', label: 'Regular Rent Transfer (₹18k)' },
              { id: 'scenario-a4', label: 'Memo Prompt-Injection' },
            ].map(sc => {
              const isSelected = selectedPresetId === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleRunEvaluation} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payer Account */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Payer Account
              </label>
              <select
                value={payerId}
                onChange={e => setPayerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {Object.values(users).map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.state === 'FROZEN_SECURITY' ? 'Locked (Frozen)' : `${u.baseline.sample_count} baseline transactions`}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient VPA */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Beneficiary UPI ID or Bank Account
              </label>
              <input
                type="text"
                value={payeeId}
                onChange={e => setPayeeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="recipient@upi"
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Payment Memo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Payment Purpose / Note
              </label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="What is this transfer for?"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isEvaluating}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Evaluating Payment Security...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Authorize &amp; Pay ₹{amount.toLocaleString()}</span>
              </>
            )}
          </button>
        </form>

        {/* Real-time Verdict Output Card */}
        {lastVerdict && (
          <div className={`p-5 rounded-2xl border transition-all ${
            lastVerdict.verdict === 'ALLOW'
              ? 'bg-emerald-950/20 border-emerald-800/40'
              : lastVerdict.verdict === 'HOLD'
              ? 'bg-amber-950/20 border-amber-800/40'
              : lastVerdict.verdict === 'STEP_UP'
              ? 'bg-blue-950/20 border-blue-800/40'
              : 'bg-rose-950/20 border-rose-800/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <Badge type="verdict" value={lastVerdict.verdict} size="lg" />
                <span className="text-xs text-slate-300">
                  Risk Score: <strong className="text-white font-mono">{(lastVerdict.risk_score * 100).toFixed(0)}%</strong>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  • Evaluated in <strong className="text-emerald-400">{lastVerdict.latency_ms}ms</strong>
                </span>
              </div>

              {lastVerdict.verdict === 'HOLD' && (
                <button
                  onClick={() => {
                    if (latestHold) {
                      setActiveReviewHold(latestHold);
                      setSelectedHold(latestHold);
                    }
                    setActiveView('nominee-review');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <span>Review with Nominee</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reasons List */}
            <div className="mt-3 text-xs space-y-1.5">
              <span className="font-semibold text-slate-300">Decision Rationale:</span>
              <ul className="space-y-1 text-slate-300">
                {lastVerdict.reasons.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {tribunalLoadingStatus && (
              <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs text-indigo-300 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
                <span>{tribunalLoadingStatus}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
