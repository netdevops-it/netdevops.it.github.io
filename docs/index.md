---
title: Welcome to NetDevOps.it
tags:
  - netdevops
  - network automation
  - devops
  - ansible
  - infrastructure
  - blog
  - tutorials
  - sso
  - docker
summary: NetDevOps.it is your resource hub for network automation, tutorials, courses, and DevOps content. Ansible roles and Docker images by Bart Smeding live on bartsmeding.nl.
---

# Welcome to NetDevOps.it

## Your Gateway to Network Automation Excellence

Welcome to **NetDevOps.it**, a hub for network engineers and DevOps enthusiasts seeking to elevate their network automation skills. This site is dedicated to sharing knowledge, tools, and insights for mastering the art of **Network Development Operations**.

> **Note:** This site is under construction. New content is being added regularly, but some sections may not be fully operational yet.

---

## What is NetDevOps?

NetDevOps is an approach that brings modern DevOps principles and practices to network operations. It aims to improve agility, automation, and collaboration in network management by leveraging tools and methodologies commonly used in software development.

In traditional network operations, changes are often manual, error-prone, and slow. NetDevOps introduces automation, continuous integration/continuous deployment (CI/CD), and version control to enhance efficiency, consistency, and scalability.

### Key Principles of NetDevOps

1. **Automation**  
   Automate repetitive tasks such as configuration management, testing, and deployment to reduce human errors and increase operational efficiency.

2. **Infrastructure as Code (IaC)**  
   Define network infrastructure using code for consistency and repeatability. Popular tools include Ansible, Terraform, and Python.

3. **Continuous Integration/Continuous Deployment (CI/CD)**  
   Implement pipelines to validate and deploy network changes automatically using tools like GitLab CI/CD, Jenkins, and GitHub Actions.

4. **Collaboration**  
   Foster cross-functional teamwork between network engineers, developers, and operations using version control systems like Git.

5. **Monitoring and Feedback**  
   Integrate telemetry and monitoring solutions (e.g., Prometheus, Grafana, NetBox) for real-time insights into network performance.

### Benefits of NetDevOps

- **Increased Agility:** Faster deployment of network changes and new services
- **Improved Reliability:** Reduced downtime through automation and proactive monitoring
- **Enhanced Scalability:** Manage large-scale networks with consistent practices
- **Cost Efficiency:** Lower manual labor and operational overhead

---

## What You'll Find Here

NetDevOps.it is more than just a blog — it's a comprehensive resource library for network engineers. Here's what you can expect:

### 🛠️ **Ansible roles & Docker images (author-maintained)**

