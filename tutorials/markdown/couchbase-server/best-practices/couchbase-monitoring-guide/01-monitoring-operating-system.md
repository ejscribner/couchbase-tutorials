---
# frontmatter
path: '/tutorial-monitoring-operating-system'
title: Monitoring Operating System
short_title: Operating System
description: 
  - See a detailed list of all Operating System metrics and learn what each means
  - Learn about various Couchbase System Stats
  - View example requests for fetching cluster-level and node-level statistics
content_type: tutorial
filter: observability
technology:
  - server
tags:
  - Monitoring
  - Metrics
  - Observability
sdk_language:
  - any
length: 10 Mins
---

## Operating System Metrics

Just as monitoring Couchbase and the individual services, buckets, indexes, etc. is extremely important to have a solid understanding of overall cluster health, it is also important to monitor the operating system and various stats for each node in the cluster. Each operating system has varying means of retrieving these metrics and many monitoring solutions collect them out of the box.

| OS Metric                         | Response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Free RAM                          | Free + cache memory should always be at least 20% of total system memory. If free + cache memory falls below 20%, scale the cluster.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Swap usage                        | Swap usage should always be zero. If swap is used, it means the OS is under very high memory pressure and unable to purge dirty pages fast enough and the cluster should be scaled.                                                                                                                                                                                                                                                                                                                                                                               |
| Memcached process RAM usage       | Create a baseline for this value as "normal" will be dependent upon your working set. Alert if this value exceeds 150% of baseline. This may indicate an unusual increase in write traffic, reading of typically cold data, or possible malloc fragmentation. Confirm the Couchbase resident ratios are still correct. Add memory or scale the cluster if necessary.                                                                                                                                                                                              |
| Beam.smp process RAM usage        | Create a baseline for this value as "normal" will be dependent upon your cluster size and API activity levels. Alert if this value exceeds 120% of baseline. This may indicate a memory leak in the beam process. Contact Couchbase Support if larger than a few gigabytes.                                                                                                                                                                                                                                                                                       |
| IO utilization \(iostat\)         | Create a baseline for this value as "normal" will be dependent upon your workload and available disk IO. Overall sustained IO utilization should not exceed 90% of total IO capacity.                                                                                                                                                                                                                                                                                                                                                                             |
| Total CPU utilization             | Create a baseline for this value as "normal" will be dependent upon your workload. Sustained CPU utilization &gt;90% indicates a need to scale the cluster.                                                                                                                                                                                                                                                                                                                                                                                                       |
| Couchbase service CPU utilization | Create a baseline for these values as "normal" will be dependent upon your workload. Alert if this value exceeds 2x of baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Beam.smp CPU utilization          | Create a baseline for this value as "normal" will be dependent upon your workload. Alert if this value exceeds 2x of baseline                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| %steal CPU                        | This value should always be zero. Anything above zero indicates the VM hypervisor is oversubscribed. Additional physical hosts should be added or collocated VMs should be migrated to other hosts.                                                                                                                                                                                                                                                                                                                                                               |
| Network utilization               | Create a baseline for this value as "normal" will be dependent upon your workload. Alert if this value exceeds 120% of baseline. If the sustained utilization is above 80% of the total available bandwidth, it indicates the need to scale the cluster.                                                                                                                                                                                                                                                                                                          |
| Presence of beam.smp process      | Alert if beam.smp is not present. This indicates Couchbase is offline and needs to be restarted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Presence of service processes     | Alert if data/index/query/fts/eventing/analytics processes are not present. This indicates Couchbase is either offline, starting up, or services may have crashed and need to be restarted. Below are the processes by service: <ul><li>Data Service: memcached</li><li>Data Service: projector</li><li>Data Service: goxdcr</li><li>Index Service: indexer</li><li>Query Service: cbq-engine</li><li>Full Text Search Service: cbft</li><li>Eventing Service: eventing-producer</li><li>Eventing Service: eventing-consumer</li><li>Analytics Service: cbas</ul> |
| NTP clock skew                    | Couchbase requires all cluster nodes \(and any replicated clusters\) to have their system clocks synchronized to a common clock source. Monitor clock skew on each server and alert if it is more than 1 minute out of sync.                                                                                                                                                                                                                                                                                                                                      |

