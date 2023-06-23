---
# frontmatter
path: '/tutorial-monitoring-nodes'
title: Monitoring Nodes
short_title: Nodes
description:
  - This tutorial describes the important metrics and how to monitor them for each node in the cluster
  - Learn how to run GET requests for node-level metrics and see several example requests
content_type: tutorial
filter: observability
technology:
  - server
landing_page: devops
landing_order: 2
tags:
  - Monitoring
  - Metrics
  - Observability
sdk_language: 
  - any
length: 10 Mins
---

## `GET` Nodes Overview

We can **GET** Nodes according to the documentation for [Couchbase REST Node Overview](https://docs.couchbase.com/server/6.0/rest-api/rest-node-get-info.html) using:

`http://localhost:8091/pools/nodes`

### Response

```json
{
  "nodes": [
    {
      "hostname": "10.112.170.101:8091",
      "thisNode": true,
      "ports": {
        "sslProxy": 11214,
        "httpsMgmt": 18091,
        "httpsCAPI": 18092,
        "proxy": 11211,
        "direct": 11210
      },
      "services": ["fts", "index", "kv", "n1ql", "cbas", "eventing"]
    }
  ]
}
```

Each node in the cluster is listed in the "nodes" array. The `thisNode` attribute indicates the node you have executed the query against. Using this output, a monitoring agent can discover new nodes within the cluster and which services are assigned to those nodes in order to automatically apply the correct monitoring profile.

### Key Metrics to Monitor

| **Couchbase Metric** | **Description**                                                                                                                                 | **Response**                                                             |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| status               | This is a meta metric that indicates overall node health.                                                                                       | Alert if the value is "unhealthy".                                       |
| clusterMembership    | Indicates whether the node is an active participant in cluster operations. Possible values are "active", "inactiveAdded", and "inactiveFailed". | Alert on "inactiveFailed" and investigate the cause of the node failure. |

### Example

This example illustrates retrieving the status of each node in the cluster.

```bash
curl \
  --user Administrator:password \
  --silent \
	--request GET \
  http://localhost:8091/pools/nodes | \
  jq -r '.nodes[] | .hostname + " (" +.status + ")"'
```

### Example

The following example displays the cluster membership of each node.

```bash
curl \
  --user Administrator:password \
  --silent \
	--request GET \
  http://localhost:8091/pools/nodes | \
  jq -r '.nodes[] | .hostname + " (" +.clusterMembership + ")"'
```

### Example

Show the services and system stats for each node in the cluster.

```bash
curl \
  --user Administrator:password \
  --silent \
	--request GET \
  http://localhost:8091/pools/nodes | \
  jq -r '.nodes[] | .hostname + " (" + (.services | join(", ")) + ")\n" +
  "  cpu_utilization_rate: " +
    ( .systemStats.cpu_utilization_rate | tostring) + "%\n" +
  "  swap_total: " +
    ( .systemStats.swap_total / 1024 / 1024 | tostring) + "MB\n" +
  "  swap_used: " +
    ( .systemStats.swap_used / 1024 / 1024 | tostring) + "MB (" +
    ( (.systemStats.swap_used / .systemStats.swap_total) * 100 | tostring) + "%)\n" +
  "  mem_total: " +
    ( .systemStats.mem_total / 1024 / 1024 | tostring) + "MB\n" +
  "  mem_free: " +
    ( .systemStats.mem_free / 1024 / 1024 | tostring) + "MB (" +
    ( (.systemStats.mem_free / .systemStats.mem_total) * 100 | tostring) + "%)"
   '
```
