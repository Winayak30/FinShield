"""FinShield API entrypoint (Stage 1.5).

STUB NOTICE: every endpoint below returns hard-coded mock data. There is no rules engine,
no Redis, no Postgres and no token/OTP validation yet. The HOLD verdict is a placeholder.
"""

import hashlib
import json
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import FastAPI

from src.core.config import settings
from src.core.errors import AppError, app_error_handler
from src.schemas import (
    NomineeHoldDetailsResponse,
    NomineeResolutionRequest,
    NomineeResolutionResponse,
    PaymentRequest,
    PaymentResponse,
    Verdict,
)

app = FastAPI(title=settings.app_name, version=settings.app_version)
app.add_exception_handler(AppError, app_error_handler)


def compute_input_hash(request: PaymentRequest) -> str:
    """sha256 over canonical JSON of the decision inputs (idempotency_key excluded)."""
    payload = request.model_dump(mode="json", exclude={"idempotency_key"})
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


@app.post("/v1/payments/evaluate", response_model=PaymentResponse)
async def evaluate_payment(request: PaymentRequest) -> PaymentResponse:
    """STUB: always returns HOLD. Real verdicts come from the rules engine in a later stage."""
    return PaymentResponse(
        verdict=Verdict.HOLD,
        risk_score=0.85,
        reasons=["STUB: Active call detected", "STUB: New payee VPA"],
        evaluation_id=f"eval_{uuid.uuid4().hex}",
        policy_version=settings.policy_version,
        input_hash=compute_input_hash(request),
    )


@app.get("/v1/holds/{evaluation_id}", response_model=NomineeHoldDetailsResponse)
async def get_hold_details(evaluation_id: str) -> NomineeHoldDetailsResponse:
    """STUB: returns synthetic data for any evaluation_id (nothing is persisted yet)."""
    return NomineeHoldDetailsResponse(
        evaluation_id=evaluation_id,
        payer_name="Test Payer (synthetic)",
        payee_vpa="test.payee@example",
        amount_paise=4_500_000,
        reasons=["STUB: Active call detected", "STUB: New payee VPA"],
        expires_at=datetime.now(UTC) + timedelta(minutes=15),
    )


@app.post("/v1/holds/{evaluation_id}/resolve", response_model=NomineeResolutionResponse)
async def resolve_hold(
    evaluation_id: str, request: NomineeResolutionRequest
) -> NomineeResolutionResponse:
    """STUB: no token, OTP or state-machine validation yet."""
    if request.action == "APPROVE" and not request.acknowledgment_checked:
        raise AppError(400, "ACK_REQUIRED", "Acknowledgment required for approval")

    return NomineeResolutionResponse(
        status="success", message=f"Hold {evaluation_id} marked as {request.action}"
    )
