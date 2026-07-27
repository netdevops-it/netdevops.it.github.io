#!/usr/bin/env python3
"""
Script to extract devices from a Nautobot site/location and generate a pyATS testbed YAML file.

Supports both Nautobot 1.x (site field) and Nautobot 2.x (locations of type 'site').

Environment variables required:
- NAUTOBOT_URL: Nautobot API base URL (e.g., https://nautobot.example.com/api/)
- NAUTOBOT_TOKEN: Nautobot API token
- NAUTOBOT_SITE: Name or slug of the site/location to extract devices from

Usage:
  export NAUTOBOT_URL=https://nautobot.example.com/api/
  export NAUTOBOT_TOKEN=yourtoken
  export NAUTOBOT_SITE=ams-dc1
  python3 nautobot_to_pyats_testbed.py > testbed.yml
"""
import os
import sys
import requests
import yaml

NAUTOBOT_URL = os.environ.get("NAUTOBOT_URL")
NAUTOBOT_TOKEN = os.environ.get("NAUTOBOT_TOKEN")
NAUTOBOT_SITE = os.environ.get("NAUTOBOT_SITE")

if not (NAUTOBOT_URL and NAUTOBOT_TOKEN and NAUTOBOT_SITE):
    print("Error: Please set NAUTOBOT_URL, NAUTOBOT_TOKEN, and NAUTOBOT_SITE environment variables.", file=sys.stderr)
    sys.exit(1)

HEADERS = {
    "Authorization": f"Token {NAUTOBOT_TOKEN}",
    "Accept": "application/json",
}

def get_location_id(site_name):
    # For Nautobot 2.x: get location with type 'site'
    url = f"{NAUTOBOT_URL.rstrip('/')}/dcim/locations/?location_type=site&name={site_name}"
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    results = resp.json().get("results", [])
    if results:
        return results[0]["id"]
    return None

def get_devices(site):
    # Try Nautobot 2.x locations first
    location_id = get_location_id(site)
    if location_id:
        url = f"{NAUTOBOT_URL.rstrip('/')}/dcim/devices/?location_id={location_id}&limit=1000"
        resp = requests.get(url, headers=HEADERS)
        resp.raise_for_status()
        return resp.json().get("results", [])
    # Fallback to Nautobot 1.x site field
    url = f"{NAUTOBOT_URL.rstrip('/')}/dcim/devices/?site={site}&limit=1000"
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    return resp.json().get("results", [])

def get_primary_ip(device):
    ip = device.get("primary_ip4") or device.get("primary_ip")
    if ip and ip.get("address"):
        return ip["address"].split("/")[0]
    return None

def build_testbed(devices):
    testbed = {"devices": {}}
    for dev in devices:
        name = dev["name"]
        os_type = dev.get("platform", {}).get("slug", "iosxe")
        mgmt_ip = get_primary_ip(dev)
        if not mgmt_ip:
            continue  # skip devices without management IP
        testbed["devices"][name] = {
            "os": os_type,
            "type": dev.get("device_type", {}).get("model", "router"),
            "connections": {
                "cli": {
                    "protocol": "ssh",
                    "ip": mgmt_ip
                }
            },
            "credentials": {
                "default": {
                    "username": "<username>",
                    "password": "<password>"
                }
            }
        }
    return testbed

if __name__ == "__main__":
    devices = get_devices(NAUTOBOT_SITE)
    if not devices:
        print(f"No devices found for site/location '{NAUTOBOT_SITE}'.", file=sys.stderr)
        sys.exit(1)
    testbed = build_testbed(devices)
    yaml.dump(testbed, sys.stdout, default_flow_style=False, sort_keys=False) 