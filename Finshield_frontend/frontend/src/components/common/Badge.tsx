import React from 'react';
import { Verdict, HoldState, AccountState } from '../../types/finshield';

interface BadgeProps {
  type: 'verdict' | 'state' | 'risk' | 'account' | 'compromise';
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-xs px-3 py-1.5 font-semibold tracking-wide',
  }[size];

  // Verdict colors (Stripe Radar style)
  if (type === 'verdict') {
    const verdict = value as Verdict;
    switch (verdict) {
      case 'ALLOW':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Approved
          </span>
        );
      case 'STEP_UP':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Verification Required
          </span>
        );
      case 'HOLD':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/25 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Held for Review
          </span>
        );
      case 'BLOCK':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Blocked
          </span>
        );
    }
  }

  // Workflow State colors
  if (type === 'state') {
    const state = value as HoldState;
    switch (state) {
      case 'PENDING':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Analyzing
          </span>
        );
      case 'AWAITING_NOMINEE':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Awaiting Trusted Contact
          </span>
        );
      case 'RELEASED':
      case 'APPROVED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Released
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Declined
          </span>
        );
      case 'EXPIRED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 ${sizeClasses}`}>
            Expired
          </span>
        );
      case 'CANCELLED_BY_PAYER':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 ${sizeClasses}`}>
            Cancelled by Payer
          </span>
        );
    }
  }

  // Account State
  if (type === 'account') {
    const state = value as AccountState;
    if (state === 'FROZEN_SECURITY') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Locked (Security Freeze)
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Active
      </span>
    );
  }

  // Compromise classification
  if (type === 'compromise') {
    if (value === 'CONFIRMED') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 font-semibold ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Confirmed Remote Control
        </span>
      );
    }
    if (value === 'SUSPECTED') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Suspicious Activity
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
        Clean Session
      </span>
    );
  }

  // Risk Rating
  if (type === 'risk') {
    switch (value) {
      case 'CRITICAL':
        return <span className={`rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 ${sizeClasses}`}>Critical Risk</span>;
      case 'HIGH':
        return <span className={`rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/30 ${sizeClasses}`}>High Risk</span>;
      case 'MEDIUM':
        return <span className={`rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>Moderate Risk</span>;
      default:
        return <span className={`rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 ${sizeClasses}`}>Low Risk</span>;
    }
  }

  return <span className={`rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 ${sizeClasses}`}>{value}</span>;
};
