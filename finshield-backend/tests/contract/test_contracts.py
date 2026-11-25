import re

import pytest
from fastapi.testclient import TestClient

from src.core.logging import mask_pii
from src.main import app
from src.schemas import NomineeResolutionResponse, PaymentResponse, Verdict

client = TestClient(app)

VALID_PAYMENT = {
    "idempotency_key": "idem-1",
    "payer_vpa": "test.payer@example",
    "payee_vpa": "test.payee@example",
    "amount_paise": 150000,
}
VALID_RESOLVE = {
    "token": "stub-token",
    "action": "APPROVE",
    "simulated_otp": "123456",
    "acknowledgment_checked": True,
}
EVALUATE = "/v1/payments/evaluate"
RESOLVE = "/v1/holds/eval_x/resolve"


def _payment(**overrides):
    return {**VALID_PAYMENT, **overrides}


def _resolve(**overrides):
    return {**VALID_RESOLVE, **overrides}


# --- OpenAPI -----------------------------------------------------------------


def test_openapi_schema_loads():
    r = client.get("/openapi.json")
    assert r.status_code == 200
    spec = r.json()
    assert {EVALUATE, "/v1/holds/{evaluation_id}", "/v1/holds/{evaluation_id}/resolve"} <= set(
        spec["paths"]
    )
    assert spec["components"]["schemas"]["Verdict"]["enum"] == [
        "ALLOW",
        "STEP_UP",
        "HOLD",
        "BLOCK",
    ]


def test_docs_load():
    assert client.get("/docs").status_code == 200


# --- Request validation (422) --------------------------------------------------


@pytest.mark.parametrize("amount", [0, -1, -100, 12.5, "abc", None])
def test_amount_paise_rejects_bad_values(amount):
    assert client.post(EVALUATE, json=_payment(amount_paise=amount)).status_code == 422


def test_old_float_amount_field_is_rejected():
    body = {k: v for k, v in VALID_PAYMENT.items() if k != "amount_paise"}
    body["amount"] = 1500.0
    assert client.post(EVALUATE, json=body).status_code == 422


@pytest.mark.parametrize("field", ["payer_vpa", "payee_vpa"])
@pytest.mark.parametrize(
    "vpa", ["", "nohandle", "@bank", "a@bank", "user@", "user@1bank", "us er@bank", "a@@b"]
)
def test_vpa_rejects_bad_values(field, vpa):
    assert client.post(EVALUATE, json=_payment(**{field: vpa})).status_code == 422


@pytest.mark.parametrize("missing", list(VALID_PAYMENT))
def test_payment_missing_field(missing):
    body = {k: v for k, v in VALID_PAYMENT.items() if k != missing}
    assert client.post(EVALUATE, json=body).status_code == 422


@pytest.mark.parametrize("otp", ["12345", "1234567", "abcdef", "12345a", "12 456", "", "١٢٣٤٥٦"])
def test_otp_rejects_bad_values(otp):
    assert client.post(RESOLVE, json=_resolve(simulated_otp=otp)).status_code == 422


def test_unknown_action_rejected():
    assert client.post(RESOLVE, json=_resolve(action="MAYBE")).status_code == 422


@pytest.mark.parametrize("missing", list(VALID_RESOLVE))
def test_resolve_missing_field(missing):
    body = {k: v for k, v in VALID_RESOLVE.items() if k != missing}
    assert client.post(RESOLVE, json=body).status_code == 422


# --- Responses ---------------------------------------------------------------


def test_valid_payment_returns_typed_response():
    r = client.post(EVALUATE, json=VALID_PAYMENT)
    assert r.status_code == 200
    parsed = PaymentResponse.model_validate(r.json())
    assert parsed.verdict in Verdict
    assert 0 <= parsed.risk_score <= 1
    assert parsed.policy_version
    assert parsed.evaluation_id.startswith("eval_")
    assert re.fullmatch(r"[0-9a-f]{64}", parsed.input_hash)


def test_input_hash_deterministic_for_identical_input():
    a = client.post(EVALUATE, json=VALID_PAYMENT).json()
    b = client.post(EVALUATE, json=VALID_PAYMENT).json()
    assert a["input_hash"] == b["input_hash"]


def test_input_hash_ignores_idempotency_key():
    a = client.post(EVALUATE, json=_payment(idempotency_key="k1")).json()
    b = client.post(EVALUATE, json=_payment(idempotency_key="k2")).json()
    assert a["input_hash"] == b["input_hash"]


@pytest.mark.parametrize(
    "change",
    [{"amount_paise": 150001}, {"payer_vpa": "other.payer@example"}, {"payee_vpa": "x.y@example"}],
)
def test_input_hash_changes_with_decision_inputs(change):
    base = client.post(EVALUATE, json=VALID_PAYMENT).json()
    changed = client.post(EVALUATE, json=_payment(**change)).json()
    assert base["input_hash"] != changed["input_hash"]


def test_evaluation_id_unique_per_call():
    a = client.post(EVALUATE, json=VALID_PAYMENT).json()
    b = client.post(EVALUATE, json=VALID_PAYMENT).json()
    assert a["evaluation_id"] != b["evaluation_id"]


def test_hold_details_contract():
    r = client.get("/v1/holds/eval_abc")
    assert r.status_code == 200
    body = r.json()
    assert body["evaluation_id"] == "eval_abc"
    assert isinstance(body["amount_paise"], int) and body["amount_paise"] > 0
    assert isinstance(body["reasons"], list)
    assert "risk_reasons" not in body
    assert "amount" not in body
    assert "is_emergency_grace_eligible" not in body


def test_resolve_approve_without_ack_is_400():
    r = client.post(RESOLVE, json=_resolve(acknowledgment_checked=False))
    assert r.status_code == 400
    assert r.json()["code"] == "ACK_REQUIRED"


def test_resolve_valid_returns_typed_response():
    r = client.post(RESOLVE, json=VALID_RESOLVE)
    assert r.status_code == 200
    parsed = NomineeResolutionResponse.model_validate(r.json())
    assert parsed.status == "success"


def test_resolve_reject_without_ack_is_ok():
    r = client.post(RESOLVE, json=_resolve(action="REJECT", acknowledgment_checked=False))
    assert r.status_code == 200


# --- PII masking -------------------------------------------------------------


def test_mask_pii_masks_vpa_otp_and_token():
    out = mask_pii("pay alice@okbank otp=123456 token: abc.def simulated_otp='654321'")
    assert "alice" not in out
    assert "123456" not in out and "654321" not in out
    assert "abc.def" not in out
    assert "al***@okbank" in out
