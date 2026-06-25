---
authors: [bsmeding]
date: 2026-05-05
title: AIOps CI/CD Docker Images for LLM, Agent, Prompt, and RAG Testing
summary: Use the aiops_cicd Docker images to test LLM clients, prompts, structured output, agent behavior, RAG evaluation, and operational replay workflows in CI.
tags: ["aiops", "docker", "ci/cd", "llm", "rag", "agents", "prompt-testing", "github-actions"]
toc: true
layout: single
comments: true
---

# AIOps CI/CD Docker Images for LLM, Agent, Prompt, and RAG Testing

AIOps pipelines need more than a generic Python image. They often need LLM clients, prompt tests, structured output validation, RAG evaluation tools, telemetry libraries, and repeatable replay datasets. The `bsmeding/aiops_cicd_*` images provide a ready-to-use CI base for those workflows.

<!-- more -->

The goal is not to run production agents from the image. The goal is to make tests around prompts, tools, evaluation, and automation behavior repeatable.

## When To Use These Images

Use `aiops_cicd` images when your repository tests AI-assisted operational automation.

Good fits:

- Prompt regression tests.
- LLM client smoke tests for OpenAI, Anthropic, or LiteLLM.
- Structured output validation with Pydantic and JSON Schema.
- Agent behavior tests with LangChain, LangGraph, or custom tool calls.
- RAG evaluation with Ragas or DeepEval.
- Replay testing from captured incidents, alerts, tickets, or logs.
- AIOps integration tests against Nautobot, NetBox, monitoring APIs, or operational datasets.

Use another image when:

- You are testing Ansible roles or Molecule scenarios. Use `ansible_cicd`.
- You are testing Python network automation without LLM/RAG tooling. Use `netdevops_cicd`.
- You need GPU inference or model serving. Build a specialized runtime image.

## Image Tags

```text
bsmeding/aiops_cicd_<tag>:latest
```

Common tags:

- `ubuntu`, `ubuntu2404`, `ubuntu2604`
- `debian`, `debian12`, `debian13`
- `rockylinux`, `rockylinux8`, `rockylinux9`
- `alpine3`, `alpine3.22`, `alpine3.23`

## Included Tooling

The image family includes:

- LLM clients: OpenAI, Anthropic, LiteLLM.
- Agent and workflow tooling: LangChain, LangGraph, LangSmith.
- Evaluation: Ragas, DeepEval, pytest, pytest-asyncio, pytest-cov.
- Data utilities: pandas, numpy, DuckDB.
- Validation: Pydantic, Pydantic Settings, JSON Schema.
- Observability and APIs: OpenTelemetry, Prometheus API client, pynautobot, pynetbox.
- CI helpers: ruff, mypy, rich, typer, responses, respx, vcrpy, freezegun, faker.

## GitHub Actions: Prompt Regression Tests

```yaml
name: Prompt Regression

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  prompt-tests:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/aiops_cicd_ubuntu:latest
    env:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    steps:
      - uses: actions/checkout@v5

      - name: Lint and type check
        run: |
          ruff check .
          mypy src tests

      - name: Run prompt regression tests
        run: pytest tests/prompts -vv
```

Example prompt test:

```python
from pydantic import BaseModel


class TriageResult(BaseModel):
    severity: str
    summary: str
    recommended_action: str


def test_router_prompt_returns_required_fields(prompt_runner):
    result = prompt_runner.run(
        prompt_name="incident_router",
        input_text="BGP sessions down on edge routers in site AMS1",
    )
    parsed = TriageResult.model_validate(result)
    assert parsed.severity in {"low", "medium", "high", "critical"}
    assert "BGP" in parsed.summary
```

## GitHub Actions: Structured Output Contract Tests

```yaml
name: Structured Output Contracts

on:
  pull_request:

jobs:
  contracts:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/aiops_cicd_debian:latest
    steps:
      - uses: actions/checkout@v5
      - name: Validate schemas
        run: |
          python tools/validate_json_schemas.py schemas/
          pytest tests/contracts -vv
```

Example JSON Schema check:

```python
import json
from pathlib import Path
from jsonschema import Draft202012Validator


for schema_file in Path("schemas").glob("*.json"):
    schema = json.loads(schema_file.read_text())
    Draft202012Validator.check_schema(schema)
    print(f"Schema OK: {schema_file}")
```

## GitHub Actions: LLM Smoke Test With LiteLLM

```yaml
name: LLM Smoke

on:
  workflow_dispatch:

jobs:
  smoke:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/aiops_cicd_ubuntu2404:latest
    env:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    steps:
      - uses: actions/checkout@v5
      - name: Smoke test configured model providers
        run: python tools/llm_smoke.py
```

Example `tools/llm_smoke.py`:

```python
from litellm import completion


response = completion(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "Answer in one sentence."},
        {"role": "user", "content": "What is NetDevOps?"},
    ],
)

content = response.choices[0].message.content
assert content
print(content)
```

## GitHub Actions: RAG Evaluation

