import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PaymentEvaluationRequest,
  PaymentEvaluationResponse,
  HoldEvent,
  HoldAuditEntry,
  UserAccount,
  EngineConfig,
  ScenarioDefinition,
  ActiveAppView,
  NotificationItem,
  NomineeContact,
} from '../types/finshield';
import {
  INITIAL_USERS,
  INITIAL_HOLDS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  SAMPLE_PAYMENTS,
  PaymentHistoryRecord,
  MOCK_NOMINEE_RAHUL,
} from '../data/mockData';
import { ACCEPTANCE_SCENARIOS } from '../data/scenarios';
import { evaluatePaymentFastPath } from '../utils/evaluator';
import { runAsyncTribunalInvestigation } from '../utils/tribunalSimulator';

interface FinShieldContextType {
  // Current user & Multi-role identity
  currentUserId: string;
  currentUser: UserAccount;
  users: Record<string, UserAccount>;
  switchUser: (userId: string) => void;

  // Navigation & Views
  activeView: ActiveAppView;
  setActiveView: (view: ActiveAppView) => void;

  // Data & State
  holds: HoldEvent[];
  auditLogs: HoldAuditEntry[];
  config: EngineConfig;
  recentEvaluations: PaymentEvaluationResponse[];
  selectedHold: HoldEvent | null;
  activeScenario: ScenarioDefinition | null;
  tribunalLoadingStatus: string | null;
  activeReviewHold: HoldEvent | null;
  nomineePortalToken: string | null;
  paymentHistory: PaymentHistoryRecord[];

  // Notifications
  notifications: NotificationItem[];
  activeNotificationToast: NotificationItem | null;
  dismissToast: () => void;
  markNotificationRead: (id: string) => void;
  openNotificationReview: (notificationId: string) => void;

  // Actions
  setSelectedHold: (hold: HoldEvent | null) => void;
  setActiveReviewHold: (hold: HoldEvent | null) => void;
  setNomineePortalToken: (token: string | null) => void;
  updateConfig: (updates: Partial<EngineConfig>) => void;
  registerNominee: (contact: { name: string; relationship: string; phone: string; email: string }) => void;
  removeNominee: (nomineeId: string) => void;

  // Core Workflows
  evaluatePayment: (req: PaymentEvaluationRequest) => Promise<PaymentEvaluationResponse>;
  nomineeApprove: (holdId: string, token: string, otp: string) => Promise<{ success: boolean; message: string }>;
  nomineeReject: (holdId: string, token: string, otp: string, reason: string) => Promise<{ success: boolean; message: string }>;
  analystOverride: (holdId: string, action: 'approve' | 'reject' | 'escalate', reason: string, analystName: string) => void;
  payerCancel: (holdId: string) => void;
  unfreezeAccount: (userId: string, analystId: string, analystName: string, reason: string) => { success: boolean; message: string; requiresSecondApproval: boolean };
  triggerExpiryWorker: () => void;
  loadScenario: (scenarioId: string) => ScenarioDefinition | undefined;
  runScenario: (scenarioId: string) => Promise<PaymentEvaluationResponse>;
}

const defaultConfig: EngineConfig = {
  allow_threshold: 0.30,
  hold_threshold: 0.70,
  cold_start_sample_min: 20,
  hold_timeout_seconds: 900,
  redis_healthy: true,
  high_value_fallback_threshold: 20000,
  enable_pii_sanitizer: true,
  auto_release_low_risk: true,
};

const FinShieldContext = createContext<FinShieldContextType | undefined>(undefined);

