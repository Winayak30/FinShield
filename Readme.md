# 🛡️ FinShield: Pre-Payment Safety Layer for Digital Payments

> **Detect. Investigate. Protect.** 
> An AI-assisted, privacy-first platform that detects and prevents Authorised Push Payment (APP) fraud, "digital arrests", and remote-access scams *before* the transaction clears the banking rails.

## 📖 Overview
FinShield sits between a user's payment application and the core banking/UPI switch. It evaluates real-time contextual signals (transaction velocity, device compromise, screen mirroring) to block coerced payments. 

Unlike traditional fraud engines that look at past losses, FinShield operates a **Dual-Path Architecture**:
1. **Fast Path (<50ms p95):** A deterministic, Redis-backed rule engine that never blocks the UPI rails.
2. **Tribunal Path (Async):** A LangGraph-powered multi-agent system that deeply investigates flagged transactions using privacy-safe Model Context Protocol (FastMCP) tools, ultimately routing to a Trusted Nominee for cryptographic approval.

---

## 🛑 Non-Negotiable Core Principles
As defined in our engineering pipeline, the following rules govern this repository:
1. **Deterministic Money:** The rules engine decides on money. The LLM only investigates and explains.
2. **Fail Closed (High Value):** If data is missing (Redis/Baseline outage), high-value payments are HELD; low-value defaults to STEP_UP.
3. **Agent Boundaries:** Agents can only *raise* risk. They never release, freeze, or block.
4. **Zero Raw LLM Data:** All PII is masked first, wrapped in delimiters, and queried via read-only FastMCP tools.
5. **Exactly-Once Release:** Atomic state transitions + transactional outbox + idempotency keys.
6. **100% Replayable Decisions:** Policy version and input hash are stored for every single evaluation.

---

## 🛠️ Technology Stack
**Fully Python-Native Backend Pipeline:**
* **Core Framework:** Python 3.12+, FastAPI, Pydantic v2
* **Database & ORM:** PostgreSQL, SQLAlchemy 2.0 (Async) + Alembic
* **Cache & Queues:** Redis, ARQ (Async Redis Queue)
* **AI Orchestration:** LangGraph, LangChain, FastMCP
* **Observability & Testing:** OpenTelemetry, Pytest (asyncio, benchmark)
* **Frontend (Nominee/Analyst):** React + Vite
* **Infrastructure:** Docker Compose

---

## 📂 Repository Structure (Stage 0)

```text
finshield/
├── src/
│   ├── api/                 # FastAPI routes (Fast Path ingress)
│   ├── core/                # Pydantic schemas, config, idempotency
│   ├── security/            # PII sanitizer, signature validation, tokens
│   ├── engine/              # Deterministic risk scoring, Redis Lua scripts
│   ├── state/               # Hold state machine, PostgreSQL atomic transitions
│   ├── agents/              # LangGraph Tribunal, nodes, and Explainer
│   └── mcp_server/          # FastMCP read-only tools for agents
├── tests/
│   ├── contract/            # Frozen schema API tests
│   ├── engine/              # Fast-path <50ms benchmarks
│   └── evals/               # Adversarial LLM testing & instruction adherence
├── docker-compose.yml       # Local infrastructure (Postgres, Redis, Workers)
└── pyproject.toml           # Dependencies and build config
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* Docker and Docker Compose installed.
* Python 3.12+ installed.
* `pip` or `poetry` for dependency management.

### 2. Environment Setup
Clone the repository and set up your virtual environment:
```bash
git clone https://github.com/your-org/finshield.git
cd finshield
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

### 3. Spin Up Infrastructure
Start the local PostgreSQL, Redis, and worker instances:
```bash
docker compose up -d
```

### 4. Run the API Server
Start the FastAPI ingress server with hot-reloading:
```bash
uvicorn src.api.main:app --reload --port 8000
```
Visit `http://localhost:8000/docs` to view the OpenAPI Swagger UI.

---

## 👥 Workstreams & Ownership (EPAM 16-Topic Track)
The project is divided into 5 independent workstreams to parallelize development and meet EPAM curriculum requirements:
1. **Core Engine:** Fast Path, OpenAPI contracts, <50ms benchmarks.
2. **Agents & MCP:** LangGraph Tribunal, parallel routing, FastMCP tools.
3. **Security & State Machine:** Idempotency, PASETO token binding, PII sanitizer, atomic Outbox.
4. **Frontend:** React-based Nominee approval and Fraud Analyst console.
5. **Evals & DevOps:** CI/CD, adversarial testing, OpenTelemetry, threshold sweeping.

*(Refer to internal documentation for assigned owners per workstream).*

---
*Built for the EPAM 16-Topic Track by Team Prism.*