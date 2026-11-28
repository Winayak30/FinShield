"""Pydantic models returned by MCP tools to the tribunal agents.

Kept separate from the top-level src/schemas.py, which defines the public
payment-app-facing API contract. These models are agent-facing only.
"""
from pydantic import BaseModel

class DeviceTelemetry(BaseModel):
    remote_access_tool_detected: bool
    remote_access_tool_name: str | None = None
    screen_share_active: bool
    call_in_progress: bool
    accessibility_service_abuse: bool
    new_device: bool
    device_age_days: int
    source: str
    confidence: float