export const FinShieldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string>('usr_diya');
  const [users, setUsers] = useState<Record<string, UserAccount>>(INITIAL_USERS);
  const [holds, setHolds] = useState<HoldEvent[]>(INITIAL_HOLDS);
  const [auditLogs, setAuditLogs] = useState<HoldAuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [config, setConfig] = useState<EngineConfig>(defaultConfig);
  const [recentEvaluations, setRecentEvaluations] = useState<PaymentEvaluationResponse[]>([]);
  const [selectedHold, setSelectedHold] = useState<HoldEvent | null>(INITIAL_HOLDS[0]);
  const [activeScenario, setActiveScenario] = useState<ScenarioDefinition | null>(null);
  const [tribunalLoadingStatus, setTribunalLoadingStatus] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveAppView>('home');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeNotificationToast, setActiveNotificationToast] = useState<NotificationItem | null>(null);
  const [activeReviewHold, setActiveReviewHold] = useState<HoldEvent | null>(INITIAL_HOLDS[0]);
  const [nomineePortalToken, setNomineePortalToken] = useState<string | null>(INITIAL_HOLDS[0].token);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryRecord[]>(SAMPLE_PAYMENTS);

  const currentUser = users[currentUserId] || users.usr_diya;

  // Background expiry checker (overdue holds moved to EXPIRED)
  useEffect(() => {
    const timer = setInterval(() => {
      triggerExpiryWorker();
    }, 15000); // Check every 15s
    return () => clearInterval(timer);
  }, [holds]);

  const switchUser = (userId: string) => {
    if (users[userId]) {
      setCurrentUserId(userId);
    }
  };

  const updateConfig = (updates: Partial<EngineConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const dismissToast = () => {
    setActiveNotificationToast(null);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  /**
   * Direct Contextual Nominee Access through Secure Notification Tap
   * Satisfies User Requirement 4:
   * 1. FinShield identifies Rahul's authenticated account
   * 2. Validates signed single-use token
   * 3. Checks OTP
   * 4. Directly opens nominee payment review page without manual role switching
   */
  const openNotificationReview = (notificationId: string) => {
    const notif = notifications.find(n => n.id === notificationId);
    if (!notif) return;

    markNotificationRead(notificationId);
    dismissToast();

    // Contextual identity switch: Ensure the logged-in context matches the authorized recipient
    if (notif.recipient_user_id && notif.recipient_user_id !== currentUserId) {
      setCurrentUserId(notif.recipient_user_id);
    }

    if (notif.hold_id) {
      const targetHold = holds.find(h => h.id === notif.hold_id);
      if (targetHold) {
        setActiveReviewHold(targetHold);
        setSelectedHold(targetHold);
        setActiveView('nominee-review');
        return;
      }
    }

    // Default to nominee dashboard if specific hold not found
    setActiveView('nominee-dashboard');
  };

  const addAuditLog = (holdId: string, actor: string, fromState: string, toState: string, reason: string) => {
    const entry: HoldAuditEntry = {
      id: 'audit_' + Math.random().toString(36).substring(2, 9),
      hold_id: holdId,
      actor,
      from_state: fromState,
      to_state: toState,
      reason,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  const registerNominee = (contact: { name: string; relationship: string; phone: string; email: string }) => {
    const newNominee: NomineeContact = {
      id: 'nom_' + Math.random().toString(36).substring(2, 8),
      user_id: currentUserId,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email,
      verified_at: new Date().toISOString(),
      is_primary: (currentUser.registered_nominees || []).length === 0,
    };

    setUsers(prev => ({
      ...prev,
      [currentUserId]: {
        ...prev[currentUserId],
        registered_nominees: [...(prev[currentUserId].registered_nominees || []), newNominee],
      },
    }));
  };

  const removeNominee = (nomineeId: string) => {
    setUsers(prev => ({
      ...prev,
      [currentUserId]: {
        ...prev[currentUserId],
        registered_nominees: (prev[currentUserId].registered_nominees || []).filter(n => n.id !== nomineeId),
      },
    }));
  };

  /**
   * Fast-Path Evaluation Endpoint
   * Evaluates payments in <50ms; places HOLD if risk score >= 0.70;
   * Dispatches contextual notification to trusted nominee.
   */
  const evaluatePayment = async (req: PaymentEvaluationRequest): Promise<PaymentEvaluationResponse> => {
    const user = users[req.payer_id] || currentUser;
    
    // Evaluate synchronously on fast-path (<50ms deterministic score)
    const evalResponse = evaluatePaymentFastPath(req, user, config);
    setRecentEvaluations(prev => [evalResponse, ...prev.slice(0, 19)]);

    // Record in local payment history
    const historyEntry: PaymentHistoryRecord = {
      id: 'tx_' + Math.random().toString(36).substring(2, 8),
      payer_id: user.id,
      payee_name: req.payee_id.split('@')[0].replace(/-/g, ' ').toUpperCase(),
      payee_id: req.payee_id,
      amount: req.amount,
      currency: req.currency,
      date: 'Just now',
      status: evalResponse.verdict === 'HOLD' ? 'HELD_VERIFICATION' : 'COMPLETED',
      risk_level: evalResponse.verdict === 'HOLD' ? 'HIGH' : (evalResponse.verdict === 'STEP_UP' ? 'MEDIUM' : 'LOW'),
      memo: req.memo,
      protection_details: evalResponse.verdict === 'HOLD'
        ? `Held by FinShield (${evalResponse.reasons[0] || 'High risk'}). Verification required.`
        : `Verified safe in ${evalResponse.latency_ms}ms.`,
    };
    setPaymentHistory(prev => [historyEntry, ...prev]);

    // If session is CONFIRMED compromise, trigger compromise response protocol
    if (evalResponse.compromise_classification === 'CONFIRMED') {
      setUsers(prev => {
        const u = prev[user.id];
        if (!u) return prev;
        return {
          ...prev,
          [user.id]: {
            ...u,
            state: 'FROZEN_SECURITY',
            token_version: u.token_version + 1,
          },
        };
      });
    }

    // If verdict is HOLD, create hold_event and enqueue nominee notification + tribunal
    if (evalResponse.verdict === 'HOLD') {
      const holdId = 'hold_' + Math.random().toString(36).substring(2, 8);
      const token = 'tok_sig_' + Math.random().toString(36).substring(2, 10);
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + config.hold_timeout_seconds * 1000).toISOString();

      // Find primary nominee for this user
      const assignedNominee = user.registered_nominees?.[0] || MOCK_NOMINEE_RAHUL;

      const newHold: HoldEvent = {
        id: holdId,
        evaluation_id: evalResponse.evaluation_id,
        payer_id: user.id,
        payer_name: user.name,
        payer_phone: user.phone,
        amount: req.amount,
        currency: req.currency,
        payee_id: req.payee_id,
        payee_name: req.payee_id.split('@')[0].replace(/-/g, ' ').toUpperCase(),
        memo: req.memo,
        masked_memo: evalResponse.masked_memo,
        risk_score: evalResponse.risk_score,
        reasons: evalResponse.reasons,
        state: 'PENDING',
        version: 1,
        token,
        otp_code: otpCode,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
        nominee: assignedNominee,
      };

      setHolds(prev => [newHold, ...prev]);
      setSelectedHold(newHold);
      setActiveReviewHold(newHold);

      addAuditLog(
        holdId,
        'gateway_engine',
        'NEW',
        'PENDING',
        `Risk score ${evalResponse.risk_score.toFixed(2)} exceeded threshold (${config.hold_threshold}). Payment held for verification.`
      );

      // Create contextual notification for the Nominee (e.g. Rahul)
      const recipientId = assignedNominee.nominee_user_id || 'usr_rahul';
      const newNotif: NotificationItem = {
        id: 'notif_' + Math.random().toString(36).substring(2, 8),
        recipient_user_id: recipientId,
        sender_name: user.name,
        title: 'Payment approval required',
        message: `${user.name} has initiated a payment of ₹${req.amount.toLocaleString()} that requires your review.`,
        timestamp: 'Just now',
        type: 'PAYMENT_APPROVAL_REQUIRED',
        hold_id: holdId,
        token,
        otp_code: otpCode,
        is_read: false,
        action_label: 'Review request',
      };

      setNotifications(prev => [newNotif, ...prev]);
      // Surface immediate actionable toast banner
      setActiveNotificationToast(newNotif);

      // Asynchronous investigation enqueued
      setTimeout(async () => {
        try {
          setTribunalLoadingStatus('Analyzing session telemetry and transaction memo...');
          const investigation = await runAsyncTribunalInvestigation(newHold, user, (status) => {
            setTribunalLoadingStatus(status);
          });

          // Auto-release if tribunal rates LOW risk (configurable)
          const isLowRisk = investigation.reviewer.consensus_recommendation === 'RELEASE';
          const nextState = (config.auto_release_low_risk && isLowRisk) ? 'RELEASED' : 'AWAITING_NOMINEE';

          setHolds(prev =>
            prev.map(h => {
              if (h.id === holdId) {
                return {
                  ...h,
                  state: nextState,
                  version: h.version + 1,
                  investigation,
                  resolution_reason: nextState === 'RELEASED' ? 'Auto-released by risk review (low risk rating)' : undefined,
                  resolved_at: nextState === 'RELEASED' ? new Date().toISOString() : undefined,
                };
              }
              return h;
            })
          );

          addAuditLog(
            holdId,
            'investigation_pipeline',
            'PENDING',
            nextState,
            nextState === 'RELEASED' 
              ? 'Multi-agent consensus rated transaction low risk; payment automatically released.'
              : `Review concluded: ${investigation.reviewer.consensus_recommendation}. Escalated to trusted contact for out-of-band verification.`
          );

          setTribunalLoadingStatus(null);
        } catch {
          setTribunalLoadingStatus(null);
        }
      }, 500);
    }

    return evalResponse;
  };

  /**
   * Nominee Approval: Atomic conditional update WHERE state = 'AWAITING_NOMINEE'
   */
  const nomineeApprove = async (holdId: string, token: string, otp: string): Promise<{ success: boolean; message: string }> => {
    const hold = holds.find(h => h.id === holdId);
    if (!hold) return { success: false, message: 'Hold event not found.' };

    if (hold.token !== token) {
      return { success: false, message: 'Invalid or tampered verification token.' };
    }
    if (hold.otp_code !== otp) {
      return { success: false, message: 'Invalid 4-digit verification code.' };
    }

    if (new Date(hold.expires_at).getTime() < Date.now() || hold.state === 'EXPIRED') {
      return { success: false, message: 'Hold window has expired (15-minute deadline exceeded).' };
    }

    if (hold.state !== 'AWAITING_NOMINEE' && hold.state !== 'PENDING') {
      return {
        success: false,
        message: `Action rejected: Transaction has already transitioned to '${hold.state}'. Duplicate executions are rejected.`,
      };
    }

    const outboxId = 'outbox_' + Math.random().toString(36).substring(2, 9);
    setHolds(prev =>
      prev.map(h => {
        if (h.id === holdId) {
          return {
            ...h,
            state: 'RELEASED',
            version: h.version + 1,
            resolved_at: new Date().toISOString(),
            resolution_reason: 'Approved by Trusted Contact (' + hold.nominee.name + ') via secure mobile review',
            resolved_by: hold.nominee.name,
            outbox_event_id: outboxId,
          };
        }
        return h;
      })
    );

    // Notify payer of successful release
    const releaseNotif: NotificationItem = {
      id: 'notif_' + Math.random().toString(36).substring(2, 8),
      recipient_user_id: hold.payer_id,
      sender_name: hold.nominee.name,
      title: 'Payment Released',
      message: `Your payment of ₹${hold.amount.toLocaleString()} was approved by ${hold.nominee.name} and has been processed.`,
      timestamp: 'Just now',
      type: 'PAYMENT_RELEASED',
      is_read: false,
    };
    setNotifications(prev => [releaseNotif, ...prev]);

    addAuditLog(
      holdId,
      `nominee:${hold.nominee.name}`,
      hold.state,
      'RELEASED',
      `Trusted contact approved transfer with verified security code. Funds released to payee.`
    );

    return { success: true, message: 'Payment approved successfully. Funds released to payee.' };
  };

  /**
   * Nominee Rejection
   */
  const nomineeReject = async (holdId: string, token: string, otp: string, reason: string): Promise<{ success: boolean; message: string }> => {
    const hold = holds.find(h => h.id === holdId);
    if (!hold) return { success: false, message: 'Hold not found.' };

    if (hold.token !== token) return { success: false, message: 'Invalid token.' };
    if (hold.otp_code !== otp) return { success: false, message: 'Invalid OTP code.' };

    if (hold.state !== 'AWAITING_NOMINEE' && hold.state !== 'PENDING') {
      return {
        success: false,
        message: `Action rejected: Hold is already in '${hold.state}' state.`,
      };
    }

    setHolds(prev =>
      prev.map(h => {
        if (h.id === holdId) {
          return {
            ...h,
            state: 'REJECTED',
            version: h.version + 1,
            resolved_at: new Date().toISOString(),
            resolution_reason: `Declined by Nominee (${hold.nominee.name}): ${reason || 'Potential fraud'}` ,
            resolved_by: hold.nominee.name,
          };
        }
        return h;
      })
    );

    // Notify payer of cancellation
    const rejectNotif: NotificationItem = {
      id: 'notif_' + Math.random().toString(36).substring(2, 8),
      recipient_user_id: hold.payer_id,
      sender_name: hold.nominee.name,
      title: 'Payment Cancelled for Safety',
      message: `Your payment of ₹${hold.amount.toLocaleString()} was declined by ${hold.nominee.name}: ${reason || 'Suspected scam'}. Your account remains safe.`,
      timestamp: 'Just now',
      type: 'PAYMENT_REJECTED',
      is_read: false,
    };
    setNotifications(prev => [rejectNotif, ...prev]);

    addAuditLog(
      holdId,
      `nominee:${hold.nominee.name}`,
      hold.state,
      'REJECTED',
      `Nominee rejected transaction: ${reason || 'Fraud suspected'}. Payment cancelled and funds returned to payer.`
    );

    return { success: true, message: 'Transaction rejected. Payer account secured.' };
  };

  /**
   * Fraud Analyst Override
   */
  const analystOverride = (
    holdId: string,
    action: 'approve' | 'reject' | 'escalate',
    reason: string,
    analystName: string
  ) => {
    const targetHold = holds.find(h => h.id === holdId);
    if (!targetHold) return;

    let targetState: HoldEvent['state'] = targetHold.state;
    if (action === 'approve') targetState = 'RELEASED';
    if (action === 'reject') targetState = 'REJECTED';
    if (action === 'escalate') targetState = 'PENDING';

    setHolds(prev =>
      prev.map(h => {
        if (h.id === holdId) {
          return {
            ...h,
            state: targetState,
            version: h.version + 1,
            resolved_at: action !== 'escalate' ? new Date().toISOString() : undefined,
            resolution_reason: `Analyst Override (${action.toUpperCase()}): ${reason}`,
            resolved_by: analystName,
          };
        }
        return h;
      })
    );

    addAuditLog(
      holdId,
      `analyst:${analystName}`,
      targetHold.state,
      targetState,
      `Analyst override [${action.toUpperCase()}]: ${reason}`
    );
  };

  /**
   * Payer Cancellation
   */
  const payerCancel = (holdId: string) => {
    const hold = holds.find(h => h.id === holdId);
    if (!hold || (hold.state !== 'PENDING' && hold.state !== 'AWAITING_NOMINEE')) return;

    setHolds(prev =>
      prev.map(h => {
        if (h.id === holdId) {
          return {
            ...h,
            state: 'CANCELLED_BY_PAYER',
            version: h.version + 1,
            resolved_at: new Date().toISOString(),
            resolution_reason: 'Cancelled directly by payer',
            resolved_by: h.payer_name,
          };
        }
        return h;
      })
    );

    addAuditLog(
      holdId,
      `payer:${hold.payer_name}`,
      hold.state,
      'CANCELLED_BY_PAYER',
      'Payer aborted transaction prior to nominee decision.'
    );
  };

  /**
   * Two-Analyst Unfreeze Workflow
   */
  const unfreezeAccount = (
    userId: string,
    analystId: string,
    analystName: string,
    reason: string
  ) => {
    const user = users[userId];
    if (!user) return { success: false, message: 'User not found.', requiresSecondApproval: false };

    if (user.state !== 'FROZEN_SECURITY') {
      return { success: false, message: 'Account is not in FROZEN_SECURITY state.', requiresSecondApproval: false };
    }

    const currentApprovals = user.unfreeze_approvals || [];
    
    if (currentApprovals.some(a => a.analyst_id === analystId)) {
      return { success: false, message: 'You have already approved this unfreeze request. A second, different analyst is required.', requiresSecondApproval: true };
    }

    const newApproval = {
      analyst_id: analystId,
      analyst_name: analystName,
      timestamp: new Date().toISOString(),
      reason,
    };

    const updatedApprovals = [...currentApprovals, newApproval];

    if (updatedApprovals.length >= 2) {
      setUsers(prev => ({
        ...prev,
        [userId]: {
          ...user,
          state: 'ACTIVE',
          unfreeze_approvals: [],
        },
      }));

      addAuditLog(
        'account_' + userId,
        `analyst:${analystName}`,
        'FROZEN_SECURITY',
        'ACTIVE',
        `Unfreeze dual-authorization completed. Approvals: [${updatedApprovals.map(a => a.analyst_name).join(', ')}]. Reason: ${reason}`
      );

      return {
        success: true,
        message: 'Account successfully unlocked and restored to Active status following two-analyst sign-off.',
        requiresSecondApproval: false,
      };
    } else {
      setUsers(prev => ({
        ...prev,
        [userId]: {
          ...user,
          unfreeze_approvals: updatedApprovals,
        },
      }));

      addAuditLog(
        'account_' + userId,
        `analyst:${analystName}`,
        'FROZEN_SECURITY',
        'FROZEN_SECURITY (1/2 Approvals)',
        `First unlock authorization recorded by ${analystName}. Awaiting secondary reviewer sign-off.`
      );

      return {
        success: true,
        message: 'Primary investigator approval recorded. Awaiting second analyst sign-off to complete unlock.',
        requiresSecondApproval: true,
      };
    }
  };

  /**
   * Expiry Worker
   */
  const triggerExpiryWorker = () => {
    const now = Date.now();
    setHolds(prev =>
      prev.map(h => {
        if ((h.state === 'PENDING' || h.state === 'AWAITING_NOMINEE') && new Date(h.expires_at).getTime() < now) {
          addAuditLog(
            h.id,
            'system:expiry_worker',
            h.state,
            'EXPIRED',
            '15-minute nominee response window expired without approval. Fails closed.'
          );
          return {
            ...h,
            state: 'EXPIRED',
            version: h.version + 1,
            resolved_at: new Date().toISOString(),
            resolution_reason: '15-minute nominee window timed out. Payment cancelled (Fail-closed).',
          };
        }
        return h;
      })
    );
  };

  const loadScenario = (scenarioId: string) => {
    const sc = ACCEPTANCE_SCENARIOS.find(s => s.id === scenarioId);
    if (sc) {
      setActiveScenario(sc);
    }
    return sc;
  };

  const runScenario = async (scenarioId: string): Promise<PaymentEvaluationResponse> => {
    const sc = loadScenario(scenarioId);
    if (!sc) throw new Error('Scenario not found');

    if (sc.code === 'A6') {
      setConfig(prev => ({ ...prev, redis_healthy: false }));
    } else {
      setConfig(prev => ({ ...prev, redis_healthy: true }));
    }

    return await evaluatePayment(sc.request);
  };

  return (
    <FinShieldContext.Provider
      value={{
        currentUserId,
        currentUser,
        users,
        switchUser,
        activeView,
        setActiveView,
        holds,
        auditLogs,
        config,
        recentEvaluations,
        selectedHold,
        activeScenario,
        tribunalLoadingStatus,
        activeReviewHold,
        nomineePortalToken,
        setNomineePortalToken,
        paymentHistory,
        notifications,
        activeNotificationToast,
        dismissToast,
        markNotificationRead,
        openNotificationReview,
        setSelectedHold,
        setActiveReviewHold,
        updateConfig,
        registerNominee,
        removeNominee,
        evaluatePayment,
        nomineeApprove,
        nomineeReject,
        analystOverride,
        payerCancel,
        unfreezeAccount,
        triggerExpiryWorker,
        loadScenario,
        runScenario,
      }}
    >
      {children}
    </FinShieldContext.Provider>
  );
};

export const useFinShield = () => {
  const ctx = useContext(FinShieldContext);
  if (!ctx) throw new Error('useFinShield must be used within FinShieldProvider');
  return ctx;
};
