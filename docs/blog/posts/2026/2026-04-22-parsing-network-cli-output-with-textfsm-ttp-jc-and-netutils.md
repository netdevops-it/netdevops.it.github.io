---
authors: [bsmeding]
date: 2026-04-22
title: Parsing Network CLI Output with TextFSM, TTP, jc, and netutils
summary: Turn raw show command output into structured test data using TextFSM, ntc-templates, TTP, jc, netutils, and pytest.
tags: ["netdevops", "network automation", "parsing", "textfsm", "ttp", "jc", "netutils", "pytest"]
toc: true
layout: single
comments: true
---

# Parsing Network CLI Output with TextFSM, TTP, jc, and netutils

APIs are great, but most networks still have a lot of operational truth hidden in CLI output. A useful NetDevOps pipeline can parse that output and test it like normal data.

<!-- more -->

The `netdevops_cicd` images include several parsing tools:

- `textfsm` and `ntc-templates` for vendor CLI templates.
- `ttp` for template-driven parsing.
- `jc` for converting many command outputs into JSON.
- `netutils` for network-specific helpers and normalization.
- `pytest` for turning parsed output into repeatable checks.

## Why Parse CLI Output in CI?

Parsing CLI output is useful when:

- A device platform does not expose the needed state through an API.
- You want regression tests for parsers before using them in production.
- You keep sanitized command samples in the repository.
- You want to compare intended state against observed state.

The key is to treat CLI samples as test fixtures.

## Repository Layout

```text
samples/
  eos_show_interfaces_status.txt
  ios_show_ip_interface_brief.txt
tests/
  test_cli_parsing.py
```

## Parse with ntc-templates

Example test:

```python
from pathlib import Path

from ntc_templates.parse import parse_output


def test_eos_interfaces_are_parsed():
    output = Path("samples/eos_show_interfaces_status.txt").read_text()

    interfaces = parse_output(
        platform="arista_eos",
        command="show interfaces status",
        data=output,
    )

    assert interfaces
    assert all("port" in item for item in interfaces)
    assert all("status" in item for item in interfaces)
```

Now parser changes can be reviewed like application code.

## Parse Custom Output with TTP

TTP is useful when you need a quick parser for output that does not already have an ntc-template.

Example template:

```text
interface {{ interface }}
 description {{ description | ORPHRASE }}
 ip address {{ ip }}/{{ prefix }}
```

Example test:

```python
from pathlib import Path

from ttp import ttp


def test_custom_interface_parser():
    data = Path("samples/interfaces.txt").read_text()
    template = Path("templates/interface.ttp").read_text()

    parser = ttp(data=data, template=template)
    parser.parse()
    result = parser.result(format="python")[0]

    assert result
```

## Parse Generic Commands with jc

`jc` is handy for Linux and network-adjacent commands in CI jobs.

```python
import jc


def test_ping_output_has_no_loss():
    raw = """
    3 packets transmitted, 3 received, 0% packet loss, time 2003ms
    rtt min/avg/max/mdev = 1.1/1.4/1.8/0.2 ms
    """

    parsed = jc.parse("ping", raw)
    assert parsed["packet_loss_percent"] == 0.0
```

## Normalize Data with netutils

When you parse data from multiple vendors, names and values are rarely consistent. `netutils` helps normalize common network values.

```python
from netutils.interface import canonical_interface_name


def test_interface_names_are_normalized():
    assert canonical_interface_name("Gi1/0/1") == "GigabitEthernet1/0/1"
    assert canonical_interface_name("Eth1") == "Ethernet1"
```

## GitHub Actions Example

```yaml
name: CLI Parser Tests

on:
  pull_request:

jobs:
  parsers:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/netdevops_cicd_ubuntu:latest
    steps:
      - uses: actions/checkout@v5
      - run: pytest tests/test_cli_parsing.py -vv
```

## Practical Tips

- Store sanitized CLI samples in version control.
- Keep parser tests close to the templates.
- Test failure cases, not only happy paths.
- Normalize interface names before comparing data across vendors.
- Store parsed JSON as an artifact when debugging CI failures.

## Summary

TextFSM, ntc-templates, TTP, jc, and netutils let you move CLI output into structured data. Once the data is structured, you can test it, diff it, and use it safely in NetDevOps pipelines.
