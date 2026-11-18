import React, { useState } from 'react';
import {
  X,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';
import { UserAccount } from '../../types/finshield';

interface Props {
  user: UserAccount;
  onClose: () => void;
}

export const UnfreezeModal: React.FC<Props> = ({ user, onClose }) => {
  const { unfreezeAccount } = useFinShield();
  
  const [analystName, setAnalystName] = useState<string>('Marcus Vance (Fraud Operations Lead)');
  const [analystId, setAnalystId] = useState<string>('an_marcus_02');
  const [reason, setReason] = useState<string>('Customer contacted via verified secondary line; remote desktop tool removed and account credentials reset.');
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const existingApprovals = user.unfreeze_approvals || [];
  const approvalsCount = existingApprovals.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const res = unfreezeAccount(user.id, analystId, analystName, reason);
    setResultMessage(res.message);
    if (!res.requiresSecondApproval && res.success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Two-Person Authorization: Account Unlock
              </h3>
              <p className="text-xs text-slate-400">
                Lifting a security freeze requires independent sign-off from two fraud investigators.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Account Details */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Customer Account:</span>
              <strong className="text-white text-sm">{user.name}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Standing:</span>
              <span className="font-mono text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                Security Lockdown Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Verified Secondary Contact:</span>
              <span className="text-slate-200 font-mono">{user.secondary_contact}</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-indigo-200 uppercase tracking-wider">Required Authorizations:</span>
              <span className="font-mono text-indigo-300 font-bold">{approvalsCount} of 2 Complete</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className={`p-3.5 rounded-lg border text-xs space-y-0.5 ${
                  approvalsCount >= 1
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5 text-xs">
                  {approvalsCount >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <UserCheck className="w-4 h-4" />}
                  <span>Primary Investigator</span>
                </div>
                {approvalsCount >= 1 ? (
                  <div className="text-[11px] text-slate-300 pt-0.5 truncate">
                    Signed by {existingApprovals[0].analyst_name}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 pt-0.5">Awaiting initial verification</div>
                )}
              </div>

              <div
                className={`p-3.5 rounded-lg border text-xs space-y-0.5 ${
                  approvalsCount >= 2
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5 text-xs">
                  {approvalsCount >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <UserCheck className="w-4 h-4" />}
                  <span>Secondary Reviewer</span>
                </div>
                {approvalsCount >= 2 ? (
                  <div className="text-[11px] text-slate-300 pt-0.5 truncate">
                    Signed by {existingApprovals[1]?.analyst_name}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 pt-0.5">Requires distinct second reviewer</div>
                )}
              </div>
            </div>
          </div>

          {resultMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resultMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Authorizing Analyst
              </label>
              <select
                value={analystId}
                onChange={(e) => {
                  setAnalystId(e.target.value);
                  setAnalystName(e.target.options[e.target.selectedIndex].text);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="an_marcus_02">Marcus Vance (Fraud Operations Lead)</option>
                <option value="an_sarah_01">Sarah Connor (Senior Fraud Lead)</option>
                <option value="an_david_03">David Chen (Security Investigator)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Remediation &amp; Contact Verification Notes
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Detail customer confirmation, device remediation, or false-positive investigation"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Submit Authorization Sign-Off</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
