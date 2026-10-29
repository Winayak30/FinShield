# FinShield 🛡️
### Privacy-First Financial Fraud Prevention & Security Gateway

FinShield is a financial security gateway designed to detect and prevent **Authorised Push Payment (APP) fraud and remote-access scams** before a payment is completed. It combines deterministic risk evaluation, behavioral analysis, device security signals, and asynchronous multi-agent AI investigation to help protect users from suspicious transactions.

The system evaluates payment requests in real time and returns a risk verdict. Suspicious transactions can be held for investigation, with high-risk cases escalated to a trusted nominee for out-of-band approval.

> **Project status:** Prototype in development  
> **Current Execution Stage:** 🟢 Stage 0 (Contracts) Complete | 🟡 Stage 1 (Walking Skeleton) In Progress  
> **Project type:** AI-powered financial security system  
> **Backend:** Python 3.12+  
> **Frontend:** React + Vite

---

## 🚀 Current Progress & Roadmap

### ✅ Stage 0: Contracts & Repository (Completed)
* **API Contracts Locked:** Defined strict Pydantic v2 schemas for `PaymentRequest`, `PaymentResponse`, `NomineeHoldDetailsResponse`, and `NomineeResolutionRequest`.
* **FastAPI Skeleton:** Implemented the core REST routing layer (`src/main.py`) with mock endpoints to unblock frontend integration.
* **OpenAPI Documentation:** Swagger UI generated for external frontend consumption.
* **Infrastructure Skeleton:** Defined `docker-compose.yml` for PostgreSQL and Redis, and isolated Python environment using `uv`.

### 🚧 Stage 1: Walking Skeleton (In Progress)
* **Database & ORM:** Connecting async SQLAlchemy to PostgreSQL and creating the `hold_events` and `hold_audit_log` tables.
* **Idempotency Integration:** Implementing Redis `SETNX` to prevent double-charging and secure single-use nominee approval tokens.
* **State Machine:** Replacing mock endpoints with a functional state machine (PENDING -> APPROVED/REJECTED) ensuring atomic state transitions.
* **E2E Smoke Test:** Ensuring a mocked flagged transaction can be held, routed to the Nominee API, and released exactly once.

---

## 🎯 Problem Statement

Traditional payment systems may struggle to identify scams in which victims are manipulated into authorizing transactions themselves. Remote-access scams introduce additional risks by allowing attackers to observe or control a victim's device.

FinShield addresses these challenges through real-time risk assessment, device and session signal analysis, explainable AI-assisted investigations, and a secure payment approval workflow.

## ✨ Key Features

- **Real-Time Payment Risk Assessment:** Evaluates transactions using deterministic rules and configurable risk thresholds.
- **Behavioral Baselines:** Identifies unusual payment amounts, new payees, transaction frequency, and deviations from established user behavior.
- **Device Compromise Detection:** Combines signals such as remote-access tools, active calls, screen sharing, and suspicious accessibility services.
- **Multi-Agent AI Investigation:** Uses specialized agents to investigate social engineering and device compromise, followed by an independent review.
- **Trusted Nominee Approval:** Enables registered nominees to approve or reject held payments through a secure, time-limited approval workflow.
- **Secure Payment Lifecycle:** Implements idempotency, atomic state transitions, expiry handling, and exactly-once payment release.
- **Privacy and AI Guardrails:** Masks personally identifiable information (PII), detects prompt injection, validates structured outputs, and constrains agent behavior.
- **Compromise Response:** Supports session revocation, security-related account freezing, and a controlled recovery workflow.
- **Analyst Dashboard:** Provides investigation details, risk scores, hold management, and auditable analyst actions.
- **Scenario Simulation and Evaluation:** Tests scam scenarios, legitimate transactions, system failures, and AI instruction adherence.

## 🏗️ System Architecture

FinShield separates latency-sensitive payment decisions from more expensive AI investigation.

```text
Payment Application
        |
        v
   FastAPI Gateway
        |
        v
 Deterministic Risk Engine
        |
        +----> ALLOW / STEP_UP
        |
        +----> HOLD / BLOCK
                    |
                    v
             Redis / ARQ Queue
                    |
                    v
             LangGraph Tribunal
                    |
          +---------+---------+
          |                   |
          v                   v
   Social Engineering    Device Compromise
       Analyst                Analyst
          |                   |
          +---------+---------+
                    |
                    v
              Reviewer Agent
                    |
                    v
              Explainer Agent
                    |
                    v
           Nominee / Analyst Review
                    |
                    v
       Audited Payment Resolution

```

**Supporting infrastructure**

* **PostgreSQL:** Persistent records, evaluations, investigations, and audit history.
* **Redis:** Behavioral baseline cache, counters, queue infrastructure, and token-version tracking.
* **FastMCP:** Controlled, read-only access to investigation data.
* **LLM Provider:** Structured AI outputs and investigation assistance.
* **React + Vite:** Analyst console and user-facing approval interfaces.

The architecture ensures that the LLM is **never on the synchronous payment evaluation path**. AI agents provide recommendations and explanations but cannot independently perform irreversible payment or account actions.

## ⚙️ Technology Stack

