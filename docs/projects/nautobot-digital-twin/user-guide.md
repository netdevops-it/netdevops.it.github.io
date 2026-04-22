# Nautobot Digital Twin User Guide

This temporary page is the user-facing documentation entry point for Nautobot Digital Twin.

## What it is

Nautobot Digital Twin creates disposable lab environments from Nautobot source-of-truth data so you can test topology and intended configuration workflows safely.

## Core user workflows

- Start a digital twin from a supported Location.
- Monitor running deployments from the Digital Twin deployment views.
- Push intended configs to a running deployment when Golden Config is enabled.
- Stop a deployment manually or rely on configured auto-destroy timers.

## Prerequisites

- Nautobot app is installed and enabled (`nautobot_digital_twin` in `PLUGINS`).
- Backend connectivity is available (`containerlab` SSH or `eveng` API).
- Platform mappings and optional config filters are configured in `PLUGINS_CONFIG`.

## Source docs

Until the app hosts its full MkDocs site in-repo, detailed pages are maintained in:

- [App Overview](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/user/app_overview.md)
- [Getting Started](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/user/app_getting_started.md)
- [Using the App](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/user/app_use_cases.md)
- [FAQ](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/user/faq.md)
