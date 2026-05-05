---
authors: [bsmeding]
date: 2026-04-18
title: NetDevOps CI/CD Docker Images for Python Network Automation
summary: Use the netdevops_cicd Docker images to test Python network automation, render configs, validate data, and run Nornir, Scrapli, Netmiko, NAPALM, Nautobot, and NetBox workflows in CI.
tags: ["netdevops", "docker", "ci/cd", "network automation", "nornir", "netmiko", "scrapli", "nautobot"]
toc: true
layout: single
comments: true
---

# NetDevOps CI/CD Docker Images for Python Network Automation

Not every network automation pipeline needs Ansible. Many repositories are pure Python: they render configurations, validate intended state, call Nautobot or NetBox APIs, run Nornir jobs, parse CLI output, or test API clients. The `bsmeding/netdevops_cicd_*` images are built for those workflows.

<!-- more -->

They include Python network automation libraries, source-of-truth clients, CI tools, parsing helpers, and common network troubleshooting commands.

## When To Use These Images

Use `netdevops_cicd` images when your pipeline is mostly Python-based network automation and you want the tools available without installing them on every CI run.

Good fits:

- Nornir, Scrapli, Netmiko, NAPALM, and ncclient jobs.
- Nautobot and NetBox sync scripts.
- Config rendering with Jinja2.
- Unit tests for network automation packages.
- Structured data validation with YAML, JSON Schema, Pydantic, and JMESPath.
- Parsing command output with TextFSM, TTP, jc, jtbl, or netutils.
- Lightweight network debugging in CI with `dig`, `nmap`, `tcpdump`, `traceroute`, and `ping`.

Use another image when:

- You need Ansible, Molecule, or Ansible role testing. Use `ansible_cicd`.
- You need LLM client and RAG evaluation tooling. Use `aiops_cicd`.
- You need full cloud/IaC tools like Terraform, Pulumi, PowerShell, AWS CLI, or Azure CLI. Build a project-specific image on top.

## Image Tags

```text
bsmeding/netdevops_cicd_<tag>:latest
```

Common tags:

- `ubuntu`, `ubuntu2404`, `ubuntu2604`
- `debian`, `debian12`, `debian13`
- `rockylinux`, `rockylinux8`, `rockylinux9`
- `alpine3`, `alpine3.22`, `alpine3.23`

## Included Tooling

The image family includes:

- Netmiko, Scrapli, Nornir, NAPALM, ncclient, Paramiko, AsyncSSH.
- Nautobot and NetBox clients: `pynautobot`, `pynetbox`.
- Data and parsing: Jinja2, PyYAML, JSON Schema, JMESPath, TTP, TextFSM, ntc-templates, jc, jtbl, netutils.
- Data formats and models: OpenPyXL, SQLModel, Pydantic.
- CI tools: pytest, pytest-cov, pytest-xdist, ruff, mypy, yamllint.
- Network utilities: DNS tools, nmap, tcpdump, traceroute, ping, iproute, net-tools.

## GitHub Actions: Python Test And Lint

```yaml
name: NetDevOps Python CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/netdevops_cicd_ubuntu:latest
    steps:
      - uses: actions/checkout@v5

      - name: Show tool versions
        run: |
          python --version
          pip list | sed -n '1,80p'

      - name: Lint
        run: |
          ruff check .
          mypy src tests
          yamllint .

      - name: Run unit tests
        run: pytest -vv --cov=src --cov-report=term-missing
```

## GitHub Actions: Validate Rendered Device Configs

```yaml
name: Render And Validate Configs

on:
  pull_request:

jobs:
  render:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/netdevops_cicd_debian:latest
    steps:
      - uses: actions/checkout@v5

      - name: Render configs
        run: python tools/render_configs.py --inventory data/inventory.yml --output build/configs

      - name: Validate generated YAML and JSON
        run: |
          yamllint data/
          python tools/validate_intent.py data/intended_state.yml

      - name: Store rendered configs
        uses: actions/upload-artifact@v4
        with:
          name: rendered-configs
          path: build/configs/
```

Example `tools/validate_intent.py`:

```python
from pathlib import Path
import yaml
from pydantic import BaseModel


class Interface(BaseModel):
    name: str
    description: str | None = None
    enabled: bool = True


class Device(BaseModel):
    name: str
    platform: str
    interfaces: list[Interface]


data = yaml.safe_load(Path("data/intended_state.yml").read_text())
devices = [Device.model_validate(item) for item in data["devices"]]
print(f"Validated {len(devices)} devices")
```

## GitHub Actions: Nornir Dry Run

