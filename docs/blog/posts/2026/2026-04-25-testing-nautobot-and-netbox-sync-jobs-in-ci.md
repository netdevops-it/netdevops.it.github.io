---
authors: [bsmeding]
date: 2026-04-25
title: Testing Nautobot and NetBox Synchronization Jobs in CI
summary: Use pynautobot, pynetbox, Pydantic, pytest, responses, and HTTPX-style tests to validate source-of-truth automation before it writes to Nautobot or NetBox.
tags: ["netdevops", "nautobot", "netbox", "pynautobot", "pynetbox", "pytest", "source-of-truth"]
toc: true
layout: single
comments: true
---

# Testing Nautobot and NetBox Synchronization Jobs in CI

Source-of-truth automation is powerful because it changes the system that other automation trusts. That also makes it risky. A broken sync job can create bad devices, duplicate prefixes, wrong interface names, or stale custom fields.

<!-- more -->

The `netdevops_cicd` images include `pynautobot`, `pynetbox`, `pytest`, `pydantic`, `responses`, `requests`, and `httpx`, which are enough to test many source-of-truth workflows before they touch a real Nautobot or NetBox instance.

## What To Test

For source-of-truth jobs, test three layers:

- Input validation: is the source data shaped correctly?
- Payload generation: would the job send the correct API payload?
- API behavior: does the job handle create, update, not found, and error responses?

Do not make every pull request depend on a live Nautobot or NetBox instance. Keep most tests mocked and deterministic, then add a smaller smoke test against a lab instance.

## Example Input Model

```python
from pydantic import BaseModel, Field


class DeviceIntent(BaseModel):
    name: str = Field(min_length=1)
    site: str = Field(min_length=1)
    role: str = Field(min_length=1)
    platform: str
    serial: str | None = None
```

Example test:

```python
import yaml
from pathlib import Path


def test_device_intent_file(device_model):
    data = yaml.safe_load(Path("data/devices.yml").read_text())
    devices = [device_model.model_validate(item) for item in data["devices"]]

    assert devices
```

## Build Payloads Separately

Keep API payload generation separate from API calls:

```python
def build_nautobot_device_payload(device):
    return {
        "name": device.name,
        "site": {"name": device.site},
        "role": {"name": device.role},
        "platform": {"name": device.platform},
        "serial": device.serial,
    }
```

Test it directly:

```python
def test_nautobot_payload(device_intent):
    payload = build_nautobot_device_payload(device_intent)

    assert payload["name"] == "edge-ams1"
    assert payload["site"]["name"] == "ams1"
    assert payload["role"]["name"] == "edge"
```

## Mock API Calls with responses

`responses` is useful for code based on `requests`, including many simple source-of-truth helpers.

```python
import responses


@responses.activate
def test_create_device_posts_payload():
    responses.add(
        responses.POST,
        "https://demo.nautobot.com/api/dcim/devices/",
        json={"id": "123", "name": "edge-ams1"},
        status=201,
    )

    created = create_device(
        base_url="https://demo.nautobot.com",
        token="dummy",
        payload={"name": "edge-ams1"},
    )

    assert created["name"] == "edge-ams1"
    assert responses.calls[0].request.headers["Authorization"] == "Token dummy"
```

## Live Smoke Test

Keep live smoke tests optional:

Use this quick local/demo config to run examples without inventing placeholder URLs:

```bash
export NAUTOBOT_URL="https://demo.nautobot.com"
export NAUTOBOT_TOKEN="replace-with-your-nautobot-token"
export NETBOX_URL="https://demo.netbox.dev"
export NETBOX_TOKEN="replace-with-your-netbox-token"
```

```yaml
name: Nautobot Smoke

on:
  workflow_dispatch:

jobs:
  smoke:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/netdevops_cicd_ubuntu:latest
    env:
      NAUTOBOT_URL: https://demo.nautobot.com
      NAUTOBOT_TOKEN: ${{ secrets.NAUTOBOT_TOKEN }}
      NETBOX_URL: https://demo.netbox.dev
      NETBOX_TOKEN: ${{ secrets.NETBOX_TOKEN }}
    steps:
      - uses: actions/checkout@v5
      - run: pytest tests/live/test_nautobot_smoke.py -vv
```

Example smoke test:

```python
import os

import pynautobot


def test_nautobot_status():
    nb = pynautobot.api(
        os.environ["NAUTOBOT_URL"],
        token=os.environ["NAUTOBOT_TOKEN"],
    )

    status = nb.status()
    assert status
```

## NetBox Works the Same Way

The same testing pattern works with `pynetbox`:

```python
import os

import pynetbox


def test_netbox_api_reachable():
    nb = pynetbox.api(
        os.environ["NETBOX_URL"],
        token=os.environ["NETBOX_TOKEN"],
    )

    assert nb.status()
```

## Practical Tips

- Test payload generation without network calls.
- Mock create/update/delete behavior in normal pull requests.
- Run live Nautobot/NetBox smoke tests manually or on schedule.
- Use CI secrets for tokens and URLs.
- Make destructive tests opt-in and point them at disposable lab data.

## Summary

Source-of-truth automation deserves tests because it becomes input for everything else. With `pynautobot`, `pynetbox`, Pydantic, pytest, and mocked HTTP responses, you can validate sync jobs before they write bad data into Nautobot or NetBox.
