---
# frontmatter
path: "/tutorial-configure-prometheus"
title: Configure Prometheus
short_title: Configure Prometheus
description: 
  - Learn how to configure Prometheus to monitor itself, discover new nodes to monitor, and configure various exporter jobs
  - See detailed examples of exporter configuration at the node, process, and bucket level as well as exporter config for each Couchbase Service
content_type: tutorial
filter: observability
technology: 
  - server
  - connectors
tags:
  - Prometheus
  - Monitoring
  - Observability
  - Configuration
sdk_language:
  - any
length: 30 Mins
---

Prometheus is configured through a single YAML file called `prometheus.yml`. When we configured Prometheus to run as a service, we specified the path of `/etc/prometheus/prometheus.yml`.

After changing the file, the prometheus service will need to be restarted to pickup the changes.

```bash
sudo systemctl restart prometheus
```

When we installed prometheus we configured an additional tool called `promtool`. It can be used to interact with prometheus, execute queries as well as validate configuration files.

```bash
promtool check config /etc/prometheus/prometheus.yml
```

Prometheus ingests stats via scrape jobs, we will configure 10 different scrape jobs for the following:

1. Prometheus
2. Node Exporter
3. Process Exporter
4. Buckets
5. Indexes
6. Query
7. XDCR
8. System
9. Eventing
10. Analytics
11. FTS

You do not have to restart Prometheus after adding each job listed below. The restarts and validation are simply added for verification purposes.

