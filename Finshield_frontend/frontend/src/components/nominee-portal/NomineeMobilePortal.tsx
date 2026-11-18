import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  KeyRound,
  Lock,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  Info,
  Radio,
  Send,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';
import { Badge } from '../common/Badge';

export const NomineeMobilePortal: React.FC = () => {
  const {
    holds,
    nomineeApprove,
    nomineeReject,
    nomineePortalToken,
    setNomineePortalToken,
  } = useFinShield();

  const awaitingHolds = holds.filter(
    h => h.state === 'AWAITING_NOMINEE' || h.state === 'PENDING'
  );
  
  const currentHold = holds.find(h => h.token === nomineePortalToken) || awaitingHolds[0] || holds[0];

  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Payer is being coached on an active phone call');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(600);

  useEffect(() => {
    if (!currentHold) return;
    const calculateSeconds = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(currentHold.expires_at).getTime() - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
    };
    calculateSeconds();
    const interval = setInterval(calculateSeconds, 1000);
    return () => clearInterval(interval);
  }, [currentHold]);

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHold) return;
    if (enteredOtp.trim() === currentHold.otp_code) {
      setIsOtpVerified(true);
      setOtpError(null);
    } else {
      setOtpError(`Invalid code. Enter verification code '${currentHold.otp_code}' from SMS alert.`);
    }
  };

  const handleApprove = async () => {
    if (!currentHold) return;
    setIsSubmitting(true);
    setActionResult(null);
    try {
      const res = await nomineeApprove(currentHold.id, currentHold.token, currentHold.otp_code);
      setActionResult(res);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!currentHold) return;
    setIsSubmitting(true);
    setActionResult(null);
    try {
      const res = await nomineeReject(currentHold.id, currentHold.token, currentHold.otp_code, rejectReason);
      setActionResult(res);
      setShowRejectModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentHold) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-white font-bold text-base">No Pending Verification Requests</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Execute a payment resulting in a hold from the sandbox to view the trusted contact approval flow.
        </p>
      </div>
    );
  }

  const isResolved = currentHold.state !== 'AWAITING_NOMINEE' && currentHold.state !== 'PENDING';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Context & Out-of-Band Dispatch */}
      <div className="lg:col-span-6 space-y-5">
        <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Trusted Contact Verification</h3>
              <p className="text-xs text-slate-400">
                Off-device approval protects victims from remote coercion
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <strong>How this protects the user: </strong> Even when an attacker has full remote control over the payer's device, they cannot authorize the transaction. The approval link is dispatched out-of-band to this separate trusted contact device.
          </p>

          {/* Simulated SMS Alert */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">
                  SMS Alert to {currentHold.nominee.name} ({currentHold.nominee.phone})
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">Delivered</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 text-xs text-slate-200 leading-relaxed space-y-1.5 border border-slate-800/80">
              <p>
                <strong>Security Alert: </strong> {currentHold.payer_name} requested a transfer of{' '}
                <strong className="text-emerald-400">₹{currentHold.amount.toLocaleString('en-IN')}</strong> to{' '}
                <span className="font-mono text-slate-300">{currentHold.payee_id}</span>.
              </p>
              <p>
                Your verification code is: <strong className="text-amber-300 font-mono text-sm underline">{currentHold.otp_code}</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Valid for 15 minutes. Open secure review link: <span className="text-indigo-400 underline">https://verify.finshield.internal</span>
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Relationship: {currentHold.nominee.relationship}</span>
              <button
                onClick={() => setEnteredOtp(currentHold.otp_code)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Copy code '{currentHold.otp_code}' to phone →
              </button>
            </div>
          </div>

          {/* Active Cases Switcher */}
          {awaitingHolds.length > 1 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Active Pending Cases:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {awaitingHolds.map(h => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setNomineePortalToken(h.token);
                      setIsOtpVerified(false);
                      setEnteredOtp('');
                      setActionResult(null);
                    }}
                    className={`p-2.5 rounded-xl border text-xs text-left transition ${
                      h.token === currentHold.token
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-white font-mono">{h.id}</div>
                    <div className="text-[11px] truncate">₹{h.amount.toLocaleString('en-IN')} • {h.payer_name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Nominee Mobile Canvas */}
      <div className="lg:col-span-6 flex justify-center">
        <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden p-2 relative">
          <div className="bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800">
            {/* Status Bar */}
            <div className="pt-3 pb-2 px-6 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-900">
              <span className="font-semibold text-slate-300 font-mono">9:41 AM</span>
              <div className="w-16 h-3.5 bg-slate-900 rounded-full mx-auto" />
              <div className="flex items-center gap-1.5 font-mono">
                <span>5G</span>
                <span>99%</span>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Security Verification</h4>
                  <p className="text-[10px] text-slate-400">FinShield Trusted Contact</p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className={timeLeft < 180 ? 'text-rose-400 font-bold animate-pulse' : 'text-amber-300 font-medium'}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[580px] overflow-y-auto text-xs">
              {/* Resolved State */}
              {isResolved && (
                <div
                  className={`p-4 rounded-xl border text-center space-y-1.5 ${
                    currentHold.state === 'RELEASED'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : currentHold.state === 'REJECTED'
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm">
                    {currentHold.state === 'RELEASED' && 'Transfer Approved'}
                    {currentHold.state === 'REJECTED' && 'Transfer Declined & Account Secured'}
                    {currentHold.state === 'EXPIRED' && 'Verification Window Expired'}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    {currentHold.resolution_reason || 'This transaction has been resolved.'}
                  </p>
                </div>
              )}

              {/* Step 1: Verification Code */}
              {!isOtpVerified && !isResolved && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 py-3">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-1.5">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-white text-sm">Enter Verification Code</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Enter the 4-digit security code sent to your phone ending in{' '}
                      <span className="font-mono text-slate-200">
                        {currentHold.nominee.phone.slice(-4)}
                      </span>
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="• • • •"
                      className="w-full text-center tracking-[0.4em] text-xl font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl py-3 text-white focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                    {otpError && (
                      <p className="text-[11px] text-rose-400 mt-1.5 text-center font-medium">
                        {otpError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
                  >
                    Continue to Review
                  </button>
                </form>
              )}

              {/* Step 2: Customer Fraud Brief */}
              {isOtpVerified && !isResolved && (
                <div className="space-y-3.5">
                  {/* Overview Card */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Requested by:</span>
                      <strong className="text-white">{currentHold.payer_name}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Transfer Amount:</span>
                      <strong className="text-emerald-400 font-mono text-base font-bold">
                        ₹{currentHold.amount.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Beneficiary:</span>
                      <span className="font-mono text-slate-200 truncate max-w-[160px]">
                        {currentHold.payee_id}
                      </span>
                    </div>
                    <div className="border-t border-slate-800/80 pt-1.5 text-slate-400 text-[11px]">
                      Note: <span className="text-slate-200 italic">"{currentHold.memo}"</span>
                    </div>
                  </div>

                  {/* Warning Brief */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Why this transfer was paused</span>
                    </div>

                    <p className="text-slate-200 text-xs leading-relaxed">
                      {currentHold.investigation?.explainer.plain_language_summary ||
                        `FinShield held this transfer because ${currentHold.payer_name} is sending money to a new recipient while an active voice call is in progress.`}
                    </p>

                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                        Observed Warning Signs:
                      </span>
                      <ul className="space-y-0.5 text-[11px]">
                        {(currentHold.investigation?.explainer.suspicious_indicators || currentHold.reasons).map((ind, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-slate-300">
                            <span className="text-rose-400 font-bold shrink-0">•</span>
                            <span>{ind}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-amber-800/30 text-[11px] text-amber-200">
                      <strong className="text-white block mb-0.5">Guidance:</strong>
                      {currentHold.investigation?.explainer.advice_for_nominee ||
                        `Speak with ${currentHold.payer_name} on a known trusted number. If an unknown caller instructed them to send money, decline this transfer.`}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline &amp; Protect Account</span>
                    </button>

                    <button
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I Spoke with Payer — Approve</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Reject Reason Form */}
              {showRejectModal && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-700 space-y-2.5">
                  <span className="font-semibold text-white text-xs block">
                    Reason for Declining:
                  </span>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Payer is being coerced by phone caller">
                      Payer is being coerced by phone caller
                    </option>
                    <option value="Remote access software suspected">
                      Remote access software suspected
                    </option>
                    <option value="Unknown fraudulent beneficiary / scam invoice">
                      Unknown fraudulent beneficiary / scam invoice
                    </option>
                  </select>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => setShowRejectModal(false)}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isSubmitting}
                      className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* Action Result */}
              {actionResult && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    actionResult.success
                      ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/50 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{actionResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
