# Nautobot MCP Server Admin Guide

Install [`nautobot-mcp`](https://pypi.org/project/nautobot-mcp/). The Nautobot plugin name is `nautobot_mcp`. The console script is `nautobot-mcp`.

The previous PyPI name was `nautobot-mcp-server`. New releases publish only as `nautobot-mcp`.

## Install

Standalone server, talking to a remote Nautobot:

```bash
pip install nautobot-mcp
```

Inside a Nautobot environment, install the `nautobot` extra so the dependency pin matches:

```bash
pip install "nautobot-mcp[nautobot]"
```

Enable it in `nautobot_config.py`:

```python
PLUGINS = ["nautobot_mcp"]

PLUGINS_CONFIG = {
    "nautobot_mcp": {
        "nautobot_url": "https://nautobot.example.com",
        "nautobot_token": "YOUR_API_TOKEN",
        "verify_ssl": True,
        "ca_bundle": "",
        "request_timeout": 30,
        "max_pagination_records": 5000,
        "allow_writes": False,
        "log_level": "INFO",
        "tenant_scope": [],
        "tenant_group_scope": [],
        "plugins": ["auto"],
    }
}
```

Then run the MCP server next to Nautobot. It reads `PLUGINS_CONFIG` when started from that environment:

```bash
nautobot-mcp
```

## Standalone configuration

```bash
export NAUTOBOT_URL="https://nautobot.example.com"
export NAUTOBOT_TOKEN="YOUR_API_TOKEN"
nautobot-mcp
```

| Env var | `PLUGINS_CONFIG` key | Default | Purpose |
| --- | --- | --- | --- |
| `NAUTOBOT_URL` | `nautobot_url` | required | Nautobot base URL. |
| `NAUTOBOT_TOKEN` | `nautobot_token` | required | API token. |
| `NAUTOBOT_MCP_VERIFY_SSL` | `verify_ssl` | `true` | TLS verification. |
| `NAUTOBOT_MCP_CA_BUNDLE` | `ca_bundle` | — | CA bundle path. |
| `NAUTOBOT_MCP_TIMEOUT` | `request_timeout` | `30` | HTTP timeout in seconds. |
| `NAUTOBOT_MCP_MAX_PAGINATION_RECORDS` | `max_pagination_records` | `5000` | Pagination cap. |
| `NAUTOBOT_MCP_ALLOW_WRITES` | `allow_writes` | `false` | Enable write tools. |
| `NAUTOBOT_MCP_TENANT_SCOPE` | `tenant_scope` | — | Restrict to these tenants. |
| `NAUTOBOT_MCP_TENANT_GROUP_SCOPE` | `tenant_group_scope` | — | Restrict to these tenant groups. |
| `NAUTOBOT_MCP_PLUGINS` | `plugins` | `auto` | Plugin integrations to enable. |
| `NAUTOBOT_MCP_LOG_LEVEL` | `log_level` | `INFO` | Log level. Logs go to stderr. |
| `NAUTOBOT_MCP_HOST` | — | `127.0.0.1` | Bind address for HTTP and SSE. `--host` wins. |
| `NAUTOBOT_MCP_PORT` | — | `8000` | Bind port for HTTP and SSE. `--port` wins. |

Older unprefixed names (`NAUTOBOT_ALLOW_WRITES`, `NAUTOBOT_TENANT_SCOPE`, `MCP_LOG_LEVEL`) still work. The `NAUTOBOT_MCP_*` form wins when both are set. `NAUTOBOT_URL` and `NAUTOBOT_TOKEN` keep their names.

## Reverse proxy

HTTP and SSE listen on `127.0.0.1:8000` unless you change the bind address. A proxy on another machine cannot reach that. Bind a reachable address and proxy to the MCP path:

```bash
nautobot-mcp --transport streamable-http --host 0.0.0.0 --port 8000
```

Streamable HTTP is at `/mcp`. SSE is at `/sse`. Keep the port reachable only from the proxy. The Nautobot UI path is not an MCP endpoint.

## Tenant scoping

Set `tenant_scope` and/or `tenant_group_scope` when one token serves agents for more than one customer:

```bash
export NAUTOBOT_MCP_TENANT_SCOPE="acme,globex"
export NAUTOBOT_MCP_TENANT_GROUP_SCOPE="managed-customers"
```

List, get, create, update, and delete on tenant-aware models stay inside that scope. The server drops a caller-supplied `tenant` filter and replaces it. Objects with no tenant are out of scope. Manufacturers, platforms, statuses, and other models without a tenant are unchanged.

`graphql_query` and Nautobot Job runs are not tenant-filtered. Use a tenant-restricted token for those paths. `tenant_scope_info` shows the active scope.

## Optional Nautobot apps

The base install covers Nautobot core only. Extras add tools for Network to Code apps:

```bash
pip install "nautobot-mcp[design-builder]"
pip install "nautobot-mcp[onboarding]"
pip install "nautobot-mcp[ssot]"
pip install "nautobot-mcp[golden-config]"
pip install "nautobot-mcp[nornir]"
pip install "nautobot-mcp[all]"
```

`plugins = auto` enables a plugin when its Python package imports. That fits a server that shares the Nautobot environment. A standalone server talking to a remote Nautobot should set the plugins explicitly, because the app is installed on Nautobot, not in the MCP virtualenv:

```bash
export NAUTOBOT_MCP_PLUGINS="design_builder,ssot"
```

Keys are `design_builder`, `onboarding`, `ssot`, `golden_config`, `nornir`, or `all`. Check the result with `list_active_plugins`.

| Plugin | Tools |
| --- | --- |
| Design Builder | `list_designs`, `list_design_deployments`, `list_design_jobs`, `run_design` |
| Device Onboarding | `list_onboarding_jobs`, `onboard_device` |
| SSoT | `list_ssot_jobs`, `list_ssot_syncs`, `list_ssot_sync_logs`, `run_ssot_sync` |
| Golden Config | compliance, rules, features, intended config, Golden Config jobs |
| Nornir | `nornir_plugin_info` |

## Source docs

- [Install and configure](https://github.com/bsmeding/nautobot-mcp-server/blob/main/docs/admin/install.md)
- [Release notes](https://github.com/bsmeding/nautobot-mcp-server/blob/main/docs/admin/release_notes/index.md)
