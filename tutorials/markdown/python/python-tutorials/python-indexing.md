---
# frontmatter
path: '/tutorial-python-indexing'
title: Indexing with Python
short_title: Indexing
description:
  - Learn about the various types of indexes
  - Learn how indexes help to query for data efficiently and improve query performance
  - Covering indexes
content_type: tutorial
filter: sdk
technology:
  - index
  - server
exclude_tutorials: true
tags:
  - Optimization
sdk_language:
  - python
length: 30 Mins
---

In this tutorial, you will learn about the six types of indexes that you can create using the Index Service as well as how they help to query for data efficiently and improve query performance.

## Introduction

Creating the right index — with the right keys, in the right order, and using the right expressions — is critical to query performance in any database system, including the Couchbase Data Server. This topic provides an overview of the types of index that you can create using the Index Service, and explains how they help to query for data efficiently and improve query performance.

In Couchbase, indexes are required to query any data. Without an index, queries cannot be run. In the case of travel-sample data, the indexes are created for you when you import the sample bucket. Indexes are created asynchronously and can take a bit of time before the process is completed.

The following utilities are examples of workplaces to create indexes:

- The Couchbase Query Workbench (in the Web Console)
- The Command-Line based Query Shell (cbq)
- Our REST API
- Any Language SDKs, including the Python SDK

## Types of Indexes

- Primary Index: The primary index is simply an index on the document key on the entire keyspace
- Secondary Index: A secondary index is an index on any key-value or document-key
- Composite Secondary Index: A secondary index using multiple keys
- Partial Index: An index defined on a subset of documents
- Covering Index: An index that includes the actual values of all the fields specified in the query
- Array Index: An index on array objects in documents

## Primary Indexing

Primary indexes contain a full set of keys in a given keyspace like in Relational Databases.

Every primary index is maintained asynchronously. A primary index is intended to be used for simple queries, which have no filters or predicates.

Primary indexes are optional and are only required for running ad hoc queries on a keyspace that is not supported by a secondary index. Typically, they are not recommended for production since the entire document has to be fetched and matched against the queries.

```python
from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster, ClusterOptions
from couchbase.management.queries import (
    CreatePrimaryQueryIndexOptions,
    QueryIndexManager,
)
```

### Checking All Available Indexes

You can check for all the available indexes in the cluster by querying the `system:indexes` keyspace which is an internal keyspace which keeps track of all the indexes.

```shell
import pprint

pp = pprint.PrettyPrinter(indent=4, depth=6)
```

```shell
all_indexes_query = "SELECT * FROM system:indexes"

try:
    result = cluster.query(all_indexes_query).execute()
    for row in result:
        pp.pprint(row)
except Exception as e:
    print(e)
```

## Secondary Indexing

A secondary index is an index on any key-value or document-key. This index can use any key within the document and the key can be of any type: scalar, object, or array.

The query has to use the same type of object for the query engine to use the index.

```shell
# This index will be used for queries that work with the hotel titles
secondary_idx_query = (
    "CREATE INDEX idx_hotels_title ON `travel-sample`.inventory.hotel(title)"
)
try:
    result = cluster.query(secondary_idx_query).execute()
except Exception as e:
    print(e)
```

### Composite Secondary Index

It is common to have queries with multiple filters (predicates). In such cases, you want to use indexes with multiple keys so the indexes can return only the qualified document keys. Additionally, if a query is referencing only the keys in the index, the query engine can simply answer the query from the index scan result without having to fetch from the data nodes. This is commonly used for performance optimization.

We can create an index that will handle the query to get the name and country for each hotel in the inventory scope to make it more efficient than using the primary index.

```shell
# This index will be used for queries that work with the hotel titles & countries
hotel_title_country_idx_query = "CREATE INDEX idx_hotels_title_country ON `travel-sample`.inventory.hotel(title, country)"
try:
    result = cluster.query(hotel_title_country_idx_query).execute()
except Exception as e:
    print(e)
```

Note that the Execution Plans can change based on the indexes available. Couchbase automatically selects the best index for the query.

### Partial Index

Unlike relational systems where each type of row is in a distinct table, Couchbase keyspaces can have documents of various types. You can include a distinguishing field in your document to differentiate distinct types.

For example, the landmark keyspace distinguishes types of landmark using the activity field. Couchbase allows you to create indexes for specific activities from them.

