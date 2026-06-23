---
authors: [bsmeding]
date: 2026-05-24
title: Nautobot Digital Twin - Disposable Labs Straight From Your Source of Truth
summary: A Nautobot app that turns Location, Device, Interface, and Cable data into disposable containerlab topologies, with Golden Config intended-config push, connectivity tests, and automatic cleanup driven entirely from Nautobot jobs.
tags: ["nautobot", "digital twin", "containerlab", "golden config", "network automation", "labs", "netdevops"]
toc: true
layout: single
comments: true
---

# Nautobot Digital Twin

![Nautobot to containerlab topology flow](/images/nautobot/Nautobot_to_containerlab.png)

Your network exists twice: once in production, and once in Nautobot as the source of truth. What is usually missing is a third copy, a place where you can actually *run* the topology, push a config change, and watch what happens before it touches real hardware.

The **Nautobot Digital Twin** app builds that third copy on demand. It reads your `Location`, `Device`, `Interface`, and `Cable` data, generates a [containerlab](https://containerlab.dev/) topology, and spins up a disposable lab on a lab host, all from a Nautobot job or a button on the Location page. When you are done, it tears the lab back down, and it can even clean up after itself on a timer.

<!-- more -->

## Why a Digital Twin

A digital twin is a throwaway, runnable copy of a piece of your network. It is useful whenever you want to test something without a maintenance window:

- **Validate intended config** before pushing it to production.
- **Reproduce a topology** to debug a routing or VLAN issue safely.
- **Train and demo** on a realistic environment that matches the real inventory.
- **Test automation** (Golden Config, SSoT, your own jobs) end to end against live nodes.

The key idea: you already modeled the network in Nautobot, so the lab should be generated *from that model*, not hand-built in a separate tool that immediately drifts out of date.

## How It Works

The app is driven entirely through Nautobot Jobs and uses containerlab as its deployment backend (over SSH to a lab host):

1. You trigger **Start Digital Twin** for a Location (manual job or a Job Button on the Location page).
2. The app reads the devices, interfaces, and cables for that Location and generates a containerlab topology (`.clab.yaml`). Management addressing is derived from each device's `primary_ip4`.
3. The topology is uploaded to the containerlab server and deployed.
4. A `DigitalTwinDeployment` record tracks state (`deploying` -> `deployed`), who deployed it, and an optional auto-destroy time.
5. When you are finished, **Stop Digital Twin** tears it down and records `destroyed`.

Because the topology is regenerated from Nautobot each time, the twin always reflects the current source of truth. Added a device or a cable? Run **Redeploy** and the lab catches up.

![Start digital twin from site overview](/images/nautobot/digitaltwin1.png)

## Install

The app is published on PyPI:

```bash
pip install nautobot-app-digital-twin
```

Enable it in `nautobot_config.py` and point it at your containerlab host:

```python
PLUGINS = [
    "nautobot_digital_twin",
]

PLUGINS_CONFIG = {
    "nautobot_digital_twin": {
        "BACKEND": "containerlab",
        "CONTAINERLAB_SSH_HOST": "172.16.6.128",
        "CONTAINERLAB_SSH_PORT": 22,
        "CONTAINERLAB_SSH_USER": "clab",
        "CONTAINERLAB_SSH_PASSWORD": "clab",
    },
}
```

Then run post-upgrade and restart Nautobot:

```bash
nautobot-server post_upgrade
```

Optionally, add the Start/Stop (and other) buttons to the Location page:

```bash
nautobot-server ensure_digital_twin_job_buttons
```

## The Jobs You Get

Everything is a Nautobot Job, so it shows up in the Jobs list, respects permissions, logs to the job result, and can be scheduled. Each operational job also ships as a **Job Button** receiver so it can be wired onto the Location detail page:

- **Start Digital Twin** - deploy a lab for a Location. Choose an empty startup config or, if Golden Config is installed, the intended config.
- **Start Digital Twin (Empty Config)** - force an empty startup config regardless of Golden Config.
- **Stop Digital Twin** - tear the lab down.
- **Redeploy Digital Twin** - regenerate the topology and re-deploy an existing lab after inventory changes.
- **Push Intended Config** - push updated Golden Config intended config to a running lab.
- **Execute and Send Intended Config** - run Golden Config "Generate Intended Configurations", then push the result to the lab and reactivate it on each node, in one workflow.
- **Check Digital Twin Health** - SSH to the lab host and inspect the running topology.
- **Validate Digital Twin Connectivity** - a full-mesh ping test between every device that has a `primary_ip4`, run from inside the containers.
- **Auto-destroy expired deployments** - schedule this (for example every 15 minutes) to clean up labs past their lifetime.

## Golden Config Integration

If you run [Golden Config](https://docs.nautobot.com/projects/golden-config/en/latest/), the twin becomes a safe rehearsal stage for config changes. The **Execute and Send Intended Config** job:

1. Syncs the Golden Config Git repositories.
2. Runs the "Generate Intended Configurations" job and waits for it to finish.
3. Pushes the freshly generated intended configs to the running lab and reactivates them on each device.

That gives you a tight loop: change intent in Nautobot, regenerate, push to the twin, and validate connectivity, all before anything reaches production.

## Guardrails: Lifecycle, Quotas, and Auto-Destroy

Disposable environments are only useful if they actually get disposed of. The app has a few built-in guardrails:

- **One active deployment per Location** - starting a twin where one already runs is rejected until you stop it.
- **Ownership** - by default only the user who started a deployment (or a superuser) can stop it.
- **Per-user quota** - `MAX_DEPLOYMENTS_PER_USER` caps how many labs a single user can keep running.
- **Auto-destroy** - `DIGITAL_TWIN_AUTO_DESTROY_MINUTES` stamps each deployment with an expiry, and the scheduled auto-destroy job cleans up anything past its time.

This keeps a shared lab host from filling up with forgotten topologies.

![Overview historical digital twins](/images/nautobot/digitaltwin2.png)

## Tuning the Generated Config

Real device configs rarely drop straight into a container node. The intended-config pipeline lets you massage configs before they are applied, via plugin settings:

- `CONTAINERLAB_PLATFORM_MAP` - map a Nautobot platform to a containerlab node `kind` and image.
- `REMOVE_CONFIG_LINES` - strip lines that do not apply in the lab.
- `REPLACE_CONFIG_PATTERNS` - rewrite values (for example management interfaces or credentials).
- `PLATFORM_ADD_CONFIG_LINES` - inject lab-only lines per platform.
- `LOCATION_TYPE_NAME` - which Location type shows the Start/Stop buttons (defaults to `Site`).

## A Typical Workflow

Putting it together, a day-to-day loop looks like this:

1. Open a Location in Nautobot and click **Start Digital Twin** (intended config).
2. Click **Validate Digital Twin Connectivity** to confirm the mesh is reachable.
3. Adjust intent in Nautobot, then **Execute and Send Intended Config** to regenerate and push.
4. Re-validate, and when satisfied, promote the change to production through your normal pipeline.
5. Click **Stop Digital Twin**, or let auto-destroy clean it up.

No separate lab definition to maintain, no drift between the lab and the source of truth.

## Status and Roadmap

The app is currently **alpha** (`0.1.0`) and supports **containerlab** as its deployment backend. It is Apache-2.0 licensed and tested against Nautobot 3.x on Python 3.10 to 3.13. The backend layer is abstracted, so additional backends are a natural next step. We're planning to add EVE-NG and GNS3 as backend.

## Summary

Nautobot Digital Twin closes the loop between modeling a network and running it. It turns your `Location`, `Device`, `Interface`, and `Cable` data into a disposable containerlab topology, integrates with Golden Config to rehearse config changes, validates connectivity with a full-mesh ping test, and cleans up after itself with quotas and auto-destroy, all through ordinary Nautobot jobs and Location buttons. Model once, lab on demand, and test changes safely before they reach production.

The project lives at [github.com/bsmeding/nautobot-app-digital-twin](https://github.com/bsmeding/nautobot-app-digital-twin) and on [PyPI](https://pypi.org/project/nautobot-app-digital-twin/). Issues and contributions are welcome.
