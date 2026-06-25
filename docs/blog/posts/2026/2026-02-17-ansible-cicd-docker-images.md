---
authors: [bsmeding]
date: 2026-02-17
title: Ansible CI/CD Docker Images for Reproducible Role and Playbook Testing
summary: Use the ansible_cicd Docker images to run repeatable Ansible, Molecule, linting, and role validation pipelines across Ubuntu, Debian, Rocky Linux, and Alpine.
tags: ["ansible", "docker", "ci/cd", "molecule", "github-actions", "gitlab", "netdevops"]
toc: true
layout: single
comments: true
---

# Ansible CI/CD Docker Images for Reproducible Role and Playbook Testing

Ansible automation often fails in CI for boring reasons: different Python versions, missing system packages, missing `sshpass`, a Molecule image that does not support systemd, or a pipeline runner that is not close to the Linux distribution used in production. The `bsmeding/ansible_cicd_*` images are built to remove that drift.

<!-- more -->

The images include Ansible, common Ansible Python libraries, linting tools, Molecule-friendly system dependencies, and distro-specific builds for Ubuntu, Debian, Rocky Linux, and Alpine.

## When To Use These Images

Use `ansible_cicd` images when you need to test Ansible roles, playbooks, collections, inventories, or Molecule scenarios in a predictable environment.

Good fits:

- Role testing with Molecule.
- Playbook syntax checks and dry runs.
- `ansible-lint`, `yamllint`, and inventory validation.
- Testing against several Linux distributions.
- CI pipelines that need Ansible preinstalled instead of installing it on every run.
- Docker-based role tests where the image is used as the Molecule instance.

Use another image when:

- You only need Python NetDevOps libraries and no Ansible runtime. Use `netdevops_cicd`.
- You need LLM, prompt, agent, or RAG evaluation tooling. Use `aiops_cicd`.
- You are building a minimal production runtime image. These are CI images, not application runtimes.

## Image Tags

The general pattern is:

```text
bsmeding/ansible_cicd_<tag>:latest
```

Common tags:

- `ubuntu`, `ubuntu2404`, `ubuntu2604`
- `debian`, `debian12`, `debian13`
- `rockylinux`, `rockylinux8`, `rockylinux9`
- `alpine3`, `alpine3.22`, `alpine3.23`

Older tags such as `ubuntu2004`, `ubuntu2204`, `debian11`, `alpine3.20`, and `alpine3.21` may still exist on Docker Hub for older pipelines, but the newest two versions per distro family are the actively maintained targets.

## GitHub Actions: Lint And Syntax Check

```yaml
name: Ansible CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  lint:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/ansible_cicd_ubuntu:latest
    steps:
      - uses: actions/checkout@v5

      - name: Show tool versions
        run: |
          ansible --version
          ansible-lint --version
          yamllint --version

      - name: Lint YAML
        run: yamllint .

      - name: Lint Ansible
        run: ansible-lint

      - name: Syntax check site playbook
        run: ansible-playbook -i inventories/dev/hosts.yml site.yml --syntax-check
```

## GitHub Actions: Molecule Test Matrix

This example runs the same role against multiple distro images.

```yaml
name: Molecule

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  molecule:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        distro:
          - ubuntu2404
          - debian12
          - rockylinux9
          - alpine3.23
    steps:
      - uses: actions/checkout@v5

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Run Molecule
        run: molecule test
        env:
          PY_COLORS: "1"
          ANSIBLE_FORCE_COLOR: "1"
          MOLECULE_DISTRO: ${{ matrix.distro }}
```

Example `molecule/default/molecule.yml`:

```yaml
---
driver:
  name: docker

platforms:
  - name: instance
    image: "bsmeding/ansible_cicd_${MOLECULE_DISTRO:-ubuntu2404}:latest"
    command: ${MOLECULE_DOCKER_COMMAND:-"/lib/systemd/systemd"}
    privileged: true
    pre_build_image: true
    cgroupns_mode: host
    volumes:
      - /sys/fs/cgroup:/sys/fs/cgroup:rw

provisioner:
  name: ansible
  config_options:
    defaults:
      remote_tmp: /var/tmp/.ansible
```

