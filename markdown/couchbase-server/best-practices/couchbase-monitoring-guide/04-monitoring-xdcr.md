---
# frontmatter
path: '/tutorial-monitoring-xdcr'
title: Monitoring XDCR
short_title: XDCR
description: 
  - This tutorial describes the important metrics and how to monitor them for cross data center replication (XDCR) operations in the cluster
  - See a list of all available stats and learn how to fetch them with example requests
  - Learn which stats are most important to monitor and why
content_type: tutorial
filter: observability
technology:
  - kv
  - server
landing_page: devops
landing_order: 3
tags:
  - Monitoring
  - Metrics
  - Observability
sdk_language:
  - any
length: 10 Mins
---

## Replication Status

The tasks endpoint will provide cluster wide information on operations such as rebalance, XDCR replications, etc. The response is an array that will need to be filtered for items containing `[].type == "xdcr"`

- Insecure: `http://localhost:8091/pools/default/tasks`
- Secure: `http://localhost:18091/pools/default/tasks`

**Response:**

```json
[
  {
    "cancelURI": "/controller/cancelXDCR/20763b82bb6b517bd0d15d9f6b78c13c%2Ftravel-sample%2Fdemo",
    "settingsURI": "/settings/replications/20763b82bb6b517bd0d15d9f6b78c13c%2Ftravel-sample%2Fdemo",
    "status": "running",
    "replicationType": "xmem",
    "continuous": true,
    "filterExpression": "",
    "id": "20763b82bb6b517bd0d15d9f6b78c13c/travel-sample/demo",
    "pauseRequested": false,
    "source": "travel-sample",
    "target": "/remoteClusters/20763b82bb6b517bd0d15d9f6b78c13c/buckets/demo",
    "type": "xdcr",
    "recommendedRefreshPeriod": 10,
    "changesLeft": 0,
    "docsChecked": 0,
    "docsWritten": 31591,
    "maxVBReps": null,
    "errors": []
  }
]
```

### Key Metrics to Monitor

| **Couchbase Metric** | **Description**                                                                     | **Response**                                    |
| :------------------- | :---------------------------------------------------------------------------------- | :---------------------------------------------- |
| status               | Indicates whether a replication is in a "running", "paused", or "notRunning" state. | Alert if the value is "paused" or "notRunning". |

> **Note:** The `replicationId` is composed of 3 parts, delimited by a `/`:

Sample ReplicationId: `6f76c2a07245aef856db44a8e361032/travel-sample/default`

- Remote Cluster ID
- Source Bucket
- Target Bucket

#### Example

The following example illustrates outputting the replication ID and Status.

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/pools/default/tasks | \
  jq -r 'map(select(.type | contains("xdcr"))) |
    .[] | .id + " (" +.status + ")"'
```

This example shows outputting all replications whose status is "paused" or "notRunning"

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/pools/default/tasks | \
  jq -c 'map(select(
    (.type | contains("xdcr"))
    and
    (.status | contains("paused") or contains("notRunning"))
  )) | .[] | .id + " (" +.status + ")"'
```

---

## Per Replication Stats

The XDCR stats are an aggregate for all of the configured replications, either for the entire cluster or a specific node.

