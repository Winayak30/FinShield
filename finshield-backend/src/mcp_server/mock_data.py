"""Fake/seed data for MCP tools until real Postgres/Redis wiring exists.

Isolated here on purpose: when real data access replaces this, delete this
one file instead of hunting fake data scattered across the codebase.
"""
from src.mcp_server.schemas import DeviceTelemetry


def get_mock_device_telemetry(compromised: bool) -> DeviceTelemetry:
    if compromised:
        return DeviceTelemetry(
            remote_access_tool_detected=True,
            remote_access_tool_name="AnyDesk",
            screen_share_active=True,
            call_in_progress=True,
            accessibility_service_abuse=True,
            new_device=True,
            device_age_days=0,
            source="finshield-mobile-sdk-v2.4",
            confidence=0.97,
        )

    return DeviceTelemetry(
        remote_access_tool_detected=False,
        screen_share_active=False,
        call_in_progress=False,
        accessibility_service_abuse=False,
        new_device=False,
        device_age_days=412,
        source="finshield-mobile-sdk-v2.4",
        confidence=0.95,
    )