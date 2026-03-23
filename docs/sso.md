---
title: Single Sign-On (SSO) for tools
tags:
  - sso
  - single sign-on
  - ldap
  - authelia
  - authentication
  - ansible
  - devops
---

# Single Sign-On (SSO) for Network Automation

Single Sign-On (SSO) is a user authentication process that allows users to access multiple applications with one set of login credentials. SSO is essential for modern network automation, improving security, user experience, and centralized access control.

## What is SSO?
SSO enables users to log in once and gain access to a variety of systems without being prompted to log in again for each one. It is commonly used in enterprise environments to streamline authentication across web apps, network devices, and automation tools.

## Benefits of SSO
- **Centralized authentication:** Manage user access in one place (e.g., LDAP, Active Directory)
- **Improved security:** Enforce strong password policies and multi-factor authentication
- **Better user experience:** Fewer passwords to remember, seamless access to tools
- **Easier compliance:** Simplified auditing and access control

## Common SSO Solutions
- **LDAP/Active Directory:** The most common backend for SSO in network automation
- **Authelia:** Modern open-source SSO and 2FA portal, integrates with Nginx, SWAG, and more
- **SAML/OAuth:** Used for web-based SSO with cloud services and enterprise apps

## SSO in Network Automation
Many of the roles and solutions on this site support SSO out of the box or via integration:

- **Nginx Docker:** Can be configured as a reverse proxy with LDAP or Authelia SSO ([see role doc](https://bartsmeding.nl/ansible/ansible_role_nginx_docker/))
- **SWAG (Secure Web Application Gateway):** Supports LDAP and Authelia for SSO ([see role doc](https://bartsmeding.nl/ansible/ansible_role_swag_docker/))
- **GitLab CE Docker:** Integrates with LDAP for SSO ([see role doc](https://bartsmeding.nl/ansible/ansible_role_gitlab_docker/))
- **Nautobot Docker:** Supports LDAP authentication for SSO ([see role doc](https://bartsmeding.nl/ansible/ansible_role_nautobot_docker/))

## How to Integrate SSO
1. **Set up an LDAP or Authelia server** (see tutorials or use a role)
2. **Configure your reverse proxy (Nginx, SWAG) to use SSO**
3. **Enable SSO in your application (GitLab, Nautobot, etc.)**
4. **Test login and access control**

## Related Tutorials and Docs
- [Nginx Docker Role](https://bartsmeding.nl/ansible/ansible_role_nginx_docker/)
- [SWAG Docker Role](https://bartsmeding.nl/ansible/ansible_role_swag_docker/)
- [GitLab CE Docker Role](https://bartsmeding.nl/ansible/ansible_role_gitlab_docker/)
- [Nautobot Docker Role](https://bartsmeding.nl/ansible/ansible_role_nautobot_docker/)
- [LDAP/Authelia setup (coming soon)]

---