Roles, collections overview, and Docker Hub images I build and maintain are documented on my **[personal site — bartsmeding.nl](https://bartsmeding.nl/)** (e.g. [Ansible Roles & Collections](https://bartsmeding.nl/ansible_roles_and_collections/), [Docker images](https://bartsmeding.nl/docker_images/)). NetDevOps.it stays focused on tutorials, blog posts, and courses.

### 📚 **Step-by-Step Tutorials**
- **Ansible fundamentals** - from basic concepts to advanced techniques
- **Network automation workflows** - practical examples you can implement today
- **CI/CD pipelines** - integrating automation into your development process
- **Infrastructure as Code** - managing network configurations with version control

**Available Tutorials:**

- [Ansible Tutorial 1: Concepts](tutorials/ansible_tutorial_1_concepts.md) - Introduction to Ansible basics
- [Ansible Tutorial 2: Modules](tutorials/ansible_tutorial_2_modules.md) - Working with Ansible modules
- [Ansible Tutorial 3: Variables and Facts](tutorials/ansible_tutorial_3_variables_facts.md) - Using variables and gathering facts
- [Ansible Cisco NAPALM Diff](tutorials/ansible_cisco_napalm_diff.md) - Configuration comparison with NAPALM
- [Git Basics](tutorials/git_basics.md) - Version control fundamentals
- [Linux Basics](tutorials/linux_basics.md) - Essential Linux commands and concepts
- [Vagrant Install](tutorials/vagrant_install.md) - Setting up Vagrant for development
- [Synology Install Docker Compose](tutorials/synology_install_docker_compose.md) - Docker on Synology NAS
- [Enable WSL on Windows](tutorials/enable_wsl_on_windows.md) - Windows Subsystem for Linux setup

**Tutorials Overview:**

- [Tutorials Index](tutorials.md) - Complete list of available tutorials

### 🏗️ **Nautobot Integration**
- **Single Source of Truth (SSoT)** strategies for network automation
- **Dynamic inventory management** with Nautobot IPAM
- **Custom jobs and workflows** to streamline network operations
- **Integration patterns** with Ansible and other automation tools

**Nautobot Resources:**
- [Nautobot as SSoT/CMDB](nautobot_ssot.md) - Comprehensive guide to using Nautobot
- [Nautobot container image (author)](https://bartsmeding.nl/docker/docker_conatiner_nautobot/) — Docker image details on bartsmeding.nl

### 🔐 **SSO and Authentication Solutions**
- **Identity management** for network automation platforms
- **Secure access patterns** for enterprise environments
- **Integration guides** for popular SSO providers

**SSO Resources:**
- [SSO Solutions](sso.md) - Single Sign-On implementation guide

### 📖 **Blog and Insights**
- **Real-world project lessons** and case studies
- **Tool comparisons** and recommendations
- **Industry trends** and best practices
- **Community insights** and collaboration opportunities

**Latest Blog Posts:**

- [Nautobot Docker Apps](blog/posts/2025/2025-04-10-nautobot-docker-apps.md) - Deploying applications with Nautobot
- [Getting Started with Network Automation](blog/posts/2025/2025-03-17-getting-started-network-automation.md) - Beginner's guide to network automation
- [Netdata Monitoring System](blog/posts/2024/2024-11-15-netdata-monitoring-system.md) - Real-time monitoring solution

**Tool Reviews and Guides:**

- [Ansible](blog/posts/tools/ansible.md) - Configuration management and automation
- [Terraform](blog/posts/tools/terraform.md) - Infrastructure as Code
- [OpenTofu](blog/posts/tools/opentofu.md) - Open source Terraform alternative
- [SaltStack](blog/posts/tools/saltstack.md) - Configuration management platform
- [Nornir](blog/posts/tools/nornir.md) - Python-based automation framework
- [pyATS](blog/posts/tools/pyats.md) - Cisco's network testing framework
- [Jenkins](blog/posts/tools/jenkins.md) - CI/CD automation server
- [GitLab CI/CD](blog/posts/tools/gitlab-ci.md) - GitLab's CI/CD platform
- [GitHub Actions](blog/posts/tools/github-actions.md) - GitHub's CI/CD platform
- [Prometheus](blog/posts/tools/prometheus.md) - Monitoring and alerting
- [Grafana](blog/posts/tools/grafana.md) - Data visualization and analytics
- [InfluxDB](blog/posts/tools/influxdb.md) - Time series database
- [CloudFormation](blog/posts/tools/cloudformation.md) - AWS infrastructure as code

**Blog Index:**

- [Blog Overview](blog/index.md) - Complete blog archive

### 🎓 **Courses and Training**
- **Structured learning paths** for network automation
- **Hands-on workshops** and exercises
- **Certification preparation** resources
- **Skill development** roadmaps

**Available Courses:**

- [Courses Overview](courses.md) - Available training programs
- [Courses (Dutch)](courses_NL.md) - Training programs in Dutch

### 🤖 **AI in networking**

For **AI in networking** (CMDB, devices, agents), see **[AI in networking on bartsmeding.nl](https://bartsmeding.nl/ai/ai_in_networking/)**.

---

## Common NetDevOps Tools

| Category                  | Tools                                    |
|---------------------------|------------------------------------------|
| Configuration Management  | Ansible, SaltStack, Nornir |
| CI/CD Pipelines           | Jenkins, GitLab CI/CD, GitHub Actions |
| Infrastructure as Code    | Terraform, OpenTofu, CloudFormation |
| Network Automation        | Netmiko, NAPALM, pyATS |
| Monitoring & Telemetry    | Prometheus, Grafana, InfluxDB |
| Version Control           | Git, GitHub, GitLab |

---

## How to Get Started with NetDevOps

1. **Learn the Fundamentals:** Understand automation tools and scripting languages (e.g., Python)
2. **Use Version Control:** Start using Git for tracking changes and collaboration
3. **Automate Small Tasks:** Begin by automating simple tasks such as configuration backups
4. **Implement CI/CD Pipelines:** Gradually introduce automation pipelines to your network operations
5. **Leverage Infrastructure as Code:** Define and manage your network infrastructure using code

---

## Site author

This site is maintained by **Bart Smeding**. For a profile, open-source roles and Docker images, and contact details, see **[bartsmeding.nl](https://bartsmeding.nl/)**. You can also connect on [LinkedIn](https://www.linkedin.com/in/bartsmeding/).

---

## Quick Navigation

### 🚀 **Getting Started**
- [Ansible Tutorial 1: Concepts](tutorials/ansible_tutorial_1_concepts.md)
- [Git Basics](tutorials/git_basics.md)
- [Linux Basics](tutorials/linux_basics.md)
- [Getting Started with Network Automation](blog/posts/2025/2025-03-17-getting-started-network-automation.md)

### 🛠️ **Automation Tools**
- [Ansible roles & Docker (author)](https://bartsmeding.nl/ansible_roles_and_collections/)
- [Ansible Tutorials](tutorials.md)
- [Ansible Tool Guide](blog/posts/tools/ansible.md)

### 🏗️ **Network Management**
- [Nautobot SSoT](nautobot_ssot.md)
- [Nautobot Docker Apps](blog/posts/2025/2025-04-10-nautobot-docker-apps.md)

### 🐳 **Container Solutions**
- [Docker images (author)](https://bartsmeding.nl/docker_images/)
- [Nautobot container image (author)](https://bartsmeding.nl/docker/docker_conatiner_nautobot/)

### 🔐 **Security & Authentication**
- [SSO Solutions](sso.md)

### 📖 **Blog & Insights**
- [Blog Index](blog/index.md)
- [Latest Posts](blog/posts/2025/)
- [Tool Reviews](blog/posts/tools/)

### 🎓 **Learning Resources**
- [Courses](courses.md)
- [Tutorials Index](tutorials.md)
- [AI in networking (author)](https://bartsmeding.nl/ai/ai_in_networking/)

### 👤 **Profile & contact**
- [bartsmeding.nl](https://bartsmeding.nl/) — profile, Ansible roles, Docker images, contact
- [LinkedIn](https://www.linkedin.com/in/bartsmeding/)

---

## Let's Connect

Have questions or want to collaborate? Feel free to reach out or connect with me on [LinkedIn](https://www.linkedin.com/in/bartsmeding/).

---

### Together, Let's Build the Future of Network Automation

Explore, learn, and automate — because the future of networking is here, and it's automated.
