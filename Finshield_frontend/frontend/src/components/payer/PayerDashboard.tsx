import React, { useState } from 'react';
import {
  Smartphone,
  Shield,
  Clock,
  Users,
  Settings,
  ArrowUpRight,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';
import { PaymentAppSimulator } from '../sdk-sandbox/PaymentAppSimulator';
import { TelemetryInspector } from '../sdk-sandbox/TelemetryInspector';
import { ManageNominees } from './ManageNominees';
import { PaymentHistory } from './PaymentHistory';
import { DeviceSecuritySettings } from './DeviceSecuritySettings';

interface PayerDashboardProps {
  initialTab?: 'overview' | 'simulator' | 'history' | 'nominees' | 'settings';
}

export const PayerDashboard: React.FC<PayerDashboardProps> = ({ initialTab = 'overview' }) => {
  const { currentUser, paymentHistory, setActiveView } = useFinShield();
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'history' | 'nominees' | 'settings'>(initialTab);

  const primaryNominee = currentUser.registered_nominees?.[0];
  const userPayments = paymentHistory.filter(p => p.payer_id === currentUser.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Banner & Sub-Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Security &amp; Protection Hub</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.name} • {currentUser.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-md shadow-indigo-600/20"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Send Payment</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: 'overview', label: 'Security Profile', icon: Activity },
            { id: 'simulator', label: 'Send Payment', icon: Smartphone },
            { id: 'history', label: 'Payment History', icon: Clock },
            { id: 'nominees', label: 'Trusted Contacts', icon: Users },
            { id: 'settings', label: 'Device Signals', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-medium text-slate-400">Baseline History</span>
              <div className="text-2xl font-bold font-mono text-white">
                {currentUser.baseline.sample_count} payments
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Established profile
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-medium text-slate-400">Typical Payment Size</span>
              <div className="text-2xl font-bold font-mono text-white">
                ₹{currentUser.baseline.amount_mean.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400">
                Range: ₹{(currentUser.baseline.amount_mean - currentUser.baseline.amount_std).toLocaleString()} – ₹{(currentUser.baseline.amount_mean + currentUser.baseline.amount_std).toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-medium text-slate-400">Trusted Contact</span>
              <div className="text-lg font-bold text-slate-200 truncate">
                {primaryNominee ? primaryNominee.name : 'None Registered'}
              </div>
              <span className="text-[11px] text-slate-400">
                {primaryNominee ? primaryNominee.relationship : 'Add a trusted contact for emergencies'}
              </span>
            </div>
          </div>

          {/* Quick Pay Action Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">Send Money with FinShield Protection</h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Transactions are analyzed in real time. Known payees and clean devices clear in under 50 milliseconds.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shrink-0 flex items-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <span>Transfer Funds</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recent Payments Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Recent Activity</h3>
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition font-medium"
              >
                View all &rarr;
              </button>
            </div>

            <div className="divide-y divide-slate-800">
              {userPayments.slice(0, 3).map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">{p.payee_name}</span>
                    <span className="text-slate-400 text-[11px]">{p.memo}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">₹{p.amount.toLocaleString()}</span>
                    <span className={`text-[10px] font-semibold ${
                      p.status === 'HELD_VERIFICATION' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {p.status === 'HELD_VERIFICATION' ? 'Held for Review' : 'Verified'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEND PAYMENT SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-7">
            <PaymentAppSimulator />
          </div>
          <div className="xl:col-span-5">
            <TelemetryInspector />
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT HISTORY */}
      {activeTab === 'history' && <PaymentHistory />}

      {/* TAB 4: MANAGE NOMINEES */}
      {activeTab === 'nominees' && <ManageNominees />}

      {/* TAB 5: DEVICE & SECURITY SETTINGS */}
      {activeTab === 'settings' && <DeviceSecuritySettings />}
    </div>
  );
};
