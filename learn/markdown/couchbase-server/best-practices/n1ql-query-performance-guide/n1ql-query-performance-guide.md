---
# frontmatter
path: '/learn/n1ql-query-performance-guide'
title: N1QL Performance Best Practices Guide
short_title: N1QL Performance
description: 
  - View all the different ways to improve query performance in Couchbase Server
  - Explore different indexing options and view illustrative examples
  - Learn about best practices for fast querying
content_type: learn
technology:
  - query
  - server
tags:
  - Best Practices 
  - SQL++ (N1QL)
  - Optimization
sdk_language:
  - any
tutorials:
  - tutorial-understanding-query-workflow-and-optimization
  - tutorial-understand-index-scans
  - tutorial-identifying-top-slow-queries
  - tutorial-understanding-explain-plan
  - tutorial-understanding-cardinality-and-selectivity
  - tutorial-understanding-covering-indexes-and-ttls
  - tutorial-tuning-tips-and-advice
  - tutorial-operators-guide
related_paths:
  - /learn/couchbase-monitoring-guide
  - /learn/couchbase-prometheus-integration-guide
  - /learn/couchbase-support-guide
  - /learn/json-data-modeling-guide
  - /learn/json-document-management-guide
download_file: '/resources/best-practice-guides/n1ql-tuning-guide.pdf'
length: 2 Hours
---

The performance of any system follows physics. The basic two rules can be (loosely) stated as:

1. Quantity: Less work is more performance.
2. Quality: Faster work is more performance.

Query processing is no different and it also tries to optimize both these factors in various forms and scenarios to bring efficiency. Each optimization is different and results in a different amount of performance benefit.

Tuning is iterative and involves the following basic steps:

1. Identifying the slowly performing or high resource consumption N1QL statements that are responsible for a large share of the application workload and system resources. Generally tuning the slower and most frequently used N1QL queries will yield the highest results. Additionally, depending on your response and SLA needs you will need to identify and tune specific queries. As in many scenarios generally, the [Pareto principle](https://en.wikipedia.org/wiki/Pareto_principle) applies to query tuning as well - 80% of your workload/performance problems are probably caused by 20% of your queries - focus and tune that 20% of your queries
2. Verify that the execution plans produced by the query optimizer for these statements are reasonable and expected. Note: Couchbase currently is a RULE based optimizer and not a COST based optimizer so key or index cardinality do not impact the choice of the index or creation of the overall query plan
3. Implement corrective actions to generate better execution plans for poorly performing SQL statements

The previous steps are repeated until the query performance reaches a satisfactory level or no more statements can be tuned.

## Prerequisites

Before you get started you should take the following prerequisites into consideration:

- Couchbase Server & SDKs
- Knowledge of JavaScript or JSON documents

## Agenda

- Understanding Query Workflow
- Understanding Index Scans
- Identifying the Top Slow Queries
- Understanding an Explain Plan
- Understanding Cardinality and Selectivity
- Understanding Covering Indexes and TTLs
- Tuning Tips and Advice
- Operators Guide