A full `prometheus.yml` file can be found at [https://github.com/couchbaselabs/cbprometheus_python/blob/master/prometheus/prometheus.yml](https://github.com/couchbaselabs/cbprometheus_python/blob/master/prometheus/prometheus.yml)

## Configure Prometheus to Monitor Itself

Edit the prometheus configuration file

```bash
sudo vi /etc/prometheus/prometheus.yml
```

Add the following contents

```yaml
global:
  scrape_interval: 60s # How frequently to scrape targets by default.
  scrape_timeout: 10s # How long until a scrape request times out.
  evaluation_interval: 60s # How frequently to evaluate rules.

# A scrape configuration
scrape_configs:
  - job_name: prometheus
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 60s
    scrape_timeout: 55s
    metrics_path: /metrics
    static_configs:
    - targets: ['localhost:9090']
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Validate the target has been added and is being monitored.

Open the Prometheus UI

```bash
http://<prometheus-ip>:9090/targets
```

The new job `prometheus` should be listed with a status of "Up". If the status shows as "Unknown" give it a few seconds and refresh.

## Setup File Service Discovery

When configuring Prometheus to monitor itself, a [static config](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#static_config) was used. For the remaining jobs, a [file_sd_config](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#file_sd_config) will be used.

Create the following directory and file with the appropriate permissions.

```bash
sudo mkdir /etc/prometheus/file_sd
sudo touch /etc/prometheus/file_sd/couchbase.yml
sudo chown prometheus:prometheus /etc/prometheus/file_sd
sudo chown prometheus:prometheus /etc/prometheus/file_sd/couchbase.yml
```

Edit the `/etc/prometheus/file_sd/couchbase.yml` with each of the Couchbase Exporter instances that have been configured.

```bash
sudo vi /etc/prometheus/file_sd/couchbase.yml
```

```yaml
- targets:
  - node1.cluster1.example.org
  - node2.cluster1.example.org
  - node3.cluster1.example.org
  - node1.cluster2.example.org
  - node2.cluster2.example.org
  - node3.cluster2.example.org
```

Once Prometheus has been fully configured, anytime new nodes are added edit the `/etc/prometheus/file_sd/couchbase.yml` file with the new nodes. The nodes will automatically be picked up by Prometheus and monitored without a restart of Prometheus being required.

## Configure Node Exporter Job

If you have not [configured Node Exporter](/tutorial-node-exporter-setup?learningPath=learn/couchbase-prometheus-integration-guide), skip this step and proceed to the next step. Here we will configure the Node Exporter job to gather system metrics from each of our nodes in each of the clusters.

The Couchbase Exporter will be used as a proxy to Node Exporter, the Couchbase Exporter will add the labels of `cluster="...", node="..."` to the metrics returned by Node Exporter, this way the Node Exporter metrics can be associated with Couchbase metrics.

Edit the `prometheus.yml` file and add the following job.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: node_exporter
    honor_labels: true
    scheme: http
    scrape_interval: 10s
    scrape_timeout: 9s
    metrics_path: /metrics/node_exporter
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
```

Spacing is very important in YAML and we want to validate our changes before they take effect. You can validate your Prometheus config by issuing the following command:

```bash
promtool check config /etc/prometheus/prometheus.yml
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```

## Configure Process Exporter Job

If you have not [configured Process Exporter](/tutorial-process-exporter-setup?learningPath=learn/couchbase-prometheus-integration-guide), skip this step and proceed to the next step. Here we will configure the Process Exporter to gather system metrics from each of our nodes in each of the clusters.

The Couchbase Exporter will be used as a proxy to Process Exporter, the Couchbase Exporter will add the labels of `cluster="...", node="..."` to the metrics returned by Process Exporter, this way the Process Exporter metrics can be associated with Couchbase metrics.

Edit the `prometheus.yml` file and add the following job.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: process_exporter
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 10s
    scrape_timeout: 9s
    metrics_path: /metrics/process_exporter
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```

## Configure Couchbase Buckets Job

Edit the `prometheus.yml` file and add the following under the `scrape_configs:` block.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: couchbase-buckets
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 60s
    scrape_timeout: 55s
    metrics_path: /metrics/buckets
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
    metric_relabel_configs:
      # if the stat name starts with data_* strip off index_
      - source_labels: [__name__]
        regex: 'data_(.*)'
        replacement: '$1'
        target_label: __name__
      # add data_ to the start of every stat
      - source_labels: [__name__]
        regex: '(.*)'
        replacement: 'data_$1'
        target_label: __name__
```

Notice in this instance there are 2 targets configured, one on port `5000` and one on `5001` this is to illustrate monitoring multiple clusters. In Step 3 we demonstrated how to configure multiple clusters and configure the appropriate ini files.

Additionally, for this job we are leveraging a metric_renamer. This takes an existing Couchbase stat as exposed by the exporter and renames it. This ensures for this job, every stat that is ingested is prefixed with `data_`. This is useful when using issuing PromQL statements or querying in Grafana which we will cover later.

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```

## Configure Couchbase Indexes Job

Edit the `prometheus.yml` file and add the following under the `scrape_configs:` block.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: couchbase-indexes
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 60s
    scrape_timeout: 55s
    metrics_path: /metrics/indexes
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
    metric_relabel_configs:
      # if the stat name starts with index_* strip off index_
      - source_labels: [__name__]
        regex: 'index_(.*)'
        replacement: '$1'
        target_label: __name__
      # add index_ to the start of every stat
      - source_labels: [__name__]
        regex: '(.*)'
        replacement: 'index_$1'
        target_label: __name__
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```

## Configure Couchbase Queries Job

Edit the `prometheus.yml` file and add the following under the `scrape_configs:` block.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: couchbase-queries
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 60s
    scrape_timeout: 55s
    metrics_path: /metrics/query
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
    metric_relabel_configs:
      # if the stat name starts with query_* strip off index_
      - source_labels: [__name__]
        regex: 'query_(.*)'
        replacement: '$1'
        target_label: __name__
      # add query_ to the start of every stat
      - source_labels: [__name__]
        regex: '(.*)'
        replacement: 'query_$1'
        target_label: __name__
```

If you do not want slow queries to be returned from the `/metrics/queries` endpoint, you can add the following block to the job:

```yaml
    params:
      slow_queries: false
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```

## Configure Couchbase XDCR Job

Edit the `prometheus.yml` file and add the following under the `scrape_configs:` block.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: couchbase-xdcr
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 60s
    scrape_timeout: 55s
    metrics_path: /metrics/xdcr
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
    metric_relabel_configs:
      # if the stat name starts with xdcr_* strip off index_
      - source_labels: [__name__]
        regex: 'xdcr_(.*)'
        replacement: '$1'
        target_label: __name__
      # add xdcr_ to the start of every stat
      - source_labels: [__name__]
        regex: '(.*)'
        replacement: 'xdcr_$1'
        target_label: __name__
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```

## Configure Couchbase System Job

Edit the `prometheus.yml` file and add the following under the `scrape_configs:` block.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: couchbase-system
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 60s
    scrape_timeout: 55s
    metrics_path: /metrics/system
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
    metric_relabel_configs:
      # if the stat name starts with system_* strip off index_
      - source_labels: [__name__]
        regex: 'system_(.*)'
        replacement: '$1'
        target_label: __name__
      # add system_ to the start of every stat
      - source_labels: [__name__]
        regex: '(.*)'
        replacement: 'system_$1'
        target_label: __name__
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```

## Configure Couchbase Eventing Job

Even if you are not currently using Eventing in your deployment, it is suggested to monitor it via Prometheus and the Couchbase Exporter. This way if it is ever enabled, you will begin to immediately start to monitor it.

Edit the `prometheus.yml` file and add the following under the `scrape_configs:` block.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: couchbase-eventing
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 60s
    scrape_timeout: 55s
    metrics_path: /metrics/eventing
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
    metric_relabel_configs:
      # if the stat name starts with eventing_* strip off index_
      - source_labels: [__name__]
        regex: 'eventing_(.*)'
        replacement: '$1'
        target_label: __name__
      # add eventing_ to the start of every stat
      - source_labels: [__name__]
        regex: '(.*)'
        replacement: 'eventing_$1'
        target_label: __name__
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```

## Configure Couchbase Analytics Job

Even if you are not currently using Analytics in your deployment, it is suggested to monitor it via Prometheus and the Couchbase Exporter. This way if it is ever enabled, you will begin to immediately start to monitor it.

Edit the `prometheus.yml` file and add the following under the `scrape_configs:` block.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: couchbase-analytics
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 60s
    scrape_timeout: 55s
    metrics_path: /metrics/analytics
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
    metric_relabel_configs:
      # if the stat name starts with analytics_* strip off index_
      - source_labels: [__name__]
        regex: 'analytics_(.*)'
        replacement: '$1'
        target_label: __name__
      # add analytics_ to the start of every stat
      - source_labels: [__name__]
        regex: '(.*)'
        replacement: 'analytics_$1'
        target_label: __name__
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```

## Configure Couchbase FTS Job

Even if you are not currently using FTS in your deployment, it is suggested to monitor it via Prometheus and the Couchbase Exporter. This way if it is ever enabled, you will begin to immediately start to monitor it. 

Edit the `prometheus.yml` file and add the following under the `scrape_configs:` block.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: couchbase-fts
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 60s
    scrape_timeout: 55s
    metrics_path: /metrics/fts
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
    metric_relabel_configs:
      # if the stat name starts with fts_* strip off index_
      - source_labels: [__name__]
        regex: 'fts_(.*)'
        replacement: '$1'
        target_label: __name__
      # add fts_ to the start of every stat
      - source_labels: [__name__]
        regex: '(.*)'
        replacement: 'fts_$1'
        target_label: __name__
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```

## Configure Couchbase cbstats Job

This job will execute cbstats against each node in the cluster. These metrics are different than the ones that have been previously gathered and should be queried at an independent interval as the values returned are point in time without a history. This requires that every node in the cluster is configured with a public/private key pair and that the system variables are set in the exporter configuration.

Edit the `prometheus.yml` file and add the following under the `scrape_configs:` block.

```bash
sudo vi /etc/prometheus/prometheus.yml
```

```yaml
  - job_name: couchbase-cbstats
    honor_labels: true
    honor_timestamps: true
    scheme: http
    scrape_interval: 60s
    scrape_timeout: 55s
    metrics_path: /metrics/cbstats
    file_sd_configs:
      - files:
        - /etc/prometheus/file_sd/couchbase.yml
    metric_relabel_configs:
      # if the stat name starts with fts_* strip off index_
      - source_labels: [__name__]
        regex: 'cbstats_(.*)'
        replacement: '$1'
        target_label: __name__
      # add fts_ to the start of every stat
      - source_labels: [__name__]
        regex: '(.*)'
        replacement: 'cbstats_$1'
        target_label: __name__
```

Restart Prometheus

```bash
sudo systemctl restart prometheus
```

Open the Prometheus UI and validate the new job is listed and is "Up"

```bash
http://<prometheus-ip>:9090/targets
```
