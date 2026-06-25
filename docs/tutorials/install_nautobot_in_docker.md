# Deploy Production-Ready Nautobot with Docker

This tutorial provides two methods for deploying a production-ready Nautobot instance using Docker:

1. **Docker Compose** - Simple deployment with a single configuration file
2. **Ansible** - Automated deployment with infrastructure as code

## Navigation

- [Install Nautobot in Docker](install_nautobot_in_docker.md) (current)
- [Install Nautobot Development Environment in Docker](install_nautobot_development_in_docker.md)

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- Basic knowledge of Docker and containerization
- For Ansible method: Ansible installed on your control machine

## Method 1: Docker Compose Deployment

### Step 1: Create Project Directory

```bash
mkdir nautobot-docker
cd nautobot-docker
```

### Step 2: Create Docker Compose File

Create a `docker-compose.yml` file with the following content:

```yaml
services:
  nautobot:
    # image: networktocode/nautobot:stable
    # image: bsmeding/nautobot:2.1.9-py3.11
    container_name: nautobot
    image: &shared_image bsmeding/nautobot:2.4
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
    image: postgres:13-alpine
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
      # - ./mapped_folders/postgres-data:/var/lib/postgresql/data             # Not possible with compose due to folder permissions, use docker volume instead  
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

### Step 3: Configure Environment Variables

Create a `.env` file with your production settings:

```bash
# Database Configuration
POSTGRES_DB=nautobot
POSTGRES_USER=nautobot
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=db

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Nautobot Configuration
NAUTOBOT_SECRET_KEY=your_secret_key_here
NAUTOBOT_ALLOWED_HOSTS=your_domain.com,localhost
NAUTOBOT_DEBUG=False
NAUTOBOT_TIME_ZONE=UTC

# Email Configuration (optional)
EMAIL_HOST=smtp.your_provider.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@domain.com
EMAIL_PASSWORD=your_email_password
EMAIL_USE_TLS=True
```

### Step 4: Generate Secret Key

Generate a secure secret key for Nautobot:

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Replace `your_secret_key_here` in the `.env` file with the generated key.

### Step 5: Deploy with Docker Compose

```bash
# Start the services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 6: Initialize Nautobot

```bash
# Create a superuser
docker-compose exec nautobot nautobot-server createsuperuser

# Run initial migrations
docker-compose exec nautobot nautobot-server migrate

# Collect static files
docker-compose exec nautobot nautobot-server collectstatic --no-input
```

### Step 7: Access Nautobot

Navigate to `http://your_domain.com` or `http://localhost:8080` to access your Nautobot instance.

## Method 2: Ansible Deployment

This method uses Ansible to automate the deployment of Nautobot with Docker. It's ideal for repeatable, scalable, and production-grade installations.

**Prerequisites:**
- Ansible installed on your control machine (`pip install ansible`)
- SSH access to your target server(s)
- The Ansible roles `bsmeding.docker` and `bsmeding.nautobot_docker` (see below)
- Your target server(s) should be accessible via SSH and have Python installed

**Install the required Ansible roles from Ansible Galaxy:**

```bash
ansible-galaxy role install bsmeding.docker bsmeding.nautobot_docker
```

### Step 1: Clone the Ansible Role

```bash
git clone https://github.com/bsmeding/ansible_role_nautobot_docker.git
cd ansible_role_nautobot_docker
```

### Step 2: Create Inventory File

Create an `inventory.yml` file:

```yaml
all:
  children:
    nautobot_servers:
      hosts:
        your_server:
          ansible_host: your_server_ip
          ansible_user: your_ssh_user
          ansible_ssh_private_key_file: ~/.ssh/your_key
```

### Step 3: Create Playbook

Create a `deploy_nautobot.yml` playbook:

```yaml
---
- name: Install Nautobot
  hosts: nautobot_servers
  gather_facts: true
  become: yes
  vars:
    nautobot_version: "latest"
    nautobot_secret_key: "your_secret_key_here"
    nautobot_allowed_hosts: "your_domain.com,localhost"
    nautobot_debug: false
    nautobot_time_zone: "UTC"
    
    # Database configuration
    postgres_db: "nautobot"
    postgres_user: "nautobot"
    postgres_password: "your_secure_password_here"
    
    # Redis configuration
    redis_host: "redis"
    redis_port: 6379
    
    # Email configuration (optional)
    email_host: "smtp.your_provider.com"
    email_port: 587
    email_username: "your_email@domain.com"
    email_password: "your_email_password"
    email_use_tls: true
    
    # Docker configuration
    docker_compose_version: "2.20.0"
    nautobot_port: 8080
    
  tasks:
    - name: Check if Docker is installed
      include_role:
        name: bsmeding.docker

    - name: Check if Nautobot is installed
      include_role:
        name: bsmeding.nautobot_docker
```