## Couchbase System Stats

The following Operating System stats are available via the Cluster-Wide or Per-Node Endpoints listed below.

### Available Stats

| **Stat name**        | **Description**                                          |
| :------------------- | :------------------------------------------------------- |
| allocstall           | Number of allocations stalled when reclaiming            |
| cpu_cores_available  | Number of CPU cores available in the cluster or the node |
| cpu_irq_rate         | The CPU interrupt request rate                           |
| cpu_stolen_rate      | CPU steal rate                                           |
| cpu_idle_ms          | The amount of time the CPU has been idle                 |
| cpu_local_ms         |                                                          |
| cpu_utilization_rate | Max CPU utilization %                                    |
| hibernated_requests  | Idle streaming requests                                  |
| hibernated_waked     | Streaming wakeups/sec                                    |
| mem_actual_free      | Amount of RAM available on this server                   |
| mem_actual_used      | Amount of RAM used on this server                        |
| mem_free             | Amount of RAM available on this server                   |
| mem_limit            | The limit for RAM                                        |
| mem_total            | Amount of RAM used on this server                        |
| mem_used_sys         | Amount of RAM available to the OS                        |
| odp_report_failed    |                                                          |
| rest_requests        | Management port reqs/sec                                 |
| swap_total           | Amount of swap space available on this server            |
| swap_used            | Amount of swap space in use on this server               |

### `GET` Cluster System Stats

These endpoints are informational and should not be used for monitoring as they are an aggregate for the entire cluster and the best practice is to monitor each node individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@system/stats](http://localhost:8091/pools/default/buckets/@system/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@system/stats](https://localhost:8091/pools/default/buckets/@system/stats)

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@query/stats | \
  jq -r '.op.samples | to_entries[] | select(.key != "timestamp") |
    .key + ": " + (.value | add / length | tostring)'
```

### `GET` Node-Level OS Stats

Each node in the cluster should be monitoring individually using the endpoint listed below.

- Insecure: [http://localhost:8091/pools/default/buckets/@system/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@system/nodes/{NODE}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@system/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/@system/nodes/{NODE}/stats)

#### Example: Stats for Individual Node

The following example demonstrates how to retrieve the system stats for the cluster.

```bash
NODE="172.17.0.2:8091"

curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@system/nodes/$NODE/stats | \
  jq -r -c '.op.samples |
  "  cpu_idle_ms: " + (.cpu_idle_ms | add / length | tostring) +
  "\n  cpu_local_ms: " + (.cpu_local_ms | add / length | tostring) +
  "\n  cpu_utilization_rate: " + (.cpu_utilization_rate | add / length | tostring) +
  "\n  hibernated_requests: " + (.hibernated_requests | add / length | tostring) +
  "\n  hibernated_waked: " + (.hibernated_waked | add / length | tostring) +
  "\n  mem_actual_free: " + (.mem_actual_free | add / length | tostring) +
  "\n  mem_actual_used: " + (.mem_actual_used | add / length | tostring) +
  "\n  mem_free: " + (.mem_free | add / length | tostring) +
  "\n  mem_total: " + (.mem_total | add / length | tostring) +
  "\n  mem_used_sys: " + (.mem_used_sys | add / length | tostring) +
  "\n  rest_requests: " + (.rest_requests | add / length | tostring) +
  "\n  swap_total: " + (.swap_total | add / length | tostring) +
  "\n  swap_used: " + (.swap_used | add / length | tostring)'
```

#### Example: Stats for Each Node Separately

```bash
# loop over each of the buckets
for node in $(curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/pools/nodes | \
  jq -r '.nodes[] |
    .hostname'
  )
do
  echo "$node OS Stats"
  echo "-------------------------------------------------------"
  # get the system stats for the specific node
  curl \
    --user Administrator:password \
    --silent \
    --request GET \
    --data zoom=minute \
    http://localhost:8091/pools/default/buckets/@system/nodes/$node/stats | \
    jq -r '.op.samples | to_entries[] | select(.key != "timestamp") |
      .key + ": " + (.value | add / length | tostring)'
done
```
