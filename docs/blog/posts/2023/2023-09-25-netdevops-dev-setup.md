---
authors: [bsmeding]
toc: true
date: 2023-09-25
layout: single
comments: true
title: Network Automation Development Setup
summary: A step-by-step guide to setting up a full network automation development environment with Docker, AWX, Nautobot, and more.
tags: ["ansible", "netdevops", "devnetops", "student", "course", "git", "gitea", "nginx", "awx", "lldap", "docker"]
---

# NetDevOps Dev Setup

Setting up a modern development environment for network automation can be challenging. In this post, I'll walk you through my NetDevOps dev setup, including tools, tips, and best practices.

<!-- more -->

Repository: [network_automation_dev_setup](https://github.com/bsmeding/network_automation_dev_setup)

---

## Features
- Install Docker
- Install LLDAP server
- Install Nautobot CMDB
- Install AWX
- Install Gitea
- Install Nginx

---

## ⚠️ Warning
**This setup is for DEV/TEST only. Do NOT use in production environments!**

---

## Setup Instructions

1. **Update and restart your target machine.**
2. **Install dependencies:**
   - Debian/Ubuntu:
     ```bash
     sudo apt install python3-pip git
     ```
   - CentOS/RHEL:
     ```bash
     sudo yum install python3-pip git
     ```
3. **Clone the repository:**
   ```bash
   git clone https://github.com/bsmeding/network_automation_dev_setup
   cd network_automation_dev_setup
   ```
4. **As a non-root user:**
   - Install Python dependencies:
     ```bash
     pip3 install -r requirements.txt
     ```
   - Install Ansible roles:
     ```bash
     ansible-galaxy install -r ./roles/requirements.yml
     ```
   - Install Ansible collections:
     ```bash
     ansible-galaxy install -r ./collections/requirements.yml
     ```
   - Edit the `inventory` file and set correct IP addresses.
   - Edit `group_vars/all` and add your login username.
   - Install Nautobot:
     ```bash
     ansible-playbook install_nautobot.yml -i ./inventory -kK
     ```

---

## Updating
- Update roles:
  ```bash
  ansible-galaxy install -r ./roles/requirements.yml --force
  ```
- Update collections:
  ```bash
  ansible-galaxy install -r ./collections/requirements.yml --force
  ```
- To update images/versions, check the variables section or re-run the playbook to pull the latest image.

---

## Variables
Variables can be set in the playbook, or in `group_vars` or `host_vars` files. All roles have defaults that can be overridden.

See role variables for:
- [Docker](https://github.com/bsmeding/ansible_role_docker/blob/main/defaults/main.yml)
  - Also see [geerlingguy.docker role](https://github.com/geerlingguy/ansible-role-docker/blob/master/defaults/main.yml)
- [Nautobot](https://github.com/bsmeding/ansible_role_nautobot_docker/blob/1.1.0/defaults/main.yml)
- [Ansible AWX](https://github.com/bsmeding/ansible_role_awx_docker/blob/1.1.0/defaults/main.yml)
- [LDAP](https://github.com/bsmeding/ansible_role_lldap_docker)
- [Nginx Reverse Proxy](https://github.com/bsmeding/ansible_role_nginx_docker/blob/main/defaults/main.yml)

---

## Full Install
To install all tools on one server, use the `install_full.yml` playbook. Make sure the hostname (e.g. `srv1`) matches your inventory file.

All settings for the full install are in `roles/full_install_config/defaults/main.yml` of the playbook repository.

**Full install will:**
- Install Docker
- Install LLDAP server
- Install Nautobot CMDB
- Install AWX
- Install Gitea
- Install Nginx
- Configure LLDAP as authentication source for Nautobot and AWX (Gitea must be set manually)
- Configure Nginx to serve all containers on port 80/443 based on URL

---

## URLs
Change URLs according to your setup and/or DNS settings. Or add these to your local hosts file:
```
<serverip>  git.lab.local cmdb.lab.local awx.lab.local ldap.lab.local
```

---

## Default Logins

### LDAP
- Login: `admin` / `devnetops`
- URL: `http://<serverip>:8080` or `http://ldap.lab.local`
- Default users:
  - `user01` / `password01`
  - `user02` / `password02`

### Nautobot
- Login: `admin` / `devnetops` or LDAP
- URL: `http://<serverip>:8081` or `http://cmdb.lab.local`

### Gitea
- First user created via registration form is admin
- URL: `http://<serverip>:8082` or `http://git.lab.local`
- To add LDAP to Gitea, see [this guide](https://github.com/nitnelave/lldap/blob/main/example_configs/gitea.md)
- LDAP server: `ldap` (container name, as all containers share a Docker network)

### AWX
- URL: `http://<serverip>:8083` or `http://awx.lab.local`
- Login: `admin` / `devnetops` or LDAP 