---
# frontmatter
path: '/tutorial-monitoring-index-service'
title: Monitoring Index Service
short_title: Index Service
description: 
  - Learn about the different stats available for both the index service as a whole as well as individual index-level metrics
  - See how to form requests to GET various statistics
  - Learn about the most relevant index service metrics to monitor
content_type: tutorial
filter: observability
technology:
  - index
  - server
landing_page: devops
landing_order: 5
tags:
  - Monitoring
  - Metrics
  - Observability
sdk_language:
  - any
length: 10 Mins
---

## Index Status

The index status API displays all index definitions, node placement and status within the cluster.

- Insecure: `http://localhost:8091/indexStatus`
- Secure: `https://localhost:18091/indexStatus`

**Response:**

```json
{
  "indexes": [
    {
      "storageMode": "plasma",
      "partitioned": false,
      "instId": 4607548507687231469,
      "hosts": ["127.0.0.1:8091"],
      "progress": 100,
      "definition": "CREATE INDEX `def_airportname` ON `travel-sample`(`airportname`) WITH {  \"defer_build\":true }",
      "status": "Ready",
      "bucket": "travel-sample",
      "index": "def_airportname",
      "id": 15764219156300962421
    },
    {
      "storageMode": "plasma",
      "partitioned": false,
      "instId": 11862384293590784556,
      "hosts": ["127.0.0.1:8091"],
      "progress": 100,
      "definition": "CREATE INDEX `def_city` ON `travel-sample`(`city`) WITH {  \"defer_build\":true }",
      "status": "Ready",
      "bucket": "travel-sample",
      "index": "def_city",
      "id": 2037567312091921182
    }
  ],
  "version": 45110879,
  "warnings": []
}
```

### Key Metrics to Monitor

| **Couchbase Metric** | **Description**                                                | **Response**                                     |
| :------------------- | :------------------------------------------------------------- | :----------------------------------------------- |
| status               | Indicates whether a index is in a "Ready" or "Building" state. | Alert if the value is not "Ready" or "Building". |

### Example

The following example illustrates outputting each Index Name and Status.

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/indexStatus | \
  jq -r '.indexes | sort_by(.bucket) | .[] | .bucket + ": " + .index + " (" +.status + ")"'
```

This example shows outputting all indexes whose status is not "Ready" or "Building"

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/indexStatus | \
  jq -r '.indexes | map(select(
    (.status != "Ready" and .status != "Building")
  )) | .[] | .bucket + ": " + .index + " (" +.status + ")"'
```

## Index Service-Level Stats

The following Index service stats are available via the Cluster-Wide or Per-Node Endpoints listed below.

### Available Stats

| **Stat name**       | **Description**                                              |
| :------------------ | :----------------------------------------------------------- |
| index_memory_quota  | The cluster wide memory quota.                               |
| index_memory_used   | The amount of memory currently used by the indexing service. |
| index_ram_percent   | The percentage of index entries in ram.                      |
| index_remaining_ram | The amount of memory remaining.                              |

---

### `GET` Cluster Index Service Stats

These endpoints are informational and should not be used for monitoring as they are an aggregate for the entire and cluster and the best practice is to monitor each node individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@index/stats](http://localhost:8091/pools/default/buckets/@index/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@index/stats](https://localhost:8091/pools/default/buckets/@index/stats)

#### Example

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@index/stats | \
  jq -r '.op.samples | to_entries[] | select(.key != "timestamp") |
    .key + ": " + (.value | add / length | tostring)'
```

---

### `GET` Node-Level Index Service Stats

Each node in the cluster running the index service should be monitoring individually using the endpoint listed below.

- Insecure: [http://localhost:8091/pools/default/buckets/@index/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@index/nodes/{NODE}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@index/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/@index/nodes/{NODE}/stats)

#### Example: Stats for Individual Node

The following example demonstrates how to retrieve the index service stats for a specific node.

```bash
NODE="172.17.0.2:8091"

curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@index/nodes/$NODE/stats | \
  jq -r -c '.op.samples |
  "  index_memory_quota: " + (.index_memory_quota | add / length | tostring) +
  "\n  index_memory_used: " + (.index_memory_used | add / length | tostring) +
  "\n  index_ram_percent: " + (.index_ram_percent | add / length | tostring) +
  "\n  index_remaining_ram: " + (.index_remaining_ram | add / length | tostring)'
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
    select(.services | contains(["index"]) == true) |
    .hostname'
  )
