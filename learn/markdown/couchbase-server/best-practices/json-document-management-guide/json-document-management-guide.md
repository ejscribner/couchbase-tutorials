---
# frontmatter
path: "/learn/json-document-management-guide"
title: JSON Document Management Guide
short_title: JSON Document Management
description: 
  - Learn how to manage and adapt to change within your data model
  - Explore best practices for structuring documents
  - View illustrative examples and conceptual implementations
content_type: learn
technology: 
  - server
tags:
  - Data Modeling
  - Configuration
  - Best Practices
sdk_language:
  - any
tutorials:
  - tutorial-standardize-document-properties
  - tutorial-document-optimizations
  - tutorial-schema-versioning
  - tutorial-document-revisions
related_paths:
  - /learn/couchbase-monitoring-guide
  - /learn/couchbase-prometheus-integration-guide
  - /learn/couchbase-support-guide
  - /learn/json-data-modeling-guide
  - /learn/n1ql-query-performance-guide
download_file: '/resources/best-practice-guides/document-management-strategies-guide.pdf'
length: 1 Hour
---

JSON provides a flexible data model, which can support an infinite number of schemas, as the schema is explicitly stored alongside every value. Every application evolves over time, schemas change, new models are defined. It is important to have a plan for managing and adapting these changes into your data model and applications smoothly, this document is intended to explain best practices and conceptual implementations of how this might work.

> **Note:** All code examples included are in pseudo-code. They are provided to relay the logical concept only. The conceptual high-level logic and JSON properties should be adapted to your organizational coding standards and programming language.

## Prerequisites

Before you get started you should take the following prerequisites into consideration:

- Couchbase Server & SDKs
- Knowledge of JavaScript or JSON documents

## Agenda

- Standardized Document Properties
- Document Optimizations
- Embedded vs. Non-Embedded Data
- Schema Versioning
- Document Revisions