```shell
activities = "SELECT DISTINCT activity FROM `travel-sample`.inventory.landmark"
try:
    result = cluster.query(activities)
    for row in result:
        print(row)
except Exception as e:
    print(e)
```

```shell
# Create an index for landmarks that are of type 'eat'
restaurants_index_query = "CREATE INDEX landmarks_eat ON `travel-sample`.inventory.landmark(name, id, address) WHERE activity='eat'"
try:
    result = cluster.query(restaurants_index_query).execute()
except Exception as e:
    print(e)
```

```shell
all_indexes_query = "SELECT * FROM system:indexes where name='landmarks_eat'"

try:
    result = cluster.query(all_indexes_query).execute()
    for row in result:
        pp.pprint(row)
except Exception as e:
    print(e)
```

### Covering Index

When an index includes the actual values of all the fields specified in the query, the index covers the query and does not require an additional step to fetch the actual values from the data service. An index, in this case, is called a covering index and the query is called a covered query. As a result, covered queries are faster and deliver better performance.

```shell
hotel_state_index_query = (
    "CREATE INDEX idx_state on `travel-sample`.inventory.hotel (state)"
)
try:
    result = cluster.query(hotel_state_index_query).execute()
except Exception as e:
    print(e)
```

We can see the query execution plan using the EXPLAIN statement. When a query uses a covering index, the EXPLAIN statement shows that a covering index is used for data access, thus avoiding the overhead associated with key-value document fetches.

If we select state from the hotel keyspace, the actual values of the field state that are to be returned are present in the index `idx_state`, and avoids an additional step to fetch the data. In this case, the index `idx_state` is called a covering index and the query is a covered query.

```shell
query_plan_example = (
    "EXPLAIN SELECT state FROM `travel-sample`.inventory.hotel WHERE state = 'CA'"
)
try:
    result = cluster.query(query_plan_example)
    for row in result:
        pp.pprint(row)
except Exception as e:
    print(e)
```

## Array Indexing

Array Indexing adds the capability to create global indexes on array elements and optimizes the execution of queries involving array elements.

```shell
# Create an index on all schedules
# Here, we create an index on all the distinct flight schedules
schedules_index_query = "CREATE INDEX idx_sched ON `travel-sample`.inventory.route ( DISTINCT ARRAY v.flight FOR v IN schedule END )"

try:
    result = cluster.query(schedules_index_query).execute()
except Exception as e:
    print(e)
```

```shell
# Select scheduled flights operated by 'UA'
query_schedules = "SELECT * FROM `travel-sample`.inventory.route WHERE ANY v IN schedule SATISFIES v.flight LIKE 'UA%' END LIMIT 5"

try:
    result = cluster.query(query_schedules)
    for row in result:
        pp.pprint(row)
except Exception as e:
    print(e)
```

```shell
# Index on Flight Stops
flight_stops_index = "CREATE INDEX idx_flight_stops ON `travel-sample`.inventory.route( stops, DISTINCT ARRAY v.flight FOR v IN schedule END )"
try:
    result = cluster.query(flight_stops_index).execute()
except Exception as e:
    print(e)
```

```shell
# Select flights with a stopover
filter_stops_query = "SELECT * FROM `travel-sample`.inventory.route WHERE stops >=1 AND ANY v IN schedule SATISFIES v.flight LIKE 'FL%' END"
try:
    result = cluster.query(filter_stops_query)
    for row in result:
        pp.pprint(row)
except Exception as e:
    print(e)
```

### Dropping Indexes

The DROP INDEX statement allows you to drop a named primary index or a secondary index.
You can drop an index by specifying the name of the index and the keyspace (bucket.scope.collection).

```shell
# This query will drop the index idx_hotels_title that we created earlier
drop_idx_query = "DROP INDEX idx_hotels_title ON `travel-sample`.inventory.hotel"
try:
    result = cluster.query(drop_idx_query).execute()
except Exception as e:
    print(e)
```

```shell
# This query will drop the primary index primary_idx_hotels that we created earlier
# It is recommended to not have primary indexes on production systems as they scan all the documents in the collection
drop_primary_idx_query = (
    "DROP INDEX primary_idx_hotels ON `travel-sample`.inventory.hotel"
)
try:
    result = cluster.query(drop_primary_idx_query).execute()
except Exception as e:
    print(e)
```