do
  echo "$node Index Stats"
  echo "-------------------------------------------------------"
  # get the index stats for the specific node
  curl \
    --user Administrator:password \
    --silent \
    --request GET \
    --data zoom=minute \
    http://localhost:8091/pools/default/buckets/@index/nodes/$node/stats | \
    jq -r '.op.samples | to_entries[] | select(.key != "timestamp") |
      .key + ": " + (.value | add / length | tostring)'
done
```

### Key Metrics to Monitor

| **Couchbase Metric** | **Description**                 | **Response**                                                                                                             |
| :------------------- | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| index_remaining_ram  | The amount of memory remaining. | Alert if this value is 20% or less, as it is an indicative of index growth and new index nodes will need to be expanded. |

## Individual Index-Level Stats

The Index stats for a specific indexes are available only under the bucket that the index is created on. The same stats that are available for the service as a whole are also available on a per-index basis and can be retrieved for the entire cluster or a specific node in the cluster.

### Available Stats

| **Stat name**                             | **Description**                                                 |
| :---------------------------------------- | :-------------------------------------------------------------- |
| index/{indexName}/avg_item_size           | The average index entry size                                    |
| index/{indexName}/avg_scan_latency        | The average latency when scanning the index                     |
| index/{indexName}/cache_hits              | The number of in-memory hits to the index                       |
| index/{indexName}/cache_miss_ratio        | The ratio of misses to hits                                     |
| index/{indexName}/cache_misses            | The number of in-memory misses to the index                     |
| index/{indexName}/data_size               | The total data size of the index                                |
| index/{indexName}/data_size_on_disk       | The total size of the index data on disk                        |
| index/{indexName}/disk_overhead_estimate  | The size of stale data on disk due to fragmentation             |
| index/{indexName}/disk_size               | The size of the index on disk                                   |
| index/{indexName}/frag_percent            | The index fragmentation percentage                              |
| index/{indexName}/index_frag_percent      | The index fragmentation percentage                              |
| index/{indexName}/index_resident_percent  | The percentage of the index that is memory resident             |
| index/{indexName}/items_count             | The number of items in the index                                |
| index/{indexName}/log_space_on_disk       | The size of the log files on disk                               |
| index/{indexName}/memory_used             | The amount of memory used by the index                          |
| index/{indexName}/num_docs_indexed        | The number of items indexed since the last restart              |
| index/{indexName}/num_docs_pending        | The number of items pending indexing                            |
| index/{indexName}/num_docs_pending+queued | The number of documents that are pending or queued for indexing |
| index/{indexName}/num_docs_queued         | The number of documents that are queued for indexing            |
| index/{indexName}/num_requests            | The number of requests to the index                             |
| index/{indexName}/num_rows_returned       | The average number of rows returned by a scan                   |
| index/{indexName}/raw_data_size           | The raw uncompressed data size                                  |
| index/{indexName}/recs_in_mem             | The number of records in the index that are in memory           |
| index/{indexName}/recs_on_disk            | The number of records not in memory                             |
| index/{indexName}/scan_bytes_read         | The average number of bytes read per scan                       |
| index/{indexName}/total_scan_duration     | The total time spent scanning                                   |

---

### `GET` Cluster Individual Index Stats

These endpoints are informational and should not be used for monitoring as they are an aggregate for the entire and cluster and the best practice is to monitor each node individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@index-{BUCKET}/stats](http://localhost:8091/pools/default/buckets/@index-{BUCKET}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@index-{BUCKET}/stats](https://localhost:8091/pools/default/buckets/@index-{BUCKET}/stats)

#### Example

The following example demonstrates how to retrieve the eventing service stats for the cluster.

```bash
BUCKET="travel-sample"

curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@index-$BUCKET/stats | \
  jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
    select(.key | split("/") | length == 3) |
    "  " + (.key) + ": " +
      (.value | add / length | tostring)'
```

---

### `GET` Individual Index Stats per Node

Each node in the cluster running the index service should be monitoring individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@index-{BUCKET}/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@index-{BUCKET}/nodes/{NODE}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@index-{BUCKET}/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/@index-{BUCKET}/nodes/{NODE}/stats)

#### Example: Stats for Individual Node

The following example demonstrates how to retrieve all of the index stats for a specific index in a bucket for a specific node.

<!--lint disable no-long-code-->

```bash
NODE="172.17.0.2:8091"
BUCKET="travel-sample"
INDEX="def_faa"

