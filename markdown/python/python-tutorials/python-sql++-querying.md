---
# frontmatter
path: '/tutorial-python-sql++-querying'
title: SQL++ Querying with Python
short_title: SQL++ Querying
description:
  - Use positional parameters with and without options
  - Learn the types of query options and their uses
  - Querying scan consistencies
content_type: tutorial
filter: sdk
technology:
  - index
  - server
  - query
exclude_tutorials: true
tags:
  - SQL++ (N1QL)
sdk_language:
  - python
length: 30 Mins
---

In this tutorial, you will how to execute SQL++ (formerly N1QL) queries with positional and named parameters, with and without options, how to use scan consistencies, and the Async APIs.

## Introduction

Our query service uses SQL++, which will be fairly familiar to anyone who’s used any dialect of SQL. Before you get started you may wish to check out the [N1QL intro page](hhttps://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/index.html), or just dive in with a query against our "travel-sample" data set. In this case, note that before you can query a bucket, you must define at least one index. You can define a _primary_ index on a bucket. When a primary index is defined you can issue non-covered queries on the bucket as well.

SQL++ queries can be executed in the following ways:

- The Couchbase Query Workbench (in the Web Console)
- The Command-Line based Query Shell (cbq)
- Our REST API
- Any Language SDKs, including the Python SDK

After familiarizing yourself with the basics on how the N1QL query language works and how to query it from the UI you can use it from the Python SDK. Here’s a complete example of doing a query and handling the results:

```python
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions, QueryOptions, ClusterTimeoutOptions
from couchbase.auth import PasswordAuthenticator
from couchbase.exceptions import CouchbaseException
from datetime import timedelta

pa = PasswordAuthenticator('username', 'password')
cluster = Cluster('couchbase://127.0.0.1', ClusterOptions(pa))

# Connect options - global timeout opts
timeout_opts = ClusterTimeoutOptions(kv_timeout=timedelta(seconds=30))
options = ClusterOptions(PasswordAuthenticator('username', 'password'), timeout_options=timeout_opts)


try:
    result = cluster.query(
        "SELECT * FROM `travel-sample`.inventory.airport LIMIT 10", QueryOptions(metrics=True))

    for row in result.rows():
        print("Found row: {}".format(row))
```

Let’s break it down. A query is always performed at the `Cluster` level, using the `query` method. It takes the statement as a required argument and then allows it to provide additional options if needed. Once a result returns you can iterate the returned rows and/or access the `QueryMetaData` associated with the query.

## Queries and Placeholders

Placeholders allow you to specify variable constraints for an otherwise constant query. There are two variants of placeholders: positional and named parameters. Positional parameters use an ordinal placeholder for substitution and named parameters use variables. A named or positional parameter is a placeholder for a value in the WHERE, LIMIT or OFFSET clause of a query. Note that both parameters and options are optional.

Here are some examples of positional and named parameters with & without options using the Python SDK:

### Positional Parameters without Options:

```shell
result = cluster.query(
    "SELECT ts.* FROM `travel-sample`.inventory.airport WHERE city=$1",
    "San Jose")
```

### Positional Parameters with Options:

```shell
result = cluster.query(
    "SELECT ts.* FROM `travel-sample`.inventory.airport WHERE city=$1",
    QueryOptions(positional_parameters=["San Jose"]))
```

### Named Parameters without Options:

```shell
result = cluster.query(
    "SELECT ts.* FROM `travel-sample`.inventory.airport WHERE city=$city",
    city='San Jose')
```

### Named Parameters with Options:

```shell
result = cluster.query(
    "SELECT ts.* FROM `travel-sample`.inventory.airport WHERE city=$city",
    QueryOptions(named_parameters={"city": "San Jose"}))
```

The complete code for this example can be found [here](https://github.com/couchbase/docs-sdk-python/blob/release/3.2/modules/howtos/examples/n1ql_ops.py/).

## The Query Result

When performing a query, the response you receive is a `QueryResult`. If no error is returned then the request succeeded and the result provides access to both the rows returned and also associated `QueryMetaData`.

```shell
result = cluster.query(
    "SELECT ts.* FROM `travel-sample`.inventory.airline LIMIT 10")

# iterate over rows
for row in result:
    # each row is an instance of the query call
    name = row["name"]
    callsign = row["callsign"]
    print("Airline name: {}, callsign: {}".format(name, callsign))
```

The `QueryMetaData` provides insight into some basic profiling/timing information as well as information like the `ClientContextID`.

## Query Options

The query service provides an array of options to customize your query. The following is a list of them all:

- `clientContextId(String)`: Sets a context ID returned by the service for debugging purposes.
- `parameters(JsonArray)`: Allows to set positional arguments for a parameterized query.
- `parameters(JsonObject)`: Allows to set named arguments for a parameterized query.
- `priority(boolean)`: Assigns a different server-side priority to the query.
- `raw(String, Object)`: Escape hatch to add arguments that are not covered by these options.
- `readonly(boolean)`: Tells the client and server that this query is readonly.
- `adhoc(boolean)`: If set to false will prepare the query and later execute the prepared statement.
- `consistentWith(MutationState)`: Allows to be consistent with previously written mutations ("read your own writes").
- `maxParallelism(int)`: Tunes the maximum parallelism on the server.
- `metrics(boolean)`: Enables the server to send metrics back to the client as part of the response.
- `pipelineBatch(int)`: Sets the batch size for the query pipeline.
- `pipelineCap(int)`: Sets the cap for the query pipeline.
- `profile(QueryProfile)`: Allows to enable additional query profiling as part of the response.
- `scanWait(Duration)`: Allows to specify a maximum scan wait time.
- `scanCap(int)`: Specifies a maximum cap on the query scan size.
- `scanConsistency(QueryScanConsistency)`: Sets a different scan consistency for this query.
- `serializer(JsonSerializer)`: Allows to use a different serializer for the decoding of the rows.

### Scan Consistencies

By default, the query engine will return whatever is currently in the index at the time of query (this mode is also called `QueryScanConsistency.NOT_BOUNDED`). If you need to include everything that has just been written, a different scan consistency must be chosen. If `QueryScanConsistency.REQUEST_PLUS` is chosen, it will likely take a bit longer to return the results but the query engine will make sure that it is as up-to-date as possible.

```shell
result = cluster.query(
    "SELECT ts.* FROM `travel-sample`.inventory.airline LIMIT 10",
    QueryOptions(scan_consistency=QueryScanConsistency.REQUEST_PLUS))
```

You can also use `consistent_with=MutationState` for a more narrowed-down scan consistency. Construct the MutationState from individual ‘MutationToken’s that are returned from KV ‘MutationResult’s to make sure at least those mutations are visible. Depending on the index update rate this might provide a speedier response.

```shell
new_hotel = {
    "callsign": None,
    "country": "United States",
    "iata": "TX",
    "icao": "TX99",
    "id": 123456789,
    "name": "Howdy Airlines",
    "type": "airline"
}

res = collection.upsert(
    "airline_{}".format(new_hotel["id"]), new_hotel)

ms = MutationState(res)

result = cluster.query(
    "SELECT ts.* FROM `travel-sample`.inventory.airline LIMIT 10",
    QueryOptions(consistent_with=ms))
```

### Client Context ID

The SDK will always send a client context ID with each query, even if none is provided by the user. By default a UUID will be generated that is mirrored back from the query engine and can be used for debugging purposes. A custom string can always be provided if you want to introduce application-specific semantics into it (so that for example in a network dump it shows up with a certain identifier). Whatever is chosen, we recommend making sure it is unique so different queries can be distinguished during debugging or monitoring.

```shell
result = cluster.query(
    "SELECT ts.* FROM `travel-sample`.inventory.hotel LIMIT 10",
    QueryOptions(client_context_id="user-44{}".format(uuid.uuid4())))
```

### Read Only

If the query is marked as readonly, both the server and the SDK can improve processing of the operation. On the client side, the SDK can be more liberal with retries because it can be sure that there are no state-mutating side-effects happening. The query engine will ensure that actually no data is mutated when parsing and planning the query.

```shell
result = cluster.query(
    "SELECT ts.* FROM `travel-sample`.inventory.hotel LIMIT 10",
    QueryOptions(read_only=True))
```

## Streaming Large Results

By default, the Python SDK will stream the result set from the server, where the client will start a persistent connection with the server and only read the header until the Rows are enumerated; then, each row or JSON object will be deserialized one at a time.

This decreases pressure on Garbage Collection and helps to prevent OutOfMemory errors.

## Async APIs

In addition to the blocking API on Cluster, the SDK provides asyncio and Twisted APIs on `ACluster` or `TxCluster` respectively. If you are in doubt of which API to use, we recommend looking at the asyncio API first.

Simple queries with both asyncio and Twisted APIs look similar to the blocking one:

### `ACouchbase`

```python
from acouchbase.cluster import Cluster, get_event_loop
from couchbase.cluster import ClusterOptions, QueryOptions, ClusterTimeoutOptions
from couchbase.auth import PasswordAuthenticator
from couchbase.exceptions import ParsingFailedException


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
        result = cluster.query(
            "SELECT ts.* FROM `travel-sample` ts WHERE ts.`type`=$type LIMIT 10",
            QueryOptions(named_parameters={"type": "hotel"}))
        async for row in result:
            print("Found row: {}".format(row))
    except ParsingFailedException as ex:
        print(ex)

loop = get_event_loop()
cluster, bucket, collection = loop.run_until_complete(get_couchbase())
loop.run_until_complete(simple_query(cluster))
```

### `TxCouchbase`

```python
from twisted.internet import reactor

from txcouchbase.cluster import TxCluster
from couchbase.cluster import ClusterOptions, QueryOptions, ClusterTimeoutOptions
from couchbase.auth import PasswordAuthenticator


def handle_query_results(result):
    for r in result.rows():
        print("query row: {}".format(r))
    reactor.stop()

pa = PasswordAuthenticator('username', 'password')
cluster = Cluster('couchbase://127.0.0.1', ClusterOptions(pa))

# Connect options - global timeout opts
timeout_opts = ClusterTimeoutOptions(kv_timeout=timedelta(seconds=30))
options=ClusterOptions(PasswordAuthenticator('username', 'password'), timeout_options=timeout_opts)

# create a bucket object
bucket = cluster.bucket("travel-sample")
# create a collection object
cb = bucket.default_collection()

d = cluster.query("SELECT ts.* FROM `travel-sample` ts WHERE ts.`type`=$type LIMIT 10",
                  QueryOptions(named_parameters={"type": "hotel"}))
d.addCallback(handle_query_results)

reactor.run()
```

## Querying at Scope Level

It is possible to query off the `Scope` [level](https://docs.couchbase.com/python-sdk/current/concept-docs/n1ql-query.html#collections-and-scopes-and-the-query-context/), with _Couchbase Server release 7.0_, using the `scope.query()`method. It takes the statement as a required argument, and then allows additional options if needed.
