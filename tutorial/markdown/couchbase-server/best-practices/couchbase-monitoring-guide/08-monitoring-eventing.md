---
# frontmatter
path: '/tutorial-monitoring-eventing-service'
title: Monitoring Eventing Service
short_title: Eventing Service
description: 
  - Learn about the available Eventing service statistics as well as individual function-level metrics for eventing functions 
  - See how to fetch various statistics with GET requests
  - Learn which metrics are most relevant for monitoring
content_type: tutorial
filter: observability
technology: 
  - eventing
  - server
tags:
  - Monitoring
  - Metrics
  - Observability
sdk_language:
  - any
length: 10 Mins
---

## Eventing Service-Level Stats

The Eventing stats are an aggregate for all of the Eventing Functions deployed, either for the entire cluster or a specific node.

### Available Stats

| **Stat name**                      | **Description**                                                                                                                                         |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| eventing/bucket_op_exception_count | Total number of bucket operations inside of an Eventing function which have resulted in an exception                                                    |
| eventing/checkpoint_failure_count  | Total number of failures when checkpointing last processed sequence numbers by v8 worker. Failures are retried using exponential backoff until timeout. |
| eventing/dcp_backlog               | Remaining mutations to process                                                                                                                          |
| eventing/failed_count              | Total number of failed Eventing function operations                                                                                                     |
| eventing/n1ql_op_exception_count   | Total number of N1QL operations inside of an Eventing function which have resulted in an exception                                                      |
| eventing/on_delete_failure         | The total number `OnDelete` handler executions that have failed for all functions                                                                       |
| eventing/on_delete_success         | Total `OnDelete` handler executions that have succeeded for all functions                                                                               |
| eventing/on_update_failure         | Total `OnUpdate` handler executions that have failed for all functions                                                                                  |
| eventing/on_update_success         | Total `OnUpdate` handler executions that have succeeded for all functions                                                                               |
| eventing/processed_count           | Total number of mutations that have been processed                                                                                                      |
| eventing/timeout_count             | Total number of handler executions were terminated because the handler ran longer than the configured script timeout                                    |

---

### `GET` Cluster Eventing Service Stats

These endpoints are informational and should not be used for monitoring as they are an aggregate for the entire and cluster and the best practice is to monitor each node individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@eventing/stats](http://localhost:8091/pools/default/buckets/@eventing/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@eventing/stats](https://localhost:8091/pools/default/buckets/@eventing/stats)

#### Example

The following example demonstrates how to retrieve the eventing service stats for the cluster.

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@eventing/stats | \
  jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
    select(.key | split("/") | length == 2) |
    "  " + (.key) + ": " +
      (.value | add / length | tostring)'
```

### `GET` Node-Level Eventing Service Stats

Each node in the cluster running the eventing service should be monitoring individually using the endpoint listed below.

- Insecure: [http://localhost:8091/pools/default/buckets/@eventing/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@eventing/nodes/{NODE}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@eventing/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/@eventing/nodes/{NODE}/stats)

#### Example: Stats for Individual Node

The following example demonstrates how to retrieve the eventing service stats for a specific node in the cluster.

```bash
NODE="172.17.0.2:8091"

curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@eventing/nodes/$NODE/stats | \
  jq -r -c '.op.samples |
  "  eventing/bucket_op_exception_count: " +
    (.["eventing/bucket_op_exception_count"] | add / length | tostring) +
  "\n  eventing/checkpoint_failure_count: " +
    (.["eventing/checkpoint_failure_count"] | add / length | tostring) +
  "\n  eventing/dcp_backlog: " +
    (.["eventing/dcp_backlog"] | add / length | tostring) +
  "\n  eventing/failed_count: " +
    (.["eventing/failed_count"] | add / length | tostring) +
  "\n  eventing/n1ql_op_exception_count: " +
    (.["eventing/n1ql_op_exception_count"] | add / length | tostring) +
  "\n  eventing/on_delete_failure: " +
    (.["eventing/on_delete_failure"] | add / length | tostring) +
  "\n  eventing/on_delete_success: " +
    (.["eventing/on_delete_success"] | add / length | tostring) +
  "\n  eventing/on_update_failure: " +
    (.["eventing/on_update_failure"] | add / length | tostring) +
  "\n  eventing/on_update_success: " +
    (.["eventing/on_update_success"] | add / length | tostring) +
  "\n  eventing/processed_count: " +
    (.["eventing/processed_count"] | add / length | tostring) +
  "\n  eventing/timeout_count: " +
    (.["eventing/timeout_count"] | add / length | tostring)'
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
    select(.services | contains(["eventing"]) == true) |
    .hostname'
  )
do
  echo "$node Function Stats"
  echo "-------------------------------------------------------"
  # get the eventing stats for the specific node
  curl \
    --user Administrator:password \
    --silent \
    --request GET \
    --data zoom=minute \
    http://localhost:8091/pools/default/buckets/@eventing/nodes/$node/stats | \
    jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
      select(.key | split("/") | length == 2) |
      "  " + (.key | split("/")[1]) + ": " +
        (.value | add / length | tostring)'