| Component | Technologies |
| --- | --- |
| Language | Python 3.12+ |
| Backend API | FastAPI, Pydantic v2 |
| Database | PostgreSQL, SQLAlchemy 2.0, Alembic |
| Caching and queues | Redis, ARQ |
| AI orchestration | LangGraph |
| Agent data access | FastMCP, Model Context Protocol (MCP) |
| Frontend | React, Vite |
| Testing | pytest, pytest-asyncio, pytest-benchmark |
| Monitoring | OpenTelemetry |
| Deployment | Docker Compose |

## 🔄 How It Works

1. **Payment request:** The integrating application submits transaction details and device/session signals to FinShield.
2. **Risk evaluation:** The deterministic engine checks hard rules, behavioral deviations, transaction velocity, payee familiarity, and compromise signals.
3. **Verdict generation:** The system returns `ALLOW`, `STEP_UP`, `HOLD`, or `BLOCK`, along with a risk score and reasons.
4. **Asynchronous investigation:** A held transaction triggers specialized AI agents that investigate potential social engineering and device compromise.
5. **Independent review:** A reviewer validates the investigation outputs. Failed reviews trigger bounded retries or escalation to a human analyst.
6. **Approval and resolution:** The system escalates held transactions to a registered nominee or analyst, subject to the configured workflow.
7. **Security response:** Confirmed device compromise can trigger session revocation, account freezing, and a security alert.
8. **Audit and evaluation:** Decisions, state transitions, tool calls, and investigation results are recorded for traceability and testing.

## 🧠 AI and GenAI Learning Integration (EPAM 16-Topic Mapping)

| # | Topic | Application in FinShield |
| --- | --- | --- |
| 1 | Python Architecture and Quality | Typed contracts, modular design, testing, and code quality |
| 2 | AI Foundations and Trade-offs | Deterministic scoring versus LLM-based investigation |
| 3 | Prompt Evaluations | Scenario-based fraud detection and evaluation |
| 4 | AI Agents and Specialization | Dedicated social engineering and device compromise agents |
| 5 | Agent Instruction Evaluations | Schema validation and role-boundary tests |
| 6 | Context Engineering | Relevant history retrieval and token-budgeted prompts |
| 7 | AI Fluency | Prompt iteration, collaboration, and performance benchmarking |
| 8 | Orchestration | Parallel agent execution, review, retries, and escalation |
| 9 | Agent-to-Agent Communication | Typed investigation state and structured agent outputs |
| 10 | Model Context Protocol (MCP) | Secure, read-only investigation tools |
| 11 | Agent Harness | Timeouts, retries, circuit breakers, and observability |
| 12 | Security and Privacy | PII masking, access control, signed tokens, and secret management |
| 13 | Guardrails | Prompt-injection defenses and output validation |
| 14 | Token Optimization | Model routing, prompt caching, and context compaction |
| 15 | Agentic Tools | Controlled tools with audit logging and bounded permissions |
| 16 | Agent Review | Independent validation, human escalation, and analyst oversight |

## 🔐 Security and Reliability Principles

* Deterministic risk evaluation with configurable thresholds.
* Idempotent payment evaluation and exactly-once release safeguards.
* Atomic hold-state transitions and append-only audit logs.
* PII masking before LLM processing and no raw PII in logs.
* Signed, single-use, short-lived nominee approval tokens.
* Read-only MCP tools with server-bound identity.
* Prompt-injection detection and structured AI output validation.
* Fail-safe handling of dependency failures and investigation timeouts.
* Automated tests for concurrency, detection quality, and AI behavior.

## 🧪 Planned Demo Scenarios

FinShield's requirements define scenarios to validate both security and usability:

* Remote-access scam involving a new device, active call, and suspicious payment.
* Coached APP fraud involving an urgent transfer to a first-time payee.
* Legitimate urgent transfers to verify false-positive handling.
* Prompt-injection attempts embedded in payment memos.
* Concurrent nominee approval and hold expiry.
* Redis outage during a high-value transaction.
* New-user transactions without an established behavioral baseline.

## 📊 Performance and Testing Goals

* Fast-path server-side p95 latency below 50 ms at 100 requests/second.
* Typical AI tribunal investigation latency of 2–4 seconds, with a 30-second hard deadline.
* At least 80% line coverage for the risk engine, state machine, and sanitizer.
* A dataset containing at least 40 scenarios, including at least 15 legitimate hard-negative cases.
* Deterministic engine and state-machine tests running independently of the LLM.

## 🚀 Getting Started

### Prerequisites

* Python 3.12+
* Docker and Docker Compose (for Postgres and Redis)

### Clone the Repository

```bash
git clone [https://github.com/Winayak30/FinShield.git](https://github.com/Winayak30/FinShield.git)
cd FinShield

```

### Project Setup

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install fastapi "uvicorn[standard]" pydantic

# Run the core API server
uvicorn src.main:app --reload

```

Navigate to `http://localhost:8000/docs` to view the interactive API contracts.

## 📌 Project Scope

FinShield is a prototype intended to demonstrate fraud prevention, AI-assisted investigation, security controls, and reliable payment workflows. The current specification excludes production banking or UPI integration, a production mobile SDK, trained ML models, production identity-provider integration, multi-currency and foreign-exchange support, and regulatory certification. Banking, payment, and notification integrations are simulated behind defined interfaces.

## 👥 Team and Contributions

FinShield is designed as a collaborative project with multiple workstreams covering backend engineering, AI orchestration, security, frontend development, and testing. Contributions must adhere strictly to the shared API schemas, typed contracts, testing standards, and fail-closed security requirements.

```

```