# get the index stats for the bucket
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@index-$BUCKET/nodes/$NODE/stats | \
  jq -r --arg index "$INDEX" '.op.samples |
  "  avg_item_size: " + (.["index/" + $index + "/avg_item_size"] | add / length | tostring) +
  "\n  avg_scan_latency: " + (.["index/" + $index + "/avg_scan_latency"] | add / length | tostring) +
  "\n  cache_hits: " + (.["index/" + $index + "/cache_hits"] | add | tostring) +
  "\n  cache_miss_ratio: " + (.["index/" + $index + "/cache_miss_ratio"] | add / length | tostring) +
  "\n  cache_misses: " + (.["index/" + $index + "/cache_misses"] | add | tostring) +
  "\n  data_size: " + (.["index/" + $index + "/data_size"] | add / length | tostring) +
  "\n  disk_overhead_estimate: " + (.["index/" + $index + "/disk_overhead_estimate"] | add / length | tostring) +
  "\n  disk_size: " + (.["index/" + $index + "/disk_size"] | add / length | tostring) +
  "\n  frag_percent: " + (.["index/" + $index + "/frag_percent"] | add / length | tostring) +
  "\n  index_frag_percent: " + (.["index/" + $index + "/index_frag_percent"] | add / length | tostring) +
  "\n  index_resident_percent: " + (.["index/" + $index + "/index_resident_percent"] | add / length | tostring) +
  "\n  items_count: " + (.["index/" + $index + "/items_count"] | add / length | tostring) +
  "\n  memory_used: " + (.["index/" + $index + "/memory_used"] | add / length | tostring) +
  "\n  num_docs_indexed: " + (.["index/" + $index + "/num_docs_indexed"] | add | tostring) +
  "\n  num_docs_pending+queued: " + (.["index/" + $index + "/num_docs_pending+queued"] | add | tostring) +
  "\n  num_docs_queued: " + (.["index/" + $index + "/num_docs_queued"] | add | tostring) +
  "\n  num_requests: " + (.["index/" + $index + "/num_requests"] | add | tostring) +
  "\n  num_rows_returned: " + (.["index/" + $index + "/num_rows_returned"] | add | tostring) +
  "\n  recs_in_mem: " + (.["index/" + $index + "/recs_in_mem"] | add / length | tostring) +
  "\n  recs_on_disk: " + (.["index/" + $index + "/recs_on_disk"] | add / length | tostring) +
  "\n  scan_bytes_read: " + (.["index/" + $index + "/scan_bytes_read"] | add | tostring) +
  "\n  total_scan_duration: " + (.["index/" + $index + "/total_scan_duration"] | add | tostring)
  '
```

---

#### Example: Stats for Individual Node

The following example demonstrates how to retrieve all of the index stats, for every bucket in the cluster for a single node.

<!--lint disable no-long-code-->

```bash
NODE="172.17.0.2:8091"

# loop over each of the buckets that has indexes
for bucket in $(curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8091/indexStatus | \
  jq -r '[ .indexes[] | .bucket ] | sort | unique | .[]')
