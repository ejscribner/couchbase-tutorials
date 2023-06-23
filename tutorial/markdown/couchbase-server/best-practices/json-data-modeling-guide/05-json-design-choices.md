---
# frontmatter
path: "/tutorial-json-design-choices"
title: JSON Design Choices
short_title: JSON Design Choices
description: 
  - Learn about the different design choices that impact JSON document design
  - Explore versioning and document structure in more depth
  - Learn the difference between objects and object arrays
content_type: tutorial
filter: n1ql
technology:
  - kv
  - capella
  - server
tags:
  - Data Modeling
sdk_language: 
  - any
length: 20 Mins
---

Couchbase Server neither enforces nor validates for any particular document structure. Below are the design choices that impact JSON document design.

- **Document typing and versioning**
  - Key Prefixing
  - Document Management fields
- **Document structure choices**
  - Field name choice, length, style, consistency, etc.
  - Use of root attribute
  - Objects vs. Arrays
  - Array element complexity
  - Timestamp format
  - Valued, Missing, Empty, and Null attribute values

## Document Key Prefixing

The document ID is the primary identifier of a document in the database. Multiple data sets are expected to share a common bucket in Couchbase. To ensure each data set has an isolated keyspace, it is a best practice to include a type/class/use-case/sub-domain prefix in all document keys.  As an example of a User Model, you might have a property called `"userId": 123`, the document key might look like `user:123`, `user_123`, or `user::123`. Every Document ID is a combination of two or more parts/values, that should be delimited by a character such as a colon or an underscore.  Pick a delimiter, and be consistent throughout your enterprise.

Just as each Document ID should contain a prefix of the type/model, it is also a best practice to include that same value in the body of the document.  This allows for efficient filtering by document type at query time or filtered XDCR replications.  This property can be named many different names: `type`, `docType`, `_type`, and `_class` are all common choices, choose one that fits your organization's standards.

```json
{
  "_type": "user",
  "userId": 123
```

## Document Management Fields

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

{% hint style="info" %}
**Note**: There is not a right or wrong property name, however, if you're application will leverage Couchbase Mobile (in particular Sync-Gateway), the use of a leading underscore should be avoided, as any document that contains root level properties with a leading underscore will fail to replicate.  This is not a bug, and it meant to facilitate backward compatibility with v1.0 of the replication protocol.  
{% endhint %}

## Field name length, style, consistency

- Brevity is beautiful at scale (e.g., 11 vs 6 characters * 1B documents) `geoCode vs countryCode`
- Self-documenting names reduce doc effort/maintenance `userName vs usyslogintxt`
- Consistent patterns reduce bugs (pick and stick to a standard) `firstName or first_name or firstname`, but pick one.
- Use plural names for array fields, and singular for others `"phones": [ ... ], "address": { ... }, "genre": " ... ", "scale": 2.3`.
- Avoid words that are reserved in N1QL (else, escape in N1QL) `user, bucket, cluster, role, select, insert` etc., Please refer [N1QL Reserved Word](https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/reservedwords.html) for more details on how to escape reserved words in N1QL.
- Use letters, numbers, or underscore (else, escape in N1QL) `first_name vs first-name`.

## Root Attributes vs. Embedded Attributes

The query model changes based on the choice of having a single root attribute or the `type` attribute embedded. Lets take a look at the `track` document as an example.

### Root Attributes

_Root_ attribute is a single, top-level attribute with all other attributes encapsulated as an object value of the root attribute. In the below example, the root element of the JSON document is `track`.

```json
{
  "track": {
    "artist": "Paul Lekakis",
    "created": "2015-08-18T19:57:07",
    "genre": "Hi-NRG",
    "id": "3305311F4A0FAAFEABD001D324906748B18FB24A",
    "mp3": "https://goo.gl/KgKoR7",
    "ver": "1.0",
    "ratings": [
      {
        "created": "2015-08-20T12:24:44",
        "rating": 4,
        "username": "sublimatingraga37014"
      },
      {
        "created": "2015-08-21T09:23:57",
        "rating": 4,
        "username": "untillableshowings34122"
      }
    ],
    "title": "My House",
    "modified": "2015-08-18T19:57:07"
  }
}
```

### Embedded Attributes

In this example, the JSON document is in a flat structure but there is an attribute called `type` embedded within the document.

```json
{
  "artist": "Paul Lekakis",
  "created": "2015-08-18T19:57:07",
  "genre": "Hi-NRG",
  "id": "3305311F4A0FAAFEABD001D324906748B18FB24A",
  "mp3": "https://goo.gl/KgKoR7",
  "ver": "1.0",
  "ratings": [
    {
      "created": "2015-08-20T12:24:44",
      "rating": 4,
      "username": "sublimatingraga37014"
    },
    {
      "created": "2015-08-21T09:23:57",
      "rating": 4,
      "username": "untillableshowings34122"
    }
  ],
  "title": "My House",
  "modified": "2015-08-18T19:57:07",
  "_type": "track"
}
```

This is the recommended approach since we can use the `type` field to create index.

```sql
CREATE INDEX cb2_type ON couchmusic2(_type);

SELECT COUNT(*) AS count
FROM couchmusic2
WHERE _type = "track"
GROUP BY genre;
```

## Objects vs. Object Arrays

There are two different ways to represent objects.

- **Objects** - In this choice, `phones` is an object in the `userProfile` class.

