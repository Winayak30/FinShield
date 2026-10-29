from fastapi import FastAPI, HTTPException
from src.schemas import (
    PaymentRequest, PaymentResponse,
    NomineeHoldDetailsResponse, NomineeResolutionRequest
)
from datetime import datetime, timedelta, timezone

app = FastAPI(title="FinShield API", version="1.0.0")


@app.post("/v1/payments/evaluate", response_model=PaymentResponse)
async def evaluate_payment(request: PaymentRequest):
    """Evaluates a payment and returns ALLOW, STEP_UP, or HOLD."""
    return PaymentResponse(
        verdict="HOLD",
        risk_score=0.85,
        reasons=["Active call detected", "New payee VPA"],
        evaluation_id="eval_123456"
    )


@app.get("/v1/holds/{evaluation_id}", response_model=NomineeHoldDetailsResponse)
async def get_hold_details(evaluation_id: str):
    """Fetches the details of a held payment for the Nominee UI."""
    return NomineeHoldDetailsResponse(
        evaluation_id=evaluation_id,
        payer_name="Vinayak Tripathi",
        payee_vpa="unknown_merchant@upi",
        amount=45000.00,
        risk_reasons=["Active call detected", "New payee VPA"],
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=15)
    )


@app.post("/v1/holds/{evaluation_id}/resolve")
async def resolve_hold(evaluation_id: str, request: NomineeResolutionRequest):
    """Submits the Nominee's decision (Approve/Reject)."""
    if request.action == "APPROVE" and not request.acknowledgment_checked:
        raise HTTPException(status_code=400, detail="Acknowledgment required for approval")

    return {"status": "success", "message": f"Hold {evaluation_id} marked as {request.action}"}