import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Lock,
  Layers,
  Code2,
  Copy,
  Check,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';
import { Badge } from '../common/Badge';

export const TelemetryInspector: React.FC = () => {
  const { recentEvaluations, config } = useFinShield();
  const [copied, setCopied] = useState<boolean>(false);
  const [showJsonRaw, setShowJsonRaw] = useState<boolean>(false);

  const latest = recentEvaluations[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur flex flex-col space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-semibold text-white text-sm">Risk Assessment &amp; Telemetry</h3>
          <p className="text-xs text-slate-400">Real-time risk scoring and privacy-preserving analysis</p>
        </div>

        {latest && (
          <Badge type="compromise" value={latest.compromise_classification} size="md" />
        )}
      </div>

      {!latest ? (
        <div className="py-16 text-center space-y-2.5 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 p-6">
          <Activity className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
          <h4 className="font-medium text-slate-300 text-sm">Awaiting Transaction Authorization</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Execute a payment from the sandbox to observe real-time risk scoring and signal telemetry.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Risk Score Gauge */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-300">
                  Overall Risk Score
                </span>
                <p className="text-[11px] text-slate-400">Aggregated deterministic score</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xl font-bold text-white">
                  {(latest.factors.combined_score * 100).toFixed(0)} / 100
                </span>
              </div>
            </div>

            {/* Threshold Bands Bar */}
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 p-0.5 relative">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out shadow"
                style={{
                  width: `${Math.min(100, latest.factors.combined_score * 100)}%`,
                  backgroundColor:
                    latest.factors.combined_score >= config.hold_threshold
                      ? '#ea580c'
                      : latest.factors.combined_score >= config.allow_threshold
                      ? '#d97706'
                      : '#16a34a',
                }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span className="text-emerald-400">Low (0–29)</span>
              <span className="text-amber-400">Moderate (30–69)</span>
              <span className="text-orange-400">High (70–100)</span>
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Key Contributing Signals
              </span>
              <span className="text-xs font-mono text-emerald-400">
                Processed in {latest.latency_ms} ms
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Amount Anomaly */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">Amount Deviation</div>
                  <div className="text-[11px] text-slate-400">Compared to user's 90-day typical transfer size</div>
                </div>
                <div className="text-right font-mono font-semibold text-white">
                  {(latest.factors.amount_anomaly * 100).toFixed(0)}%
                </div>
              </div>

              {/* Device Compromise */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">Device Compromise Indicators</div>
                  <div className="text-[11px] text-slate-400">Remote control, active call, or screen broadcast</div>
                </div>
                <div className={`text-right font-mono font-semibold ${latest.factors.device_compromise > 0.5 ? 'text-rose-400' : 'text-white'}`}>
                  {(latest.factors.device_compromise * 100).toFixed(0)}%
                </div>
              </div>

              {/* New Payee */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">First-Time Beneficiary</div>
                  <div className="text-[11px] text-slate-400">Recipient not found in prior transaction history</div>
                </div>
                <div className="text-right font-mono font-semibold text-white">
                  {(latest.factors.new_payee * 100).toFixed(0)}%
                </div>
              </div>

              {/* New Device */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">Unrecognized Device</div>
                  <div className="text-[11px] text-slate-400">Session initiated from a newly registered device</div>
                </div>
                <div className="text-right font-mono font-semibold text-white">
                  {(latest.factors.new_device * 100).toFixed(0)}%
                </div>
              </div>

              {/* Prompt Injection */}
              {latest.factors.prompt_injection_penalty > 0 && (
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 flex items-center justify-between text-rose-300">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Adversarial Text Detected</div>
                      <div className="text-[11px] text-rose-300/80">Instruction override pattern neutralized in memo</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-rose-400">
                    Flagged
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Layer (Redacted Memo) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300">
                  Privacy Redaction Layer
                </span>
              </div>
              <span className="text-[11px] text-cyan-300 font-mono">PII Masked</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Personal identifiers (cards, phone numbers, tax IDs) are automatically masked before text enters the AI analysis context.
            </p>

            <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap">
              {latest.masked_memo}
            </pre>
          </div>

          {/* API Payload Accordion */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowJsonRaw(!showJsonRaw)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-medium text-slate-300 hover:text-white transition"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-400" />
                <span>API Response Inspector (POST /v1/payments/evaluate)</span>
              </div>
              {showJsonRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showJsonRaw && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-mono">200 OK</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(latest, null, 2))}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-72">
                  {JSON.stringify(latest, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
