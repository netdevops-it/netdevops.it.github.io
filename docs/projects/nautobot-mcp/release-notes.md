# Nautobot MCP Server Release Notes

- Package name: `nautobot-mcp`
- Plugin name: `nautobot_mcp`
- Console script: `nautobot-mcp`
- Version in the repository: `0.2.5`
- PyPI: [nautobot-mcp](https://pypi.org/project/nautobot-mcp/)
- GitHub releases: [bsmeding/nautobot-mcp-server](https://github.com/bsmeding/nautobot-mcp-server/releases)

## v0.2.5

- The console script is `nautobot-mcp`, so `uvx nautobot-mcp` starts the server. The `nautobot-mcp-server` script from earlier releases is no longer installed.
- `streamable-http` and `sse` accept `--host` / `--port`, or `NAUTOBOT_MCP_HOST` / `NAUTOBOT_MCP_PORT`. The default stays `127.0.0.1:8000`. Use `--host 0.0.0.0` when a reverse proxy connects from another host.
- The PyPI homepage points at these docs.

## v0.2.3

- Rename the Python package and Nautobot plugin from `nautobot_mcp_server` to `nautobot_mcp`. Use `PLUGINS = ["nautobot_mcp"]` and `PLUGINS_CONFIG["nautobot_mcp"]`.
- The `nautobot-mcp-server` console script is unchanged in this release.

## v0.2.2

- Publish on PyPI as `nautobot-mcp`.
- Migrate the server from mcp 1.x `FastMCP` to mcp 2.x `MCPServer`.
- Refresh the lockfile onto patched GitPython, sqlparse, Django REST framework, and cryptography. Paramiko stays on 4.x.

## v0.2.1

- Rename MCP-specific environment variables to the `NAUTOBOT_MCP_` prefix. `NAUTOBOT_URL` and `NAUTOBOT_TOKEN` are unchanged. Legacy unprefixed names remain accepted as aliases.

## v0.2.0

- Tenant scoping for MSP isolation (`tenant_scope`, `tenant_group_scope`).
- Optional plugin integrations: Design Builder, Device Onboarding, SSoT, Golden Config, and Nornir.
- Golden Config `compliance_summary` helper.
- Nautobot app scaffolding: status view, navigation, development environment, and documentation.
- PyPI release workflow via trusted publishing.

## v0.1.0

- Initial release: REST and GraphQL tools for DCIM, IPAM, circuits, tenancy, virtualization, extras and jobs, a generic passthrough, and cross-domain search.

## Source docs

- [Release notes](https://github.com/bsmeding/nautobot-mcp-server/blob/main/docs/admin/release_notes/index.md)
