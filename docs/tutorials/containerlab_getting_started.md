---
title: Containerlab getting started
tags:
  - containerlab
  - tutorial
  - getting started
  - images
  - arista
  - nokia
  - vscode
  - cursor
---

# Getting started with containerlab

Containerlab is a powerful tool for creating and managing container-based network labs. This tutorial will guide you through the basic setup process to get your first network topology running quickly.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Installation](#quick-installation)
- [Downloading Network Images](#downloading-network-images)
- [Creating Your First Topology](#creating-your-first-topology)
- [Basic Commands](#basic-commands)
- [VS Code/Cursor IDE Integration](#vs-codecursor-ide-integration)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Prerequisites

Before starting with containerlab, ensure you have the following installed:

- **Docker**: Containerlab relies on Docker to run network device containers
- **Linux/macOS**: Containerlab works best on Linux and macOS systems
- **Git**: For cloning repositories and managing configurations
- **Network tools**: Basic networking knowledge and tools like `ping`, `ssh`, `telnet`

## Quick Installation

### Step 1: Install Docker

For the most up-to-date Docker installation instructions, visit the official Docker documentation:

- **[Docker Installation Guide](https://docs.docker.com/get-docker/)** - Official installation instructions for all platforms
- **[Docker Desktop](https://www.docker.com/products/docker-desktop)** - For Windows and macOS users

**Quick verification after installation:**
```bash
# Verify Docker installation
docker --version
docker run hello-world
```

### Step 2: Install ContainerLab

```bash
# Download and run the installation script
bash -c "$(curl -sL https://get.containerlab.dev)"

# Verify installation
containerlab version
```

## Add useraccount to groups
Add your user account to the following groups:

```bash
sudo usermod -a -G docker <username>
sudo usermod -a -G clab_admins <username>
```

!!! info "When is each group needed?"
    - **`docker`** — Required for Containerlab to talk to the Docker daemon (pull images, create and run lab containers). Without it, you cannot run labs.
    - **`clab_admins`** — Only needed when the Containerlab binary is installed with the SUID bit and restricted to this group. Then only root or users in `clab_admins` are allowed to run `containerlab`.

    After adding yourself to a group, log out and back in (or reboot) so the new group membership takes effect.

!!! warning "Root-level privileges"
    Much like the docker group, any users part of the `clab_admins` group are effectively given root-level privileges to the system running Containerlab.

    If this group does not exist and the binary still has the SUID bit set, any user who can run Containerlab should be treated as having root privileges.

## Downloading Network Images

Containerlab supports various network vendor images. Here's how to download and import the most popular ones:

### Downloading Arista cEOS Image

1. **Create an Arista account**:
   - Go to https://www.arista.com
   - Create an account or login to your existing account

2. **Navigate to software downloads**:
   - Go to Support → Software Download

3. **Select cEOS version**:
   - Choose your desired cEOS version
   - Download the `cEOS64-<version>.tar.xz` file

4. **Import the image**:
```bash
# Import container image and save it under short ceos:4.34.2F name
docker import cEOS64-lab-4.34.2F.tar.xz ceos:4.34.2F

# Verify the image is imported
docker images | grep ceos
```

### Downloading Nokia SR Linux Image

Nokia SR Linux is available as a public container image and can be pulled directly:

```bash
# Pull Nokia SR Linux image from GitHub Container Registry
docker pull ghcr.io/nokia/srlinux

# Verify the image is downloaded
docker images | grep srlinux
```

### Downloading Alpine Linux Image

Alpine Linux is a lightweight Linux distribution perfect for testing and automation:

```bash
# Pull Alpine Linux image
docker pull alpine:latest

# Verify the image is downloaded
docker images | grep alpine
```

## Creating Your First Topology

### Basic Topology File

Create a simple topology file named `lab.yml`:

```yaml
name: my-first-lab
topology:
  nodes:
    # Arista cEOS switch
    switch1:
      kind: ceos
      image: ceos:4.34.2F
      
    # Nokia SR Linux router
    router1:
      kind: srl
      image: ghcr.io/nokia/srlinux
      
    # Linux host for testing
    host1:
      kind: linux
      image: alpine:latest

  links:
    - endpoints: ["switch1:eth1", "router1:eth1"]
    - endpoints: ["host1:eth1", "switch1:eth2"]

mgmt:
  network: mgmt-net
  ipv4-subnet: 172.20.20.0/24
```

### Deploy Your First Lab

```bash
# Deploy the lab
containerlab deploy -t lab.yml

# Check lab status
containerlab list

# Show lab topology
containerlab inspect --name my-first-lab
```

## Basic Commands

### Lab Management

```bash
# Deploy a lab
containerlab deploy -t lab.yml

# List running labs
containerlab list

# Show lab topology
containerlab inspect --name my-first-lab

# Connect to a device
containerlab connect --name switch1

# Destroy a lab
containerlab destroy --name my-first-lab

# Destroy all labs
containerlab destroy --all
```

### Device Access

```bash
# SSH to a device (if configured)
ssh admin@172.20.20.10

# Execute commands on device
containerlab exec --name switch1 --cmd "show version"

# Access device shell
containerlab exec --name switch1
```

## VS Code/Cursor IDE Integration

ContainerLab provides excellent integration with VS Code and Cursor IDE through the official ContainerLab extension, making it easy to manage labs, edit topologies visually, and view network diagrams.

### Installing the ContainerLab Extension

1. **Open VS Code or Cursor IDE**
2. **Go to Extensions** (Ctrl+Shift+X)
3. **Search for "ContainerLab"**
4. **Install the official ContainerLab extension**

### Extension Features

#### Lab Management
- **Deploy/Destroy labs** directly from the IDE
  ![Deploy Lab](/images/tools/containerlab/containerlab_extension_start_lab.png)
- **List running labs** with status information
- **Connect to devices** with one click
- **Execute commands** on network devices

#### Visual Topology Editor (TopoEditor)
- **Drag-and-drop interface** for creating topologies
- **Visual node placement** and connection management
- **Real-time topology validation**
- **Export to YAML** format

#### Topology Visualization
- **Web-based viewer** for topology diagrams
- **Draw.io integration** for custom diagrams
- **TopoViewer** for interactive topology exploration
- **Export to various formats** (PNG, SVG, PDF)

### Using the Extension

#### 1. Open a ContainerLab Project
```bash
# Create a new lab directory
mkdir my-containerlab-project
cd my-containerlab-project

# Open in VS Code/Cursor
code .  # or cursor .
```

#### 2. Create a Topology File
Create a `lab.yml` file in your project:

```yaml
name: simple-lab
topology:
  nodes:
    switch1:
      kind: ceos
      image: ceos:4.34.2F
    router1:
      kind: srl
      image: ghcr.io/nokia/srlinux
    host1:
      kind: linux
      image: alpine:latest
  links:
    - endpoints: ["switch1:eth1", "router1:eth1"]
    - endpoints: ["host1:eth1", "switch1:eth2"]
mgmt:
  network: mgmt-net
  ipv4-subnet: 172.20.20.0/24
```

#### 3. Use the Extension Commands
- **Ctrl+Shift+P** to open command palette
- **Type "ContainerLab"** to see available commands:
  - `ContainerLab: Deploy Lab`
  - `ContainerLab: Destroy Lab`
  - `ContainerLab: List Labs`
  - `ContainerLab: Open Topology View`
  - `ContainerLab: Connect to Device`

#### 4. Visual Topology Editor
- **Right-click on lab.yml** → "Open with TopoEditor"
  ![Open with TopoEditor](/images/tools/containerlab/containerlab_topologyeditor.png)
- **Drag nodes** from the palette to the canvas
- **Connect nodes** by dragging between ports
- **Configure node properties** in the sidebar
- **Save and export** your topology

#### 5. Topology Visualization
- **Right-click on lab.yml** → "Open Topology View"
- **Interactive diagram** showing your lab topology
- **Click on nodes** to see details
- **Export diagram** in various formats

### Extension Configuration

Create a `.vscode/settings.json` file in your project:

```json
{
  "containerlab.imagesPath": "./images",
  "containerlab.labsPath": "./labs",
  "containerlab.configsPath": "./configs",
  "containerlab.defaultTopology": "lab.yml",
  "containerlab.autoDeploy": false,
  "containerlab.autoDestroy": true
}
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` → "ContainerLab: Deploy" | Deploy current lab |
| `Ctrl+Shift+P` → "ContainerLab: Destroy" | Destroy current lab |
| `Ctrl+Shift+P` → "ContainerLab: List" | List running labs |
| `Ctrl+Shift+P` → "ContainerLab: Connect" | Connect to selected device |

### Tips for Using the Extension

1. **Organize your projects** with separate directories for each lab
2. **Use the visual editor** for complex topologies
3. **Leverage the topology viewer** for documentation
4. **Set up keyboard shortcuts** for common operations
5. **Use the integrated terminal** for advanced commands

## Troubleshooting

### Common Issues

1. **Image Import Errors**:
```bash
# Check if image exists
docker images | grep ceos

# Re-import if needed
docker import cEOS64-lab-4.34.2F.tar.xz ceos:4.34.2F
```

2. **Network Connectivity Issues**:
```bash
# Check bridge networks
docker network ls

# Inspect network configuration
docker network inspect containerlab

# Restart containerlab network
containerlab destroy --all
containerlab deploy -t lab.yml
```

3. **Permission Issues**:
```bash
# Ensure user is in docker group
sudo usermod -aG docker $USER

# Restart docker service
sudo systemctl restart docker
```

4. **Extension Issues**:
```bash
# Check ContainerLab installation
containerlab version

# Verify Docker is running
docker ps

# Check extension logs in VS Code/Cursor
# View → Output → ContainerLab
```

### Debug Commands

```bash
# Enable debug mode
containerlab --debug deploy -t lab.yml

# Check containerlab version and configuration
containerlab version
containerlab --help

# Validate topology file
containerlab validate -t lab.yml

# Show detailed lab information
containerlab inspect --name my-lab --all
```

## Next Steps

Now that you have containerlab set up, you can:

1. **Explore more topologies**: Try different network designs and vendor combinations
2. **Learn advanced features**: Check out the [ContainerLab Extended Configurations](/tutorials/containerlab_extended_configurations/) tutorial
3. **Integrate with automation**: Use Ansible, Python, or other tools to automate lab operations
4. **Build CI/CD pipelines**: Automate lab testing and validation
5. **Create training environments**: Build labs for network training and certification

For more advanced topics, check out:
- [ContainerLab Extended Configurations](/tutorials/containerlab_extended_configurations/) - Advanced features and automation
- [ContainerLab Overview and Installation](/blog/posts/tools/containerlab.html) - Comprehensive guide
- [Building a Reusable Network Automation Lab](/blog/posts/2025/2025-08-10-building-reusable-network-automation-lab-with-containerlab.html) - Complete lab example
- [Containerlab Documentation](https://containerlab.dev/)

Happy labbing! 🚀

