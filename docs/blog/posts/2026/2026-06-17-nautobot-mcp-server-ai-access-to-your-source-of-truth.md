---
authors: [bsmeding]
date: 2026-06-17
title: Nautobot MCP Server - Give Your AI Assistant Access to Your Source of Truth
summary: Connect Claude, Cursor, and any MCP-compatible assistant to Nautobot's REST and GraphQL APIs with a read-only-by-default Model Context Protocol server, including tenant scoping for multi-tenant isolation.
tags: ["nautobot", "mcp", "model context protocol", "ai", "llm", "aiops", "network automation", "netdevops"]
toc: true
layout: single
comments: true
---

# Nautobot MCP Server

Your AI assistant is great at writing Python and explaining configs, but it has no idea what is actually in your network. It cannot tell you which devices live in a given site, what prefixes are free, or which circuit terminates where. That knowledge lives in your source of truth.

The [Model Context Protocol](https://modelcontextprotocol.io) (MCP) is the missing link. The `nautobot-mcp-server` exposes [Nautobot](https://docs.nautobot.com/)'s built-in REST and GraphQL APIs as tools that LLM clients such as Claude Desktop and Cursor can call directly, so the assistant answers from your real data instead of guessing.

<!-- more -->

## What Is MCP, Briefly

MCP is an open standard for connecting AI assistants to external tools and data. An MCP *server* advertises a set of tools (each with a typed input schema), and an MCP *client* (Claude Desktop, Cursor, or your own agent) decides when to call them. The model never talks to your API directly; it asks the server, and the server enforces the rules.

That separation is exactly what you want for infrastructure data: the assistant gets context, but you keep control of authentication, permissions, and what is allowed to change.

## What the Nautobot MCP Server Does

`nautobot-mcp-server` wraps Nautobot's APIs into discoverable tools across the core data models:

- **DCIM** - devices, interfaces, locations, racks, device types, cables.
- **IPAM** - prefixes, IP addresses, VLANs, VRFs, available IPs and prefixes.
- **Circuits, tenancy, virtualization** - circuits and providers, tenants and tenant groups, virtual machines and clusters.
- **Extras** - jobs (list, run, and read results), statuses, tags, custom fields, config contexts.
- **GraphQL** - run arbitrary GraphQL queries and introspect the schema.
- **Generic passthrough** - `rest_list` and `rest_get` work against any endpoint, so even models without a dedicated wrapper are reachable.

There are also cross-domain shortcuts like `search_devices`, `search_ip_addresses`, and `search_prefixes` for the questions people actually ask.

It runs in two ways:

- **Standalone stdio server** - installed in any Python environment, talking to a remote Nautobot over its REST API. This is the easiest path for Claude Desktop and Cursor.
- **As a Nautobot app** - dropped into a Nautobot environment via `PLUGINS_CONFIG`, so configuration lives alongside Nautobot itself.

## Install

The package is on PyPI:

```bash
pip install nautobot-mcp-server
```

If you use [uv](https://docs.astral.sh/uv/), you do not even need a manual install. `uvx` fetches and runs it on demand, which is handy for desktop clients (more on that below).

## Connect It to Cursor

Add an entry to your Cursor MCP config (`~/.cursor/mcp.json`). Using `uvx` avoids a global install:

```json
{
  "mcpServers": {
    "nautobot": {
      "command": "uvx",
      "args": ["nautobot-mcp-server@latest"],
      "env": {
        "NAUTOBOT_URL": "http://localhost:8081",
        "NAUTOBOT_TOKEN": "YOUR_API_TOKEN"
      }
    }
  }
}
```

Reload the MCP server from Cursor's settings and the Nautobot tools appear.

## Connect It to Claude Desktop

Add the same server to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nautobot": {
      "command": "uvx",
      "args": ["nautobot-mcp-server@latest"],
      "env": {
        "NAUTOBOT_URL": "http://localhost:8081",
        "NAUTOBOT_TOKEN": "YOUR_API_TOKEN"
      }
    }
  }
}
```

Then fully quit and reopen Claude Desktop (a window close is not enough; the config is read on startup). If you prefer an installed console script over `uvx`, set `"command": "nautobot-mcp-server"` instead, but make sure the binary is on the PATH the client uses.

## Read-Only by Default

This is the part that matters for production data. Mutating tools (`rest_create`, `rest_update`, `rest_delete`) are blocked unless you explicitly opt in:

```bash
export NAUTOBOT_ALLOW_WRITES=true
```

Until you set that, the assistant can read and search everything its token allows, but it cannot change anything. GraphQL queries and Nautobot Job runs are still permitted, because they are already governed by Nautobot's own permission model and the token's scope. Start read-only, build trust, and enable writes only when you are ready.

## Tenant Scoping for Multi-Tenant Isolation

If you run an MSP-style deployment where one server serves agents acting for different customers, you can lock the server to one or more tenants. Enforcement happens centrally in the client, so an agent cannot cross customer boundaries regardless of the filters it passes:

```bash
export NAUTOBOT_TENANT_SCOPE="acme,globex"
# or by tenant group:
export NAUTOBOT_TENANT_GROUP_SCOPE="managed-customers"
```

With a scope active:

- List and search on tenant-aware endpoints (devices, racks, locations, prefixes, IP addresses, VLANs, VRFs, circuits, VMs, clusters) are constrained to the in-scope tenants, and any caller-supplied `tenant` filter is replaced.
- Single-object reads are verified against the scope; out-of-scope objects raise a permission error.
- Creates must target an in-scope tenant, and updates or deletes cannot move an object out of scope.

Non-tenant-aware models (manufacturers, platforms, statuses) are left untouched. Note that the generic `graphql_query` tool and Job runs are not tenant-filtered, so rely on a tenant-restricted API token for those paths.

## What It Looks Like in Practice

Once connected, you ask in plain language and the assistant calls the right tool:

> "How many active devices do we have in the Amsterdam location, and list any with no primary IP."

> "Find the next three available /30s in 10.0.0.0/16."

> "Run the Golden Config compliance job for the edge role and summarize the failures."

The assistant turns each request into a tool call (`search_devices`, `get_available_prefixes`, `run_job`), the server executes it against Nautobot with your token, and the answer is grounded in real data instead of a plausible-sounding guess.

## Optional Nautobot App Integrations

The base install exposes Nautobot core tools only. Tools for the NetworkToCode apps are optional and added via extras:

```bash
pip install "nautobot-mcp-server[golden-config]"   # Golden Config tools
pip install "nautobot-mcp-server[ssot]"            # SSoT tools
pip install "nautobot-mcp-server[design-builder]"  # Design Builder tools
pip install "nautobot-mcp-server[onboarding]"      # Device Onboarding tools
pip install "nautobot-mcp-server[all]"             # everything
```

When the MCP server shares the Nautobot environment, installing the extra is enough; the matching tools register automatically. For a standalone server talking to a remote Nautobot, enable them explicitly with `NAUTOBOT_MCP_PLUGINS="golden_config,ssot"`. Use the `list_active_plugins` tool to see what is configured, enabled, and available.

## A Quick Safety Checklist

Before you point an assistant at a real Nautobot, confirm:

- The API token has the **minimum permissions** the use case needs, not superuser.
- `NAUTOBOT_ALLOW_WRITES` is left **unset** until you genuinely need writes.
- Tenant scope is set if the server serves multiple customers.
- TLS verification is on (`NAUTOBOT_VERIFY_SSL=true`) for anything beyond localhost.
- You are not reusing a shared dev token from a `docker-compose` `.env` in production.

## Summary

The Nautobot MCP server closes the gap between your AI assistant and your source of truth. It exposes DCIM, IPAM, circuits, tenancy, virtualization, extras, and GraphQL as typed tools, runs standalone or as a Nautobot app, and is read-only by default with optional tenant scoping for multi-tenant isolation. Install it, drop a few lines into your Cursor or Claude Desktop config, point it at Nautobot with a scoped token, and your assistant can finally answer questions about the network you actually run.

The project lives at [github.com/bsmeding/nautobot-app-mcp-server](https://github.com/bsmeding/nautobot-app-mcp-server) and on [PyPI](https://pypi.org/project/nautobot-mcp-server/). Contributions and issues are welcome.
