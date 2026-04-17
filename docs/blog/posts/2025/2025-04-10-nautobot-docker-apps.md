---
authors: [bsmeding]
date: 2025-04-10
title: Nautobot Docker Images with Pre-Installed Apps
summary: Discover ready-to-use Nautobot Docker images with all major apps pre-installed—including Nautobot 3.1 builds alongside 1.x and 2.x. Learn how to deploy with Docker Compose, pick the right image tag, and enable only the plugins you need.
tags: ["nautobot", "docker", "network automation", "cmdb", "ssot", "plugins", "apps"]
toc: true
layout: single
comments: true
---

# Nautobot Docker Apps

Nautobot is a powerful network automation platform, and with Docker you can easily deploy Nautobot and its ecosystem of apps and plugins. In this post, I'll show you how to get started with Nautobot in Docker, explore some useful apps, and share tips for a smooth deployment.

**Update (2026):** Images now include **Nautobot 3.x** (including **3.1.0** on Docker Hub), refreshed app pins per major release, and a dedicated `requirements-3.x.txt`. The build source lives in [`bsmeding/docker_container_nautobot`](https://github.com/bsmeding/docker_container_nautobot) on GitHub.

<!-- more -->

# Nautobot Docker Images with Pre-Installed Apps

Managing and extending Nautobot with plugins and apps can be challenging, especially for users who are not familiar with Docker, Docker builds, or Python package management. To make things easier, I maintain a set of Docker images based on the upstream **Network to Code** Nautobot images, extended with almost all major Nautobot apps pre-installed and ready to use.

> Due to CVEs, avoid unmaintained patch levels. Prefer current **1.6.x**, **2.4.x**, and **3.0.x / 3.1.x** images from Docker Hub (see the [build matrix](https://github.com/bsmeding/docker_container_nautobot/blob/main/.github/workflows/build.yml) in the repo). Python **3.9**-based tags are discontinued (May 2025 onward) because several apps no longer support that runtime.

## 🚀 What Are These Images?
- **Based on upstream [`networktocode/nautobot`](https://hub.docker.com/r/networktocode/nautobot)** images, extended with extra OS tools, Ansible, job-friendly Python packages, and pinned Nautobot apps
- **Published lines:** **1.6.x**, **2.4.x**, **3.0.x**, and **3.1.x** (multi-arch **amd64** and **arm64**), plus `stable` and `latest` tags that follow upstream (today those still resolve to the **2.x** app bundle in the Dockerfile—use an explicit **3.x** tag for Nautobot 3)
- **Major-specific requirements:** `requirements-1.x.txt`, `requirements-2.x.txt`, and `requirements-3.x.txt` in the [GitHub repo](https://github.com/bsmeding/docker_container_nautobot)
- **No need to build or install plugins manually** for the bundled set—enable them in `nautobot_config.py`
- **Available on Docker Hub:** [bsmeding/nautobot](https://hub.docker.com/r/bsmeding/nautobot)

## 🧩 Included Nautobot Apps

Apps are **pinned per Nautobot major** (see the repo README tables and the `requirements-*.txt` files). The [Nautobot apps catalog](https://docs.nautobot.com/projects/core/en/stable/apps/) is the authoritative list of names and docs.

**Nautobot 2.x** (example pins: plugin-nornir 2.3.0, device-lifecycle-mgmt 3.2.0, ssot 3.11.0, golden-config 2.6.0, and others) includes:

* [Nautobot Data Validation Engine](https://docs.nautobot.com/projects/data-validation/en/latest/)
* [Nautobot Device Lifecycle Management](https://docs.nautobot.com/projects/device-lifecycle/en/latest/)
* [Nautobot Device Onboarding](https://docs.nautobot.com/projects/device-onboarding/en/latest/)
* [Nautobot Firewall Models](https://docs.nautobot.com/projects/firewall-models/en/latest/)
* [Nautobot Golden Configuration](https://docs.nautobot.com/projects/golden-config/en/latest/)
* [Nautobot Plugin Nornir](https://docs.nautobot.com/projects/plugin-nornir/en/latest/)
* [Nautobot Single Source of Truth (SSoT)](https://docs.nautobot.com/projects/ssot/en/latest/)
* [Nautobot Floorplan](https://docs.nautobot.com/projects/floor-plan/en/latest/)
* [Nautobot BGP models](https://docs.nautobot.com/projects/bgp-models/en/latest/)
* [Nautobot Secrets Provider](https://docs.nautobot.com/projects/secrets-providers/en/latest/)
* [Nautobot Design Builder](https://docs.nautobot.com/projects/design-builder/en/latest/)
* [nautobot-ui-plugin](https://pypi.org/project/nautobot-ui-plugin/) (2.x line; community package, see PyPI / project repo for usage)

**Nautobot 3.x** (example pins: plugin-nornir 3.2.0, device-lifecycle-mgmt 4.1.1, ssot 4.2.2, golden-config 3.0.5, chatops 4.0.0 with Slack/Teams/Webex/Ansible/Arista extras, and others) includes the same families where a 3.x release exists, with these differences:

* **[Nautobot ChatOps](https://docs.nautobot.com/projects/chatops/en/latest/)** is bundled again on **3.x** (it was dropped from 1.x/2.x images in this stack because of dependency clashes).
* **Data Validation Engine** is **not** in the 3.x image today—the upstream package still targets Nautobot &lt; 3.0.
* **UI Plugin** is **not** installed on 3.x (commented out in `requirements-3.x.txt`).

Read more about the apps on [nautobot_the_ultimate_network_cmdb](/nautobot_the_ultimate_network_cmdb/)

## 🛠️ How to Use
1. **Pull the image from Docker Hub** (tags combine Nautobot version and Python, e.g. `3.1.0-py3.12`; floating **3.1-py3.12** is published for the highest Python in that minor series):

   ```bash
   docker pull bsmeding/nautobot:3.1.0-py3.12   # Nautobot 3.1, Python 3.12
   docker pull bsmeding/nautobot:2.4.31-py3.12  # Nautobot 2.4 LTS line
   docker pull bsmeding/nautobot:1.6.32-py3.11  # Nautobot 1.6
   docker pull bsmeding/nautobot:stable-py3.12   # tracks upstream; app set = 2.x requirements today
   ```
2. **Use the provided Docker Compose file:**
```yaml

services:
  nautobot:
    container_name: nautobot
    image: &shared_image bsmeding/nautobot:3.1.0-py3.12
    depends_on:
      - postgres
      - redis
    ports:
      - "8080:8080"  # Exposes Nautobot on localhost:8080
    environment:
      - NAUTOBOT_DEBUG=True
      - NAUTOBOT_DJANGO_EXTENSIONS_ENABLED=False
      - NAUTOBOT_DJANGO_TOOLBAR_ENABLED=False
      - NAUTOBOT_HIDE_RESTRICTED_UI=True
      - NAUTOBOT_LOG_LEVEL=WARNING
      - NAUTOBOT_METRICS_ENABLED=False
      - NAUTOBOT_NAPALM_TIMEOUT=5
      - NAUTOBOT_MAX_PAGE_SIZE=0
      - NAUTOBOT_DB_HOST=postgres
      - NAUTOBOT_DB_PORT=5432
      - NAUTOBOT_DB_NAME=nautobot
      - NAUTOBOT_DB_USER=nautobot
      - NAUTOBOT_DB_PASSWORD=nautobotpassword
      - NAUTOBOT_ALLOWED_HOSTS=*
      - NAUTOBOT_REDIS_HOST=redis
      - NAUTOBOT_REDIS_PORT=6379
      - NAUTOBOT_SUPERUSER_NAME=admin
      - NAUTOBOT_SUPERUSER_PASSWORD=admin
      - NAUTOBOT_SUPERUSER_API_TOKEN=1234567890abcde0987654321
      - NAUTOBOT_CREATE_SUPERUSER=true
      - NAUTOBOT_INSTALLATION_METRICS_ENABLED=false
      - NAUTOBOT_CONFIG=/opt/nautobot/nautobot_config.py
      - NAUTOBOT_CELERY_BROKER_URL=redis://redis:6379/0
      - NAUTOBOT_SECURE_HSTS_SECONDS=3600
      - NAUTOBOT_SECURE_SSL_REDIRECT=True
      - NAUTOBOT_SESSION_COOKIE_SECURE=True
      - NAUTOBOT_CSRF_COOKIE_SECURE=True
    volumes:
      - nautobot_config:/opt/nautobot/
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 120s
    command: ["nautobot-server", "runserver", "0.0.0.0:8080"]

  postgres:
    image: postgres:14-alpine
    container_name: postgres
    command:
      - "-c"
      - "max_connections=1000"
    healthcheck:
      test: "pg_isready --username=$$POSTGRES_USER --dbname=$$POSTGRES_DB"
      interval: "10s"
      timeout: "5s"
      retries: 10    
    environment:
      POSTGRES_USER: nautobot
      POSTGRES_PASSWORD: nautobotpassword
      POSTGRES_DB: nautobot
    volumes:
      - "postgres_data:/var/lib/postgresql/data"
    restart: unless-stopped

  redis:
    image: redis:6
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  celery-beat:
    container_name: nautobot_celery_beat
    image: *shared_image
    command: nautobot-server celery beat
    depends_on:
      nautobot:
        condition: "service_healthy"
    volumes:
      - nautobot_config:/opt/nautobot/
    environment:
      - NAUTOBOT_DB_HOST=postgres
      - NAUTOBOT_DB_PORT=5432
      - NAUTOBOT_DB_NAME=nautobot
      - NAUTOBOT_DB_USER=nautobot
      - NAUTOBOT_DB_PASSWORD=nautobotpassword
      - NAUTOBOT_REDIS_HOST=redis
      - NAUTOBOT_REDIS_PORT=6379      
      - NAUTOBOT_CELERY_BROKER_URL=redis://redis:6379/0
      - NAUTOBOT_CONFIG=/opt/nautobot/nautobot_config.py

  celery-worker-1:
    image: *shared_image
    container_name: nautobot_celery_worker_1
    command: nautobot-server celery worker --concurrency=4
    depends_on:
      nautobot:
        condition: "service_healthy"
    healthcheck:
      interval: "30s"
      timeout: "10s"
      start_period: "30s"
      retries: 3
      test:
        [
          "CMD",
          "bash",
          "-c",
          "nautobot-server celery inspect ping --destination celery@$$HOSTNAME"  ## $$ because of docker-compose
        ]
    volumes:
      - nautobot_config:/opt/nautobot/
    environment:
      - NAUTOBOT_DB_HOST=postgres
      - NAUTOBOT_DB_PORT=5432
      - NAUTOBOT_DB_NAME=nautobot
      - NAUTOBOT_DB_USER=nautobot
      - NAUTOBOT_DB_PASSWORD=nautobotpassword
      - NAUTOBOT_REDIS_HOST=redis
      - NAUTOBOT_REDIS_PORT=6379      
      - NAUTOBOT_CELERY_BROKER_URL=redis://redis:6379/0
      - NAUTOBOT_CONFIG=/opt/nautobot/nautobot_config.py


volumes:
  nautobot_config: {}
  postgres_data: {}
  redis_data: {}
```
   - Source: [docker-compose.yml Gist](https://gist.github.com/bsmeding/d60cf4f23519c75ca2339148d6efd7fe) (adjust `image` to your desired Nautobot major, e.g. `3.0.6-py3.12` or `stable-py3.12`).
   - This Compose file sets up Nautobot, Postgres, Redis, and volumes for persistent data.
3. **Configure your plugins/apps:**
   - Edit `nautobot_config.py` to activate the plugins you want. Everything listed for your image’s major version is pre-installed; enable only what you need.
   - Example:
     ```python
     PLUGINS = [
         "nautobot_chatops",
         "nautobot_golden_config",
         # ...add or remove as needed
     ]
     ```
4. **Start Nautobot:**
   ```bash
   docker compose up -d
   ```

## 🔍 Requirements Files
- **1.x:** [`requirements-1.x.txt`](https://github.com/bsmeding/docker_container_nautobot/blob/main/requirements-1.x.txt)
- **2.x** (also used when `NAUTOBOT_VER` is `stable` or `latest` in the Dockerfile): [`requirements-2.x.txt`](https://github.com/bsmeding/docker_container_nautobot/blob/main/requirements-2.x.txt)
- **3.x:** [`requirements-3.x.txt`](https://github.com/bsmeding/docker_container_nautobot/blob/main/requirements-3.x.txt)

Local builds use [`build.sh`](https://github.com/bsmeding/docker_container_nautobot/blob/main/build.sh) or the Makefile (`make build VERSION=3.1.0`, and so on).

## 📝 Why Use These Images?
- **Save time:** No need to build or install plugins manually.
- **Consistency:** All users get the same set of apps and versions.
- **Easy upgrades:** Just pull the latest image for new Nautobot or app versions.
- **Great for labs, demos, and production** where you want a quick start.

## 🔗 Resources
- [Nautobot Apps Documentation](https://docs.nautobot.com/projects/core/en/stable/apps/)
- [Docker Compose Example](https://gist.github.com/bsmeding/d60cf4f23519c75ca2339148d6efd7fe)
- [Docker Hub: bsmeding/nautobot](https://hub.docker.com/repository/docker/bsmeding/nautobot)
- [GitHub: docker_container_nautobot](https://github.com/bsmeding/docker_container_nautobot) (Dockerfile, CI matrix, pinned apps)

---

If you have questions or want to suggest more apps to include, feel free to open an issue or contact me via the links above!