```yaml
name: RAG Evaluation

on:
  pull_request:
  workflow_dispatch:

jobs:
  rag-eval:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/aiops_cicd_ubuntu:latest
    env:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    steps:
      - uses: actions/checkout@v5
      - name: Build test index
        run: python rag/build_index.py --source docs/runbooks --output build/index
      - name: Run RAG evaluation
        run: pytest tests/rag -vv --junitxml=rag-results.xml
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: rag-results
          path: rag-results.xml
```

Example evaluation shape:

```python
def test_runbook_answer_mentions_source(rag_client):
    answer = rag_client.ask("How do I recover a failed BGP peer?")
    assert answer.citations
    assert any("bgp" in citation.path.lower() for citation in answer.citations)
    assert "neighbor" in answer.text.lower()
```

## GitLab CI: Agent Tool Call Tests

```yaml
stages:
  - lint
  - test
  - eval

lint:
  stage: lint
  image: bsmeding/aiops_cicd_ubuntu:latest
  script:
    - ruff check .
    - mypy src tests

agent_tests:
  stage: test
  image: bsmeding/aiops_cicd_ubuntu:latest
  variables:
    OPENAI_API_KEY: $OPENAI_API_KEY
  script:
    - pytest tests/agents -vv

ragas_eval:
  stage: eval
  image: bsmeding/aiops_cicd_ubuntu:latest
  variables:
    OPENAI_API_KEY: $OPENAI_API_KEY
  script:
    - python eval/run_ragas.py --dataset eval/datasets/network_runbooks.jsonl
  artifacts:
    when: always
    paths:
      - eval/results/
```

Example agent test:

```python
def test_agent_calls_nautobot_lookup(agent, fake_toolbox):
    response = agent.invoke(
        "Find the site and role for device edge-ams1 and summarize the result."
    )

    assert fake_toolbox.called("nautobot_get_device")
    assert "edge-ams1" in response.lower()
    assert "site" in response.lower()
```

## GitLab CI: Replay Operational Incidents

```yaml
incident_replay:
  image: bsmeding/aiops_cicd_debian:latest
  script:
    - python replay/run_replay.py replay/incidents/*.jsonl --output build/replay-results.json
    - python replay/check_regressions.py build/replay-results.json
  artifacts:
    when: always
    paths:
      - build/replay-results.json
```

Replay data can be sanitized incidents, alerts, syslog snippets, or tickets. The important part is that the same input produces a stable classification, tool plan, or recommended action.

## Gitea Or Forgejo Actions

```yaml
name: aiops-ci

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/aiops_cicd_ubuntu:latest
    steps:
      - uses: actions/checkout@v4
      - run: ruff check .
      - run: pytest tests/contracts tests/prompts -vv
```

## Jenkins Pipeline

```groovy
pipeline {
  agent {
    docker {
      image 'bsmeding/aiops_cicd_ubuntu:latest'
    }
  }

  environment {
    OPENAI_API_KEY = credentials('openai-api-key')
  }

  stages {
    stage('Lint') {
      steps {
        sh 'ruff check .'
        sh 'mypy src tests'
      }
    }

    stage('Prompt Tests') {
      steps {
        sh 'pytest tests/prompts -vv'
      }
    }

    stage('Agent Tests') {
      steps {
        sh 'pytest tests/agents -vv'
      }
    }

    stage('RAG Evaluation') {
      steps {
        sh 'python eval/run_ragas.py --dataset eval/datasets/runbooks.jsonl'
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
  -e OPENAI_API_KEY \
  -e ANTHROPIC_API_KEY \
  bsmeding/aiops_cicd_ubuntu:latest \
  bash
```

Inside the container:

```bash
ruff check .
pytest tests/contracts -vv
pytest tests/prompts -vv
python eval/run_ragas.py --dataset eval/datasets/runbooks.jsonl
```

## Testing Without Real LLM Calls

Not every pull request should call paid APIs. Split fast deterministic tests from provider smoke tests:

```yaml
jobs:
  deterministic:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/aiops_cicd_ubuntu:latest
    steps:
      - uses: actions/checkout@v5
      - run: pytest tests/contracts tests/replay -vv

  provider-smoke:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    container:
      image: bsmeding/aiops_cicd_ubuntu:latest
    env:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    steps:
      - uses: actions/checkout@v5
      - run: pytest tests/provider_smoke -vv
```

## Practical Tips

- Keep most tests deterministic and run real provider calls only on schedule or manual dispatch.
- Validate structured output with Pydantic or JSON Schema before trusting it.
- Store prompt and replay datasets in version control.
- Save evaluation results as CI artifacts.
- Use sanitized operational data in replay tests.
- Add cost limits and timeouts around external model calls.
- Separate "model behavior changed" from "code regression" in test names and reports.

## Summary

The `aiops_cicd` images provide a repeatable CI base for testing AI-assisted operations code. They are useful for prompt contracts, agent tool calls, RAG quality checks, replay datasets, and operational API integrations where normal Python images do not include enough evaluation and LLM tooling.
