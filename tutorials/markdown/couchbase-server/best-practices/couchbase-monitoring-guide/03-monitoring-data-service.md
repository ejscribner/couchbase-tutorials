---
# frontmatter
path: '/tutorial-monitoring-data-service'
title: Monitoring Data Service
short_title: Data Service
description: 
  - See a list of all bucket-level statistics available and what each means
  - View example requests to fetch bucket statistics cluster-wide and at the node-level
  - Learn about key metrics to monitor and why each is important
content_type: tutorial
filter: observability
technology: 
  - kv
  - server
tags:
  - Monitoring
  - Metrics
  - Observability
sdk_language: 
  - any
length: 10 Mins
---

## Buckets Overview

Buckets overview provides all available buckets, high-level system information and resource utilization for each bucket in the cluster.

We can **GET** all available buckets and more according to the documentation for [Couchbase REST Buckets Summary](https://docs.couchbase.com/server/6.0/rest-api/rest-buckets-summary.html) using:

- Insecure: `http://localhost:8091/pools/default/buckets`
- Secure: `http://localhost:8091/pools/default/buckets`

### Example

The following example illustrates retrieving all of the buckets in a cluster and displaying basic stats about each bucket.

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data skipMap=true \
  http://localhost:8091/pools/default/buckets | \
  jq -r '.[] |
  "  Bucket: " + .name + "\n" +
  "  Quota Used:" + (.basicStats.quotaPercentUsed | tostring) + "%\n" +
  "  Ops / Sec:" + (.basicStats.opsPerSec | tostring) + "\n" +
  "  Disk Fetches:" + (.basicStats.diskFetches | tostring) + "\n" +
  "  Item Count:" + (.basicStats.itemCount | tostring) + "\n" +
  "  Disk Used:" + (.basicStats.diskUsed / 1024 / 1024 | tostring) + "MB\n" +
  "  Data Used:" + (.basicStats.dataUsed / 1024 / 1024 | tostring) + "MB\n" +
  "  Memory Used:" + (.basicStats.memUsed / 1024 / 1024 | tostring) + "MB\n"
  '
```

> **Note:** The `skipMap` query string parameter is a _boolean_ value that can be used to include or exclude the current vBucket distribution map for the buckets.

## Individual Bucket-Level Stats

Bucket metrics provide detailed information about resource consumption, application workload, and internal operations at the bucket level. The following Bucket stats are available via the Cluster-Wide or Per-Node Endpoints listed below.

Documentation: [https://docs.couchbase.com/server/6.0/rest-api/rest-bucket-stats.html](https://docs.couchbase.com/server/6.0/rest-api/rest-bucket-stats.html)

- Insecure: [http://localhost:8091/pools/default/buckets/{BUCKET}/stats](http://localhost:8091/pools/default/buckets/{BUCKET}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/{BUCKET}/stats](http://localhost:8091/pools/default/buckets/{BUCKET}/stats)

### Available Stats

| **Stat name**                           | **Description**                                                                                                                              |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| avg_active_timestamp_drift              | Average drift (in seconds) per mutation on active vBuckets                                                                                   |
| avg_bg_wait_time                        | Average background fetch time in microseconds                                                                                                |
| avg_disk_commit_time                    | Average disk commit time in seconds as from disk_update histogram of timings                                                                 |
| avg_disk_update_time                    | Average disk update time in microseconds as from disk_update histogram of timings                                                            |
| avg_replica_timestamp_drift             | Average drift (in seconds) per mutation on replica vBuckets                                                                                  |
| bg_wait_count                           | Number of background fetch operations                                                                                                        |
| bg_wait_total                           | Background fetch time in microseconds                                                                                                        |
| bytes_read                              | Number of bytes per second sent into this bucket                                                                                             |
| bytes_written                           | Number of bytes per second sent from this bucket                                                                                             |
| cas_badval                              | Number of CAS operations per second using an incorrect CAS ID for data that this bucket contains                                             |
| cas_hits                                | Number of CAS operations per second for data that this bucket contains                                                                       |
| cas_misses                              | Number of CAS operations per second for data that this bucket does not contain                                                               |
| cmd_get                                 | Number of get operations serviced by this bucket                                                                                             |
| cmd_lookup                              | Number of lookup sub-document operations serviced by this bucket                                                                             |
| cmd_set                                 | Number of set operations serviced by this bucket                                                                                             |
| couch_docs_actual_disk_size             | The size of all data files for this bucket, including the data itself, metadata and temporary files                                          |
| couch_docs_data_size                    | The size of active data in this bucket                                                                                                       |
| couch_docs_disk_size                    | The size of active data in this bucket on disk                                                                                               |
| couch_docs_fragmentation                | How much fragmented data there is to be compacted compared to real data for the data files in this bucket                                    |
| couch_spatial_data_size                 | The size of all active items in all the spatial indexes for this bucket on disk                                                              |
| couch_spatial_disk_size                 | The size of all active items in all the spatial indexes for this bucket on disk                                                              |
| couch_spatial_ops                       | All the spatial index reads                                                                                                                  |
| couch_total_disk_size                   | The total size on disk of all data and view files for this bucket.                                                                           |
| couch_views_actual_disk_size            | The size of all active items in all the indexes for this bucket on disk                                                                      |
| couch_views_data_size                   | The size of active data on for all the view indexes in this bucket                                                                           |
| couch_views_disk_size                   | The size of active data on for all the view indexes in this bucket on disk                                                                   |
| couch_views_fragmentation               | How much fragmented data there is to be compacted compared to real data for the view index files in this bucket                              |
| couch_views_ops                         | All the view reads for all design documents including scatter gather.                                                                        |
| curr_connections                        | Number of connections to this server including connections from external client SDKs, proxies, DCP requests and internal statistic gathering |
| curr_items                              | Number of unique items in this bucket - only active items, not replica                                                                       |
| curr_items_tot                          | Total number of items in this bucket (including replicas)                                                                                    |
| decr_hits                               | Number of decrement operations per second for data that this bucket contains                                                                 |
| decr_misses                             | Number of decr operations per second for data that this bucket does not contain                                                              |
| delete_hits                             | Number of delete operations per second for this bucket                                                                                       |
| delete_misses                           | Number of delete operations per second for data that this bucket does                                                                        |
| disk_commit_count                       | The number of disk comments                                                                                                                  |
| disk_commit_total                       | The total time spent committing to disk                                                                                                      |
| disk_update_count                       | The total number of disk updates                                                                                                             |
| disk_update_total                       | The total time spent updating disk                                                                                                           |
| disk_write_queue                        | Number of items waiting to be written to disk in this bucket                                                                                 |
| ep_active_ahead_exceptions              | Total number of ahead exceptions for all active vBuckets                                                                                     |
| ep_active_hlc_drift                     | The sum of total_abs_drift for the nodes active vBuckets                                                                                     |
| ep_active_hlc_drift_count               | The sum of total_abs_drift_count for the nodes active vBuckets                                                                               |
| ep_bg_fetched                           | Number of reads per second from disk for this bucket                                                                                         |
| ep_cache_miss_rate                      | Percentage of reads per second to this bucket from disk as opposed to RAM                                                                    |
| ep_clock_cas_drift_threshold_exceeded   |                                                                                                                                              |
| ep_data_read_failed                     | Number of disk read failures                                                                                                                 |
| ep_data_write_failed                    | Number of disk write failures                                                                                                                |
| ep_dcp_2i_backoff                       | Number of backoffs for index DCP connections                                                                                                 |
| ep_dcp_2i_count                         | Number of internal second index DCP connections in this bucket                                                                               |
| ep_dcp_2i_items_remaining               | Number of secondary index items remaining to be sent to consumer in this bucket                                                              |
| ep_dcp_2i_items_sent                    | Number of secondary index items per second being sent for a producer for this bucket                                                         |
| ep_dcp_2i_producer_count                | Number of secondary index senders for this bucket                                                                                            |
| ep_dcp_2i_total_backlog_size            | Total size in bytes of the DCP backlog for secondary indexes                                                                                 |
| ep_dcp_2i_total_bytes                   | Number of bytes per second being sent for secondary indexes DCP connections                                                                  |
| ep_dcp_cbas_backoff                     | Number of backoffs for Analytics DCP connections                                                                                             |
| ep_dcp_cbas_count                       | Number of internal Analytics DCP connections in this bucket                                                                                  |
| ep_dcp_cbas_items_remaining             | Number of Analytics items remaining to be sent to consumer in this bucket                                                                    |
| ep_dcp_cbas_items_sent                  | Number of Analytics items per second being sent for a producer for this bucket                                                               |
| ep_dcp_cbas_producer_count              | Number of Analytics senders for this bucket                                                                                                  |
| ep_dcp_cbas_total_backlog_size          | Total size in bytes of the DCP backlog for Analytics                                                                                         |
| ep_dcp_cbas_total_bytes                 | Number of bytes per second being sent for Analytics DCP connections                                                                          |
| ep_dcp_eventing_backoff                 | Number of backoffs for Eventing DCP connections                                                                                              |
| ep_dcp_eventing_count                   | Number of internal Eventing DCP connections in this bucket                                                                                   |
| ep_dcp_eventing_items_remaining         | Number of Eventing items remaining to be sent to consumer in this bucket                                                                     |
| ep_dcp_eventing_items_sent              | Number of Eventing items per second being sent for a producer for this bucket                                                                |
| ep_dcp_eventing_producer_count          | Number of Eventing senders for this bucket                                                                                                   |
| ep_dcp_eventing_total_backlog_size      | Total size in bytes of the DCP backlog for Eventing                                                                                          |
| ep_dcp_eventing_total_bytes             | Number of bytes per second being sent for Eventing DCP connections                                                                           |
| ep_dcp_fts_backoff                      | Number of backoffs for FTS DCP connections                                                                                                   |
| ep_dcp_fts_count                        | Number of internal FTS DCP connections in this bucket                                                                                        |
| ep_dcp_fts_items_remaining              | Number of FTS items remaining to be sent to consumer in this bucket                                                                          |
| ep_dcp_fts_items_sent                   | Number of FTS items per second being sent for a producer for this bucket                                                                     |
| ep_dcp_fts_producer_count               | Number of FTS senders for this bucket                                                                                                        |
| ep_dcp_fts_total_backlog_size           | Total size in bytes of the DCP backlog for FTS                                                                                               |
| ep_dcp_fts_total_bytes                  | Number of bytes per second being sent for FTS DCP connections                                                                                |
| ep_dcp_other_backoff                    | Number of backoffs for other DCP connections                                                                                                 |
| ep_dcp_other_count                      | Number of other DCP connections in this bucket                                                                                               |
| ep_dcp_other_items_remaining            | Number of items remaining to be sent to consumer in this bucket                                                                              |
| ep_dcp_other_items_sent                 | Number of items per second being sent for a producer for this bucket                                                                         |
| ep_dcp_other_producer_count             | Number of other senders for this bucket                                                                                                      |
| ep_dcp_other_total_backlog_size         | Total size in bytes of the DCP backlog for analytics other                                                                                   |
| ep_dcp_other_total_bytes                | Number of bytes per second being sent for other DCP connections for this bucket                                                              |
| ep_dcp_replica_backoff                  | Number of backoffs for replication DCP connections                                                                                           |
| ep_dcp_replica_count                    | Number of internal replication DCP connections in this bucket                                                                                |
| ep_dcp_replica_items_remaining          | Number of replication items remaining to be sent to consumer in this bucket                                                                  |
| ep_dcp_replica_items_sent               | Number of replication items per second being sent for a producer for this bucket                                                             |
| ep_dcp_replica_producer_count           | Number of replication senders for this bucket                                                                                                |
| ep_dcp_replica_total_backlog_size       | Total size in bytes of the DCP backlog for replication                                                                                       |
| ep_dcp_replica_total_bytes              | Number of bytes per second being sent for replication DCP connections                                                                        |
| ep_dcp_views+indexes_backoff            | Number of backoffs for view/index DCP connections                                                                                            |
| ep_dcp_views+indexes_count              | Number of internal view/index DCP connections in this bucket                                                                                 |
| ep_dcp_views+indexes_items_remaining    | Number of view/index items remaining to be sent to consumer in this bucket                                                                   |
| ep_dcp_views+indexes_items_sent         | Number of view/index items per second being sent for a producer for this bucket                                                              |
| ep_dcp_views+indexes_producer_count     | Number of views/index senders for this bucket                                                                                                |
| ep_dcp_views+indexes_total_backlog_size | Total size in bytes of the DCP backlog for views/indexes                                                                                     |
| ep_dcp_views+indexes_total_bytes        | Number of bytes per second being sent for views/indexes DCP connections                                                                      |
| ep_dcp_views_backoff                    | Number of backoffs for view DCP connections                                                                                                  |
| ep_dcp_views_count                      | Number of internal view DCP connections in this bucket                                                                                       |
| ep_dcp_views_items_remaining            | Number of view items remaining to be sent to consumer in this bucket                                                                         |
| ep_dcp_views_items_sent                 | Number of view items per second being sent for a producer for this bucket                                                                    |
| ep_dcp_views_producer_count             | Number of view senders for this bucket                                                                                                       |
| ep_dcp_views_total_backlog_size         | Total size in bytes of the DCP backlog for views                                                                                             |
| ep_dcp_views_total_bytes                | Number of bytes per second being sent for view DCP connections                                                                               |
| ep_dcp_xdcr_backoff                     | Number of backoffs for XDCR DCP connections                                                                                                  |
| ep_dcp_xdcr_count                       | Number of internal XDCR DCP connections in this bucket                                                                                       |
| ep_dcp_xdcr_items_remaining             | Number of XDCR items remaining to be sent to consumer in this bucket                                                                         |
| ep_dcp_xdcr_items_sent                  | Number of XDCR items per second being sent for a producer for this bucket                                                                    |
| ep_dcp_xdcr_producer_count              | Number of XDCR senders for this bucket                                                                                                       |
| ep_dcp_xdcr_total_backlog_size          | Total size in bytes of the DCP backlog for XDCR                                                                                              |
| ep_dcp_xdcr_total_bytes                 | Number of bytes per second being sent for XDCR DCP connections                                                                               |
| ep_diskqueue_drain                      | Total number of items per second being written to disk in this bucket                                                                        |
| ep_diskqueue_fill                       | Total number of items per second being put on the disk queue in this                                                                         |
| ep_diskqueue_items                      | Total number of items waiting to be written to disk in this bucket                                                                           |
| ep_flusher_todo                         | Number of items currently being written.                                                                                                     |
| ep_item_commit_failed                   | Number of times a transaction failed to commit due to storage errors.                                                                        |
| ep_kv_size                              | Total amount of user data cached in RAM in this bucket                                                                                       |
| ep_max_size                             | The maximum amount of memory this bucket can use.                                                                                            |
| ep_mem_high_wat                         | High water mark for auto-evictions                                                                                                           |
| ep_mem_low_wat                          | Low water mark for auto-evictions                                                                                                            |
| ep_meta_data_memory                     | Total amount of item metadata consuming RAM in this bucket                                                                                   |
| ep_num_non_resident                     | The number of non-resident items.                                                                                                            |
| ep_num_ops_del_meta                     | Number of delete operations per second for this bucket as the target for XDCR                                                                |
| ep_num_ops_del_ret_meta                 | Number of delRetMeta operations.                                                                                                             |
| ep_num_ops_get_meta                     | Number of metadata read operations per second for this bucket as the target for XDCR                                                         |
| ep_num_ops_set_meta                     | Number of set operations per second for this bucket as the target for XDCR                                                                   |
| ep_num_ops_set_ret_meta                 |                                                                                                                                              |
| ep_num_value_ejects                     | Total number of items per second being ejected to disk in this bucket                                                                        |
| ep_oom_errors                           | Number of times unrecoverable OOMs happened while processing operations.                                                                     |
| ep_ops_create                           | Total number of new items being inserted into this bucket                                                                                    |
| ep_ops_update                           | Number of items updated on disk per second for this bucket                                                                                   |
| ep_overhead                             | Extra memory used by transient data like persistence queues, replication queues, checkpoints, etc.                                           |
| ep_queue_size                           | Number of items queued for storage.                                                                                                          |
| ep_replica_ahead_exceptions             | Total number of ahead exceptions for all replica vBuckets                                                                                    |
| ep_replica_hlc_drift                    | The sum of total_abs_drift for the node's active vBuckets                                                                                    |
| ep_replica_hlc_drift_count              | The sum of total_abs_drift_count for the node's active vBuckets                                                                              |
| ep_resident_items_rate                  | Percentage of all items cached in RAM in this bucket                                                                                         |
| ep_tmp_oom_errors                       | Number of back-offs sent per second to client SDKs due to "out of memory" situations from this bucket                                        |
| ep_vb_total                             | Total number of vBuckets for this bucket                                                                                                     |
| evictions                               | Number of items per second evicted from this bucket                                                                                          |
| get_hits                                | Number of get operations per second for data that this bucket contains                                                                       |
| get_misses                              | Number of get operations per second for data that this bucket does not contain                                                               |
| hibernated_requests                     | Number of hibernated requests                                                                                                                |
| hibernated_waked                        | Number of times hibernated waked                                                                                                             |
| hit_ratio                               | Percentage of get requests served with data from this bucket                                                                                 |
| incr_hits                               | Number of increment operations per second for data that this bucket contains                                                                 |
| incr_misses                             | Number of increment operations per second for data that this bucket does not contain                                                         |
| mem_used                                | Amount of Memory used                                                                                                                        |
| misses                                  | Total amount of operations per second for that that the bucket does not contain                                                              |
| ops                                     | Total amount of operations per second (including XDCR) to this bucket                                                                        |
| rest_requests                           |
| swap_total                              |
| swap_used                               |
| vb_active_eject                         | Number of items per second being ejected to disk from "active"                                                                               |
| vb_active_itm_memory                    | Amount of active user data cached in RAM in this bucket                                                                                      |
| vb_active_meta_data_memory              | Amount of active item metadata consuming RAM in this bucket                                                                                  |
| vb_active_num                           | Number of vBuckets in the "active" state for this bucket                                                                                     |
| vb_active_num_non_resident              | Number of non-resident items.                                                                                                                |
| vb_active_ops_create                    | New items per second being inserted into "active" vBuckets in this bucket                                                                    |
| vb_active_ops_update                    | Number of items updated on disk per second for this bucket                                                                                   |
| vb_active_queue_age                     | Sum of disk queue item age in milliseconds for "active" vBuckets                                                                             |
| vb_active_queue_drain                   | Number of active items per second being written to disk in this bucket                                                                       |
| vb_active_queue_fill                    | Number of active items per second being put on the active item disk queue in this bucket                                                     |
| vb_active_queue_size                    | Number of active items waiting to be written to disk in this bucket                                                                          |
| vb_active_resident_items_ratio          | Percentage of active items cached in RAM in this bucket                                                                                      |
| vb_active_sync_write_aborted_count      | Number of vbucket writes aborted                                                                                                             |
| vb_active_sync_write_accepted_count     | Number of vbucket writes accepted                                                                                                            |
| vb_active_sync_write_committed_count    | Number of vbucket writes committed                                                                                                           |
| vb_avg_active_queue_age                 | Average age in seconds of active items in the active item queue for this bucket                                                              |
| vb_avg_pending_queue_age                | Average age in seconds of pending items in the pending item queue for this bucket and should be transient during rebalancing                 |
| vb_avg_replica_queue_age                | Average age in seconds of replica items in the replica item queue for this bucket                                                            |
| vb_avg_total_queue_age                  | Average age in seconds of all items in the disk write queue for this bucket                                                                  |
| vb_pending_curr_items                   | Number of items in "pending" vBuckets in this bucket and should be transient during rebalancing                                              |
| vb_pending_eject                        | Number of items per second being ejected to disk from "pending" vBuckets in this bucket and should be transient during rebalancing           |
| vb_pending_itm_memory                   | Amount of pending user data cached in RAM in this bucket and should be transient during rebalancing                                          |
| vb_pending_meta_data_memory             | Amount of pending item metadata consuming RAM in this bucket and should be transient during rebalancing                                      |
| vb_pending_num                          | Number of vBuckets in the "pending" state for this bucket and should be transient during rebalancing                                         |
| vb_pending_num_non_resident             | Number of non-resident items.                                                                                                                |
| vb_pending_ops_create                   | New items per second being instead into "pending" vBuckets in this bucket and should be transient during rebalancing                         |
| vb_pending_ops_update                   | Number of items updated on disk per second for this bucket                                                                                   |
| vb_pending_queue_age                    | Sum of disk queue item age in milliseconds.                                                                                                  |
| vb_pending_queue_drain                  | Number of pending items per second being written to disk in this bucket and should be transient during rebalancing                           |
| vb_pending_queue_fill                   | Number of pending items per second being put on the pending item disk queue in this bucket and should be transient during rebalancing        |
| vb_pending_queue_size                   | Number of pending items waiting to be written to disk in this bucket and should be transient during rebalancing                              |
| vb_pending_resident_items_ratio         | Percentage of items in pending state vbuckets cached in RAM in this bucket                                                                   |
| vb_replica_curr_items                   | Number of items in "replica" vBuckets in this bucket                                                                                         |
| vb_replica_eject                        | Number of items per second being ejected to disk from "replica" vBuckets in this bucket                                                      |
| vb_replica_itm_memory                   | Amount of replica user data cached in RAM in this bucket                                                                                     |
| vb_replica_meta_data_memory             | Amount of replica item metadata consuming in RAM in this bucket                                                                              |
| vb_replica_num                          | Number of vBuckets in the "replica" state for this bucket                                                                                    |
| vb_replica_num_non_resident             | Number of non-resident items.                                                                                                                |
| vb_replica_ops_create                   | New items per second being inserted into "replica" vBuckets in this bucket                                                                   |
| vb_replica_ops_update                   | Number of items updated on disk per second for this bucket                                                                                   |
| vb_replica_queue_age                    | Sum of disk queue item age in milliseconds for "replica" vBuckets                                                                            |
| vb_replica_queue_drain                  | Number of replica items per second being written to disk in this bucket                                                                      |
| vb_replica_queue_fill                   | Number of replica items per second being put on the replica item disk queue in this bucket                                                   |
| vb_replica_queue_size                   | Number of replica items waiting to be written to disk in this bucket                                                                         |
| vb_replica_resident_items_ratio         | Percentage of replica items cached in RAM in this bucket                                                                                     |
| vb_total_queue_age                      | Sum of disk queue item age in milliseconds.                                                                                                  |
| xdc_ops                                 | Incoming XDCR operations per second for this bucket                                                                                          |

---

### `GET` Cluster-Wide Individual Bucket Stats

These endpoints are informational and should not be used for monitoring as they are an aggregate for the entire cluster and the best practice is to monitor each node individually.

- Insecure: [http://localhost:8091/pools/default/buckets/{BUCKET}/stats](http://localhost:8091/pools/default/buckets/{BUCKET}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/{BUCKET}/stats](https://localhost:8091/pools/default/buckets/{BUCKET}/stats)

#### Example: With an average for all samples

```bash
BUCKET="travel-sample"

curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/$BUCKET/stats | \
  jq -r '.op.samples | to_entries[] | select(.key != "timestamp") |
    .key + ": " + (.value | add / length | tostring)'
```

### `GET` Node-Level Individual Bucket Stats

Each node in the cluster running the data service should be monitoring individually using the endpoint listed below.

- Insecure: [http://localhost:8091/pools/default/buckets/{BUCKET}/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/{BUCKET}/nodes/{NODE}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/{BUCKET}/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/{BUCKET}/nodes/{NODE}/stats)

#### Example: Stats for Individual Node

The following example demonstrates how to retrieve the bucket stats for a specific node.

```bash
BUCKET="travel-sample"
NODE="172.17.0.2:8091"

curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/$BUCKET/nodes/$NODE/stats | \
  jq -r -c '.op.samples |
  "  cmd_get: " + (.cmd_get | add / length | tostring) +
  "\n  cmd_set: " + (.cmd_set | add / length | tostring) +
  "\n  curr_connections: " + (.curr_connections | add / length | tostring) +
  "\n  curr_items: " + (.curr_items | add / length | tostring) +
  "\n  curr_items_tot: " + (.curr_items_tot | add / length | tostring) +
  "\n  decr_hits: " + (.decr_hits | add / length | tostring) +
  "\n  decr_misses: " + (.decr_misses | add / length | tostring) +
  "\n  delete_hits: " + (.delete_hits | add / length | tostring) +
  "\n  delete_misses: " + (.delete_misses | add / length | tostring) +
  "\n  ep_bg_fetched: " + (.ep_bg_fetched | add / length | tostring) +
  "\n  evictions: " + (.evictions | add / length | tostring) +
  "\n  get_hits: " + (.get_hits | add / length | tostring) +
  "\n  get_misses: " + (.get_misses | add / length | tostring) +
  "\n  hit_ratio: " + (.hit_ratio | add / length | tostring) +
  "\n  incr_hits: " + (.incr_hits | add / length | tostring) +
  "\n  incr_misses: " + (.incr_misses | add / length | tostring) +
  "\n  misses: " + (.misses | add / length | tostring) +
  "\n  ops: " + (.ops | add / length | tostring)
  "\n  xdc_ops: " + (.xdc_ops | add / length | tostring)
  '
```

## Key Metrics to Monitor

| Couchbase Metric                                                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| :------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <ul><li>mem_used</li><li>ep_kv_size</li><li>ep_mem_high_wat</li></ul>            | These four metrics together give insight into how memory is used by the data service.<br><br>mem_used / ep_kv_size represents fragmentation within the KV engine.<br><br>out mem_used is the actual memory utilization whereas ep_kv_size is the sum of the metadata and values expected to be in RAM.mem_used / memoryTotal should be less than 90%.<br><br>ep_kv_size / ep_mem_high_wat represents your quota utilization.<br><br>ep_mem_high_wat is the maximum RAM the bucket is expected to use. | The amount of fragmentation \(mem_used / ep_kv_size\) you should expect will depend on the workload, but in general, alert if this value exceeds 115%.If mem_used / memoryTotal are consistently near 90%, that is a trigger to add additional memory or nodes to the cluster. If this value approaches 100%, then you could face an Out of Memory error and the Couchbase process could be killed or crash.Once ep_kv_size = ep_mem_high_wat, Couchbase will start ejecting data to disk. This may be expected depending on your use case, but caching use cases will always want ep_kv_size to be lower than ep_mem_high_wat. |
| ep_meta_data_memory                                                              | The amount of memory used specifically for document metadata. In Value Ejection mode, it's possible for document metadata to displace document values in cache, reducing cache hit rates and increasing latencies.                                                                                                                                                                                                                                                                                    | Create a baseline for ep_meta_data_memory / ep_mem_high_wat. If this value exceeds 30% and vb_active_resident_items_ratio is not 100%, consider configuring Full Ejection on the bucket.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ep_queue_size                                                                    | The amount of data waiting to be written to disk. A large value typically indicates the server is disk IO bound. If this value exceeds 1,000,000 items, the server will start sending tmp_oom \(backoff\) messages to the application.                                                                                                                                                                                                                                                                | Create a baseline for this value as "normal" will be dependent upon your workload and available disk IO. Alert at 2x of baseline. You may need to add nodes or increase the per-node disk IO.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ep_flusher_todo                                                                  | The number of items currently being written to disk. Combined with ep_queue_size, this represents the total disk write queue on the server.                                                                                                                                                                                                                                                                                                                                                           | Create a baseline for this value as "normal" will be dependent upon your workload and available disk IO. Alert at 2x of baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| vb_avg_total_queue_age                                                           | The average time in seconds that a write is in queue before persisting to disk. This represents the local node's exposure to potential data loss.                                                                                                                                                                                                                                                                                                                                                     | Create a baseline for this value as "normal" will be dependent upon your workload and available disk IO. Alert at 2x of baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ep_dcp_replica_items_remaining                                                   | The number of items in the inter-node replication queue. This represents the cluster's exposure to potential data loss.                                                                                                                                                                                                                                                                                                                                                                               | Create a baseline for this value as "normal" will be dependent upon your workload and available network IO. Alert at 2x of baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ops                                                                              | The total number of KV operations occurring against the node.                                                                                                                                                                                                                                                                                                                                                                                                                                         | Create a baseline for this value as "normal" will be dependent on your workload. Alert at 2x of baseline. Abnormally high operations could mean an unexpected change to the application or unusual application traffic patterns.                                                                                                                                                                                                                                                                                                                                                                                                |
| cmd_get                                                                          | The number of KV GET operations occurring against the node.                                                                                                                                                                                                                                                                                                                                                                                                                                           | Create a baseline for this value as "normal" will be dependent on your workload. Alert at 3x of baseline. Abnormally high operations could mean an unexpected change to the application or unusual application traffic patterns.                                                                                                                                                                                                                                                                                                                                                                                                |
| cmd_set                                                                          | The number of KV SET operations occurring against the node.                                                                                                                                                                                                                                                                                                                                                                                                                                           | Create a baseline for this value as "normal" will be dependent on your workload. Alert at 2x of baseline. Abnormally high operations could mean an unexpected change to the application or unusual application traffic patterns.                                                                                                                                                                                                                                                                                                                                                                                                |
| delete_hits                                                                      | The number of KV DELETE operations occurring against the node.                                                                                                                                                                                                                                                                                                                                                                                                                                        | Create a baseline for this value as "normal" will be dependent on your workload. Alert at 2x of baseline. Abnormally high operations could mean an unexpected change to the application or unusual application traffic patterns.                                                                                                                                                                                                                                                                                                                                                                                                |
| ep_bg_fetched                                                                    | The number of items fetched from disk \(cache misses\).                                                                                                                                                                                                                                                                                                                                                                                                                                               | This value should be close to 0. Establish a baseline for this metric and alert at 2x of baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| curr_connections                                                                 | The number of client \(SDK\) connections to Couchbase. More connections will result in increased CPU utilization.                                                                                                                                                                                                                                                                                                                                                                                     | Create a baseline for your environment. Alert at 2x of baseline. Couchbase will begin rejecting connections above 30,000.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| curr_items                                                                       | The number of items currently active on this node. During warmup, this will be 0 until complete.                                                                                                                                                                                                                                                                                                                                                                                                      | Once a baseline number of objects has been established, substantial changes to the baseline could indicate unexpected failures within Couchbase or an application bug                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| vb_active_resident_items_ratio                                                   | The percentage of active data in that is memory resident.                                                                                                                                                                                                                                                                                                                                                                                                                                             | For caching use cases, this value should be close to 100%. If this value falls below 100% and ep_bg_fetched is greater than 0, this indicates the bucket needs more RAM. The value should never be less than 15%.                                                                                                                                                                                                                                                                                                                                                                                                               |
| vb_replica_resident_items_ratio                                                  | The percentage of replica data in that is memory resident. A higher percentage for this value will ensure lower latency data access following a failover.                                                                                                                                                                                                                                                                                                                                             | Set the threshold for this value based on business requirements for object latency during a failure scenario. The value should never be less than 15%                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ep_tmp_oom_errors                                                                | Number of times temporary OOMs were sent to a client. Represents high transient memory pressure within the system.                                                                                                                                                                                                                                                                                                                                                                                    | This error indicates temporary memory pressure after the server has reached ep_mem_high_wat and is ejecting not recently accessed values. Frequent errors indicate the need to scale the cluster.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ep_oom_errors                                                                    | Number of times permanent OOMs were sent to a client. Represents very high consistent memory pressure within the system.                                                                                                                                                                                                                                                                                                                                                                              | This error indicates the bucket has exceeded its total memory allocation and immediately requires additional memory or nodes be added.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| <ul><li>ep_dcp_views_items_remaining</li><li>ep_dcp_2i_items_remaining</li></ul> | The number of documents awaiting indexing for views and GSI.                                                                                                                                                                                                                                                                                                                                                                                                                                          | Create a baseline for this value as "normal" will be dependent upon your workload and available disk IO. Alert at 2x baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ep_dcp_replica_backoff                                                           | Indicates the number of times an internal replication was instructed to slow down.                                                                                                                                                                                                                                                                                                                                                                                                                    | Alert if this value greater than zero. This indicates a resource constraint within the cluster that should be investigated.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ep_dcp_xdcr_backoff                                                              | Indicates the number of times an XDCR replication was instructed to slow down.                                                                                                                                                                                                                                                                                                                                                                                                                        | Should be monitored as a rate. Create a baseline for your environment as "normal" will be dependent on workload patterns and XDCR bandwidth limits. Alert at 2x of baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| couch_docs_fragmentation                                                         | The percentage of data file fragmentation.                                                                                                                                                                                                                                                                                                                                                                                                                                                            | By default, compaction should start when this value hits 30%. If this value consistently exceeds 30%, then this typically indicates disk IO contention or a problem with compaction starting that should be investigated.                                                                                                                                                                                                                                                                                                                                                                                                       |
| couch_views_fragmentation                                                        | The percentage of View index fragmentation.                                                                                                                                                                                                                                                                                                                                                                                                                                                           | By default, compaction should start when this value hits 30%. If this value significantly exceeds 30%, then this typically indicates disk IO contention or a problem with compaction starting that should be investigated.                                                                                                                                                                                                                                                                                                                                                                                                      |
| vb_replica_num                                                                   | The number of replica vBuckets.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | If this value falls below \(1024 \* the number of configured replicas\) / the number of servers, it indicates that a rebalance is required.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| vb_active_num                                                                    | The number of active vBuckets.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | This value should always equal 1024 / the number of servers. If it does not, it indicates a node failure and that a failover + rebalance is required.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

### Example

The following example illustrates getting the verbose stats for an individual bucket.

```bash
BUCKET='travel-sample'

# output the stats for the bucket
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/$BUCKET/stats | \
  jq -r -c '.op.samples | to_entries | sort_by(.key) | .[] |
  "  " + (.key) + ": " + (.value | add / length | tostring)'
```

### Example

The following example illustrates getting an individual stat for a single bucket.

```bash
BUCKET='travel-sample'
STAT='cmd_get'

# output the stats for the bucket
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/$BUCKET/stats/$STAT | \
  jq -r -c '.nodeStats | to_entries | sort_by(.key) | .[] |
  "  " + (.key) + ": " + (.value | add / length | tostring)'
```

### Example

This example shows how to retrieve all stats for all buckets.

```bash
# loop over each of the buckets
for bucket in $(curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data skipMap=true \
  http://localhost:8091/pools/default/buckets | \
  jq -r '.[] | .name')
do
  echo ""
  echo "Bucket: $bucket"
  echo "================================================================"
  # output the stats for the bucket
  curl \
    --user Administrator:password \
    --silent \
    --request GET \
    --data zoom=minute \
    http://localhost:8091/pools/default/buckets/$bucket/stats | \
    jq -r -c '.op.samples | to_entries | sort_by(.key) | .[] |
    "  " + (.key) + ": " + (.value | add / length | tostring)'
done
```
