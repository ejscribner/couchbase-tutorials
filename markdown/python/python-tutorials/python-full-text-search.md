---
# frontmatter
path: '/tutorial-python-full-text-search'
title: Full Text Search with Python
short_title: Full Text Search
description:
  - Create, manage and query full text indexes on documents stored in Couchbase buckets
  - Query a Search Index from the SDK
  - Control consistency with `ScanConsistency` and `ConsistentWith`
content_type: tutorial
filter: sdk
technology:
  - server
  - fts
exclude_tutorials: true
tags:
  - SQL++ (N1QL)
sdk_language:
  - python
length: 30 Mins
---

In this tutorial, you will how to create queryable full-text indexes in Couchbase Server.

## Introduction

You can use the Full Text Search service (FTS) to create queryable full-text indexes in Couchbase Server.

Full Text Search or FTS allows you to create, manage and query full text indexes on JSON documents stored in Couchbase buckets. It uses natural language processing for indexing and querying documents, provides relevance scoring on the results of your queries and has fast indexes for querying a wide range of possible text searches.

Some of the supported query-types include simple queries like Match and Term queries, range queries like Date Range and Numeric Range and compound queries for conjunctions, disjunctions and/or boolean queries.

## Getting Started

After familiarizing yourself with how to create and query a [Search index in the UI](https://docs.couchbase.com/server/current/fts/fts-introduction.html), you can query it from the SDK. Intentionally the API itself is very similar to the query and analytics ones, the main difference being that you cannot cast the resulting rows into a domain object directly but rather get a SearchRow returned. The reason for this is that a search row ("hit") has more metadata associated with it than you potentially want to look at.

```python
from couchbase.cluster import Cluster, ClusterOptions, ClusterTimeoutOptions
from couchbase.auth import PasswordAuthenticator
from couchbase.exceptions import CouchbaseException
import couchbase.search as search

pa = PasswordAuthenticator('username', 'password')
cluster = Cluster('couchbase://127.0.0.1', ClusterOptions(pa))

# Connect options - global timeout opts
timeout_opts = ClusterTimeoutOptions(kv_timeout=timedelta(seconds=30))
options=ClusterOptions(PasswordAuthenticator('username', 'password'), timeout_options=timeout_opts)

bucket = cluster.bucket("travel-sample")
collection = bucket.default_collection()

try:
    result = cluster.search_query(
        "travel-sample-index", search.QueryStringQuery("swanky"))

    for row in result.rows():
        print("Found row: {}".format(row))

    print("Reported total rows: {}".format(
        result.metadata().metrics().total_rows()))

except CouchbaseException as ex:
    import traceback
    traceback.print_exc()
```

Let’s break it down. A Search query is always performed at the `Cluster` level, using the `search_query` method. It takes the name of the index and the type of query as required arguments and then allows it to provide additional options if needed (in the example above, no options are specified). Once a result returns you can iterate over the returned rows, and/or access the `SearchMetaData` associated with the query.

## Search Queries

The second mandatory argument in the example above used `QueryStringQuery("query")` to specify the query to run against the search index. The query string is the simplest form, but there are many more available such as `MatchQuery`, `RegexQuery`, etc. You can combine them with `conjuncts` and `disjuncts` respectively. `Location` objects are specified as a `Tuple[SupportsFloat,SupportsFloat]` of longitude and latitude respectively.

## The Search Result

Once the Search query is executed successfully, the server starts sending back the resultant hits.

```shell
result = cluster.search_query(
    "travel-sample-index", search.PrefixQuery("swim"), SearchOptions(fields=["description"]))

for row in result.rows():
    print("Score: {}".format(row.score))
    print("Document Id: {}".format(row.id))

    # print fields included in query:
    print(row.fields)
```

## Search Options

The `cluster.search_query` function provides an array of named parameters to customize your query via `**kwargs` or `SearchOptions`.

### Limit and Skip

It is possible to limit the returned results to a maximum amount using the limit option. If you want to skip the first N records it can be done with the skip option.

```shell
result = cluster.search_query(
    "travel-sample-index", search.TermQuery("downtown"), SearchOptions(limit=4, skip=3)
```

## ScanConsistency and ConsistentWith

By default, all Search queries will return the data from whatever is in the index at the time of query. These semantics can be tuned if needed so that the hits returned include the most recently performed mutations, at the cost of slightly higher latency since the index needs to be updated first.

There are two ways to control consistency: either by supplying a custom `SearchScanConsistency` or using `consistentWith`. At the moment the cluster only supports `consistentWith`, which is why you only see `SearchScanConsistency.NOT_BOUNDED` in the enum which is the default setting. The way to make sure that recently written documents show up in the rfc works as follows (commonly referred to "read your own writes" — RYOW):

### Scan Consistency

```shell
result = cluster.search_query(
    "travel-sample-index", search.TermQuery("downtown"), SearchOptions(scan_consistency=SearchScanConsistency.NOT_BOUNDED)
```

### ConsistentWith consistency:

```shell
new_airline = {
    "callsign": None,
    "country": "United States",
    "iata": "TX",
    "icao": "TX99",
    "id": 123456789,
    "name": "Howdy Airlines",
    "type": "airline"
}

res = collection.upsert(
    "airline_{}".format(new_airline["id"]), new_airline)

ms = MutationState(res)

result = cluster.search_query(
    "travel-sample-index", search.PrefixQuery("howdy"), SearchOptions(consistent_with=ms))
```

### Highlight

It is possible to enable highlighting for matched fields. You can either rely on the default highlighting style or provide a specific one. The following snippet uses HTML formatting for two fields:

```shell
result = cluster.search_query(
    "travel-sample-index", search.TermQuery("downtown"), SearchOptions(highlight_style=HighlightStyle.Html, highlight_fields=["description", "name"]))
```

### Sort

By default the Search Engine will sort the results in descending order by score. This behavior can be modified by providing a different sorting order which can also be nested.

```shell
result = cluster.search_query(
    "travel-sample-index", search.TermQuery("downtown"), SearchOptions(sort=["_score", "description"]))
```

### Facets

Facets are aggregate information collected on a result set and are useful when it comes to categorization of result data. The SDK allows you to provide many different facet configurations to the Search Engine, the following example shows how to create a facet based on a term.

Facets are useful in providing filters that indicate the number of documents that match the search. You can have the same term matching across different types of documents. Facets provide an aggregation of the documents that match the search term.

```shell
result = cluster.search_query(
    "travel-sample-index", search.QueryStringQuery("north"), SearchOptions(facets={"types": TermFacet("type", 5)}))
```

### Fields

You can tell the Search Engine to include the full content of a certain number of indexed fields in the response.

```shell
result = cluster.search_query(
    "travel-sample-index", search.TermQuery("swanky"), SearchOptions(fields=["name", "description"]))
```

### Collections

It is now possible to limit the search query to a specific list of collection names. This feature is only supported with Couchbase Server 7.0 or later.

```shell
result = cluster.search_query(
    "travel-sample-index", search.TermQuery("downtown"), SearchOptions(collections=["hotel", "airport"]))
```

## Async APIs

In addition to the blocking API on `Cluster`, the SDK provides asyncio and Twisted APIs on `ACluster` or `TxCluster` respectively. If you are in doubt of which API to use, we recommend looking at the asyncio API first. Simple queries with both asyncio and Twisted APIs look similar to the blocking one:

### `ACouchbase`

```python
from acouchbase.cluster import Cluster, get_event_loop
from couchbase.cluster import ClusterOptions, ClusterTimeoutOptions
from couchbase.auth import PasswordAuthenticator
from couchbase.exceptions import CouchbaseException
import couchbase.search as search

async def get_couchbase():
    cluster = Cluster(
        "couchbase://localhost",
        ClusterOptions(PasswordAuthenticator("Administrator", "password")))
    bucket = cluster.bucket("travel-sample")
    await bucket.on_connect()
    collection = bucket.default_collection()

    return cluster, bucket, collection


async def simple_query(cluster):
    try:
        result = cluster.search_query(
            "travel-sample-index", search.QueryStringQuery("swanky"))

        async for row in result:
            print("Found row: {}".format(row))

    except CouchbaseException as ex:
        print(ex)


loop = get_event_loop()
cluster, bucket, collection = loop.run_until_complete(get_couchbase())
loop.run_until_complete(simple_query(cluster))
```

### `TxCouchbase`

```python
from twisted.internet import reactor

from txcouchbase.cluster import TxCluster
from couchbase.cluster import ClusterOptions, ClusterTimeoutOptions
from couchbase.auth import PasswordAuthenticator
import couchbase.search as search


def handle_query_results(result):
    for r in result.rows():
        print("query row: {}".format(r))

    reactor.stop()


cluster = TxCluster("couchbase://localhost",

pa = PasswordAuthenticator('username', 'password')
cluster = Cluster('couchbase://127.0.0.1', ClusterOptions(pa))

# Connect options - global timeout opts
timeout_opts = ClusterTimeoutOptions(kv_timeout=timedelta(seconds=30))
options=ClusterOptions(PasswordAuthenticator('username', 'password'), timeout_options=timeout_opts)

# create a bucket object
bucket = cluster.bucket("travel-sample")
# create a collection object
cb = bucket.default_collection()

d = cluster.search_query("travel-sample-index", search.QueryStringQuery("swanky"))
d.addCallback(handle_query_results)

reactor.run()
```
