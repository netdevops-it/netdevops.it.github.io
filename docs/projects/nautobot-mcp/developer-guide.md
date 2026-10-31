# Nautobot MCP Server Developer Guide

Clone [bsmeding/nautobot-mcp-server](https://github.com/bsmeding/nautobot-mcp-server) and install the development extra:

```bash
pip install -e ".[dev]"
```

## Quality gates

```bash
ruff check nautobot_mcp tests
ruff format nautobot_mcp tests
pytest -v
```

`invoke lint`, `invoke format`, `invoke unittest`, and `invoke tests` wrap the same commands. `invoke tests` runs lint and then the unit tests. Tests use `pytest` and `respx` against a mocked Nautobot API, so a live Nautobot is not required.

Code targets Python 3.10+ and uses `from __future__ import annotations`. Ruff enforces `E`, `F`, `I`, `UP`, `B`, `SIM`, and `RUF`.

New tools live under `nautobot_mcp/tools/`. Each module exposes `register(mcp)`. Plugin integrations live under `nautobot_mcp/tools/plugins/` and enable themselves from `DIST_PACKAGES`.

## Local Nautobot

`development/` is a Docker Compose stack driven by invoke:

```bash
cp development/creds.example.env development/creds.env
invoke build
invoke start
invoke migrate
```

Nautobot is then at <http://localhost:8080> with this app enabled. The repository is mounted into the container.

| Task | Description |
| --- | --- |
| `invoke build` | Build the dev image with the app installed editable. |
| `invoke start` / `invoke stop` | Start or stop the stack. |
| `invoke debug` | Start in the foreground with logs. |
| `invoke destroy` | Remove containers and volumes. |
| `invoke nbshell` | Open a `nautobot-server` shell. |
| `invoke cli` | Bash shell in the Nautobot container. |

## Docs in the app repo

```bash
pip install -e ".[docs]"
mkdocs serve
```

The pages on this site are the published user, admin, developer, and release-note guides. The same material is maintained in the app repository under `docs/`.

## Contributing

Open an issue for bugs and feature discussion. Pull requests should include tests and a release-note line when behavior changes.

## Source docs

- [Contributing](https://github.com/bsmeding/nautobot-mcp-server/blob/main/docs/dev/contributing.md)
- [Development environment](https://github.com/bsmeding/nautobot-mcp-server/blob/main/docs/dev/dev_environment.md)