done
```

### Key Metrics to Monitor

| **Couchbase Metric**                                                                                                                                                                   | **Description**                             | **Response**                                                                                                                        |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- |
| eventing/bucket_op_exception_count<br>eventing/failed_count <br>eventing/n1ql_op_exception_count<br>eventing/on_delete_failure<br>eventing/on_update_failure<br>eventing/timeout_count | Any exceptions/failures should be monitored | For this value "normal" is 0, any value other than 0 would indicate exceptions are being thrown and should be investigated          |
| eventing/dcp_backlog                                                                                                                                                                   | The number of items to be processed.        | Create a baseline for this value as "normal" will be dependent upon your workload and number of functions. Alert at 2x of baseline. |

## Eventing Function-Level Stats

The Eventing stats for a specific functions are available only once the function has been deployed. The same stats that are available for the service as a whole are also available on a per-function basis and can be retrieved for the entire cluster or a specific node in the cluster.

### Available Stats

| **Stat name**                                      | **Description**                                                                                                     |
| :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| eventing/{function_name}/bucket_op_exception_count | Total number of operations inside of an Eventing function which have resulted in an exception for the function      |
| eventing/{function_name}/checkpoint_failure_count  | Total number of checkpoint failures for the function                                                                |
| eventing/{function_name}/dcp_backlog               | Remaining mutations to process                                                                                      |
| eventing/{function_name}/failed_count              | Total number of failed Eventing function operations for the function                                                |
| eventing/{function_name}/n1ql_op_exception_count   | Total number of N1QL operations inside of an Eventing function which have resulted in an exception for the function |
| eventing/{function_name}/on_delete_failure         | The total number `OnDelete` handler executions that have failed for the function                                    |
| eventing/{function_name}/on_delete_success         | Total `OnDelete` handler executions that have succeeded for the function                                            |
| eventing/{function_name}/on_update_failure         | Total `OnUpdate` handler executions that have failed for the function                                               |
| eventing/{function_name}/on_update_success         | Total `OnUpdate` handler executions that have succeeded for the function                                            |
| eventing/{function_name}/processed_count           | Total number of mutations that have been processed for the function                                                 |
| eventing/{function_name}/timeout_count             | Total number of handler executions that have resulted in a timeout for the function                                 |

### `GET` Cluster Eventing Function Stats

These endpoints are informational and should not be used for monitoring as they are an aggregate for the entire and cluster and the best practice is to monitor each node individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@eventing/stats](http://localhost:8091/pools/default/buckets/@eventing/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@eventing/stats](https://localhost:8091/pools/default/buckets/@eventing/stats)

#### Example

The following example demonstrates how to retrieve the eventing service stats for the cluster.

```bash
curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@eventing/stats | \
  jq -r '.op.samples | to_entries | sort_by(.key) | .[] |
    select(.key | split("/") | length == 3) |
    "  " + (.key) + ": " +
      (.value | add / length | tostring)'
```

### `GET` Eventing Function Stats per Node

Each node in the cluster running the eventing service should be monitoring individually, although as functions can be dynamic, from a manageability standpoint, it will be easier to monitor the aggregate stats of the service. However, each individual function can be monitored if you so choose.

- Insecure: [http://localhost:8091/pools/default/buckets/@eventing/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@eventing/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@eventing/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/@eventing/stats)

#### Example

The following example demonstrates how to retrieve the specific eventing function stats for the node.

```bash
NODE="172.17.0.2:8091"

curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@eventing/nodes/$NODE/stats | \
  jq -r '.op.samples as $stats
    | $stats | [
      keys | .[] | select(. | split("/") | length == 3) | split("/")[1]
    ] | sort | unique as $funcs
    | $funcs | .[] |
    "Function: " + . +
    "\n----------------------------------------------------------------" +
    "\n  bucket_op_exception_count: " +
      ($stats["eventing/" + . + "/bucket_op_exception_count"] | add | tostring) +
    "\n  checkpoint_failure_count: " +
      ($stats["eventing/" + . + "/checkpoint_failure_count"] | add | tostring) +
    "\n  dcp_backlog: " +
      ($stats["eventing/" + . + "/dcp_backlog"] | add | tostring) +
    "\n  failed_count: " +
      ($stats["eventing/" + . + "/failed_count"] | add | tostring) +
    "\n  n1ql_op_exception_count: " +
      ($stats["eventing/" + . + "/n1ql_op_exception_count"] | add | tostring) +
    "\n  on_delete_failure: " +
      ($stats["eventing/" + . + "/on_delete_failure"] | add / length | tostring) +
    "\n  on_delete_success: " +
      ($stats["eventing/" + . + "/on_delete_success"] | add / length  | tostring) +
    "\n  on_update_failure: " +
      ($stats["eventing/" + . + "/on_update_failure"] | add / length | tostring) +
    "\n  on_update_success: " +
      ($stats["eventing/" + . + "/on_update_success"] | add / length | tostring) +
    "\n  processed_count: " +
      ($stats["eventing/" + . + "/processed_count"] | add / length | tostring) +
    "\n  timeout_count: " +
      ($stats["eventing/" + . + "/timeout_count"] | add | tostring)
    '
```

### Key Metrics to Monitor

| **Couchbase Metric**                                                                                                                                                                                                                                           | **Description**                             | **Response**                                                                                                                        |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- |
| eventing/{func_name}/bucket_op_exception_count<br>eventing/{func_name}/failed_count <br>eventing/{func_name}/n1ql_op_exception_count<br>eventing/{func_name}/on_delete_failure<br>eventing/{func_name}/on_update_failure<br>eventing/{func_name}/timeout_count | Any exceptions/failures should be monitored | For this value "normal" is 0, any value other than 0 would indicate exceptions are being thrown and should be investigated          |
| eventing/{func_name}/dcp_backlog                                                                                                                                                                                                                               | The number of items to be processed.        | Create a baseline for this value as "normal" will be dependent upon your workload and number of functions. Alert at 2x of baseline. |
