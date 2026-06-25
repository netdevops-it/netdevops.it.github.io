---
authors: [bsmeding]
date: 2026-04-28
title: Python Network Automation Dry Runs with Nornir, Scrapli, and Netmiko
summary: Build safer CI pipelines for Python network automation by combining Nornir inventory, Scrapli or Netmiko tasks, pytest, and dry-run checks.
tags: ["netdevops", "nornir", "scrapli", "netmiko", "napalm", "pytest", "ci/cd"]
toc: true
layout: single
comments: true
---

# Python Network Automation Dry Runs with Nornir, Scrapli, and Netmiko

Python network automation often starts as a script and slowly becomes a change platform. Before that happens, it needs tests, dry runs, and guardrails.

<!-- more -->

The `netdevops_cicd` images include Nornir, Scrapli, Netmiko, NAPALM, ncclient, Paramiko, pytest, and common validation tooling. That makes them useful for testing Python-first network automation without turning every pipeline into an Ansible job.

## Why Dry Runs Matter

A dry run should answer three questions:

- Which devices would be touched?
- Which commands or API calls would be sent?
- What validation must pass before a real change is allowed?

This does not require connecting to production devices on every pull request. A good pipeline can test inventory selection, task construction, templates, and parsing offline.

## Example Nornir Inventory

```yaml
---
edge-ams1:
  hostname: 192.0.2.11
  platform: arista_eos
  groups:
    - edge
  data:
    site: ams1
```

## Write Tasks That Can Be Tested

Keep command selection separate from transport:

```python
def commands_for_device(host):
    if host.platform == "arista_eos":
        return ["show version", "show interfaces status"]

    if host.platform == "cisco_ios":
        return ["show version", "show ip interface brief"]

    raise ValueError(f"Unsupported platform: {host.platform}")
```

Now test it without a device:

```python
from types import SimpleNamespace


def test_arista_commands():
    host = SimpleNamespace(platform="arista_eos")
    commands = commands_for_device(host)

    assert "show version" in commands
    assert "show interfaces status" in commands
```

## Nornir Dry Run Task

```python
from nornir import InitNornir
from nornir_utils.plugins.functions import print_result


def dry_run_task(task):
    commands = commands_for_device(task.host)
    task.host["planned_commands"] = commands
    return commands


nr = InitNornir(config_file="nornir.yml")
result = nr.run(task=dry_run_task)
print_result(result)
```

This proves inventory selection and command planning without opening a network session.

## Real Collection with Scrapli

When you do need a real collection job, use CI secrets and keep it explicit:

```python
from nornir_scrapli.tasks import send_command


def collect_version(task):
    return task.run(task=send_command, command="show version")
```

GitHub Actions example:

```yaml
jobs:
  dry-run:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/netdevops_cicd_ubuntu:latest
    env:
      NORNIR_USERNAME: ${{ secrets.LAB_USERNAME }}
      NORNIR_PASSWORD: ${{ secrets.LAB_PASSWORD }}
    steps:
      - uses: actions/checkout@v5
      - run: pytest tests/ -vv
      - run: python automation/dry_run.py
```

## Netmiko for Simple Jobs

Netmiko is still useful for straightforward CLI collection:

```python
from netmiko import ConnectHandler


device = {
    "device_type": "cisco_ios",
    "host": "192.0.2.10",
    "username": "admin",
    "password": "password",
}

with ConnectHandler(**device) as conn:
    output = conn.send_command("show ip interface brief")
    print(output)
```

Keep this type of direct connection in smoke tests or scheduled jobs, not every pull request.

## NAPALM for State Checks

NAPALM is useful when you want normalized getters:

```python
def test_facts_have_hostname(napalm_device):
    facts = napalm_device.get_facts()
    assert facts["hostname"]
```

## Practical Tips

- Make dry-run tests run on every pull request.
- Make live device tests manual, scheduled, or environment-protected.
- Keep inventory filters visible in CI logs.
- Store collected output as artifacts when debugging.
- Prefer read-only commands in CI unless approvals are in place.

## Summary

Nornir, Scrapli, Netmiko, and NAPALM are powerful tools for Python network automation. In CI/CD, their best use is often not immediate configuration changes, but dry runs, inventory checks, read-only validation, and controlled smoke tests.
