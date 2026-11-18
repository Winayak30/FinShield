/**
 * FinShield Type Definitions
 * Derived directly from the FinShield Software Requirements Specification (SRS v0.1)
 * Enhanced for Unified One-Account Multi-Role Architecture (Payer & Nominee)
 */

export type Verdict = 'ALLOW' | 'STEP_UP' | 'HOLD' | 'BLOCK';

export type CompromiseClassification = 'NONE' | 'SUSPECTED' | 'CONFIRMED';

export type HoldState = 
  | 'PENDING' 
  | 'AWAITING_NOMINEE' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'EXPIRED' 
  | 'CANCELLED_BY_PAYER' 
  | 'RELEASED';

export type AccountState = 'ACTIVE' | 'FROZEN_SECURITY';

export type UserRole = 'PAYER' | 'NOMINEE';

export interface DeviceSessionSignals {
  remote_access_tool_detected: boolean;
  remote_access_tool_name?: string; // e.g. "AnyDesk", "TeamViewer", "RustDesk"
  screen_share_active: boolean;
  call_in_progress: boolean;
  accessibility_service_abuse: boolean;
  new_device: boolean;
  device_age_days: number;
  source: string; // "finshield-mobile-sdk-v2.4"
  confidence: number; // 0.0 - 1.0
}

export interface PaymentEvaluationRequest {
  idempotency_key: string;
  payer_id: string;
  amount: number;
  currency: string;
  payee_id: string;
  memo: string;
  timestamp: string;
  device_session: DeviceSessionSignals;
}

export interface FactorBreakdown {
  amount_anomaly: number; // 0.0 - 1.0
  velocity_1m_1h_24h: number; // 0.0 - 1.0
  new_payee: number; // 0.0 or 1.0
  new_device: number; // 0.0 or 1.0
  time_of_day_deviation: number; // 0.0 - 1.0
  device_compromise: number; // 0.0 - 1.0
  prompt_injection_penalty: number; // added if injection detected
  cold_start_multiplier: number;
  combined_score: number; // 0.0 - 1.0
}

export interface PaymentEvaluationResponse {
  evaluation_id: string;
  idempotency_key: string;
  verdict: Verdict;
  risk_score: number;
  reasons: string[];
  factors: FactorBreakdown;
  compromise_classification: CompromiseClassification;
  latency_ms: number;
  created_at: string;
  prompt_injection_flagged: boolean;
  masked_memo: string;
}

export interface ToolCallLog {
  id: string;
  tool: 'get_device_telemetry' | 'get_payment_history_summary' | 'get_baseline_summary' | 'get_payee_profile';
  arguments: Record<string, unknown>;
  result_hash: string;
  execution_time_ms: number;
  timestamp: string;
  output_summary: string;
}

export interface SpecialistVerdict {
  agent_name: 'SocialEngineeringAnalyst' | 'DeviceCompromiseAnalyst';
  risk_rating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  flags: string[];
  reasoning: string;
  evidence: string[];
}

export interface ReviewerAgentVerdict {
  validated: boolean;
  retry_count: number;
  critique: string;
  consensus_recommendation: 'RELEASE' | 'NOMINEE_REVIEW' | 'ESCALATE_HUMAN' | 'BLOCK';
  escalate_to_human: boolean;
}

export interface ExplainerBrief {
  headline: string;
  plain_language_summary: string;
  suspicious_indicators: string[];
  advice_for_nominee: string;
  suggested_action: 'APPROVE' | 'REJECT';
}

export interface TribunalInvestigation {
  id: string;
  hold_id: string;
  evaluation_id: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  model_tier: 'gemini-1.5-flash (primary)' | 'gemini-1.5-pro (escalated)';
  token_usage: {
    prompt_tokens: number;
    cached_tokens: number;
    completion_tokens: number;
    total_cost_usd: number;
  };
  specialists: {
    social_engineering: SpecialistVerdict;
    device_compromise: SpecialistVerdict;
  };
  reviewer: ReviewerAgentVerdict;
  explainer: ExplainerBrief;
  tool_calls: ToolCallLog[];
}

