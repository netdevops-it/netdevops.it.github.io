# Nautobot MCP Server User Guide

Nautobot MCP Server exposes Nautobot's REST and GraphQL APIs as [Model Context Protocol](https://modelcontextprotocol.io/) tools. An AI client such as Claude Desktop or Cursor calls those tools instead of talking to Nautobot directly.

The project is [`nautobot-mcp` on PyPI](https://pypi.org/project/nautobot-mcp/) and [bsmeding/nautobot-mcp-server](https://github.com/bsmeding/nautobot-mcp-server) on GitHub. Install and configuration are in the [Admin Guide](admin-guide.md).

## What you can ask

A read-only agent can answer questions such as "which active core devices in Amsterdam are missing a primary IP?" by composing `search_devices`, `get_device_interfaces`, and `list_ip_addresses`, or a single `graphql_query`.

With writes enabled and a scoped token, an agent can allocate prefixes and IPs, create cables, set statuses, and run Nautobot Jobs you already built.

For an MSP, lock one server to one customer with [tenant scoping](admin-guide.md#tenant-scoping). Optional plugin tools can run Design Builder designs, onboard devices, trigger SSoT syncs, or check Golden Config compliance.

## Connect Claude Desktop

`uvx` looks for an executable with the same name as the package, which is `nautobot-mcp`. Add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nautobot": {
      "command": "uvx",
      "args": ["nautobot-mcp"],
      "env": {
        "NAUTOBOT_URL": "https://nautobot.example.com",
        "NAUTOBOT_TOKEN": "YOUR_API_TOKEN"
      }
    }
  }
}
```

If `nautobot-mcp` is already on `PATH`, set `"command": "nautobot-mcp"` and drop the `uvx` args.

This uses the stdio transport. Claude starts the process itself. You do not point Claude at the Nautobot URL.

## HTTP and SSE

The Nautobot app does not serve MCP over HTTP. There is no `/plugins/mcp-server` endpoint to give a client. Run the console script with an HTTP transport, then point the client at that process or at a reverse proxy in front of it.

```bash
nautobot-mcp --transport streamable-http
nautobot-mcp --transport streamable-http --host 0.0.0.0 --port 8000
nautobot-mcp --transport sse
```

The default listen address is `127.0.0.1:8000`. Streamable HTTP is at `/mcp`. SSE is at `/sse`. Use `--host 0.0.0.0` (or `NAUTOBOT_MCP_HOST`) when the reverse proxy runs on another host. `--port` and `NAUTOBOT_MCP_PORT` change the port. A flag overrides the matching environment variable.

## Read-only by default

`rest_create`, `rest_update`, and `rest_delete` stay blocked until `NAUTOBOT_MCP_ALLOW_WRITES=true` (or `allow_writes: true` in `PLUGINS_CONFIG`). GraphQL queries and Nautobot Job runs follow the API token's own permissions.

## Tools

Start with `nautobot_status`, `list_api_roots`, `tenant_scope_info`, and `list_active_plugins`.

| Area | Tools |
| --- | --- |
| Discovery | `nautobot_status`, `list_api_roots`, `list_endpoints_in`, `list_content_types`, `tenant_scope_info`, `list_active_plugins` |
| Generic REST | `rest_list`, `rest_get`, `rest_create`, `rest_update`, `rest_delete` |
| DCIM | `list_devices`, `get_device`, `get_device_interfaces`, `get_device_config_context`, `get_device_inventory`, locations, racks, device types, roles, manufacturers, platforms, cables |
| IPAM | prefixes, available IPs and prefixes, IP addresses, VLANs, VLAN groups, VRFs, RIRs, namespaces |
| Circuits, tenancy, virtualization | circuits, providers, tenants, virtual machines, VM interfaces, clusters |
| Extras | jobs and job results, statuses, tags, roles, custom fields, relationships, config contexts, webhooks |
| Users | `list_users`, `list_groups`, `list_object_permissions` |
| GraphQL | `graphql_query`, `graphql_introspect` |
| Search | `search_devices`, `search_ip_addresses`, `search_prefixes`, `search_locations`, `search_circuits` |

Plugin tools register only when that integration is enabled. See the [Admin Guide](admin-guide.md#optional-nautobot-apps).

## Source docs

- [App overview](https://github.com/bsmeding/nautobot-mcp-server/blob/main/docs/user/app_overview.md)
- [Getting started](https://github.com/bsmeding/nautobot-mcp-server/blob/main/docs/user/app_getting_started.md)
- [Use cases](https://github.com/bsmeding/nautobot-mcp-server/blob/main/docs/user/app_use_cases.md)
- [Tenant scoping](https://github.com/bsmeding/nautobot-mcp-server/blob/main/docs/user/tenant_scoping.md)
- [Plugin integrations](https://github.com/bsmeding/nautobot-mcp-server/blob/main/docs/user/plugins.md)