Documentation: [https://docs.couchbase.com/server/6.0/rest-api/rest-xdcr-statistics.html](https://docs.couchbase.com/server/6.0/rest-api/rest-xdcr-statistics.html)

### Available Stats

| **Stat name**                                            | **Description**                                                                                                                                         |
| :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| replication_changes_left                                 | The total number of changes left across all replications for the bucket                                                                                 |
| replication_docs_rep_queue                               | The total number of documents in replication queue for all replications for the bucket                                                                  |
| replications/{replicationId}/bandwidth_usage             | Bandwidth used during replication, measured in bytes per second.                                                                                        |
| replications/{replicationId}/changes_left                | Number of mutations to be replicated to the remote cluster                                                                                              |
| replications/{replicationId}/data_replicated             | Size of data replicated in bytes                                                                                                                        |
| replications/{replicationId}/datapool_failed_gets        | Number of failed gets from the pool                                                                                                                     |
| replications/{replicationId}/dcp_datach_length           |                                                                                                                                                         |
| replications/{replicationId}/dcp_dispatch_time           |                                                                                                                                                         |
| replications/{replicationId}/deletion_docs_written       | The number of docs deleted that have been written to the target cluster                                                                                 |
| replications/{replicationId}/deletion_failed_cr_source   | The number of deletes that have failed conflict resolution on the source due to optimistic replication                                                  |
| replications/{replicationId}/deletion_filtered           | The number of deletes that have been filtered                                                                                                           |
| replications/{replicationId}/deletion_received_from_dcp  | The number of deletes that have been received from DCP                                                                                                  |
| replications/{replicationId}/docs_checked                | Number of documents checked for changes                                                                                                                 |
| replications/{replicationId}/docs_failed_cr_source       | The number of docs that have failed conflict resolution on the source due to optimistic replication                                                     |
| replications/{replicationId}/docs_filtered               | Number of documents that have been filtered out and not replicated to target cluster                                                                    |
| replications/{replicationId}/docs_opt_repd               | Number of documents sent optimistically                                                                                                                 |
| replications/{replicationId}/docs_processed              | The number of documents processed                                                                                                                       |
| replications/{replicationId}/docs_received_from_dcp      | Number of documents received from DCP                                                                                                                   |
| replications/{replicationId}/docs_rep_queue              | Number of documents in replication queue                                                                                                                |
| replications/{replicationId}/docs_unable_to_filter       | The number of documents where filtering could not be processed                                                                                          |
| replications/{replicationId}/docs_written                | Number of documents written to the target cluster                                                                                                       |
| replications/{replicationId}/expiry_docs_written         | The number of expiry documents written to the target cluster                                                                                            |
| replications/{replicationId}/expiry_failed_cr_source     | The number of expiries that have failed conflict resolution on the source due to optimistic replication                                                 |
| expiry_filtered                                          | The number of expiry documents that have been filtered out and not replicated to the target cluster                                                     |
| replications/{replicationId}/expiry_received_from_dcp    | The number of expiry documents that have been received                                                                                                  |
| replications/{replicationId}/expiry_stripped             | The number of expiry documents removed from replicating                                                                                                 |
| replications/{replicationId}/num_checkpoints             | Number of checkpoints issued in replication queue                                                                                                       |
| replications/{replicationId}/num_failedckpts             | Number of checkpoints failed during replication                                                                                                         |
| replications/{replicationId}/percent_completeness        | Percentage of checked items out of all checked and to-be-replicated items                                                                               |
| replications/{replicationId}/rate_doc_checks             |                                                                                                                                                         |
| replications/{replicationId}/rate_doc_opt_repd           |                                                                                                                                                         |
| replications/{replicationId}/rate_received_from_dcp      | Number of documents received from DCP per second                                                                                                        |
| replications/{replicationId}/rate_replicated             | Rate of documents being replicated, measured in documents per second                                                                                    |
| replications/{replicationId}/resp_wait_time              |                                                                                                                                                         |
| replications/{replicationId}/set_docs_written            | The number of sets that have failed conflict resolution on the source due to optimistic replication                                                     |
| replications/{replicationId}/set_failed_cr_source        | The number of sets that have failed conflict resolution on the source due to optimistic replication                                                     |
| replications/{replicationId}/set_filtered                | Number of sets that have been filtered out and not replicated to target cluster                                                                         |
| replications/{replicationId}/set_received_from_dcp       | The number of sets that have been received from DCP                                                                                                     |
| replications/{replicationId}/size_rep_queue              | Size of replication queue in bytes                                                                                                                      |
| replications/{replicationId}/throttle_latency            | Throttle latency                                                                                                                                        |
| replications/{replicationId}/throughput_throttle_latency | Throughput throttle latency                                                                                                                             |
| replications/{replicationId}/time_committing             | Seconds elapsed during replication                                                                                                                      |
| replications/{replicationId}/wtavg_docs_latency          | Weighted average latency for sending replicated changes to target cluster                                                                               |
| replications/{replicationId}/wtavg_meta_latency          | Weighted average time for requesting document metadata. XDCR uses this for conflict resolution prior to sending the document into the replication queue |

---

### `GET` Cluster-Wide Bucket XDCR Stats

These endpoints are informational and should not be used for monitoring as they are an aggregate for the entire cluster and the best practice is to monitor each node individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@xdcr-{BUCKET}/stats](http://localhost:8091/pools/default/buckets/@xdcr-{BUCKET}/stats)
- Secure: [http://localhost:8091/pools/default/buckets/@xdcr-{BUCKET}/stats](http://localhost:8091/pools/default/buckets/@xdcr-{BUCKET}/stats)

#### Example: Single Bucket

This example will output the XDCR stats for a specific bucket

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@xdcr-travel-sample/stats | \
  jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
    select(.key | split("/") | length > 1) |
    "  " + (.key) + ": " +
      (.value | add / length | tostring)'
```

#### Example: All Replications

This example will output all XDCR stats for every bucket that has one or more replications configured.

```bash
# loop over each of the buckets
for bucket in $(curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/pools/default/tasks | \
  jq -r '[ .[] | select(.type == "xdcr") | .source ] | sort | unique | .[]')
do
  echo ""
  echo "Bucket: $bucket"
  echo "================================================================"
  # get the xdcr stats for the bucket
  curl \
    --user Administrator:password \
    --silent \
    --request GET \
    --data zoom=minute \
    http://localhost:8091/pools/default/buckets/@xdcr-$bucket/stats | \
    jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
      select(.key | split("/") | length > 1) |
      "  " + (.key) + ": " +
        (.value | add / length | tostring)'
done
```

---

### `GET` Node-Level Bucket XDCR Stats

Each data node in the cluster should be monitoring individually using the endpoint listed below.

- Insecure: [http://localhost:8091/pools/default/buckets/@xdcr-{BUCKET}/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@xdcr-{BUCKET}/stats)
- Secure: [http://localhost:8091/pools/default/buckets/@xdcr-{BUCKET}/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@xdcr-{BUCKET}/stats)

#### Example: Single Bucket

This example will output the XDCR stats for a specific node and bucket.

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@xdcr-travel-sample/nodes/172.17.0.2:8091/stats | \
  jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
    select(.key | split("/") | length > 1) |
    "  " + (.key) + ": " +
      (.value | add / length | tostring)'
```

#### Example: All Replications

This example will output all XDCR stats for a single node for every bucket that has one or more replications configured.

```bash
# loop over each of the buckets
for bucket in $(curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/pools/default/tasks | \
  jq -r '[ .[] | select(.type == "xdcr") | .source ] | sort | unique | .[]')
do
  echo ""
  echo "Bucket: $bucket"
  echo "================================================================"
  # get the xdcr stats for the bucket
  curl \
    --user Administrator:password \
    --silent \
    --request GET \
    --data zoom=minute \
    http://localhost:8091/pools/default/buckets/@xdcr-$bucket/nodes/172.17.0.2:8091/stats | \
    jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
      select(.key | split("/") | length > 1) |
      "  " + (.key) + ": " +
        (.value | add / length | tostring)'
done
```

#### Example: All Replications for Each Node

This example will output all XDCR stats for a single node for every bucket that has one or more replications configured.

```bash
# get all of the buckets in the cluster that have 1 or more
# xdcr replications configured
buckets=$(curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/pools/default/tasks | \
  jq -r '[ .[] | select(.type == "xdcr") | .source ] | sort | unique | .[]')
# get all of the nodes in the cluster running the data service
nodes=$(curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/pools/nodes | \
  jq -r '.nodes[] |
    select(.services | contains(["kv"]) == true) |
    .hostname'
)
# loop over each of the buckets
for bucket in ${buckets[@]}
do
  echo ""
  echo "Bucket: $bucket"
  echo "================================================================"
  # loop over each of the nodes in the cluster
  for node in ${nodes[@]}
  do
    echo "Node: $node"
    echo "----------------------------------------------------------------"
    # get the xdcr stats for the bucket on the node
    curl \
      --user Administrator:password \
      --silent \
      --request GET \
      --data zoom=minute \
      http://localhost:8091/pools/default/buckets/@xdcr-$bucket/nodes/$node/stats | \
      jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
        select(.key | split("/") | length > 1) |
        "  " + (.key) + ": " +
          (.value | add / length | tostring)'
    echo ""
  done
done
```

### Key Metrics to Monitor

| **Couchbase Metric** | **Description**                                                                                                                    | **Response**                                                                                                                                                                            |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| changes_left         | The number of items pending XDCR replication. This can be used to approximate the degree of eventual consistency between clusters. | Create a baseline for this value as "normal" will depend on workload, XDCR configuration, and available bandwidth. Alert at 2x of baseline. This may indicate a resource bottleneck.    |
| bandwidth_usage      | The amount of bandwidth in bytes used for XDCR replication.                                                                        | An alert value for this metric should be based on the network interconnect capacity between the clusters and the percentage of the interconnect XDCR is expected or allowed to consume. |

---

### `GET` Per Node Individual Stat for a Replication

Each XDCR replication stat can be retrieved individually. The entire key must be URL-encoded, where `/`'s are replaced with `%2F`.

Documentation: [https://docs.couchbase.com/server/6.0/rest-api/rest-xdcr-statistics.html](https://docs.couchbase.com/server/6.0/rest-api/rest-xdcr-statistics.html)

#### Example

This example shows requesting an individual stat for a single replication and displays the results for each data node in the cluster.

```bash
# set the replication info
REMOTE_CLUSTER='20763b82bb6b517bd0d15d9f6b78c13c'
SOURCE_BUCKET='travel-sample'
target_BUCKET='demo'
STAT_NAME='percent_completeness'

# build the url
STAT_URL="http://localhost:8091/pools/default/buckets/$SOURCE_BUCKET/stats"
STAT_URL="$STAT_URL/replications%2F$REMOTE_CLUSTER%2F$SOURCE_BUCKET"
STAT_URL="$STAT_URL%2F$target_BUCKET%2F$STAT_NAME"

curl \
  --user Administrator:password \
  --silent \
  $STAT_URL | \
  jq -r '.nodeStats | to_entries | .[] |
    (.key | split(":") | .[0]) + ": " + (.value | add / length | tostring)'
```

---

### `GET` Remote Cluster Information

The `replicationId` is a uniquely generated ID and does not convey the remote cluster details. All configured remote clusters and their associated IDs can be retrieved from the REST API.

Documentation: [https://docs.couchbase.com/server/6.0/rest-api/rest-xdcr-get-ref.html](https://docs.couchbase.com/server/6.0/rest-api/rest-xdcr-get-ref.html)

- Insecure: [http://localhost:8091/pools/default/remoteClusters](http://localhost:8091/pools/default/remoteClusters)
- Secure: [https://localhost:18091/pools/default/remoteClusters](http://localhost:18091/pools/default/remoteClusters)

#### Example

This example shows requesting an individual stat for a single replication and displays the results for each data node in the cluster.

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/pools/default/remoteClusters | \
  jq -r '.'
```

## Bucket XDCR Operations

### `GET` Bucket Incoming XDCR operations

To retrieve the incoming write operations that occur on a target cluster due to replication, make the request on your target cluster and bucket.

Documentation: [https://docs.couchbase.com/server/6.0/rest-api/rest-xdcr-statistics.html#rest-xdcr-stats-operations](https://docs.couchbase.com/server/6.0/rest-api/rest-xdcr-statistics.html#rest-xdcr-stats-operations)

- Insecure: [http://localhost:8091/pools/default/buckets/{BUCKET}/stats](http://localhost:8091/pools/default/buckets/{BUCKET}/stats)
- Secure: [http://localhost:8091/pools/default/buckets/{BUCKET}/stats](http://localhost:8091/pools/default/buckets/{BUCKET}/stats)

### Available Stats

| **Stat name**       | **Description**                                                                                                                                               |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ep_num_ops_get_meta | The number of metadata read operations per second for the bucket as the target for XDCR                                                                       |
| ep_num_ops_set_meta | The number of set operations per second for the bucket as the target for XDCR                                                                                 |
| ep_num_ops_del_meta | The number of delete operations per second for the bucket as the target for XDCR                                                                              |
| xdc_ops             | Total XDCR operations per second for this bucket (measured from the sum of the statistics: ep_num_ops_del_meta, ep_num_ops_get_meta, and ep_num_ops_set_meta) |

### Example

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/travel-sample/stats | \
  jq -r '.op.samples |
      "ep_num_ops_get_meta: " + (.ep_num_ops_get_meta | add / length | tostring) +
      "\nep_num_ops_set_meta: " + (.ep_num_ops_set_meta |add / length | tostring) +
      "\nep_num_ops_del_meta: " + (.ep_num_ops_del_meta |add / length | tostring) +
      "\nxdc_ops: " + (.xdc_ops |add / length | tostring)'
```

---

## `GET` XDCR Timestamp-based Conflict Resolution Stats

When using buckets configured with Timestamp-based Conflict Resolution it is important to monitor the drift related statistics. When a cluster is the destination for XDCR traffic, active vBuckets will calculate drift from their remote cluster peers.

It is normal for a cluster with closely synchronized clocks to show some drift; in general it will be showing how long it took a mutation to be replicated and should remain steady. It is also normal for the active vBucket drift to be zero if no XDCR relationship exists (or if no XDCR traffic is flowing).

Documentation: [https://docs.couchbase.com/server/6.0/learn/clusters-and-availability/xdcr-monitor-timestamp-conflict-resolution.html](https://docs.couchbase.com/server/6.0/learn/clusters-and-availability/xdcr-monitor-timestamp-conflict-resolution.html)

- Insecure: [http://localhost:8091/pools/default/buckets/{BUCKET}/stats](http://localhost:8091/pools/default/buckets/{BUCKET}/stats)
- Secure: [http://localhost:8091/pools/default/buckets/{BUCKET}/stats](http://localhost:8091/pools/default/buckets/{BUCKET}/stats)

### Available Stats

| **Stat name**                         | **Description**                                                 |
| :------------------------------------ | :-------------------------------------------------------------- |
| avg_active_timestamp_drift            |                                                                 |
| avg_replica_timestamp_drift           |                                                                 |
| ep_active_hlc_drift                   | The sum of total_abs_drift for the node's active vBuckets       |
| ep_active_hlc_drift_count             | The sum of total_abs_drift_count for the node's active vBuckets |
| ep_replica_hlc_drift                  | The sum of total_abs_drift for the node's active vBuckets       |
| ep_replica_hlc_drift_count            | The sum of total_abs_drift_count for the node's active vBuckets |
| ep_active_ahead_exceptions            | The sum of drift_ahead_exceeded for the node's active vBuckets  |
| ep_replica_ahead_exceptions           | The sum of drift_ahead_exceeded for the node's replica vBuckets |
| ep_clock_cas_drift_threshold_exceeded |                                                                 |

### Example

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/travel-sample/stats | \
  jq -r '.op.samples |
    "avg_active_timestamp_drift: " +
      (.avg_active_timestamp_drift | add / length | tostring) +
    "\navg_replica_timestamp_drift: " +
      (.avg_replica_timestamp_drift | add / length | tostring) +
    "\nep_active_hlc_drift: " +
      (.ep_active_hlc_drift | add / length | tostring) +
    "\nep_active_hlc_drift_count: " +
      (.ep_active_hlc_drift_count | add / length | tostring) +
    "\nep_replica_hlc_drift: " +
      (.ep_replica_hlc_drift | add / length | tostring) +
    "\nep_replica_hlc_drift_count: " +
      (.ep_replica_hlc_drift_count | add / length | tostring) +
    "\nep_active_ahead_exceptions: " +
      (.ep_active_ahead_exceptions | add / length | tostring) +
    "\nep_clock_cas_drift_threshold_exceeded: " +
      (.ep_clock_cas_drift_threshold_exceeded | add / length | tostring)'
```
