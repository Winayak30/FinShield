from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field

# UPI VPA: <handle>@<psp>. Handle 2-256 chars, PSP alphabetic start.
VPA_PATTERN = r"^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9]{1,63}$"


class ActionEnum(StrEnum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"


class Verdict(StrEnum):
    ALLOW = "ALLOW"
    STEP_UP = "STEP_UP"
    HOLD = "HOLD"
    BLOCK = "BLOCK"


class PaymentRequest(BaseModel):
    idempotency_key: str = Field(
        ..., min_length=1, description="Transport metadata; excluded from input_hash"
    )
    payer_vpa: str = Field(..., pattern=VPA_PATTERN, description="Payer's UPI ID")
    payee_vpa: str = Field(..., pattern=VPA_PATTERN, description="Payee's UPI ID")
    amount_paise: int = Field(..., gt=0, description="Transaction amount in paise (INR x 100)")


class PaymentResponse(BaseModel):
    verdict: Verdict
    risk_score: float = Field(..., ge=0, le=1)
    reasons: list[str]
    evaluation_id: str | None = None
    policy_version: str
    input_hash: str = Field(..., description="sha256 hex over the canonical decision inputs")


class NomineeHoldDetailsResponse(BaseModel):
    evaluation_id: str
    payer_name: str
    payee_vpa: str
    amount_paise: int
    reasons: list[str]
    expires_at: datetime


class NomineeResolutionRequest(BaseModel):
    token: str
    action: ActionEnum
    simulated_otp: str = Field(..., pattern=r"^[0-9]{6}$")
    acknowledgment_checked: bool


class NomineeResolutionResponse(BaseModel):
    status: str
    message: str
