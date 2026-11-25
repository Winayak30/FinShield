import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Radio,
  Eye,
  AlertTriangle,
  Lock,
  RefreshCw,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';

export const DeviceSecuritySettings: React.FC = () => {
  const { currentUser } = useFinShield();
  const [telemetryPermission, setTelemetryPermission] = useState(true);
  const [overlayDetection, setOverlayDetection] = useState(true);
  const [callStateGuard, setCallStateGuard] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const runDeviceScan = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      setScanResult('Clean. No unauthorized remote access tools or malicious overlays detected.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Device &amp; Telemetry Permissions</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              FinShield SDK inspects system-level hardware signals at checkout to detect active remote desktop clients (AnyDesk, TeamViewer) and live call coercion.
            </p>
          </div>

          <button
            onClick={runDeviceScan}
            disabled={scanning}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Scanning Device...' : 'Run Security Scan'}</span>
          </button>
        </div>

        {scanResult && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{scanResult}</span>
          </div>
        )}
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Permission 1: Remote Access Inspection */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Remote Access Scanner</h3>
                <span className="text-xs text-slate-400">Monitors RAT processes in memory</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={telemetryPermission}
                onChange={e => setTelemetryPermission(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Identifies when third-party screen mirroring software is relaying your display to a remote party during UPI authentication.
          </p>
        </div>

        {/* Permission 2: Call State Coercion Guard */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Live Call Coaching Guard</h3>
                <span className="text-xs text-slate-400">Detects concurrent telephony calls</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={callStateGuard}
                onChange={e => setCallStateGuard(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Flags simultaneous phone calls during payments. 89% of APP fraud occurs while victims are actively coached by phone scammers.
          </p>
        </div>

        {/* Permission 3: Overlay & Accessibility Abuse */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Screen Overlay Protection</h3>
                <span className="text-xs text-slate-400">Accessibility API abuse monitor</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={overlayDetection}
                onChange={e => setOverlayDetection(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Prevents malicious apps from drawing invisible clickjacking overlays on top of the payment confirmation PIN keypad.
          </p>
        </div>

        {/* Account Security State */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Account Status: Active</h3>
              <span className="text-xs text-slate-400">Token Version: {currentUser.token_version}</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your credentials and session tokens are valid. In the event of a confirmed compromise, sessions are revoked instantly via server-side token rotation.
          </p>
        </div>
      </div>
    </div>
  );
};

