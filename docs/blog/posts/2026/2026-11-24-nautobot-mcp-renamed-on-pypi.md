---
authors: [bsmeding]
date: 2026-11-24
title: Nautobot MCP Is Now nautobot-mcp on PyPI
summary: The public package moved from nautobot-mcp-server to nautobot-mcp. The old PyPI name will be handed over to Network to Code for their Nautobot MCP Server, so installs, the plugin id, and the console script need to follow the new name.
tags: ["nautobot", "mcp", "model context protocol", "pypi", "ai", "network automation", "netdevops"]
toc: true
layout: single
comments: true
draft: false
---

# Nautobot MCP Is Now nautobot-mcp on PyPI

The MCP server from the [June post](/blog/2026/06/17/nautobot-mcp-server-ai-access-to-your-source-of-truth/) is the same project. The PyPI name is not. It is published as [`nautobot-mcp`](https://pypi.org/project/nautobot-mcp/).

The old name, `nautobot-mcp-server`, will be handed over to Network to Code. That is the name of [their Nautobot MCP Server](https://docs.nautobot.com/projects/nautobot-mcp-server/en/stable/). After the transfer, `pip install nautobot-mcp-server` no longer installs this MCP server,  this project stays on `nautobot-mcp`.

<!-- more -->

## What to install

```bash
pip install nautobot-mcp
```

Inside a Nautobot environment, keep the Nautobot extra:

```bash
pip install "nautobot-mcp[nautobot]"
```

`uvx nautobot-mcp` starts the server, because the console script matches the package name. If a client config still says `uvx nautobot-mcp-server`, or `"command": "nautobot-mcp-server"`, change it to `nautobot-mcp`.

Until the handover, [`nautobot-mcp-server` 0.2.2](https://pypi.org/project/nautobot-mcp-server/) still depends on `nautobot-mcp`. That release is a bridge, not the long-term name. New releases of this project are published only as `nautobot-mcp`. Switch install commands, lockfiles, and client configs before the old name belongs to Network to Code.

## Names that move with the package

The distribution name, the Python package, the Nautobot plugin id, and the console script all dropped `_server`.

| Before | Now |
| --- | --- |
| `pip install nautobot-mcp-server` | `pip install nautobot-mcp` |
| `import nautobot_mcp_server` | `import nautobot_mcp` |
| `PLUGINS = ["nautobot_mcp_server"]` | `PLUGINS = ["nautobot_mcp"]` |
| `PLUGINS_CONFIG["nautobot_mcp_server"]` | `PLUGINS_CONFIG["nautobot_mcp"]` |
| console script `nautobot-mcp-server` | console script `nautobot-mcp` |

`NAUTOBOT_URL` and `NAUTOBOT_TOKEN` are unchanged. MCP-specific settings keep the `NAUTOBOT_MCP_` prefix.

A Nautobot config that still lists the old plugin id will not load this app. Update both the plugin list and the config key, then restart Nautobot:

```python
PLUGINS = ["nautobot_mcp"]

PLUGINS_CONFIG = {
    "nautobot_mcp": {
        "nautobot_url": "https://nautobot.example.com",
        "nautobot_token": "YOUR_API_TOKEN",
    }
}
```

## One token per person

A shared `NAUTOBOT_TOKEN` makes every MCP client the same Nautobot user. The change log then cannot tell who created an object or ran a job.

For Cursor and Claude Desktop, leave each person's token in that person's MCP config. The process uses that token for every call, and Nautobot records the token's user.

For one shared HTTP server, do not fall back to a process-wide token. Require the client to send one:

```bash
export NAUTOBOT_URL="https://nautobot.example.com"
export NAUTOBOT_MCP_REQUIRE_CLIENT_TOKEN=true
nautobot-mcp --transport streamable-http --host 0.0.0.0 --port 8000
```

The client sends its own token on the request. `X-Nautobot-Token` is the header to use. `Authorization: Token` is accepted as well. `Authorization: Bearer` is not forwarded to Nautobot, so an OAuth credential for the MCP endpoint is not reused as a Nautobot token. A request with no token is refused.

```json
{
  "mcpServers": {
    "nautobot": {
      "url": "http://mcp-host:8000/mcp",
      "headers": {
        "X-Nautobot-Token": "YOUR_PERSONAL_API_TOKEN"
      }
    }
  }
}
```

`http://mcp-host:8000/mcp` is the MCP listener. `NAUTOBOT_URL` is still the Nautobot instance. From another container, that is the Nautobot service address, not `localhost`.

## The app shows up in Nautobot

Installing the app does not turn Nautobot into the MCP server. Clients still connect to the `nautobot-mcp` process. The app is there so the install is visible and the resolved settings can be checked.

After restart, Nautobot lists it under **Apps → Installed Apps**. **Apps → MCP Server → MCP Server Status** (`/plugins/mcp-server/`) shows the settings with the token redacted. Set `log_file` (or `NAUTOBOT_MCP_LOG_FILE`) when that page should also show the log tail. Otherwise the process logs to stderr.

`streamable-http` and `sse` listen on `127.0.0.1:8000` unless you pass `--host` and `--port`, or set `NAUTOBOT_MCP_HOST` and `NAUTOBOT_MCP_PORT`. Use `--host 0.0.0.0` when a reverse proxy on another host connects to the process.

## What did not change

Reads stay on by default. `rest_create`, `rest_update`, and `rest_delete` stay blocked until `NAUTOBOT_MCP_ALLOW_WRITES=true`. Tenant scope still constrains the REST tools for an MSP-style server. GraphQL and job runs still follow the token's own permissions.

The project is at [github.com/bsmeding/nautobot-app-mcp-server](https://github.com/bsmeding/nautobot-app-mcp-server). Install docs are on [netdevops.it](https://netdevops.it/projects/nautobot-mcp/user-guide/).