do
  echo ""
  echo "Bucket: $bucket"
  echo "================================================================"
  # get the index stats for the bucket
  curl \
    --user Administrator:password \
    --silent \
    --request GET \
    --data zoom=minute \
    http://localhost:8091/pools/default/buckets/@index-$bucket/nodes/$NODE/stats | \
    # 1. reduce the samples object, by looping over each property, only work with properties
    # who are index specific stat properties and either sum or average samples
    # 2. get all of the unique index keys
    # 3. loop over each index and output the stats
    jq -r 'reduce (.op.samples | to_entries[]) as {$key, $value} (
        {};
        if (
          $key | split("/") | length == 3
          and ($key | contains("replica ") | not)
        ) then
          if ([
            "cache_hits","cache_misses","num_docs_indexed","num_docs_pending",
            "num_docs_pending+queued","num_docs_queued","num_requests",
            "num_rows_returned","scan_bytes_read","total_scan_duration"
          ] | .[] | contains($key | split("/") | .[2]) == true) then
            .[$key] += ($value | add)
          else
            .[$key] += ($value | add / length | roundit/100.0)
          end
        else
          .
        end
      ) | . as $stats |
      $stats | keys | map(split("/")[1]) | sort | unique as $indexes |
      $indexes | .[] |
      "Index: " + . +
      "\n----------------------------------------------------------------" +
      "\n  avg_item_size: " + ($stats["index\/" + . + "\/avg_item_size"] | tostring ) +
      "\n  avg_scan_latency: " + ($stats["index\/" + . + "\/avg_scan_latency"] | tostring) +
      "\n  cache_hits: " + ($stats["index\/" + . + "\/cache_hits"] | tostring) +
      "\n  cache_miss_ratio: " + ($stats["index\/" + . + "\/cache_miss_ratio"] | tostring) +
      "\n  cache_misses: " + ($stats["index\/" + . + "\/cache_misses"] | tostring) +
      "\n  data_size: " + ($stats["index\/" + . + "\/data_size"] | tostring) +
      "\n  disk_overhead_estimate: " + ($stats["index\/" + . + "\/disk_overhead_estimate"] | tostring) +
      "\n  disk_size: " + ($stats["index\/" + . + "\/disk_size"] | tostring) +
      "\n  frag_percent: " + ($stats["index\/" + . + "\/frag_percent"] | tostring) +
      "\n  index_frag_percent: " + ($stats["index\/" + . + "\/index_frag_percent"] | tostring) +
      "\n  index_resident_percent: " + ($stats["index\/" + . + "\/index_resident_percent"] | tostring) +
      "\n  items_count: " + ($stats["index\/" + . + "\/items_count"] | tostring) +
      "\n  memory_used: " + ($stats["index\/" + . + "\/memory_used"] | tostring) +
      "\n  num_docs_indexed: " + ($stats["index\/" + . + "\/num_docs_indexed"] | tostring) +
      "\n  num_docs_pending: " + ($stats["index\/" + . + "\/num_docs_pending"] | tostring) +
      "\n  num_docs_pending+queued: " + ($stats["index\/" + . + "\/num_docs_pending+queued"] | tostring) +
      "\n  num_docs_queued: " + ($stats["index\/" + . + "\/num_docs_queued"] | tostring) +
      "\n  num_requests: " + ($stats["index\/" + . + "\/num_requests"] | tostring) +
      "\n  num_rows_returned: " + ($stats["index\/" + . + "\/num_rows_returned"] | tostring) +
      "\n  recs_in_mem: " + ($stats["index\/" + . + "\/recs_in_mem"] | tostring) +
      "\n  recs_on_disk: " + ($stats["index\/" + . + "\/recs_on_disk"] | tostring) +
      "\n  scan_bytes_read: " + ($stats["index\/" + . + "\/scan_bytes_read"] | tostring) +
      "\n  avg_scan_latency: " + ($stats["index\/" + . + "\/avg_scan_latency"] | tostring) +
      "\n  total_scan_duration: " + ($stats["index\/" + . + "\/total_scan_duration"] | tostring) +
      "\n"
    '
