---
# frontmatter
path: "/tutorial-standardize-document-properties"
title: Standardized Document Properties
short_title: Standard Doc Properties
description:
  - Multiple data sets can share a common bucket in Couchbase, but its important to ensure each data set has isolated keyspaces
  - Learn best practices to ensure isolation by prefixing document keys or adding certain document properties
  - See common conventions that are typically followed when naming fields
content_type: tutorial
filter: n1ql
technology: 
  - kv
  - server
  - capella
tags:
  - Data Modeling
sdk_language:
  - any
length: 10 Mins
---

Multiple data sets are expected to share a common bucket in Couchbase. To ensure each data set has an isolated keyspace, it is a best practice to include a type/class/use-case/sub-domain prefix in all document keys.  As an example of a User Model, you might have a property called `"userId": 123`, the document key might look like `user:123`, `user_123`, or `user::123`.  Every Document ID is a combination of two or more parts/values, that should be delimited by a character such as a colon or an underscore.  Pick a delimiter, and be consistent throughout your enterprise.

Just as each Document ID should contain a prefix of the type/model, it is also a best practice to include that same value in the body of the document.  This allows for efficient filtering by document type at query time or filtered XDCR replications.  This property can be named many different names: `type`, `docType`, `_type`, and `_class` are all common choices, choose one that fits your organization's standards.

```json
{
  "_type": "user",
  "userId": 123
}
```

> **Note:**  There is not a right or wrong property name, however, if you're application will leverage Couchbase Mobile (in particular Sync-Gateway), the use of a leading underscore should be avoided, as any document that contains root level properties with a leading underscore will fail to replicate.  This is not a bug, and it meant to facilitate backward compatibility with v1.0 of the replication protocol.  

Applications are typically versioned using [Semantic Versioning](https://semver.org), i.e. 2.5.1.  Where 2 is the major version, 5 is the minor version and 1 is bugfix/maintenance version.  Versioning the application informs users of features, functionality, updates, etc.  The term "schemaless", is often associated with NoSQL, while this is technically correct, it is better stated as:

> "There is no schema managed by the database, however, there is still a schema, and it is an "Application Enforced Schema."  The application is now responsible for enforcing the schema as well as maintaining the integrity of the data and relationships.

As schemas change and evolve, documenting the version provides a mechanism of notifying applications about the schema version of the document that they're working with.  This also enables a migration path for updating models which is discussed further in the [Schema Versioning](#schema-versioning) section.  

```json
{
  "_type": "user",
  "_schema": "1.2",
  "userId": 123
}
```

At a minimum, every JSON document should contain a type and version property.  Depending on your application requirements, use case, the line of business, etc. other common properties to consider at:

- `_created` - A timestamp of when the document was created in epoch time (milliseconds or seconds if millisecond precision is not required)  
- `_createdBy` - A user ID/name of the person or application that created the document
- `_modified` - A timestamp of when the document was last modified in epoch time (milliseconds or seconds if millisecond precision is not required)
- `_modifiedBy` - A user ID/name of the person or application that modified the document
- `_accessed` - A timestamp of when the document was last accessed in epoch time (milliseconds or seconds if millisecond precision is not required)
- `_geo` - A 2 character ISO code of a country

The use of a leading `_` creates a standardized approach to global attributes across all documents within the enterprise.

```json
{
  "_type": "user",
  "_schema": "1.2",
  "_created": 1544734688923
  "userId": 123
}
```

The same can be applied through a top-level property i.e. `"meta": {}`.

```json
{
  "meta": {
    "type": "user",
    "schema": "1.2",
    "created": 1544734688923
  },
  "userId": 123
}
```

Choose an approach that works within your organization and be consistent throughout your applications.