```json
{
  "type": "userProfile",
  "created": "2015-01-28T13:50:56",
  "dateOfBirth": "1986-06-09",
  "email": "andy.bowman@games.com",
  "firstName": "Andy",
  "gender": "male",
  "lastName": "Bowman",
  "phones": {
    "number": "212-771-1834",
    "type": "cell"
  },
  "pwd": "636f6c6f7261646f",
  "status": "active",
  "title": "Mr",
  "updated": "2015-08-25T10:29:16",
  "username": "copilotmarks61569"
}
```

- **Object Arrays** - In this choice, `phones` is an array of objects in the `userProfile` class.

```json
{
  "type": "userProfile",
  "created": "2015-01-28T13:50:56",
  "dateOfBirth": "1986-06-09",
  "email": "andy.bowman@games.com",
  "firstName": "Andy",
  "gender": "male",
  "lastName": "Bowman",
  "phones": [
    {
      "number": "212-771-1834",
      "type": "cell"
    }
  ],
  "pwd": "636f6c6f7261646f",
  "status": "active",
  "title": "Mr",
  "updated": "2015-08-25T10:29:16",
  "username": "copilotmarks61569"
}
```

## Array element complexity and use

Array values may be _simple_ or _object_.

- Store key to lookup/join
  - In this choice, _tracks_ is an array of strings which contain track IDs. Let's say we have to get the _track_ and _artist_ name for each of the track id, in which case we will end up doing multiple _gets_. So, this choice will have a significant impact when the user base is high, say we have 1M users accessing this information which translates to 3M _gets_ for this playlist.

```json
{
  "created": "2014-12-04T03:36:18",
  "id": "003c6f65-641a-4c9a-8e5e-41c947086cae",
  "name": "Eclectic Summer Mix",
  "owner": "copilotmarks61569",
  "type": "playlist",
  "tracks": [
    "9FFAF88C1C3550245A19CE3BD91D3DC0BE616778",
    "3305311F4A0FAAFEABD001D324906748B18FB24A",
    "0EB4939F29669774A19B276E60F0E7B47E7EAF58"
  ],
  "updated": "2015-09-11T10:39:40"
}
```

- Or, nest a summary to avoid a lookup/join
  - There are lot of advantages in this approach over the first one. In this choice, all we have to do is _one_ get to retrieve all the information that we need regarding the playlist.

```json
{
  "created": "2014-12-04T03:36:18",
  "id": "003c6f65-641a-4c9a-8e5e-41c947086cae",
  "name": "Eclectic Summer Mix",
  "owner": "copilotmarks61569",
  "type": "playlist",
  "tracks": [
    {
      "id": "9FFAF88C1C3550245A19CE3BD91D3DC0BE616778",
      "title": "Buddha Nature",
      "artist": "Deuter",
      "genre": "Experimental Electronic"
    },
    {
      "id": "3305311F4A0FAAFEABD001D324906748B18FB24A",
      "title": "Bluebird Canyon Stomp",
      "artist": "Beaver & Krause",
      "genre": "Experimental Electronic"
    }
  ],
  "updated": "2015-09-11T10:39:40"
}
```

## Timestamp Format

Working with Timestamp format is the difficult thing when it comes to JSON, since JSON does not have a standardized date format. Dates are commonly stored as string in JSON.

The following are examples of commonly used date formats.

- **ISO8601**

```json
{
  "countryCode": "US",
  "type": "country",
  "gdp": 53548,
  "name": "United States of America",
  "region": "Americas",
  "region-number": 21,
  "sub-region": "Northern America",
  "updated": "2010-07-15T15:34:27"
}
```

- **Time Component Array** - This format can be extremely useful when you trying to group data. Lets say, you want to generate time series graph and this choice best suits when you want to visualize data.

```json
{
  "countryCode": "US",
  "type": "country",
  "gdp": 53548,
  "name": "United States of America",
  "region": "Americas",
  "region-number": 21,
  "sub-region": "Northern America",
  "updated": [ 2010, 7, 15, 15, 34, 27 ]
}
```

- **Epoch / Unix** - Epoch format is a numeric value specifying the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970. Epoch format is the most efficient in terms of brevity, especially if you reduce the granularity. This is the preferred format when you have to do some kind of date comparison, sorting etc.

```json
{
  "countryCode": "US",
  "type": "country",
  "gdp": 53548,
  "name": "United States of America",
  "region": "Americas",
  "region-number": 21,
  "sub-region": "Northern America",
  "updated": 1279208067000
}
```

## Four states of data presence in JSON docs

It is important to understand that JSON supports optional properties. If a property has a null value, consider dropping it from the JSON unless there's a good reason not to. N1QL makes it easy to test for missing or null property values. Be sure your application code handles the case where a property value is missing.

- Fields may have a value

  ```sql
  SELECT geocode WHERE geocode IS VALUED
  ```

  ```json
  {
    "geocode": "USA"
  }
  ```

- Fields may have no value

  ```sql
  SELECT geocode WHERE geocode IS NOT VALUED
  ```

  ```json
  {
    "geocode": ""
  }
  ```

- Fields may be missing

  ```sql
  SELECT geocode WHERE geocode IS [NOT] MISSING
  ```

  ```json
  {
  }
  ```

- Fields may be explicitly null

  ```sql
  SELECT geocode WHERE geocode IS [NOT] NULL
  ```

  ```json
  {
    "geocode": null
  }
  ```
