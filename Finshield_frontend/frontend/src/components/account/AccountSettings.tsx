import React from 'react';
import {
  User,
  Shield,
  Smartphone,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';

export const AccountSettings: React.FC = () => {
  const { currentUser, switchUser } = useFinShield();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn py-4">
      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{currentUser.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {currentUser.state}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => switchUser(currentUser.id === 'usr_diya' ? 'usr_rahul' : 'usr_diya')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Switch to {currentUser.id === 'usr_diya' ? 'Rahul' : 'Diya'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-sm">Account Information</h3>

        <div className="space-y-3 text-xs divide-y divide-slate-800">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5 text-slate-400">
              <Phone className="w-4 h-4" />
              <span>Registered Phone</span>
            </div>
            <span className="font-mono text-slate-200">{currentUser.phone}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5 text-slate-400">
              <Mail className="w-4 h-4" />
              <span>Email Address</span>
            </div>
            <span className="text-slate-200">{currentUser.email}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5 text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Trusted Contact Channel</span>
            </div>
            <span className="text-slate-200">{currentUser.secondary_contact}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5 text-slate-400">
              <Lock className="w-4 h-4" />
              <span>Session Status</span>
            </div>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
