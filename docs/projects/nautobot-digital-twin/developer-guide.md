# Nautobot Digital Twin Developer Guide

This temporary page is the developer documentation entry point for Nautobot Digital Twin.

## Local development

- Clone the app repository.
- Create a Poetry environment and install dependencies.
- Use invoke tasks for linting, testing, packaging, and docs builds.

Common commands:

```bash
poetry install --with dev,docs
poetry run invoke tests --lint-only
poetry run invoke build-and-check-docs
poetry build
```

## Contributing

- Open an issue for bugs or feature discussions.
- Submit pull requests with tests and docs updates.
- Keep docs and release notes aligned with code changes.

## Docs workflow

The long-term target is full app documentation served from the app repo build pipeline. This page is temporary and links to canonical docs in the app repository.

## Source docs

- [Contributing](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/dev/contributing.md)
- [Development Environment](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/dev/dev_environment.md)
- [Release Checklist](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/dev/release_checklist.md)
- [Code Reference Index](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/dev/code_reference/index.md)
