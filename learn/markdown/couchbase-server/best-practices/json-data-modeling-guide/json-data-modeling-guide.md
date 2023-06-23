---
# frontmatter
path: '/learn/json-data-modeling-guide'
title: JSON Data Modeling Guide
short_title: JSON Data Modeling
description:
  - Learn about core elements used to handle data in Couchbase Server
  - Explore best practices for how to store documents from a Couchbase SDK
  - A well-thought-out data model can play a big role in ensuring your application performs as expected
content_type: learn
technology: 
  - capella
  - server
tags:
  - Data Modeling
sdk_language:
  - any
tutorials:
  - tutorial-comparing-document-oriented-relational-data
  - tutorial-using-json-documents
  - tutorial-schemaless-data-modeling
  - tutorial-phases-of-data-modeling
  - tutorial-json-design-choices
  - tutorial-document-key-design
  - tutorial-standardization-optimization-and-resources
related_paths:
  - /learn/couchbase-monitoring-guide
  - /learn/couchbase-prometheus-integration-guide
  - /learn/couchbase-support-guide
  - /learn/json-document-management-guide
  - /learn/n1ql-query-performance-guide
download_file: '/resources/best-practice-guides/data-modeling-guide.pdf'
length: 1.5 Hours
---

This learning path describes core elements used to handle data in Couchbase Server, structure individual JSON documents for your app, and how to store the documents from a Couchbase SDK.

Couchbase Server is a document database. Unlike traditional relational databases, you store information in documents rather than table rows. Couchbase has a much more flexible data format. Documents generally contain all the information about a data entity, including compound data rather than the data being normalized across tables.

A document is a JSON object consisting of a number of key-value pairs that you define. There is no schema in Couchbase; every JSON document can have its own individual set of keys, although you may probably adopt one or more informal schemas for your data.

With Couchbase Server, one of the benefits of using JSON documents is that you can index and query these records. This enables you to collect and retrieve information based on rules you specify about given fields; it also enables you to retrieve records without using the key for the record.

## Prerequisites

Before you get started you should take the following prerequisites into consideration:

- Couchbase Server & SDKs
- Knowledge of JavaScript or JSON documents

## Agenda

- Comparing Document-Oriented and Relational Data
- Using JSON documents
- Schemaless Data Modeling
- Phases of Data Modeling
- JSON Design Choices
- Document Key Design
- Standardization, Optimization, and Resources
