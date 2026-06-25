---
authors: [bsmeding]
date: 2026-05-12
draft: true
title: RAG Evaluation for Network Runbooks with Ragas, DeepEval, and DuckDB
summary: Test retrieval-augmented generation for network operations by evaluating runbook answers, citations, datasets, and regression results in CI.
tags: ["aiops", "rag", "deepeval", "ragas", "duckdb", "runbooks", "ci/cd", "llm"]
toc: true
layout: single
comments: true
---

# RAG Evaluation for Network Runbooks with Ragas, DeepEval, and DuckDB

Retrieval-augmented generation sounds useful for network operations: ask a question, search runbooks, return a grounded answer. But without tests, a RAG system can quietly drift into confident nonsense.

<!-- more -->

The `aiops_cicd` images include Ragas, DeepEval, pandas, NumPy, DuckDB, pytest, Pydantic, JSON Schema, OpenAI, Anthropic, LiteLLM, and LangChain tooling. That makes them useful for evaluating RAG quality in CI/CD.

## What To Evaluate

For network runbooks, test:

- Did retrieval find the right document?
- Did the answer cite the source?
- Did the answer include required operational steps?
- Did it avoid unsafe actions?
- Did quality regress compared to previous runs?

You do not need a huge benchmark. Start with 20 to 50 real questions from incidents, tickets, or operator notes.

## Example Dataset

Store a small JSONL dataset:

```json
{"question": "How do I recover a failed BGP peer?", "expected_source": "runbooks/bgp-peer-recovery.md", "must_include": ["neighbor", "clear", "logs"]}
{"question": "What should I check when an interface is flapping?", "expected_source": "runbooks/interface-flap.md", "must_include": ["errors", "optic", "cable"]}
```

Load it with Python:

```python
import json
from pathlib import Path


def load_dataset(path="eval/network_runbooks.jsonl"):
    return [
        json.loads(line)
        for line in Path(path).read_text().splitlines()
        if line.strip()
    ]
```

## Basic pytest Evaluation

Start with deterministic checks:

```python
def test_rag_answers_reference_expected_sources(rag_client):
    for item in load_dataset():
        answer = rag_client.ask(item["question"])

        assert any(
            item["expected_source"] in citation["source"]
            for citation in answer["citations"]
        )

        for word in item["must_include"]:
            assert word.lower() in answer["text"].lower()
```

This test catches obvious retrieval failures without needing a judge model.

## Store Evaluation Results in DuckDB

DuckDB is useful for local analysis and CI artifacts:

```python
import duckdb


def write_results(results, path="build/rag_results.duckdb"):
    con = duckdb.connect(path)
    con.execute(
        """
        create table if not exists rag_results (
            question varchar,
            expected_source varchar,
            answer varchar,
            passed boolean
        )
        """
    )
    con.executemany(
        "insert into rag_results values (?, ?, ?, ?)",
        [
            (
                item["question"],
                item["expected_source"],
                item["answer"],
                item["passed"],
            )
            for item in results
        ],
    )
```

Upload the database as a CI artifact so failures can be inspected later.

## Ragas and DeepEval

Use Ragas or DeepEval when you want model-assisted scoring. Keep those tests separate from fast deterministic tests because they may call an LLM provider.

Example CI split:

```yaml
jobs:
  deterministic-rag:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/aiops_cicd_ubuntu:latest
    steps:
      - uses: actions/checkout@v5
      - run: pytest tests/rag/test_retrieval_contracts.py -vv

  judged-rag:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    container:
      image: bsmeding/aiops_cicd_ubuntu:latest
    env:
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    steps:
      - uses: actions/checkout@v5
      - run: pytest tests/rag/test_judged_quality.py -vv
```

## Example Quality Gate

```python
def test_average_score_does_not_drop(eval_results):
    scores = [item["score"] for item in eval_results]
    average = sum(scores) / len(scores)

    assert average >= 0.80
```

Use thresholds carefully. The point is not to make the test flaky. The point is to catch clear regressions: wrong source, missing citation, dangerous recommendation, or a large quality drop.

## Practical Tips

- Keep a small deterministic dataset that runs on every pull request.
- Run LLM-judged tests manually or on schedule.
- Save answers, citations, and scores as artifacts.
- Track regressions by question, not only by average score.
- Use sanitized tickets and incidents as evaluation data.
- Prefer "must include" and "must not include" checks for safety-critical runbooks.

## Summary

RAG for network operations needs evaluation, not just demos. Ragas, DeepEval, pytest, DuckDB, and structured datasets help turn runbook QA into a repeatable CI process.