For Alpine, systemd is not available, so override the command:

```bash
MOLECULE_DISTRO=alpine3.23 MOLECULE_DOCKER_COMMAND=sleep infinity molecule test
```

## GitHub Actions: Publish A Role After Tests

```yaml
name: Test And Publish Role

on:
  push:
    tags:
      - "v*"

jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/ansible_cicd_debian:latest
    steps:
      - uses: actions/checkout@v5
      - run: ansible-lint
      - run: molecule test

  publish:
    needs: test
    runs-on: ubuntu-latest
    container:
      image: bsmeding/ansible_cicd_debian:latest
    steps:
      - uses: actions/checkout@v5
      - name: Import role into Ansible Galaxy
        env:
          ANSIBLE_GALAXY_API_KEY: ${{ secrets.ANSIBLE_GALAXY_API_KEY }}
        run: |
          ansible-galaxy role import \
            --api-key "$ANSIBLE_GALAXY_API_KEY" \
            bsmeding "${GITHUB_REPOSITORY#*/}"
```

## GitLab CI: Lint, Syntax, And Molecule

```yaml
stages:
  - lint
  - test

variables:
  ANSIBLE_FORCE_COLOR: "true"
  PY_COLORS: "1"

lint:
  stage: lint
  image: bsmeding/ansible_cicd_ubuntu:latest
  script:
    - yamllint .
    - ansible-lint
    - ansible-playbook -i inventories/dev/hosts.yml site.yml --syntax-check

molecule:
  stage: test
  image: docker:27
  services:
    - docker:27-dind
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
    MOLECULE_DISTRO: ubuntu2404
  before_script:
    - apk add --no-cache python3 py3-pip
    - pip install --break-system-packages molecule molecule-plugins[docker] ansible
  script:
    - molecule test
```

## Gitea Or Forgejo Actions

```yaml
name: ansible-role-ci

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  lint:
    runs-on: ubuntu-latest
    container:
      image: bsmeding/ansible_cicd_ubuntu2404:latest
    steps:
      - uses: actions/checkout@v4
      - run: yamllint .
      - run: ansible-lint
      - run: ansible-playbook --syntax-check -i inventory.yml playbook.yml
```

## Jenkins Declarative Pipeline

```groovy
pipeline {
  agent {
    docker {
      image 'bsmeding/ansible_cicd_ubuntu:latest'
      args '-u root:root'
    }
  }

  stages {
    stage('Versions') {
      steps {
        sh 'ansible --version'
        sh 'python --version'
      }
    }

    stage('Lint') {
      steps {
        sh 'yamllint .'
        sh 'ansible-lint'
      }
    }

    stage('Syntax Check') {
      steps {
        sh 'ansible-playbook -i inventories/dev/hosts.yml site.yml --syntax-check'
      }
    }

    stage('Molecule') {
      steps {
        sh 'molecule test'
      }
    }
  }
}
```

## Local CI Reproduction

When CI fails, reproduce the same environment locally:

```bash
docker run --rm -it \
  -v "$PWD:/work" \
  -w /work \
  bsmeding/ansible_cicd_ubuntu:latest \
  bash
```

Then run the same checks:

```bash
yamllint .
ansible-lint
ansible-playbook -i inventories/dev/hosts.yml site.yml --syntax-check
molecule test
```

## Practical Tips

- Use `ubuntu` or `debian` aliases for normal pipelines.
- Use version-specific tags when your test must match a target OS.
- Use `rockylinux8` only when you still support older Enterprise Linux hosts.
- Use Alpine for lightweight syntax and Python checks, but not for systemd-based Molecule tests.
- Pin your role dependencies in `requirements.yml` and install them in CI before running Molecule.
- Keep secrets in CI secret stores, never in `group_vars` or committed inventories.

## Summary

The `ansible_cicd` images are a practical base for repeatable Ansible CI. They keep Ansible, Python modules, lint tooling, and Molecule-friendly OS dependencies together so every pull request is tested in a known environment.