done
```

### Key Metrics to Monitor

| **Couchbase Metric**   | **Description**                                     | **Response**                                                                                                                                                     |
| :--------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| avg_item_size          | The average index entry size                        | Create a baseline for this value, as "normal" will depend on the size. Alert at 2x of the baseline. This would indicate a dramatic model change.                 |
| avg_scan_latency       | The average scan latency                            | Create a baseline for this value, as "normal" will depend on the size. Alert at 2x of the baseline. This would indicate a slowdown for index scans to the index. |
| index_resident_percent | The percentage of the index that is memory resident | Create a baseline for this value as "normal" will depend on SLAs and hard configuration. Alert at 5-10% deviation of the baseline.                               |
| num_requests           | The number of index scan requests to the index      | Create a baseline for this value, as "normal" will depend on the amount. Alert at 2x of the baseline. This would indicate a dramatic increase in requests.       |

---

## Index Aggregate Stats

The Index aggregate stats for a specific bucket are available only under the bucket that the indexes exist on and are a total of all of the indexes for that bucket in the cluster or node.

### Available Stats

| **Stat name**                | **Description**                                                 |
| :--------------------------- | :-------------------------------------------------------------- |
| index/cache_hits             | The number of in-memory hits to the index                       |
| index/cache_misses           | The number of in-memory misses to the index                     |
| index/data_size              | The total data size of the index                                |
| index/data_size_on_disk      | The total data size on disk                                     |
| index/disk_overhead_estimate | The size of stale data on disk due to fragmentation             |
| index/disk_size              | The size of the index on disk                                   |
| index/frag_percent           | The index fragmentation percentage                              |
| index/fragmentation          | The index fragmentation percentage                              |
| index/items_count            | The number of items in the index                                |
| index/memory_used            | The amount of memory used by the index                          |
| index/num_docs_indexed       | The number of items indexed since the last restart              |
| index/num_docs_pending       | The number of documents that are pending or queued for indexing |
| index/num_docs_queued        | The number of documents that are queued for indexing            |
| index/num_requests           | The number of requests to the index                             |
| index/num_rows_returned      | The average number of rows returned by a scan                   |
| index/raw_data_size          | The raw uncompressed data size                                  |
| index/recs_in_mem            | The number of records in the index that are in memory           |
| index/recs_on_disk           | The number of records not in memory                             |
| index/scan_bytes_read        | The average number of bytes read per scan                       |
| index/total_scan_duration    | The total time spent scanning                                   |

### `GET` Cluster Index Aggregate Stats

- Insecure: [http://localhost:8091/pools/default/buckets/@index-{BUCKET}/stats](http://localhost:8091/pools/default/buckets/@index-{BUCKET}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@index-{BUCKET}/stats](https://localhost:8091/pools/default/buckets/@index-{BUCKET}/stats)

#### Example: Stats for Cluster

The following example demonstrates how to retrieve all of the index aggregate stats for a specific bucket in the entire cluster.

```bash
BUCKET="travel-sample"

# get the index stats for the bucket
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@index-$BUCKET/stats | \
  jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
    select(.key | split("/") | length == 2) |
    "  " + (.key | split("/")[1]) + ": " +
      (.value | add / length | tostring)'
```

### `GET` Index Aggregate Stats per Node

- Insecure: [http://localhost:8091/pools/default/buckets/@index-{BUCKET}/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@index-{BUCKET}/nodes/{NODE}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@index-{BUCKET}/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/@index-{BUCKET}/nodes/{NODE}/stats)

#### Example: Aggregate Stats for Individual Node

The following example demonstrates how to retrieve all of the index aggregate stats for a specific in a bucket for a specific node.

```bash
BUCKET="travel-sample"
NODE="172.17.0.2:8091"

# get the index stats for the bucket
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@index-$BUCKET/nodes/$NODE/stats | \
  jq -r '.op.samples |
  "  cache_hits: " + (.["index/cache_hits"] | add | tostring) +
  "\n  cache_misses: " + (.["index/cache_misses"] | add | tostring) +
  "\n  data_size: " + (.["index/data_size"] | add | tostring) +
  "\n  disk_overhead_estimate: " + (.["index/disk_overhead_estimate"] | add / length | tostring) +
  "\n  disk_size: " + (.["index/disk_size"] | add | tostring) +
  "\n  frag_percent: " + (.["index/frag_percent"] | add / length | tostring) +
  "\n  fragmentation: " + (.["index/fragmentation"] | add / length | tostring) +
  "\n  items_count: " + (.["index/items_count"] | add / length | tostring) +
  "\n  memory_used: " + (.["index/memory_used"] | add / length | tostring) +
  "\n  num_docs_indexed: " + (.["index/num_docs_indexed"] | add | tostring) +
  "\n  num_docs_pending: " + (.["index/num_docs_pending"] | add | tostring) +
  "\n  num_docs_queued: " + (.["index/num_docs_queued"] | add | tostring) +
  "\n  num_requests: " + (.["index/num_requests"] | add | tostring) +
  "\n  num_rows_returned: " + (.["index/num_rows_returned"] | add | tostring) +
  "\n  recs_in_mem: " + (.["index/recs_in_mem"] | add | tostring) +
  "\n  recs_on_disk: " + (.["index/recs_on_disk"] | add | tostring) +
  "\n  scan_bytes_read: " + (.["index/scan_bytes_read"] | add | tostring) +
  "\n  total_scan_duration: " + (.["index/total_scan_duration"] | add | tostring)
  '
```
