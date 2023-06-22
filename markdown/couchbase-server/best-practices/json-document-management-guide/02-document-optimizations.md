---
# frontmatter
path: "/tutorial-document-optimizations"
title: Document Optimizations
short_title: Document Optimizations
description: 
  - In this tutorial, we'll go over options and best practices to proactively reduce document sizes
  - We'll also cover best practices for storing dates in Couchbase
content_type: tutorial
filter: n1ql
technology:
  - kv
  - capella
  - server
tags:
  - Data Modeling
  - Best Practices
sdk_language: 
  - any
length: 10 Mins
---

JSON gives us a flexible schema, that allows our models to rapidly adapt to change, this is because the schema is explicitly stored alongside each value.  Whereas, in an RDBMS the schema is defined by the table columns, which are defined once.  In any database, every byte of stored data adds up, historically this has been abstracted from developers as the schema and the database are managed by a DBA.  With an application enforced schema, the model size is now controlled by the application.  As developers we tend to be overly verbose when describing variables throughout our applications, this practice tends to carry over to our JSON models.   While it is generally preferred to maintain human-readable field names for developer productivity, there are often well-understood abbreviations for many fields that will not reduce document readability.

As a general approach, consider the following options to proactively reduce document sizes:

- Don't store the document ID as a repeated value in the document
- Convert ISO-8601 timestamps to epoch time in milliseconds, saving at least 11 bytes. When millisecond precision is not required, convert to a smaller value \(i.e. divide by 1000 to convert to seconds, 60 for minutes, 60 for hours, 24 for days\), saving at least 4 bytes
- Store dates as an ISO format `YYYY-MM-DD` instead of `MMM DD, YYYY`
- When using GUID's strip all dashes saving an additional 4 bytes per GUID
- Use shorter property names
- Don't store properties whose value is `null` , empty `String|Array|Object`, or a known default
- Don't repeat values in arrays whose value is not unique, use a top-level property on the document

## Storing Dates

It is very common in almost any application, there is a need to store a date.  This could be when the document was created, modified, when an order was placed, etc.  Generally, this date is stored in [ISO-8601](https://www.iso.org/iso-8601-date-and-time-format.html) format.  

Take the date `2018-12-14T03:45:24.478Z` as an example, this is very _readable_, but is it the most efficient way to store the date?  Storing this same date as [Unix Epoch Time](https://en.wikipedia.org/wiki/Unix_time) we can represent this same date as `1544759124478`.  ISO-8601 is 24 bytes, where epoch format is 13 bytes, this saves 11 bytes.  This might not seem like a lot, but consider this scenario: 500,000,000 documents and each document has an average of 2 date properties.  If we used epoch format, we'd save 11,000,000,000 bytes or 11Gb of space.  

Now, take this a step further and ask the question, "What level of precision does the application require?".  Often times we do not need millisecond precision, we can divide the epoch date accordingly for seconds, minutes, hours, etc.

| **Epoch Date** | **Precision** | **Reduction** | **Output** | **Length / Bytes** |
| :--- | :--- | :--- | :--- | :--- |
| 1544759124478 | milliseconds | `n/a` | 1544759124478 | 13 |
| 1544759124478 | seconds | `/ 1000` | 1544759124 | 10 |
| 1544759124478 | minutes | `/1000 / 60` | 25745985 | 8 |
| 1544759124478 | hours | `/1000 / 60 / 60` | 429099 | 6 |
| 1544759124478 | days | `/1000 / 60 / 60 / 24` | 17879 | 5 |

## Embedded vs. Non-Embedded Data

Typically denormalized document models provide better read performance

Embed when there are:

- Relationship between entities
- One-to-few relationships between entities
- Embedded data that will not grow unbounded
- Embedded data that is integral to data in a document

Do not embed and normalize when there are:

- Unbounded data/arrays
- Frequent change of data across models
- Unrelated models
- One-to-many relationships
- Many-to-many relationships
- Frequent changes to related data
- Referenced data could be unbounded
- Smaller mutations are required for replication/network performance