export interface NomineeContact {
  id: string;
  user_id: string; // The payer who registered this nominee
  nominee_user_id?: string; // If the nominee is also a FinShield registered user (e.g. Rahul)
  name: string;
  relationship: string;
  phone: string;
  email: string;
  verified_at: string;
  is_primary: boolean;
}

export interface HoldEvent {
  id: string;
  evaluation_id: string;
  payer_id: string;
  payer_name: string;
  payer_phone: string;
  amount: number;
  currency: string;
  payee_id: string;
  payee_name: string;
  memo: string;
  masked_memo: string;
  risk_score: number;
  reasons: string[];
  state: HoldState;
  version: number; // for optimistic concurrency
  token: string; // single-use signed short-lived token (15 mins)
  otp_code: string; // simulated 4-digit OTP for nominee portal access
  expires_at: string; // ISO
  created_at: string;
  resolved_at?: string;
  resolution_reason?: string;
  resolved_by?: string;
  nominee: NomineeContact;
  investigation?: TribunalInvestigation;
  outbox_event_id?: string;
}

export interface HoldAuditEntry {
  id: string;
  hold_id: string;
  actor: string;
  from_state: string;
  to_state: string;
  reason: string;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  secondary_contact: string;
  state: AccountState;
  token_version: number;
  roles: UserRole[]; // One identity can have both PAYER and NOMINEE roles!
  registered_nominees: NomineeContact[]; // Nominees registered by this user to protect their payments
  nominee_for_user_ids: string[]; // User IDs who have registered this person as their nominee
  unfreeze_approvals: {
    analyst_id: string;
    analyst_name: string;
    timestamp: string;
    reason: string;
  }[];
  baseline: {
    sample_count: number;
    amount_mean: number;
    amount_std: number;
    known_payees: string[];
    active_hours_start: number;
    active_hours_end: number;
    is_cold_start: boolean;
  };
}

export interface NotificationItem {
  id: string;
  recipient_user_id: string;
  sender_name: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'PAYMENT_APPROVAL_REQUIRED' | 'PAYMENT_RELEASED' | 'PAYMENT_REJECTED' | 'SECURITY_ALERT';
  hold_id?: string;
  token?: string;
  otp_code?: string;
  is_read: boolean;
  action_label?: string;
}

export interface ScenarioDefinition {
  id: string;
  code: string; // A1 - A7
  title: string;
  subtitle: string;
  description: string;
  expected_verdict: Verdict;
  expected_outcome: string;
  request: PaymentEvaluationRequest;
  signalsDescription: string[];
  highlight: string;
}

export interface EngineConfig {
  allow_threshold: number; // default 0.30
  hold_threshold: number; // default 0.70
  cold_start_sample_min: number; // default 20
  hold_timeout_seconds: number; // default 900 (15 min)
  redis_healthy: boolean; // toggle for FR-106 failure simulation
  high_value_fallback_threshold: number; // default 20000
  enable_pii_sanitizer: boolean;
  auto_release_low_risk: boolean; // FR-409
}

export type ActiveAppView = 
  | 'home'                // Common Home Dashboard
  | 'payer-dashboard'     // Payer Overview & Quick Pay
  | 'make-payment'        // Payment Simulator embedding SDK
  | 'payment-history'     // Payer My Payments
  | 'manage-nominees'     // Payer Nominees Management
  | 'nominee-dashboard'   // Nominee Overview & Incoming Requests
  | 'nominee-review'      // Direct Contextual Review
  | 'decision-history'    // Nominee Past Decisions
  | 'notifications'       // Notification Center
  | 'account-settings'    // Profile & Device Settings
  | 'analyst-console'     // Privileged Analyst Console
  | 'sdk-hub'             // SDK Integration & Dev Center
  | 'observability';      // Metrics, SLOs & Compliance
