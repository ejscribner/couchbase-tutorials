---
# frontmatter
path: '/tutorial-python-distributed-transactions'
title: Distributed Transactions with Python
short_title: Distributed Transactions
description:
  - Requirements and getting started with transactions
  - Configuring transactions optionally or globally when configuring a cluster
  - Creating a transaction in Python with Couchbase
content_type: tutorial
filter: sdk
technology:
  - server
exclude_tutorials: true
tags:
  - Transactions
sdk_language:
  - python
length: 30 Mins
---

In this tutorial, you will learn how to use distributed ACID transactions in Couchbase Server with the Python SDK.

## Introduction

This tutorial shows how to use Couchbase transactions, following on from our [transactions documentation](https://docs.couchbase.com/server/current/learn/data/transactions.html).

## Requirements

- Must use Couchbase Server 6.6.1 or above.
- Must have Couchbase Python SDK 4.0.0 or above.
- NTP should be configured so nodes of the Couchbase cluster are in sync with time.
- The application, if it is using extended attributes (XATTRs), must avoid using the XATTR field txn, which is reserved for Couchbase use

## Getting Started

Couchbase transactions require no additional components or services to be configured. Simply `pip install` the most recent version of the SDK. You may, on occasion, need to import some enumerations for particular settings, but in basic cases nothing is needed.

## Configuration

Transactions can optionally be globally configured when configuring the `Cluster`. For example, if you want to change the level of durability which must be attained, this can be configured as part of the connect options:

```python
opts = ClusterOptions(authenticator=PasswordAuthenticator("Administrator", "password"),
                      transaction_config=TransactionConfig(
                          durability=ServerDurability(DurabilityLevel.PERSIST_TO_MAJORITY))
                      )

cluster = Cluster.connect('couchbase://localhost', opts)
```

The default configuration will perform all writes with the durability setting `Majority`, ensuring that each write is available in-memory on the majority of replicas before the transaction continues. There are two higher durability settings available that will additionally wait for all mutations to be written to physical storage on either the active or the majority of replicas, before continuing. This further increases safety, at a cost of additional latency.
A level of `None` is present but its use is discouraged and unsupported. If durability is set to `None`, then ACID semantics are not guaranteed.

## Creating a Transaction

A core idea of Couchbase transactions is that an application supplies the logic for the transaction inside a lambda, including any conditional logic required, and the transaction is then automatically committed. If a transient error occurs, such as a temporary conflict with another transaction, then the transaction will rollback what has been done so far and run the lambda again. The application does not have to do these retries and error handling itself.

Each run of the lambda is called an `attempt`, inside an overall `transaction`.

```python
def txn_logic_ex(ctx  # type: AttemptContext
                 ):
    """
    … Your transaction logic here …
    """

try:
    """
    'txn_logic_ex' is a Python closure that takes an AttemptContext. The
    AttemptContext permits getting, inserting, removing and replacing documents,
    performing N1QL queries, etc.

    Committing is implicit at the end of the closure.
    """
    cluster.transactions.run(txn_logic_ex)
except TransactionFailed as ex:
    print(f'Transaction did not reach commit point.  Error: {ex}')
except TransactionCommitAmbiguous as ex:
    print(f'Transaction possibly committed.  Error: {ex}')
```

The lambda gets passed an `AttemptContext` object, generally referred to as `ctx` here.

Since the lambda may be rerun multiple times, it is important that it does not contain any side effects. In particular, you should never perform regular operations on a `Collection`, such as `collection.insert()`, inside the lambda. Such operations may be performed multiple times, and will not be performed transactionally. Instead such operations must be done through the ctx object, e.g. `ctx.insert()`.
Examples and specific transaction mechanics can be referenced from our [transactions mechanics documentation](https://docs.couchbase.com/python-sdk/current/howtos/distributed-acid-transactions-from-the-sdk.html#examples).
