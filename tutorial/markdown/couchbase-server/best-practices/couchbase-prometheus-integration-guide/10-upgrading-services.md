---
# frontmatter
path: "/tutorial-upgrading-services"
title: Upgrading Services
short_title: Upgrading Services
description: 
  - Learn how to upgrade all monitoring services
  - This can be used for reference when performing ongoing maintenance for your project
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
length: 30 Mins
---

1. [Upgrade Prometheus](#upgrade-prometheus)
2. [Upgrade Node Exporter](#upgrade-node-exporter)
3. [Upgrade Process Exporter](#upgrade-process-exporter)
4. [Upgrade Couchbase Exporter](#upgrade-couchbase-exporter)
5. [Upgrade AlertManager](#upgrade-alertmanager)
6. [Upgrade Grafana](#upgrade-grafana)

## Upgrade Prometheus

In the final tutorial of the Prometheus Integration learning path, we will upgrade all of our services installed in our application. This can be used for reference in the future as part of ongoing maintenance of your project, so be sure to bookmark this page.

### Download Latest Prometheus Binary

Visit the Prometheus [downloads page](https://prometheus.io/download/) for the latest version.  Copy the correct link and download the Prometheus binary to the server that you will upgrade Prometheus on.  

```bash
wget \
  https://github.com/prometheus/prometheus/releases/download/v2.18.0/prometheus-2.18.0.linux-amd64.tar.gz
```

### Unpack Prometheus Binary

Untar and move the downloaded Prometheus binary

```bash
tar -xvf prometheus-2.18.0.linux-amd64.tar.gz
mv prometheus-2.18.0.linux-amd64 prometheus-files
```

### Stop Prometheus Service

The executable that we're replacing is in use, so we need to stop the service so it can be replaced.

```bash
sudo systemctl stop prometheus.service
```

### Install Prometheus

Copy `prometheus` and `promtool` binary from prometheus-files folder to `/usr/bin` and change the ownership to prometheus user.

```bash
sudo cp prometheus-files/prometheus /usr/bin/
sudo cp prometheus-files/promtool /usr/bin/
sudo chown prometheus:prometheus /usr/bin/prometheus
sudo chown prometheus:prometheus /usr/bin/promtool
```

### Install Prometheus Libraries

Move the `consoles` and `console_libraries` directories from `prometheus-files` to `/etc/prometheus` folder and change the ownership to prometheus user.

```bash
sudo cp -r prometheus-files/consoles /etc/prometheus
sudo cp -r prometheus-files/console_libraries /etc/prometheus
sudo chown -R prometheus:prometheus /etc/prometheus/consoles
sudo chown -R prometheus:prometheus /etc/prometheus/console_libraries
```

### Start Prometheus

Restart the Prometheus service

```bash
sudo systemctl start prometheus.service
```

### Clean Up Prometheus Files

Remove the download and temporary files

```bash
rm -rf prometheus-2.18.0.linux-amd64.tar.gz prometheus-files
```

## Upgrade Node Exporter

### Download Latest Binary

Visit the Prometheus [downloads page](https://prometheus.io/download/) for the latest version.  Copy the correct link and download the Prometheus binary to the server that you will upgrade Prometheus on.  

```bash
wget \
  https://github.com/prometheus/node_exporter/releases/download/v0.18.1/node_exporter-0.18.1.darwin-amd64.tar.gz
```

### Unpack

Untar and move the downloaded Node Exporter binary

```bash
tar -xvf node_exporter-0.18.1.linux-amd64.tar.gz
mv node_exporter-0.18.1.linux-amd64 node_exporter-files
```

### Stop Node Exporter Service

The executable that we're replacing is in use, so we need to stop the service so it can be replaced.

```bash
sudo systemctl stop node_exporter.service
```

### Install Node Exporter

Copy `node_exporter` binary from `node_exporter-files` folder to `/usr/bin` and change the ownership to prometheus user.

```bash
sudo cp node_exporter-files/node_exporter /usr/bin/
sudo chown node_exporter:node_exporter /usr/bin/node_exporter
```

### Start Node Exporter Service

Restart the Node Exporter service

```bash
sudo systemctl start node_exporter.service
```

### Clean Up Node Exporter Files

Remove the download and temporary files

```bash
rm -rf node_exporter-0.18.1.linux-amd64.tar.gz node_exporter-files
```

## Upgrade Process Exporter

## Download Latest Process Exporter Binary

Visit the Prometheus [downloads page](https://github.com/ncabatoff/process-exporter/releases) for the latest version.  Copy the correct link and download the Process Exporter binary to the server that you will upgrade.

```bash
wget \
  https://github.com/ncabatoff/process-exporter/releases/download/v0.6.0/process-exporter-0.6.0.linux-amd64.tar.gz
```

## Unpack Process Exporter

Untar and move the downloaded Process Exporter binary

```bash
tar -xvf process-exporter-0.6.0.linux-amd64.tar.gz
mv process-exporter-0.6.0.linux-amd64 process_exporter-files
```

## Stop Process Exporter Service

The executable that we're replacing is in use, so we need to stop the service so it can be replaced.

```bash
sudo systemctl stop process_exporter.service
```

## Install Process Exporter

Copy `process_exporter` binary from `process_exporter-files` folder to `/usr/bin` and change the ownership to prometheus user.

```bash
sudo cp process_exporter-files/process-exporter /usr/bin/
sudo chown process_exporter:process_exporter /usr/bin/process-exporter
```

## Start Process Exporter Service

Restart the Node Exporter service

```bash
sudo systemctl start process_exporter.service
```

## Clean Up Process Exporter Files

Remove the download and temporary files

```bash
rm -rf process-exporter-0.6.0.linux-amd64.tar.gz process_exporter-files
```

## Upgrade Couchbase Exporter

### Download Latest Couchbase Exporter Binary

[Download](https://github.com/couchbaselabs/cbprometheus_python) the Couchbase Exporter python code.

```bash
curl -L \
  https://github.com/couchbaselabs/cbprometheus_python/tarball/master > \
  couchbase_exporter.tar.gz
```

### Unpack Couchbase Exporter Binary

Untar and move the downloaded Couchbase Exporter code

```bash
mkdir -p couchbase_exporter
tar -xzf couchbase_exporter.tar.gz \
  -C couchbase_exporter --strip-components=1
```

### Install Python Dependencies

It is unlikely that the Python dependcies have changed, incase they have changed they'll need to be installed

```bash
sudo pip install -r ./couchbase_exporter/requirements
```

### Install Couchbase Exporter

Copy `couchbase_exporter` directory from `couchbase_exporter` folder to `/opt/couchbase_exporter` and change the ownership to the couchbase_exporter user.

```bash
sudo cp -R couchbase_exporter/* /opt/couchbase_exporter
sudo chown -R couchbase_exporter:couchbase_exporter /opt/couchbase_exporter
```

### Restart Emperor Service

Restart the Node Exporter service

```bash
sudo systemctl restart emperor.uwsgi.service
```

### Clean Up Couchbase Exporter Files

Remove the download and temporary files

```bash
rm -rf couchbase_exporter*
```

## Upgrade AlertManager

### Download Latest Prometheus AlertManager Binary

Visit the Prometheus [downloads page](https://prometheus.io/download/) for the latest version.  Copy the correct link and download the AlertManager binary to the server that you will upgrade.  

```bash
wget \
  https://github.com/prometheus/alertmanager/releases/download/v0.20.0/alertmanager-0.20.0.linux-amd64.tar.gz
```

### Unpack Prometheus AlertManager Binary

Untar and move the downloaded Prometheus binary

```bash
tar -xvf alertmanager-0.20.0.linux-amd64.tar.gz
mv alertmanager-0.20.0.linux-amd64 alertmanager-files
```

### Stop Prometheus AlertManager Service

The executable that we're replacing is in use, so we need to stop the service so it can be replaced.

```bash
sudo systemctl stop alertmanager.service
```

### Install Prometheus AlertManager

Copy `prometheus` and `promtool` binary from prometheus-files folder to `/usr/bin` and change the ownership to prometheus user.

```bash
sudo cp prometheus-files/prometheus /usr/bin/
sudo cp prometheus-files/promtool /usr/bin/
sudo chown prometheus:prometheus /usr/bin/prometheus
sudo chown prometheus:prometheus /usr/bin/promtool
```

### Install Prometheus AlertManager Libraries

Copy `alertmanager` and `amtool` binary from `alertmanager-files` folder to ``/usr/bin` and change the ownership to alertmanager user.

```bash
sudo cp alertmanager-files/alertmanager /usr/bin/
sudo cp alertmanager-files/amtool /usr/bin/
sudo chown alertmanager:alertmanager /usr/bin/alertmanager
sudo chown alertmanager:alertmanager /usr/bin/amtool
```

### Start Prometheus AlertManager

Restart the AlertManager service

```bash
sudo systemctl start alertmanager.service
```

### Clean Up Prometheus AlertManager Files

Remove the download and temporary files

```bash
rm -rf alertmanager-files
```

## Upgrade Grafana

For our final task, it's an easy one. WE can update Grafana with a simple Yum command and pat ourselves on the back for making through this rigourous but required setup and configuration.

### Yum or Rpm

```bash
sudo yum update grafana
```
