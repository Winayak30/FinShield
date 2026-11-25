# FinShield: Pre-Payment Safety Layer for Digital Payments

> An AI-assisted, privacy-first platform that aims to detect and prevent Authorised Push Payment
> (APP) fraud, "digital arrests" and remote-access scams *before* the transaction clears.

**Status: Stage 1.5 (foundation).** This is a walking skeleton. The API contract is defined and
tested, but **all endpoints are stubs**. See [What is built](#what-is-built-and-what-is-not).

## Target design (not yet implemented)

FinShield sits between a payment app and the banking/UPI switch with a dual-path architecture:

1. **Fast Path (<50ms p95 target):** deterministic, Redis-backed rules engine.
2. **Tribunal Path (async):** LangGraph multi-agent investigation over read-only FastMCP tools,
   routing to a Trusted Nominee for cryptographically bound approval.

Core principles the design commits to:

1. **Deterministic money:** the rules engine decides; the LLM only investigates and explains.
2. **Fail closed (high value):** missing data holds high-value payments; low-value defaults to STEP_UP.
3. **Agent boundaries:** agents can only *raise* risk; they never release, freeze or block.
4. **Zero raw LLM data:** PII is masked first and reached only via read-only FastMCP tools.
5. **Exactly-once release:** atomic state transitions, transactional outbox, idempotency keys.
6. **Replayable decisions:** `policy_version` and `input_hash` are returned for every evaluation.

## What is built and what is not

| Area | Status |
|---|---|
| FastAPI app, 3 endpoints, Pydantic v2 contract (`src/main.py`, `src/schemas.py`) | Built, **stub responses** |
| `/v1/payments/evaluate` always returns `HOLD` (score 0.85) with `STUB:` reasons | **Stub**, no rules |
| `input_hash` (sha256 of canonical decision inputs, excludes `idempotency_key`) | Built |
| `policy_version` from settings (`FINSHIELD_POLICY_VERSION`) | Built |
| Settings, PII-masking log filter, error model (`src/core/`) | Built |
| Contract tests (`tests/contract/`) | Built |
| Docker Compose: Postgres 16 + Redis 7 with volumes and healthchecks | Built, **not used by the app yet** |
| Rules engine, velocity, Redis (`src/engine/`) | Not built (empty package) |
| Postgres models, hold state machine, outbox, idempotency enforcement (`src/state/`) | Not built (empty package) |
| PASETO tokens, OTP/token validation (`src/security/`) | Not built (empty package); `token` and `simulated_otp` are only format-checked |
| FastMCP read-only tools (`src/mcp_server/`) | Not built (empty package) |
| LangGraph Tribunal and eval harness (`finshield-agent/`) | Not built |
| Frontend (`finshield-frontend/`) | Not started |
| Alembic, ARQ, OpenTelemetry | Not added |

Nothing is persisted: `GET /v1/holds/{id}` returns synthetic data for any ID.

## Repository layout

```text
FinShield/
├── Readme.md
├── .gitignore
├── finshield-backend/
│   ├── pyproject.toml, uv.lock, docker-compose.yml, .env.example
│   ├── src/
│   │   ├── main.py          # app entry: src.main:app
│   │   ├── schemas.py       # API contract
│   │   ├── core/            # config, logging (PII masking), errors
│   │   ├── engine/          # (empty) rules and velocity
│   │   ├── state/           # (empty) Postgres models, state machine, outbox
│   │   ├── security/        # (empty) PASETO token service
│   │   └── mcp_server/      # (empty) read-only FastMCP tools
│   └── tests/contract/
├── finshield-agent/         # LangGraph Tribunal + evals; consumes data ONLY via the MCP server
└── finshield-frontend/      # not started
```

## Quick start

Prerequisites: Python 3.12+, [uv](https://docs.astral.sh/uv/), Docker (only for Postgres/Redis).

```bash
cd finshield-backend
uv sync
uv run uvicorn src.main:app --reload
```

Open <http://localhost:8000/docs> for Swagger UI.

Run tests and lint:

```bash
uv run pytest
uv run ruff check
```

Optional infrastructure (not yet used by the API):

```bash
cp .env.example .env      # then edit the values
docker compose up -d
```

## API contract notes (Stage 1.5)

- Money is an integer in paise: `amount_paise` (> 0). Float amounts are gone.
- `verdict` is one of `ALLOW`, `STEP_UP`, `HOLD`, `BLOCK`.
- Both responses use `reasons` (not `risk_reasons`).
- `input_hash` covers the decision inputs only; `idempotency_key` is transport metadata and is excluded.
- VPAs match `handle@psp`; `simulated_otp` is exactly 6 ASCII digits.
