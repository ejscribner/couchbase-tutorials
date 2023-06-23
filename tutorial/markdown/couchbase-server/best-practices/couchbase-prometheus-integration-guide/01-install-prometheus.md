---
# frontmatter
path: "/tutorial-install-prometheus"
title: Install Prometheus
short_title: Install Prometheus
description: 
  - Learn how to install and configure Prometheus as a standalone instance
  - Gain access the Prometheus UI
  - Allow the necessary port(s) through the firewall if needed
content_type: tutorial
filter: observability
technology: 
  - server
tags:
  - Prometheus
  - Monitoring
  - Observability
  - Configuration
sdk_language:
  - any
length: 15 Mins
---

The following will walk you through how to install and configure Prometheus. This should NOT be installed on a Couchbase node, but rather on a standalone server in the same network as your Couchbase cluster.

## Download Prometheus

[Download](https://github.com/prometheus/prometheus/releases/download/v2.24.0/prometheus-2.24.0.linux-amd64.tar.gz) the Prometheus binary to the server that you will use for Prometheus.

```bash
wget \
  https://github.com/prometheus/prometheus/releases/download/v2.24.0/prometheus-2.24.0.linux-amd64.tar.gz
```

Visit the Prometheus [downloads page](https://prometheus.io/download/) for the latest version.

## Create User

Create a Prometheus user, required directories, and make prometheus user as the owner of those directories.

```bash
sudo groupadd -f prometheus
sudo useradd -g prometheus --no-create-home --shell /bin/false prometheus
sudo mkdir /etc/prometheus
sudo mkdir /var/lib/prometheus
sudo chown prometheus:prometheus /etc/prometheus
sudo chown prometheus:prometheus /var/lib/prometheus
```

## Unpack Prometheus Binary

Untar and move the downloaded Prometheus binary

```bash
tar -xvf prometheus-2.24.0.linux-amd64.tar.gz
mv prometheus-2.24.0.linux-amd64 prometheus-files
```

## Install Prometheus

Copy `prometheus` and `promtool` binary from `prometheus-files` folder to `/usr/bin` and change the ownership to prometheus user.

```bash
sudo cp prometheus-files/prometheus /usr/bin/
sudo cp prometheus-files/promtool /usr/bin/
sudo chown prometheus:prometheus /usr/bin/prometheus
sudo chown prometheus:prometheus /usr/bin/promtool
```

## Install Prometheus Libraries

Move the `prometheus.yml`, `consoles` and `console_libraries` directories from `prometheus-files` to `/etc/prometheus` folder and change the ownership to prometheus user.

```bash
sudo cp -r prometheus-files/consoles /etc/prometheus
sudo cp -r prometheus-files/console_libraries /etc/prometheus
sudo cp prometheus-files/prometheus.yml /etc/prometheus/prometheus.yml
sudo chown -R prometheus:prometheus /etc/prometheus/consoles
sudo chown -R prometheus:prometheus /etc/prometheus/console_libraries
sudo chown prometheus:prometheus /etc/prometheus/prometheus.yml
```

## Setup Prometheus Service

Create a prometheus service file.

```bash
sudo vi /usr/lib/systemd/system/prometheus.service
```

Add the following configuration and save the file

```bash
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
```

```bash
sudo chmod 664 /usr/lib/systemd/system/prometheus.service
```

**Note:** Prometheus is configured to use `/var/lib/prometheus` as it's tsdb storage location, ensure there is enough space available.

## Reload systemd and Register Prometheus

Reload the `systemd` service to register the prometheus service and start the prometheus service.

```bash
sudo systemctl daemon-reload
sudo systemctl start prometheus
```

Check the prometheus service status using the following command.

```bash
sudo systemctl status prometheus
```

Configure Prometheus to start at boot

```bash
sudo systemctl enable prometheus.service
```

![Prometheus Status](./assets/prometheus-status.png)

If `firewalld` is enabled and running, add a rule for port `9090`

```bash
sudo firewall-cmd --permanent --zone=public --add-port=9090/tcp
sudo firewall-cmd --reload
```

## Access Prometheus UI

Now you will be able to access the prometheus UI on `9090` port of the prometheus server.

```bash
http://<prometheus-ip>:9090/graph
```

You should be able to see the following UI as shown below.

![Prometheus UI](./assets/prometheus-ui.png)

## Clean Up

Remove the download and temporary files

```bash
rm -rf prometheus-2.24.0.linux-amd64.tar.gz prometheus-files
```
