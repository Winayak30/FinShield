import React from 'react';
import { useFinShield } from './context/FinShieldContext';
import { Header } from './components/common/Header';
import { CommonHomeDashboard } from './components/home/CommonHomeDashboard';
import { PayerDashboard } from './components/payer/PayerDashboard';
import { NomineeDashboard } from './components/nominee/NomineeDashboard';
import { NomineeReviewPage } from './components/nominee/NomineeReviewPage';
import { NotificationsCenter } from './components/notifications/NotificationsCenter';
import { NotificationToast } from './components/notifications/NotificationToast';
import { AccountSettings } from './components/account/AccountSettings';
import { HoldsDashboard } from './components/analyst-console/HoldsDashboard';
import { SdkHub } from './components/sdk-hub/SdkHub';
import { ObservabilityDashboard } from './components/observability/ObservabilityDashboard';
import { ShieldCheck, Lock, Activity, Shield } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeView } = useFinShield();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Top Floating Contextual Notification Toast */}
      <NotificationToast />

      {/* Global Header & Navigation */}
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* VIEW 1: Common Home Dashboard */}
        {activeView === 'home' && <CommonHomeDashboard />}

        {/* VIEW 2: Payer Views */}
        {activeView === 'payer-dashboard' && <PayerDashboard initialTab="overview" />}
        {activeView === 'make-payment' && <PayerDashboard initialTab="simulator" />}
        {activeView === 'payment-history' && <PayerDashboard initialTab="history" />}
        {activeView === 'manage-nominees' && <PayerDashboard initialTab="nominees" />}

        {/* VIEW 3: Nominee Views */}
        {activeView === 'nominee-dashboard' && <NomineeDashboard />}
        {activeView === 'nominee-review' && <NomineeReviewPage />}
        {activeView === 'decision-history' && <NomineeDashboard />}

        {/* VIEW 4: Common User Pages */}
        {activeView === 'notifications' && <NotificationsCenter />}
        {activeView === 'account-settings' && <AccountSettings />}

        {/* VIEW 5: Privileged Fraud Operations Console */}
        {activeView === 'analyst-console' && <HoldsDashboard />}

        {/* VIEW 6: SDK Dev Hub & API Explorer */}
        {activeView === 'sdk-hub' && <SdkHub />}

        {/* VIEW 7: Observability, Metrics & Audits */}
        {activeView === 'observability' && <ObservabilityDashboard />}
      </main>

      {/* Production Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-6 lg:px-10 text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-medium">FinShield Financial Security</span>
            <span className="text-slate-700">•</span>
            <span>Real-time fraud defense &amp; nominee authorization</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span>Security</span>
            <span>Privacy</span>
            <span>System Status: Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
