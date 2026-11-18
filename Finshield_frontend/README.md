# FinShield — Privacy-First Financial Security Gateway & SDK

> **Version 0.1** | Python 3.12+ Backend Spec | React + Vite UI Suite | Built to SRS v0.1 & EPAM 16-Topic Track

FinShield is an enterprise-grade financial security gateway that prevents **Authorised Push Payment (APP) fraud** and **remote-access scams** in real-time. It sits in the payment authorization path of integrating mobile payment apps (such as UPI, banking, and digital wallet clients) via an embedded **FinShield Mobile SDK**.

---

## 🎯 Architecture & Core Invariants

```
+-----------------------------------------------------------------------------------+
|                        Host Payment App (e.g., PayFlex UPI)                       |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                    FinShield Mobile SDK (Client-Side)                       |  |
|  |  * Telemetry (FR-301): RAT (AnyDesk), Screen share, Calls, Accessibility     |  |
|  +---------------------------------------+-------------------------------------+  |
+------------------------------------------|----------------------------------------+
                                           | POST /v1/payments/evaluate
                                           v
+-----------------------------------------------------------------------------------+
|                            FinShield Gateway Service                              |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |  Fast-Path Deterministic Evaluator (FR-101 - FR-107)                         |  |
|  |  * Zero LLMs inline | Hard budget <50ms (NFR-1) | 90-day rolling baseline   |  |
|  |  * Scoring: Amount anomaly (floored std-dev), Velocity, New payee/device    |  |
|  |  * Verdicts: ALLOW (<0.30) | STEP_UP (0.30-0.70) | HOLD (>=0.70) | BLOCK    |  |
|  |  * Compromise: RAT + Call + (New Payee or High Amount) => CONFIRMED        |  |
|  +---------------------------------------+-------------------------------------+  |
|                                          |                                        |
|                     [ALLOW / STEP_UP]    | [HOLD / CONFIRMED]                     |
|                            |             |                                        |
|                            v             v                                        |
|                    Instant Release   +-----------------------------------------+  |
|                                      | PII Masking & Memo Guard (FR-801-803)   |  |
|                                      | Strip cards, phone, Aadhaar, PAN, UPI   |  |
|                                      +--------------------+--------------------+  |
|                                                           |                       |
|                                                           v                       |
|                                      +-----------------------------------------+  |
|                                      | LangGraph Multi-Agent Tribunal (FR-502) |  |
|                                      | * SocialEngineeringAnalyst (Parallel)   |  |
|                                      | * DeviceCompromiseAnalyst (Parallel)    |  |
|                                      | * FastMCP Read-Only Tools (FR-601-604)  |  |
|                                      | * ReviewerAgent Schema Validation       |  |
|                                      | * ExplainerAgent Plain-Language Brief   |  |
|                                      +--------------------+--------------------+  |
|                                                           |                       |
+-----------------------------------------------------------|-----------------------+
                                                            |
                 +------------------------------------------+
                 |
                 v
+-----------------------------------------------------------------------------------+
|                     Nominee Out-of-Band Mobile Portal (FR-1201)                   |
|  * 15-minute signed short-lived magic link token (FR-404)                         |
|  * 2FA OTP Verification (FR-1202)                                                 |
|  * Plain-English non-technical fraud brief                                        |
|  * Exactly-once release via transactional outbox & atomic conditional update      |
+-----------------------------------------------------------------------------------+
```

---

## 🖥️ UI Suite Modules

The FinShield UI console is built with **React 18 + Vite + Tailwind CSS + Lucide Icons + TypeScript**, specifically structured around the SDK model and SRS requirements:

### 1. 📱 Host Payment App & FinShield SDK Simulator
* **Interactive Payment Client**: Simulate a consumer mobile payment app (e.g. PayFlex UPI) embedding the FinShield SDK.
* **Client Telemetry Signal Controls (FR-301)**: Live toggles for:
  - Remote desktop client detected (AnyDesk, TeamViewer, RustDesk)
  - Screen sharing / mirroring active
  - In-progress telephony call
  - Accessibility service keystroke/touch injection abuse
  - Device age and new hardware flags