```yaml
name: Nornir Dry Run

on:
  workflow_dispatch:
  pull_request:

jobs:
  dry-run:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/netdevops_cicd_ubuntu2404:latest
    env:
      NORNIR_USERNAME: ${{ secrets.LAB_USERNAME }}
      NORNIR_PASSWORD: ${{ secrets.LAB_PASSWORD }}
    steps:
      - uses: actions/checkout@v5
      - name: Run dry-run task
        run: python automation/nornir_dry_run.py
```

Example Nornir script:

```python
from nornir import InitNornir
from nornir_utils.plugins.functions import print_result
from nornir_netmiko.tasks import netmiko_send_command


nr = InitNornir(config_file="nornir.yml")
result = nr.run(task=netmiko_send_command, command_string="show version")
print_result(result)
```

## GitLab CI: Nautobot Sync Validation

```yaml
stages:
  - lint
  - test
  - validate

variables:
  PIP_DISABLE_PIP_VERSION_CHECK: "1"

lint:
  stage: lint
  image: bsmeding/netdevops_cicd_ubuntu:latest
  script:
    - ruff check .
    - mypy src tests

unit_tests:
  stage: test
  image: bsmeding/netdevops_cicd_ubuntu:latest
  script:
    - pytest -vv

nautobot_validate:
  stage: validate
  image: bsmeding/netdevops_cicd_ubuntu:latest
  variables:
    NAUTOBOT_URL: $NAUTOBOT_URL
    NAUTOBOT_TOKEN: $NAUTOBOT_TOKEN
  script:
    - python tools/check_nautobot_connectivity.py
    - python tools/validate_nautobot_payloads.py
```

Example Nautobot connectivity check:

```python
import os
import pynautobot


nb = pynautobot.api(
    os.environ["NAUTOBOT_URL"],
    token=os.environ["NAUTOBOT_TOKEN"],
)

status = nb.status()
print(status)
```

## GitLab CI: Parse Show Command Output

```yaml
parse_cli_output:
  image: bsmeding/netdevops_cicd_debian:latest
  script:
    - python parsers/parse_show_interfaces.py samples/show_interfaces.txt
    - python parsers/parse_routes.py samples/show_ip_route.txt
```

Example using `jc`:

```python
import json
from pathlib import Path
import jc


raw = Path("samples/show_ip_route.txt").read_text()
parsed = jc.parse("ip_route", raw)
print(json.dumps(parsed, indent=2))
```

## Gitea Or Forgejo Actions

```yaml
name: network-python-ci

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/netdevops_cicd_ubuntu:latest
    steps:
      - uses: actions/checkout@v4
      - run: ruff check .
      - run: pytest -vv
      - run: python tools/render_configs.py
```

## Jenkins Pipeline

```groovy
pipeline {
  agent {
    docker {
      image 'bsmeding/netdevops_cicd_ubuntu:latest'
    }
  }

  stages {
    stage('Lint') {
      steps {
        sh 'ruff check .'
        sh 'yamllint .'
      }
    }

    stage('Test') {
      steps {
        sh 'pytest -vv --cov=src'
      }
    }

    stage('Render Configs') {
      steps {
        sh 'python tools/render_configs.py --output build/configs'
      }
    }

    stage('Network Smoke Checks') {
      steps {
        sh 'python tools/check_lab_reachability.py'
      }
    }
  }
}
```

## Local Reproduction

```bash
docker run --rm -it \
  -v "$PWD:/work" \
  -w /work \
  -e NAUTOBOT_URL \
  -e NAUTOBOT_TOKEN \
  bsmeding/netdevops_cicd_ubuntu:latest \
  bash
```

Inside the container:

```bash
ruff check .
pytest -vv
python tools/render_configs.py
python tools/check_nautobot_connectivity.py
```

## Network Utility Examples In CI

```yaml
network_debug:
  image: bsmeding/netdevops_cicd_ubuntu:latest
  script:
    - dig nautobot.example.com
    - traceroute nautobot.example.com || true
    - nmap -Pn -p 443 nautobot.example.com
    - python tools/check_api_latency.py
```

Use this sparingly. CI should not become a full troubleshooting host, but these commands are useful when a pipeline needs to prove that a lab API, sandbox, or source-of-truth service is reachable.

## Practical Tips

- Keep device credentials in CI secrets.
- Use dry-run and validation workflows for pull requests.
- Run write operations only after approval or on protected branches.
- Store rendered configs as artifacts for review.
- Use version-specific distro tags when your dependencies are sensitive to OS versions.
- Use `ansible_cicd` instead if your job is mostly Ansible.

## Summary

The `netdevops_cicd` images are designed for Python-first network automation. They give you a consistent CI environment for tests, config rendering, source-of-truth validation, parsing, and lightweight network checks without making Ansible the default tool.
