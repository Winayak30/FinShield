"""The get_device_telemetry MCP tool (FR-301, FR-602)."""
from fastmcp import FastMCP

from src.mcp_server.mock_data import get_mock_device_telemetry
from src.mcp_server.schemas import DeviceTelemetry


def register(mcp: FastMCP) -> None:
    @mcp.tool
    def get_device_telemetry(compromised: bool = False) -> DeviceTelemetry:
        """Return device/session telemetry for the current investigation."""
        return get_mock_device_telemetry(compromised)