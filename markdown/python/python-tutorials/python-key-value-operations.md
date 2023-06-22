---
# frontmatter
path: '/tutorial-python-key-value-operations'
title: Key Value Operations with Python
short_title: KV Operations
description:
  - Learn how to use KV operations to create, read, update and delete documents
  - Learn how to use the CAS value to identify the current state of an item
  - Follow along with various examples
content_type: tutorial
filter: sdk
technology:
  - server
  - kv
exclude_tutorials: true
tags:
  - Data Ingestion
sdk_language:
  - python
length: 30 Mins
---

In this tutorial, you will learn how to use Key Value operations to create, read, update and delete documents and how to use the CAS value to identify the current state of an item.

## Introduction

Key Value (also known as the Couchbase Data Service) offers the simplest way to retrieve or mutate data where you know the key. A key-value store is a type of [NoSQL Database](https://www.couchbase.com/resources/why-nosql/?ref=blog/) that uses a simple method to store data as a collection of key-value pairs in which a key serves as the unique identifier.

The core interface to Couchbase Server is simple KV operations on full documents. Make sure you’re familiar with the basics of authorization and connecting to a Cluster from the [Start Using the SDK Section](https://docs.couchbase.com/python-sdk/current/hello-world/start-using-sdk.html). We’re going to expand on the short _Upsert_ example we used there, adding options as we move through the various CRUD operations. Here is the _Insert_ operation at its simplest:

## Insert Operation

```shell
# Insert document
document = {"foo": "bar", "bar": "foo"}
result = collection.insert("document-key", document)
cas = result.cas
```

Options may be added to operations. It is best practice to use the \*Options() class that matches the name of the operation (e.g. GetOptions(), InsertOptions(), etc.). However, keyword arguments can be used as an override to a corresponding value within the options.
Options like _timeout_ and _expiry_ are timedelta objects.

### Options

```shell
# Insert document with options
document = {"foo": "bar", "bar": "foo"}
opts = InsertOptions(timeout=timedelta(seconds=5))
result = collection.insert("document-key-opts",
                           document,
                           opts,
                           expiry=timedelta(seconds=30))
```

Expiration sets an explicit time to live (TTL) for a document. We’ll discuss modifying `Expiration` in more details [below](https://docs.couchbase.com/python-sdk/current/howtos/kv-operations.html#expiration-ttl/). For a discussion of item (Document) _vs_ Bucket expiration, see the [Expiration Overview page](https://docs.couchbase.com/server/6.6/learn/buckets-memory-and-storage/expiration.html#expiration-bucket-versus-item/).

## Read Documents

Using the `get()` method with the document key, we can fetch the document:

```shell
result = collection.get("document-key")
print(result.content_as[dict])
```

Timeout can also be set:

```shell
opts = GetOptions(timeout=timedelta(seconds=5))
result = collection.get("document-key", opts)
print(result.content_as[dict])

```

## Update/Upsert Document

An upsert operation inserts the document into a collection if they do not already exist, or updates them if they do.

```shell
content = {"foobar": "barfoo"}
result = cb_coll.upsert("document-key", content)

updated_doc = cb_coll.get("document-key")
upserted_doc = updated_doc.content
print(f"Upserted Document: {upserted_doc}")
```

```shell
document = {"foo": "bar", "bar": "foo"}
result = cb_coll.upsert("document-key-1", document)

# fetch the new document
inserted_doc = cb_coll.get("document-key-1")
upserted_doc = inserted_doc.content
print(f"Upserted Document: {upserted_doc}")
```

## Delete Document

When removing a document, you will have the same concern for durability as with any additive modification to the Bucket:

```shell
# remove document with options
result = collection.remove(
    "document-key",
    RemoveOptions(
        cas=12345,
        durability=ServerDurability(
            Durability.MAJORITY)))
```

## Replace Document

To replace a document…

```shell
result = cb_coll.get("document-key")
print(f"Document Before Replace: {result.content}")

document = {"foo": "bar", "bar": "foo"}
result = cb_coll.replace("document-key", document)

result = cb_coll.get("document-key")
print(f"Document After Replace: {result.content}")
```

## Durability

Writes in Couchbase are written to a single node, and from there the Couchbase Server will take care of sending that mutation to any configured replicas. The optional durability parameter, which all mutating operations accept, allows the application to wait until this replication (or persistence) is successful before proceeding.

The SDK exposes three durability levels:

- Majority - The server will ensure that the change is available in memory on the majority of configured replicas.
- MajorityAndPersistToActive - Majority level, plus persisted to disk on the active node.
- PersistToMajority - Majority level, plus persisted to disk on the majority of configured replicas.

The options are in increasing levels of safety. Note that nothing comes for free - for a given node, waiting for writes to storage is considerably slower than waiting for it to be available in-memory.

```shell

# Upsert with Durability level Majority
# The tradeoffs associated with durability levels may not be apparent in this example
# since we are using a single node cluster, but become much more clear on multi-node clusters
# The error is due to the single node setup
from couchbase.collection import UpsertOptions
from couchbase.durability import Durability, ServerDurability

document = dict(foo="bar", bar="foo")
opts = UpsertOptions(durability=ServerDurability(Durability.MAJORITY))
try:
    result = cb_coll.upsert("document-key", document, opts)
except Exception as e:
    print(e)
```

It is possible to perform scoped key-value operations on named Collections with _Couchbase Server release_ 7.0. See the [API docs](https://docs.couchbase.com/sdk-api/couchbase-python-client/api/couchbase.html#collection-object) for more information. Here is an example showing an upsert in the `users` collection, which lives in the `travel-sample.tenant_agent_00 keyspace`:

```shell
agent_scope = bucket.scope("tenant_agent_00");
users_collection = agent_scope.collection("users");

content = {"name": "John Doe", "preferred_email": "johndoe111@test123.test" }

result = users_collection.upsert("user-key", content);
```

## Compare and Swap (CAS) Value:

The CAS is a value representing the current state of an item. Each time the item is modified, its CAS changes.

The CAS value itself is returned as part of a document’s metadata whenever a document is accessed. In the SDK, this is presented as the cas field in the result object from any operation which executes successfully.

CAS is an acronym for Compare And Swap, and is a form of optimistic locking. The CAS can be supplied as parameters to the replace and remove operations. When applications provide the CAS, server will check the application-provided version of CAS against the CAS of the document on the server:

- If the two CAS values match (they compare successfully), then the mutation operation succeeds.
- If the two CAS values differ, then the mutation operation fails.
