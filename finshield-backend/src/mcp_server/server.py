"""Creates the FastMCP server instance and registers all read-only tools."""
from fastmcp import FastMCP

from src.mcp_server.tools import device_telemetry

mcp = FastMCP("FinShield MCP Server")

device_telemetry.register(mcp)

if __name__ == "__main__":
    mcp.run()