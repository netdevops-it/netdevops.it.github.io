---
authors: [bsmeding]
date: 2026-04-19
title: Validating Network Intent with Pydantic, JSON Schema, YAML, and Jinja2
summary: Use Pydantic, JSON Schema, PyYAML, Jinja2, pytest, and yamllint to catch broken network intent data before it reaches devices.
tags: ["netdevops", "ci/cd", "pydantic", "jsonschema", "yaml", "jinja2", "pytest"]
toc: true
layout: single
comments: true
---

# Validating Network Intent with Pydantic, JSON Schema, YAML, and Jinja2

Network automation usually breaks before it touches a router. The failure is often bad input data: a missing VLAN ID, an interface name typo, a wrong site slug, or a template variable that nobody supplied.

<!-- more -->

That is why the first useful NetDevOps CI job is not "push config". It is "prove that the intended state is valid".

The `netdevops_cicd` images include the tooling needed for this kind of pipeline:

- `pydantic` for Python data models.
- `jsonschema` for validating JSON contracts.
- `pyyaml` for YAML inventory and intent files.
- `jinja2` for rendering configs.
- `pytest` for repeatable tests.
- `yamllint` for basic YAML hygiene.
- `jmespath` for querying nested data structures.

## Example Intent Data

Example `data/sites.yml`:

```yaml
sites:
  - name: ams1
    vlans:
      - id: 10
        name: users
      - id: 20
        name: servers
    interfaces:
      - name: Ethernet1
        description: uplink-to-core
        enabled: true
```

That file looks simple, but it already has rules:

- VLAN IDs must be between 1 and 4094.
- Interface names must not be empty.
- Descriptions should be strings.
- The site name should follow your naming standard.

## Validate with Pydantic

Create `tests/test_intent_models.py`:

```python
from pathlib import Path

import yaml
from pydantic import BaseModel, Field


class Vlan(BaseModel):
    id: int = Field(ge=1, le=4094)
    name: str = Field(min_length=1)


class Interface(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None
    enabled: bool = True


class Site(BaseModel):
    name: str = Field(pattern=r"^[a-z0-9-]+$")
    vlans: list[Vlan]
    interfaces: list[Interface]


def test_site_intent_is_valid():
    data = yaml.safe_load(Path("data/sites.yml").read_text())
    sites = [Site.model_validate(item) for item in data["sites"]]

    assert sites
```

Run it in CI:

```yaml
jobs:
  validate-intent:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/netdevops_cicd_ubuntu:latest
    steps:
      - uses: actions/checkout@v5
      - run: yamllint data/
      - run: pytest tests/test_intent_models.py -vv
```

## Validate External Contracts with JSON Schema

Pydantic is great when your automation code owns the model. JSON Schema is useful when you want a contract that other systems can validate too.

Example `schemas/vlan.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": {
      "type": "integer",
      "minimum": 1,
      "maximum": 4094
    },
    "name": {
      "type": "string",
      "minLength": 1
    }
  }
}
```

Example validation:

```python
import json
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator


def test_vlan_schema():
    schema = json.loads(Path("schemas/vlan.json").read_text())
    validator = Draft202012Validator(schema)
    data = yaml.safe_load(Path("data/sites.yml").read_text())

    for site in data["sites"]:
        for vlan in site["vlans"]:
            validator.validate(vlan)
```

## Render Jinja2 Only After Data Passes

Once the input data is valid, render templates:

```jinja2
hostname {{ site.name }}
{% for vlan in site.vlans %}
vlan {{ vlan.id }}
   name {{ vlan.name }}
{% endfor %}
```

Example render test:

```python
from jinja2 import Environment, FileSystemLoader, StrictUndefined


def test_template_renders(site):
    env = Environment(
        loader=FileSystemLoader("templates"),
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    template = env.get_template("vlans.j2")
    output = template.render(site=site)

    assert "vlan 10" in output
```

`StrictUndefined` matters. It makes missing variables fail the test instead of producing half-rendered configs.

## Practical Tips

- Validate YAML before rendering templates.
- Use Pydantic when Python owns the model.
- Use JSON Schema when other systems need the same contract.
- Use `StrictUndefined` in Jinja2 CI tests.
- Store rendered configs as CI artifacts for review.

## Summary

Good CI for network automation starts with intent validation. Pydantic, JSON Schema, PyYAML, Jinja2, pytest, and yamllint catch the boring mistakes early, before they become failed changes or emergency rollbacks.
