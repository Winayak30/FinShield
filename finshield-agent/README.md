# finshield-agent

Planned home of the LangGraph Tribunal and the eval harness. **Nothing is built here yet.**

Rule: this component consumes data **only through the FastMCP server**
(`finshield-backend/src/mcp_server/`). It must never access Postgres or Redis directly.
