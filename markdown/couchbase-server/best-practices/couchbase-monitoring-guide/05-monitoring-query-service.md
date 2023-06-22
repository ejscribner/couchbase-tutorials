---
# frontmatter
path: '/tutorial-monitoring-query-service'
title: Monitoring Query Service
short_title: Query Service
description: 
  - Learn about all the query service statistics available and what they mean
  - See how to GET cluster-level and node-level query stats
  - Learn about which query metrics are most relevant to monitor
content_type: tutorial
filter: observability
technology:
  - query
  - server
landing_page: devops
landing_order: 4
tags:
  - Monitoring
  - Metrics
  - Observability
sdk_language:
  - any
length: 10 Mins
---

## Query Service-Level Stats

The following Query stats are available via the Cluster-Wide or Per-Node Endpoints listed below.

### Available Stats

| **Stat name**           | **Description**                                             |
| :---------------------- | :---------------------------------------------------------- |
| query_avg_req_time      | The average total request time.                             |
| query_avg_svc_time      | The average time of the query service for requests.         |
| query_avg_response_size | The average size in bytes of the resonse.                   |
| query_avg_result_count  | The average number of results being returned.               |
| query_active_requests   | The number of active requests.                              |
| query_errors            | The number of queries resulting in an error.                |
| query_invalid_requests  | The number of invalid / incorrectly formatted queries.      |
| query_queued_requests   | The number of query requests that have been queued.         |
| query_request_time      | The current request duration.                               |
| query_requests          | The current number of requests per second.                  |
| query_requests_1000ms   | The number of queries greater than 1000ms.                  |
| query_requests_250ms    | The number of queries greater than 250ms.                   |
| query_requests_5000ms   | The number of queries greater than 5000ms.                  |
| query_requests_500ms    | The number of queries greater than 500ms.                   |
| query_result_count      | The number of results returned.                             |
| query_result_size       | The result query result size.                               |
| query_selects           | The number of selects being executed.                       |
| query_service_time      | The time spent by the query service to service the request. |
| query_warnings          | The number of query warnings generated.                     |

---

### `GET` Cluster Query Service Stats

These endpoints are informational and should not be used for monitoring as they are an aggregate for the entire and cluster and the best practice is to monitor each node individually.

- Insecure: [http://localhost:8091/pools/default/buckets/@query/stats](http://localhost:8091/pools/default/buckets/@query/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@query/stats](https://localhost:8091/pools/default/buckets/@query/stats)

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

### `GET` Node-Level Query Service Stats

Each node in the cluster running the query service should be monitoring individually using the endpoint listed below.

- Insecure: [http://localhost:8091/pools/default/buckets/@query/nodes/{NODE}/stats](http://localhost:8091/pools/default/buckets/@query/nodes/{NODE}/stats)
- Secure: [https://localhost:18091/pools/default/buckets/@query/nodes/{NODE}/stats](https://localhost:8091/pools/default/buckets/@query/nodes/{NODE}/stats)

#### Example: Stats for Individual Node

The following example demonstrates how to retrieve the query service stats for the cluster.

```bash
NODE="172.17.0.2:8091"

curl \
  --user Administrator:password \
  --silent \
  --request GET \
  --data zoom=minute \
  http://localhost:8091/pools/default/buckets/@query/nodes/$NODE/stats | \
  jq -r -c '.op.samples |
  "  query_avg_req_time: " + (.query_avg_req_time | add / length | tostring) +
  "\n  query_avg_svc_time: " + (.query_avg_svc_time | add / length | tostring) +
  "\n  query_avg_response_size: " + (.query_avg_response_size | add / length | tostring) +
  "\n  query_avg_result_count: " + (.query_avg_result_count | add / length | tostring) +
  "\n  query_active_requests: " + (.query_active_requests | add | tostring) +
  "\n  query_errors: " + (.query_errors | add | tostring) +
  "\n  query_invalid_requests: " + (.query_invalid_requests | add | tostring) +
  "\n  query_queued_requests: " + (.query_queued_requests | add | tostring) +
  "\n  query_request_time: " + (.query_request_time | add | tostring) +
  "\n  query_requests: " + (.query_requests | add | tostring) +
  "\n  query_requests_1000ms: " + (.query_requests_1000ms | add | tostring) +
  "\n  query_requests_250ms: " + (.query_requests_250ms | add | tostring) +
  "\n  query_requests_5000ms: " + (.query_requests_5000ms | add | tostring) +
  "\n  query_requests_500ms: " + (.query_requests_500ms | add | tostring) +
  "\n  query_result_count: " + (.query_result_count | add | tostring) +
  "\n  query_result_size: " + (.query_result_size | add | tostring) +
  "\n  query_selects: " + (.query_selects | add | tostring) +
  "\n  query_service_time: " + (.query_service_time | add | tostring) +
  "\n  query_warnings: " + (.query_warnings | add | tostring)'
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
    select(.services | contains(["n1ql"]) == true) |
    .hostname'
  )
do
  echo "$node Query Stats"
  echo "-------------------------------------------------------"
  # get the query stats for the specific node
  curl \
    --user Administrator:password \
    --silent \
    --request GET \
    --data zoom=minute \
    http://localhost:8091/pools/default/buckets/@query/nodes/$node/stats | \
    jq -r '.op.samples | to_entries[] | select(.key != "timestamp") |
      .key + ": " + (.value | add / length | tostring)'
done
```

### Key Metrics to Monitor

| **Couchbase Metric** | **Description**                                     | **Response**                                                                                                                                                                                                            |
| :------------------- | :-------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query_avg_svc_time   | The average time of the query service for requests. | Create a baseline for this value, as "normal" will depend on workload. Alert at 2x of the baseline. This would indicate that more query nodes may be needed or indexes are performing slowly and require investigation. |
| query_requests       | The number of query requests per second.            | Create a baseline for this value, as "normal" will depend on workload. Alert at 2x of the baseline. This would indicate an increase in query traffic.                                                                   |
