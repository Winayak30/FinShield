import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  KeyRound,
  ShieldX,
  Smartphone,
  ChevronRight,
  Info,
  Lock,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';

export const NomineeReviewPage: React.FC = () => {
  const {
    activeReviewHold,
    currentUser,
    nomineeApprove,
    nomineeReject,
    setActiveView,
    holds,
  } = useFinShield();

  const hold = activeReviewHold || holds.find(h => h.state === 'AWAITING_NOMINEE' || h.state === 'PENDING') || holds[0];

  const [otpInput, setOtpInput] = useState(hold?.otp_code || '4892');
  const [rejectReason, setRejectReason] = useState('Coercion / suspected package delivery scam');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!hold) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">No Pending Authorizations</h2>
        <p className="text-xs text-slate-400">There are no payments awaiting your review.</p>
        <button
          onClick={() => setActiveView('home')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const isResolved = hold.state === 'RELEASED' || hold.state === 'REJECTED' || hold.state === 'EXPIRED';

  const handleApprove = async () => {
    setProcessing(true);
    setResultMessage(null);
    try {
      const res = await nomineeApprove(hold.id, hold.token, otpInput);
      if (res.success) {
        setResultMessage({ type: 'success', text: res.message });
      } else {
        setResultMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message || 'Approval failed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    setResultMessage(null);
    try {
      const res = await nomineeReject(hold.id, hold.token, otpInput, rejectReason);
      if (res.success) {
        setShowRejectModal(false);
        setResultMessage({ type: 'success', text: res.message });
      } else {
        setResultMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message || 'Decline failed' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn py-4">
      {/* Back button */}
      <button
        onClick={() => setActiveView('home')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Main Review Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Urgent Header */}
        <div className={`p-6 border-b ${
          isResolved
            ? hold.state === 'RELEASED'
              ? 'bg-emerald-950/20 border-emerald-800/40'
              : 'bg-rose-950/20 border-rose-800/40'
            : 'bg-amber-950/20 border-amber-800/40'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              isResolved
                ? hold.state === 'RELEASED'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {isResolved ? (
                hold.state === 'RELEASED' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  isResolved
                    ? hold.state === 'RELEASED' ? 'text-emerald-400' : 'text-rose-400'
                    : 'text-amber-400'
                }`}>
                  {isResolved ? `Payment ${hold.state}` : 'Payment Authorization Required'}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-0.5">
                {hold.payer_name} initiated a payment of ₹{hold.amount.toLocaleString()}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                You are registered as {hold.payer_name.split(' ')[0]}'s trusted contact.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Transfer Details Grid */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block">Sender</span>
                <span className="font-semibold text-white block mt-0.5">{hold.payer_name}</span>
                <span className="text-slate-400 text-[11px]">{hold.payer_phone}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Recipient</span>
                <span className="font-semibold text-white block mt-0.5">{hold.payee_name}</span>
                <span className="text-slate-400 font-mono text-[11px]">{hold.payee_id}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 block">Note / Description</span>
              <span className="text-slate-200 mt-0.5 block italic">"{hold.memo}"</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Why FinShield paused this payment:</span>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-300">
              {hold.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>

            {/* Advice Callout */}
            <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
              <PhoneCall className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5 text-amber-300">Recommended Action:</strong>
                <span>
                  Call {hold.payer_name.split(' ')[0]} directly on regular phone. Confirm they are not on call with someone asking them to transfer money to avoid legal action or clear a package.
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {resultMessage && (
            <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
              resultMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {resultMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              )}
              <span>{resultMessage.text}</span>
            </div>
          )}

          {/* Code Input & Decisions */}
          {!isResolved && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-slate-300">
                    4-Digit Security Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpInput(hold.otp_code)}
                    className="text-indigo-400 hover:text-indigo-300 text-[11px]"
                  >
                    Auto-fill demo code ({hold.otp_code})
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:border-indigo-500"
                  placeholder="••••"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={processing}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{processing ? 'Processing...' : 'Approve Payment'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <ShieldX className="w-4 h-4" />
                  <span>Decline Transfer</span>
                </button>
              </div>
            </div>
          )}

          {/* If resolved */}
          {isResolved && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3">
              <div className="font-semibold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span>Decision Complete</span>
              </div>
              <p>
                This request was resolved as <strong>{hold.state}</strong>.
                {hold.resolution_reason && ` (${hold.resolution_reason})`}
              </p>
              <button
                onClick={() => setActiveView('home')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <h3 className="font-bold text-white text-base">Decline Payment</h3>
            <p className="text-xs text-slate-400">
              The transfer will be cancelled immediately and funds will not leave {hold.payer_name.split(' ')[0]}'s account.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-300 font-medium">Reason for declining:</label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                {processing ? 'Cancelling...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
