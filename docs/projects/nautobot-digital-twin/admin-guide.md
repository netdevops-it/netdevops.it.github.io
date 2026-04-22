# Nautobot Digital Twin Admin Guide

This temporary page is the administrator documentation entry point for Nautobot Digital Twin.

## Install

Install from PyPI:

```bash
pip install nautobot-app-digital-twin
```

Enable in `nautobot_config.py`:

```python
PLUGINS = [
    "nautobot_digital_twin",
]
```

Then run:

```bash
nautobot-server post_upgrade
nautobot-server ensure_digital_twin_job_buttons
```

## Configuration model

Configure all runtime behavior in `PLUGINS_CONFIG["nautobot_digital_twin"]`.

```python
PLUGINS_CONFIG = {
    "nautobot_digital_twin": {
        "BACKEND": "containerlab",
        "BACKEND_URLS": {"containerlab": ""},
        "LOCATION_TYPE_NAME": "Site",
        "CONTAINERLAB_SSH_HOST": "172.16.6.128",
        "CONTAINERLAB_SSH_PORT": 22,
        "CONTAINERLAB_SSH_USER": "clab",
        "CONTAINERLAB_SSH_PASSWORD": "clab",
        "DIGITAL_TWIN_ROOT": "/opt/nautobot/digital_twin",
        "CONTAINERLAB_COMMAND_TIMEOUT_MINUTES": 15,
        "DIGITAL_TWIN_JOB_TIMEOUT_MINUTES": 20,
        "CONTAINERLAB_PLATFORM_MAP": {
            "client": {
                "kind": "linux",
                "image": "alpine:latest",
                "cmd": "sh -c 'apk add --no-cache openssh 2>/dev/null; ssh-keygen -A 2>/dev/null; echo root:clab | chpasswd 2>/dev/null; /usr/sbin/sshd 2>/dev/null; ip addr add 10.2.1.1/31 dev eth1 2>/dev/null; ip link set eth1 up; ip route add default via 10.2.1.0 2>/dev/null; sleep infinity'",
            },
            "mgmt": {
                "kind": "linux",
                "image": "alpine:latest",
                "cmd": "sh -c 'apk add --no-cache openssh 2>/dev/null; ssh-keygen -A 2>/dev/null; echo root:clab | chpasswd 2>/dev/null; /usr/sbin/sshd 2>/dev/null; ip addr add 10.1.0.1/31 dev eth1 2>/dev/null; ip link set eth1 up; ip route add default via 10.1.0.0 2>/dev/null; sleep infinity'",
            },
        },
        "PLATFORM_REMOVE_CONFIG_LINES": {
            "eos": [
                "tacacs-server",
                "no aaa root",
            ],
        },
        "PLATFORM_ADD_CONFIG_LINES": {
            "eos": [
                "username admin privilege 15 role network-admin secret admin",
            ],
        },
    },
}
```

## Key admin settings

- `BACKEND`: `containerlab` or `eveng`
- `BACKEND_URLS`: optional endpoint mapping per backend
- `LOCATION_TYPE_NAME`
- `CONTAINERLAB_SSH_*` / `CONTAINERLAB_SSH_CREDENTIALS_SECRETS_GROUP`
- `DIGITAL_TWIN_ROOT`: local filesystem path where generated files are staged
- `CONTAINERLAB_COMMAND_TIMEOUT_MINUTES`: backend command timeout
- `DIGITAL_TWIN_JOB_TIMEOUT_MINUTES`: Nautobot job timeout for long deploys
- `CONTAINERLAB_PLATFORM_MAP` / `EVENG_PLATFORM_MAP`
- `REMOVE_CONFIG_LINES`, `REPLACE_CONFIG_PATTERNS`, `PLATFORM_ADD_CONFIG_LINES`
- `PLATFORM_REMOVE_CONFIG_LINES`: platform-specific block removal patterns
- `DIGITAL_TWIN_AUTO_DESTROY_MINUTES`

## Practical recommendations

- For medium-size topologies, increase both backend and job timeouts together; avoid default low values when devices need full boot/config time.
- Use `PLATFORM_REMOVE_CONFIG_LINES` to strip enterprise AAA blocks that can break lab bootstrapping.
- Use `PLATFORM_ADD_CONFIG_LINES` to inject fallback local access (for example an EOS local admin user) when intended config is unavailable or sanitized.
- Keep Linux endpoint `cmd` blocks explicit and idempotent (enable SSH, set addressing, set route, then hold process with `sleep infinity`).
- Prefer secrets groups for production credentials; use inline defaults only for disposable lab environments.

## Operations

- Upgrade: update the package and run `nautobot-server post_upgrade`.
- Uninstall: run `nautobot-server migrate nautobot_digital_twin zero`, remove plugin config, then uninstall package.

## Troubleshooting checklist

- Deployment times out: raise `CONTAINERLAB_COMMAND_TIMEOUT_MINUTES` and `DIGITAL_TWIN_JOB_TIMEOUT_MINUTES`.
- SSH to lab nodes fails: verify fallback user config under `PLATFORM_ADD_CONFIG_LINES` and node startup command in `CONTAINERLAB_PLATFORM_MAP`.
- Unexpected config behavior: review remove/replace/add transforms in this order:
  - `REMOVE_CONFIG_LINES` and `PLATFORM_REMOVE_CONFIG_LINES`
  - `REPLACE_CONFIG_PATTERNS`
  - `PLATFORM_ADD_CONFIG_LINES`
- Buttons not visible on Location: confirm `LOCATION_TYPE_NAME` and run `nautobot-server ensure_digital_twin_job_buttons`.

## Source docs

- [Install and Configure](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/admin/install.md)
- [Upgrade](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/admin/upgrade.md)
- [Uninstall](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/admin/uninstall.md)
- [Compatibility Matrix](https://github.com/bsmeding/nautobot-app-nautobot-digital-twin/blob/main/docs/admin/compatibility_matrix.md)
