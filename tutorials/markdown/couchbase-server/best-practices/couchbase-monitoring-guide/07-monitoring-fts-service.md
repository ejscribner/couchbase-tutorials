---
# frontmatter
path: '/tutorial-monitoring-fts-service'
title: Monitoring FTS Service
short_title: FTS Service
description: 
  - Learn about various Full Text Search (FTS) stats, including service-level and index-level metrics
  - View example requests to fetch relevant FTS statistics
content_type: tutorial
filter: observability
technology:
  - fts
  - server
landing_page: devops
landing_order: 6
tags:
  - Monitoring
  - Metrics
  - Observability
sdk_language:
  - any
length: 10 Mins
---

## `GET` Full-Text Search Indexes

We can **GET** Full-Text Search Indexes according to the documentation for [Couchbase Rest FTS Indexing](https://docs.couchbase.com/server/6.0/rest-api/rest-fts-indexing.html#index-definition) using:

`http://localhost:8094/api/index`

Retrieve all index definitions and configurations

### Example

The following example illustrates how to retrieve each FTS index name

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8094/api/index |
  jq -r '.indexDefs.indexDefs | keys | .[]'
```

## FTS Service-Level Stats

### Available Stats

| **Stat name**                        | **Description**                                         |
| :----------------------------------- | :------------------------------------------------------ |
| fts_curr_batches_blocked_by_herder   | The number of batches blocked by the herder             |
| fts_num_bytes_used_ram               | The number of bytes used in memory for the FTS service. |
| fts_total_queries_rejected_by_herder | The number of queries rejected by the herder            |

### `GET` Cluster FTS Service Stats

These endpoints are informational and should not be used for monitoring as they are an aggregate for the entire and cluster and the best practice is to monitor each node individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@fts/stats](http://localhost:8091/pools/default/buckets/@fts/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@fts/stats](https://localhost:8091/pools/default/buckets/@fts/stats)

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@fts/stats | \
  jq -r '.op.samples |
    "fts_num_bytes_used_ram:  " + (.fts_num_bytes_used_ram | add / length | tostring)'
```

### `GET` Node-Level FTS Service Stats

Each node in the cluster running the FTS service should be monitoring individually using the endpoint listed below.

- Insecure: [http://localhost:8091/pools/default/buckets/@fts/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@fts/nodes/{NODE}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@fts/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/@fts/nodes/{NODE}/stats)

#### Example: Stats for Individual Node

The following example demonstrates how to retrieve the FTS service stats for the cluster.

```bash
NODE="172.17.0.2:8091"

curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@fts/nodes/$NODE/stats | \
  jq -r '.op.samples |
    "fts_num_bytes_used_ram:  " + (.fts_num_bytes_used_ram | add / length | tostring)'
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
    select(.services | contains(["fts"]) == true) |
    .hostname'
  )
do
  echo "$node FTS Stats"
  echo "-------------------------------------------------------"
  # get the FTS stats for the specific node
  curl \
    --user Administrator:password \
    --silent \
    --request GET \
    --data zoom=minute \
    http://localhost:8091/pools/default/buckets/@fts/nodes/$node/stats | \
    jq -r '.op.samples |
      "fts_num_bytes_used_ram:  " + (.fts_num_bytes_used_ram | add / length | tostring)'
done
```

## Individual FTS-Level Stats

The FTS stats for a specific indexes are available only under the bucket that the index is created on. The same stats that are available for the service as a whole are also available on a per-index basis and can be retrieved for the entire cluster or a specific node in the cluster.

### Available Stats

| **Stat name**                                  | **Description**                                                    |
| :--------------------------------------------- | :----------------------------------------------------------------- |
| fts/{indexName}/avg_queries_latency            | The average query latency in milliseconds                          |
| fts/{indexName}/doc_count                      | The number of documents in the index                               |
| fts/{indexName}/num_bytes_used_disk            | Total disk file size used by the index                             |
| fts/{indexName}/num_files_on_disk              | Number of files for the index on disk                              |
| fts/{indexName}/num_mutations_to_index         | The number of documents pending indexing                           |
| fts/{indexName}/num_pindexes_actual            | Number of index partitions (including replica partitions)          |
| fts/{indexName}/num_pindexes_target            | Number of index partitions expected (including replica partitions) |
| fts/{indexName}/num_recs_to_persist            | Number of index records not yet persisted to disk                  |
| fts/{indexName}/num_root_filesegments          | The number of root file segments                                   |
| fts/{indexName}/num_root_memorysegments        | The number of root memory segments                                 |
| fts/{indexName}/total_bytes_indexed            | Number of fts bytes indexed per second                             |
| fts/{indexName}/total_bytes_query_results      | Number of bytes returned in results per second                     |
| fts/{indexName}/total_compaction_written_bytes | Number of compaction bytes written per second                      |
| fts/{indexName}/total_queries                  | The number of queries per second                                   |
| fts/{indexName}/total_queries_error            | The number of query errors per second                              |
| fts/{indexName}/total_queries_slow             | The number of slow queries per second (>5s)                        |
| fts/{indexName}/total_queries_timeout          | The number of queries per second that resulted in a timeout        |
| fts/{indexName}/total_request_time             | Total time spent servicing requests                                |
| fts/{indexName}/total_term_searchers           | Number of term searchers started per second                        |

---

### `GET` Cluster Individual FTS Stats

These endpoints are informational and should not be used for monitoring as they are an aggregate for the entire and cluster and the best practice is to monitor each node individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@fts-{BUCKET}/stats](http://localhost:8091/pools/default/buckets/@fts-{BUCKET}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@fts-{BUCKET}/stats](https://localhost:8091/pools/default/buckets/@fts-{BUCKET}/stats)

#### Example

The following example demonstrates how to retrieve the eventing service stats for the cluster.

```bash
BUCKET="travel-sample"

curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@fts-$BUCKET/stats | \
  jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
    select(.key | split("/") | length == 3) |
    "  " + (.key) + ": " +
      (.value | add / length | tostring)'
```

### `GET` Individual FTS Stats per Node

Each node in the cluster running the FTS service should be monitoring individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@fts-{BUCKET}/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@fts-{BUCKET}/nodes/{NODE}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@fts-{BUCKET}/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/@fts-{BUCKET}/nodes/{NODE}/stats)

#### Example: Stats for Individual Node

The following example demonstrates how to retrieve all of the FTS stats for a specific index in a bucket for a specific node.

```bash
NODE="172.17.0.2:8091"
BUCKET="travel-sample"
INDEX="demo"

# get the FTS stats for the bucket
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@fts-$BUCKET/nodes/$NODE/stats | \
  jq -r --arg index "$INDEX" '.op.samples |
  "  avg_queries_latency: " +
    (.["fts/" + $index + "/avg_queries_latency"] | add / length | tostring) +
  "\n  doc_count: " +
    (.["fts/" + $index + "/doc_count"] | add / length | tostring) +
  "\n  num_bytes_used_disk: " +
    (.["fts/" + $index + "/num_bytes_used_disk"] | add / length | tostring) +
  "\n  num_mutations_to_index: " +
    (.["fts/" + $index + "/num_mutations_to_index"] | add | tostring) +
  "\n  num_pindexes_actual: " +
    (.["fts/" + $index + "/num_pindexes_actual"] | add | tostring) +
  "\n  num_pindexes_target: " +
    (.["fts/" + $index + "/num_pindexes_target"] | add | tostring) +
  "\n  num_recs_to_persist: " +
    (.["fts/" + $index + "/num_recs_to_persist"] | add | tostring) +
  "\n  total_bytes_indexed: " +
    (.["fts/" + $index + "/total_bytes_indexed"] | add / length | tostring) +
  "\n  total_bytes_query_results: " +
    (.["fts/" + $index + "/total_bytes_query_results"] | add / length | tostring) +
  "\n  total_compaction_written_bytes: " +
    (.["fts/" + $index + "/total_compaction_written_bytes"] | add / length | tostring) +
  "\n  total_queries: " +
    (.["fts/" + $index + "/total_queries"] | add | tostring) +
  "\n  total_queries_error: " +
    (.["fts/" + $index + "/total_queries_error"] | add | tostring) +
  "\n  total_queries_slow: " +
    (.["fts/" + $index + "/total_queries_slow"] | add | tostring) +
  "\n  total_queries_timeout: " +
    (.["fts/" + $index + "/total_queries_timeout"] | add | tostring) +
  "\n  total_request_time+queued: " +
    (.["fts/" + $index + "/total_request_time"] | add | tostring) +
  "\n  total_term_searchers: " +
    (.["fts/" + $index + "/total_term_searchers"] | add | tostring)'
```

#### Example: Stats for Individual Node

The following example demonstrates how to retrieve all of the FTS stats, for every bucket in the cluster for a single node.

```bash
NODE="172.17.0.2:8091"

# loop over each of the buckets that has indexes
for bucket in $(curl \
  --user Administrator:password \
  --silent \
  --request GET \
  http://localhost:8094/api/index | \
  jq -r '.indexDefs.indexDefs | [ to_entries[] | .value.sourceName ] | sort | unique | .[]')
do
  echo ""
  echo "Bucket: $bucket"
  echo "================================================================"
  # get the FTS stats for the bucket
  curl \
    --user Administrator:password \
    --silent \
    --request GET \
    --data zoom=minute \
    http://localhost:8091/pools/default/buckets/@fts-$bucket/nodes/$NODE/stats | \
    # 1. reduce the samples object, by looping over each property, only work with properties
    # who are index specific stat properties and either sum or average samples
    # 2. get all of the unique index keys
    # 3. loop over each index and output the stats
    jq -r '
      reduce (.op.samples | to_entries[]) as {$key, $value} (
        {};
        if (
          $key | split("/") | length == 3
          and ($key | contains("replica ") | not)
        ) then
          if ([
            "num_mutations_to_index","num_pindexes_actual",
            "num_pindexes_target","num_recs_to_persist","total_queries",
            "total_queries_error","total_queries_slow","total_queries_timeout",
            "total_request_time+queued","total_term_searchers"
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
      "\n  avg_queries_latency: "
        + ($stats["fts\/" + . + "\/avg_queries_latency"] | tostring ) +
      "\n  doc_count: "
        + ($stats["fts\/" + . + "\/doc_count"] | tostring) +
      "\n  num_bytes_used_disk: "
        + ($stats["fts\/" + . + "\/num_bytes_used_disk"] | tostring) +
      "\n  num_mutations_to_index: "
        + ($stats["fts\/" + . + "\/num_mutations_to_index"] | tostring) +
      "\n  num_pindexes_actual: "
        + ($stats["fts\/" + . + "\/num_pindexes_actual"] | tostring) +
      "\n  num_pindexes_target: "
        + ($stats["fts\/" + . + "\/num_pindexes_target"] | tostring) +
      "\n  num_recs_to_persist: "
        + ($stats["fts\/" + . + "\/num_recs_to_persist"] | tostring) +
      "\n  total_bytes_indexed: "
        + ($stats["fts\/" + . + "\/total_bytes_indexed"] | tostring) +
      "\n  total_bytes_query_results: "
        + ($stats["fts\/" + . + "\/total_bytes_query_results"] | tostring) +
      "\n  total_compaction_written_bytes: "
        + ($stats["fts\/" + . + "\/total_compaction_written_bytes"] | tostring) +
      "\n  total_queries: "
        + ($stats["fts\/" + . + "\/total_queries"] | tostring) +
      "\n  total_queries_error: "
        + ($stats["fts\/" + . + "\/total_queries_error"] | tostring) +
      "\n  total_queries_slow: "
        + ($stats["fts\/" + . + "\/total_queries_slow"] | tostring) +
      "\n  total_queries_timeout: "
        + ($stats["fts\/" + . + "\/total_queries_timeout"] | tostring) +
      "\n  total_request_time: "
        + ($stats["fts\/" + . + "\/total_request_time"] | tostring) +
      "\n  total_term_searchers: "
        + ($stats["fts\/" + . + "\/total_term_searchers"] | tostring) +
      "\n"
    '
done
```

### Key Metrics to Monitor

| **Couchbase Metric**                         | **Description**                           | **Response**                                                                                                                                                     |
| :------------------------------------------- | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| avg_queries_latency                          | The average query latency                 | Create a baseline for this value, as "normal" will depend on the size. Alert at 2x of the baseline. This would indicate a slowdown for index scans to the index. |
| total_queries                                | The number of query requests to the index | Create a baseline for this value, as "normal" will depend on the amount. Alert at 2x of the baseline. This would indicate a dramatic increase in requests.       |
| total_queries_error<br>total_queries_timeout | The number of query errors to the index   | Alert at any value greater than 0 as this indicates failed requests.                                                                                             |

## FTS Aggregate Stats

The FTS aggregate stats for a specific bucket are available only under the bucket that the indexes exist on and are a total of all of the indexes for that bucket in the cluster or node.

### Available Stats

| **Stat name**                      | **Description**                                                    |
| :--------------------------------- | :----------------------------------------------------------------- |
| fts/doc_count                      | The number of documents in all fts indexes                         |
| fts/num_bytes_used_disk            | Total disk file size used by the indexes                           |
| fts/num_files_on_disk              | The number of index files on disk                                  |
| fts/num_mutations_to_index         | The number of documents pending indexing                           |
| fts/num_pindexes_actual            | Number of index partitions (including replica partitions)          |
| fts/num_pindexes_target            | Number of index partitions expected (including replica partitions) |
| fts/num_recs_to_persist            | Number of index records not yet persisted to disk                  |
| fts/num_root_filesegments          | Number of root file segments                                       |
| fts/num_root_memorysegments        | Number of root memory segments                                     |
| fts/total_bytes_indexed            | Number of fts bytes indexed per second                             |
| fts/total_bytes_query_results      | Number of bytes returned in results per second                     |
| fts/total_compaction_written_bytes | Number of compaction bytes written per second                      |
| fts/total_queries                  | The number of queries per second                                   |
| fts/total_queries_error            | The number of query errors per second                              |
| fts/total_queries_slow             | The number of slow queries per second (>5s)                        |
| fts/total_queries_timeout          | The number of queries per second that resulted in a timeout        |
| fts/total_request_time             |                                                                    |
| fts/total_term_searchers           | Number of term searchers started per second                        |

### `GET` Cluster FTS Aggregate Stats

- Insecure: [http://localhost:8091/pools/default/buckets/@fts-{BUCKET}/stats](http://localhost:8091/pools/default/buckets/@fts-{BUCKET}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@fts-{BUCKET}/stats](https://localhost:8091/pools/default/buckets/@fts-{BUCKET}/stats)

#### Example: Stats for Cluster

The following example demonstrates how to retrieve all of the fts aggregate stats for a specific bucket in the entire cluster.

```bash
BUCKET="travel-sample"

# get the FTS stats for the bucket
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@fts-$BUCKET/stats | \
  jq -r '.op.samples |
  "  doc_count: " + (.["fts/doc_count"] | add / length | tostring) +
  "\n  num_bytes_used_disk: " + (.["fts/num_bytes_used_disk"] | add / length | tostring) +
  "\n  num_mutations_to_index: " + (.["fts/num_mutations_to_index"] | add / length | tostring) +
  "\n  num_pindexes_actual: " + (.["fts/num_pindexes_actual"] | add | tostring) +
  "\n  num_pindexes_target: " + (.["fts/num_pindexes_target"] | add / length | tostring) +
  "\n  total_bytes_indexed: " + (.["fts/total_bytes_indexed"] | add / length | tostring) +
  "\n  total_bytes_query_results: " + (.["fts/total_bytes_query_results"] | add / length | tostring) +
  "\n  total_compaction_written_bytes: " + (.["fts/total_compaction_written_bytes"] | add / length | tostring) +
  "\n  total_queries: " + (.["fts/total_queries"] | add / length | tostring) +
  "\n  total_queries_error: " + (.["fts/total_queries_error"] | add / length | tostring) +
  "\n  total_queries_slow: " + (.["fts/total_queries_slow"] | add / length | tostring) +
  "\n  total_queries_timeout: " + (.["fts/total_queries_timeout"] | add / length | tostring) +
  "\n  total_request_time: " + (.["fts/total_request_time"] | add | tostring) +
  "\n  total_term_searchers: " + (.["fts/total_term_searchers"] | add | tostring)'
```

### `GET` FTS Aggregate Stats per Node

- Insecure: [http://localhost:8091/pools/default/buckets/@fts-{BUCKET}/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@fts-{BUCKET}/nodes/{NODE}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@fts-{BUCKET}/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/@fts-{BUCKET}/nodes/{NODE}/stats)

#### Example: Aggregate Stats for Individual Node

The following example demonstrates how to retrieve all of the index aggregate stats for a specific in a bucket for a specific node.

```bash
BUCKET="travel-sample"
NODE="172.17.0.2:8091"

# get the FTS stats for the bucket
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@fts-$BUCKET/nodes/$NODE/stats | \
  jq -r '.op.samples |
  "  doc_count: " + (.["fts/doc_count"] | add / length | tostring) +
  "\n  num_bytes_used_disk: " + (.["fts/num_bytes_used_disk"] | add / length | tostring) +
  "\n  num_mutations_to_index: " + (.["fts/num_mutations_to_index"] | add / length | tostring) +
  "\n  num_pindexes_actual: " + (.["fts/num_pindexes_actual"] | add | tostring) +
  "\n  num_pindexes_target: " + (.["fts/num_pindexes_target"] | add / length | tostring) +
  "\n  total_bytes_indexed: " + (.["fts/total_bytes_indexed"] | add / length | tostring) +
  "\n  total_bytes_query_results: " + (.["fts/total_bytes_query_results"] | add / length | tostring) +
  "\n  total_compaction_written_bytes: " + (.["fts/total_compaction_written_bytes"] | add / length | tostring) +
  "\n  total_queries: " + (.["fts/total_queries"] | add / length | tostring) +
  "\n  total_queries_error: " + (.["fts/total_queries_error"] | add / length | tostring) +
  "\n  total_queries_slow: " + (.["fts/total_queries_slow"] | add / length | tostring) +
  "\n  total_queries_timeout: " + (.["fts/total_queries_timeout"] | add / length | tostring) +
  "\n  total_request_time: " + (.["fts/total_request_time"] | add | tostring) +
  "\n  total_term_searchers: " + (.["fts/total_term_searchers"] | add | tostring)'
```
