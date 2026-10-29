from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ActionEnum(str, Enum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"

class PaymentRequest(BaseModel):
    idempotency_key: str = Field(..., description="Unique key to prevent double charging")
    payer_vpa: str = Field(..., description="Payer's UPI ID")
    payee_vpa: str = Field(..., description="Payee's UPI ID")
    amount: float = Field(..., description="Transaction amount in INR")

class PaymentResponse(BaseModel):
    verdict: str = Field(..., description="ALLOW, STEP_UP, or HOLD")
    risk_score: float
    reasons: List[str]
    evaluation_id: Optional[str] = None

class NomineeHoldDetailsResponse(BaseModel):
    evaluation_id: str
    payer_name: str
    payee_vpa: str
    amount: float
    risk_reasons: List[str]
    expires_at: datetime
    is_emergency_grace_eligible: bool = False

class NomineeResolutionRequest(BaseModel):
    token: str
    action: ActionEnum
    simulated_otp: str = Field(..., min_length=6, max_length=6)
    acknowledgment_checked: bool