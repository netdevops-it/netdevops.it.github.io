---
authors: [bsmeding]
date: 2025-10-20
title: Enable shared folder on linux in VMware Fusion on Mac
tags: ["Linux", "fix", "VMware", "VMware Fusion", "virtualization"]
toc: true
layout: single
comments: true
draft: false
---

# Getting shared folder in Linux distro on Mac OSX with VMware Fusion

I recently got a new MacBook and want to setup my network automation and AI lab in a fresh virtual environment.
To get everything working i needed to copy some files from the host to the VM. VMware Fusion have a sharing option but this doesn't work out of the box on linux, Ubuntu in my case.

So because it was now the 3rd time i needed to search on the web, i write it down here so i can find it quicker next time.

![Make shared folder available](/images/ubuntu/make_shared_folder_available.png)
<!-- more -->

First install open-vm-tools
```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop -y
```

and reboot
```bash
sudo reboot
```

Then check if `/mnt/hgfs` exists, if not exist create it with the following commands:

```bash
sudo mkdir -p /mnt/hgfs
sudo vmhgfs-fuse .host:/ /mnt/hgfs -o allow_other
```

Now the shared folders must be available under `/mnt/hgfs`.