* **1-Click Acceptance Scenarios (FR-1301 / Section 9)**:
  - **A1**: Remote-access scam (AnyDesk + Call + High amount -> CONFIRMED -> Account Frozen)
  - **A2**: Coached APP fraud (Urgent police impersonation -> HOLD -> Nominee review)
  - **A3**: Legitimate urgent transfer (False positive control -> ALLOW)
  - **A4**: Prompt-injection attack in payment memo (FR-802/803 -> Neutralized & Penalized)
  - **A5**: Nominee approval vs. expiry race condition (FR-402/407 -> Atomic concurrency)
  - **A6**: Redis outage during high-value payment (FR-106 -> Fallback degradation)
  - **A7**: New user cold start (FR-202/203 -> Z-score flooring, no blow-up)
* **Live Telemetry & Gateway Inspector**: Real-time gauge for the combined deterministic score and weighted factors, plus live JSON payload inspector and PII diff viewer.

### 2. 🛡️ Fraud Analyst Console (FR-1101 to FR-1105)
* **Holds Queue & Filtering**: Real-time monitoring of all held payments with risk score, state badges, time remaining, and payer details.
* **Deep Investigation Inspector (FR-1102)**:
  - **Specialist Agents Tab (FR-502)**: Side-by-side inspection of `SocialEngineeringAnalyst` and `DeviceCompromiseAnalyst` outputs, risk rating, confidence, and concrete evidence.
  - **Reviewer Agent Tab (FR-503)**: Schema conformance check, retry counter (max 2 retries), critique, and consensus action.
  - **Explainer Agent Tab (FR-504)**: Plain-language summary and nominee guidance.
  - **FastMCP Tool Logs (FR-601-604)**: Read-only tool calls (`get_device_telemetry`, `get_baseline_summary`, `get_payee_profile`) with server-side identity context binding and execution times.
  - **Audit Trail (FR-410)**: Append-only state transition records.
* **Analyst Override Action (FR-1103)**: Force Approve, Reject, or Escalate with mandatory audit reasoning.
* **Dual-Analyst Account Unfreeze Workflow (FR-705 & FR-1105)**: 2-step verification for accounts locked in `FROZEN_SECURITY`.

### 3. 📲 Nominee Out-of-Band Mobile Portal (FR-1201 to FR-1202)
* **Realistic Mobile Viewport**: Mobile frame simulating the nominee's smartphone browser.
* **Signed Token & OTP Verification (FR-1202)**: Single-use signed token validation with simulated 4-digit SMS OTP.
* **Plain-Language Briefing**: Clear, jargon-free summary explaining why the transaction was held and suspicious indicators observed.
* **Decision Controls**:
  - `Reject Payment & Protect Account` (cancels transfer, secures payer)
  - `I Verified with Payer — Approve Release` (atomic conditional release)
* **Fail-Closed 15-Minute Expiry (FR-404, FR-406)**: Dynamic countdown timer with explicit refusal for expired/reused tokens (FR-405).

### 4. 📦 FinShield SDK Dev Hub & API Explorer
* **SDK Integration Architecture & Flow**: End-to-end trace from hardware hooks to nominee notification.
* **Production Code Snippets**:
  - Android Kotlin SDK (`com.finshield.sdk.FinShield`)
  - Python 3.12+ / FastAPI gateway service (`PaymentEvaluationRequest`, `evaluate_fast_path`)
  - TypeScript / React Native SDK client
  - Raw `curl` REST specification with `Idempotency-Key` headers
* **Dynamic Fast-Path Threshold Configurator (FR-104)**: Sliders to customize ALLOW, HOLD, cold-start sample count, and outage thresholds without altering code.
* **Interactive PII Sanitizer & Prompt-Injection Sandbox (FR-801-803)**: Live interactive input to test credit card, phone, Aadhaar, PAN, and prompt injection masking.

### 5. 📊 Observability & EPAM 16-Topic Traceability Matrix (Section 8)
* **Real-Time SLO Gauges (FR-1003, NFR-1, NFR-2)**:
  - Fast-path p95 latency: 18.4ms (within <50ms budget)
  - Async tribunal latency: 2.74s (within 2-4s target)
  - Prompt cache hit rate: 78.8% (FR-902)
  - Cost per investigation: $0.00034 (FR-904)
* **Full EPAM Traceability Matrix**: Complete table mapping Topic 01 (Python architecture) through Topic 16 (Agent review) to exact requirements and verification artifacts.

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ (tested on Node v24.15.0)
* npm 9+

### Running the UI

1. Clone or open this repository:
```bash
cd Finshield
```

2. Install dependencies (already installed in workspace):
```bash
npm --prefix frontend install
```

3. Launch development server:
```bash
npm run dev
```

4. Or run directly from the `frontend` folder:
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

### Building for Production
```bash
npm run build
```
Build output is generated in `frontend/dist/`.

