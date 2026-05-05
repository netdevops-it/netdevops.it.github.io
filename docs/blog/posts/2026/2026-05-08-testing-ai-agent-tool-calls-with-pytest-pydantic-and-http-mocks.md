---
authors: [bsmeding]
date: 2026-05-08
draft: true
title: Testing AI Agent Tool Calls with pytest, Pydantic, and HTTP Mocks
summary: Make AI-assisted operations safer by testing agent tool schemas, mocked API calls, structured JSON output, and refusal paths in CI.
tags: ["aiops", "agents", "pytest", "pydantic", "jsonschema", "responses", "respx", "netdevops"]
toc: true
layout: single
comments: true
---

# Testing AI Agent Tool Calls with pytest, Pydantic, and HTTP Mocks

AI agents become risky when their tool calls are treated as magic. For operations work, a tool call is just an API request with higher stakes. It should be tested like any other integration.

<!-- more -->

The `aiops_cicd` images include pytest, pytest-asyncio, Pydantic, JSON Schema, responses, respx, vcrpy, freezegun, faker, requests, HTTPX, pynautobot, and pynetbox. That is enough to test most agent tool contracts without calling a live LLM or a live API.

## What To Test

For an operational agent, test:

- The tool input schema.
- The tool output schema.
- The API request the tool would make.
- Error handling for missing objects, timeouts, and permission failures.
- Refusal behavior for unsafe actions.

Do not start by testing whether a model is clever. Start by testing whether the tools are safe.

## Define Tool Input with Pydantic

```python
from pydantic import BaseModel, Field


class DeviceLookupInput(BaseModel):
    device_name: str = Field(min_length=1)
    include_interfaces: bool = False
```

Test invalid input:

```python
import pytest
from pydantic import ValidationError


def test_device_lookup_requires_name():
    with pytest.raises(ValidationError):
        DeviceLookupInput(device_name="")
```

## Mock a Nautobot Tool

```python
import requests


def nautobot_get_device(base_url, token, device_name):
    response = requests.get(
        f"{base_url}/api/dcim/devices/",
        headers={"Authorization": f"Token {token}"},
        params={"name": device_name},
        timeout=10,
    )
    response.raise_for_status()
    results = response.json()["results"]
    return results[0] if results else None
```

Test with `responses`:

```python
import responses


@responses.activate
def test_nautobot_get_device_uses_name_filter():
    responses.add(
        responses.GET,
        "https://nautobot.example.com/api/dcim/devices/",
        json={"results": [{"name": "edge-ams1", "role": {"name": "edge"}}]},
        status=200,
    )

    device = nautobot_get_device(
        base_url="https://nautobot.example.com",
        token="dummy",
        device_name="edge-ams1",
    )

    assert device["name"] == "edge-ams1"
    assert responses.calls[0].request.url.endswith("name=edge-ams1")
```

## Mock Async Tools with respx

If your agent tools use HTTPX:

```python
import httpx


async def fetch_site(base_url, token, slug):
    async with httpx.AsyncClient(base_url=base_url) as client:
        response = await client.get(
            "/api/dcim/sites/",
            headers={"Authorization": f"Token {token}"},
            params={"slug": slug},
        )
        response.raise_for_status()
        return response.json()["results"]
```

Test it:

```python
import pytest
import respx
from httpx import Response


@pytest.mark.asyncio
@respx.mock
async def test_fetch_site():
    route = respx.get("https://nautobot.example.com/api/dcim/sites/").mock(
        return_value=Response(200, json={"results": [{"slug": "ams1"}]})
    )

    sites = await fetch_site("https://nautobot.example.com", "dummy", "ams1")

    assert route.called
    assert sites[0]["slug"] == "ams1"
```

## Test Agent Output Contracts

Even if the LLM output is mocked, validate the shape:

```python
from pydantic import BaseModel


class Recommendation(BaseModel):
    summary: str
    risk: str
    action: str
    requires_approval: bool
```

```python
def test_agent_recommendation_contract(fake_agent):
    result = fake_agent.invoke("Device edge-ams1 has BGP down")
    parsed = Recommendation.model_validate(result)

    assert parsed.requires_approval is True
    assert parsed.risk in {"low", "medium", "high", "critical"}
```

## CI Example

```yaml
jobs:
  agent-contracts:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/aiops_cicd_ubuntu:latest
    steps:
      - uses: actions/checkout@v5
      - run: pytest tests/tools tests/agents -vv
```

## Practical Tips

- Keep tool schemas small and explicit.
- Test tools without a model first.
- Mock APIs for pull requests.
- Run live API tests only on schedule or manual dispatch.
- Always test unsafe or destructive requests.

## Summary

AI agents for operations should be tested around their tools. Pydantic, pytest, responses, respx, and JSON Schema make the boundary between "model text" and "operational action" visible and testable.
