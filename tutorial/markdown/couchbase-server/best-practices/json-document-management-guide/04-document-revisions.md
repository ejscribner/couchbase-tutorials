---
# frontmatter
path: "/tutorial-document-revisions"
title: Document Revisions
short_title: Document Revisions
description: 
  - Sometimes, you may need to save multiple revisions of a document within a bucket
  - Learn how to store and maintain document revision history with your application
  - There are several ways to do this, but this is one we suggest
content_type: tutorial
filter: n1ql
technology:
  - kv
  - capella
  - server
tags:
  - Data Modeling
  - Metadata
sdk_language: 
  - any
length: 20 Mins
---

From time to time, there may be a requirement to save multiple revisions of a document within a bucket, this history is maintained by the application. This section is intended to outline one way this can be accomplished.

### Document Metadata

Just as we've shown in previous sections, we'll add a standardized metadata property to our document model to assist with storing the revision information. A certain amount of this is standard practice around the industry. Building on our User model, we can add a `_ver` property to document the current version of the document.

```json
{  
  "_type":"user",  
  "_schema": "3.0",
  "_ver": 1,
  "_created": 1544759124,
  "userId": 123,  
  "firstName": "Joe",
  "lastName": "Smith",
  "phones": [
    {
      "type": "mobile",
      "number": "1234567890"
    }
  ]
}
```

Then, in your data object, you would want to add some code to initialize and increment this revision number as updates are made to a document.

```js
public class User extends Base {
  private var _ver: integer
  private var userId: integer
  private var firstName: string
  private var lastName: string
  private var phones: array
  private var email: string

  constructor User(doc) {
    doc = migrate(doc) // transform the document
    super(doc)
    this.set_Type("user")
    this.set_Schema("3.0")
    // set _ver if it is not defined
    if (!this._ver) {
      this._ver = 1
    }
  }
  ...
}
```

## Maintaining Revisions

Because you are wanting to maintain the revisions of a document, this requires steps to be taken with writing updates to a document to preserve the previous version. It also requires using a predictable pattern in the revision key generation to make it easy to find and retrieve specific document revisions. One of the simplest ways of using a predictable pattern in the key generation is to append the revision number to the document key, so if the document had a key of `user:123`, the revision might have a key like `user:123:v:1`. So, if a revision had been made to our example user document, you'd have two different documents:

**Document ID:** `user:123`

```json
{  
  "_type":"user",  
  "_schema": "3.0",
  "_ver": 2,
  "_created": 1544759124,
  "userId": 123,  
  "firstName": "Joe",
  "lastName": "Smith",
  "phones": [
    {
      "type": "mobile",
      "number": "1234567890"
    },
    {
      "type": "home",
      "number": "1234445555"
    }
  ]
}
```

and

**Document ID:** `user:123:v:1`

```json
{  
  "_type":"user",  
  "_schema": "3.0",
  "_ver": 1,
  "_created": 1544759124,
  "userId": 123,  
  "firstName": "Joe",
  "lastName": "Smith",
  "phones": [
    {
      "type": "mobile",
      "number": "1234567890"
    }
  ]
}
```

This will require code in your objects `save()` method to make a copy of the current document prior to saving the update:

```js
public save() {
  this.copyRevision()
  this._ver++
  bucket.upsert(
    this._type + ":" + this.userId, // key
    this // value
  )
}

private copyRevision() {
  var doc = bucket.get(this._type + ":" + this.userId)
  bucket.insert(
    this._type + this.userId + ":v:" + this._ver, // key
    doc // value
  )
}
```

### Limiting Revisions

The problem with maintaining document revisions is that they can significantly increase the amount of storage space needed to hold them. It's not unusual for a document to be updated thousands of times over its lifespan. So odds are that you'll want to limit the number of revisions to be kept. To avoid having to go back and purge outdated revisions, the better solution would be to determine ahead of time what your revision limit is going to be, and to build that into your data objects:

```js
private maxRevisionCount = 10

public class User extends Base {
  ...
}
```

Then you would want to perform a check before saving a revision to see if an older revision needs to be deleted:

```js
public save() {
  if (this._ver >= maxRevisionCount) {
    this.deleteOldRevision()
  }
  this.copyRevision()
  this._ver++
  bucket.upsert(
    this._type + ":" + this.userId, // key
    this // value
  )
}

private deleteOldRevision() {
  bucket.delete(this._type + ":" + this.userId + ":v:" + (this._ver - maxRevisionCount))
}
```

## Summary

By adding a revision number and using a key generation scheme that appends the revision number to the current revision key in a predictable way, it can be fairly straightforward to implement a document revision retention policy.

In summary, you'll need to:

- Add a revision number property to the document and data object.
- Increment the revision number property each time the document is updated.
- Copy the prior revision document, adding the revision number to the document key in a predictable way prior to saving any updates to the current revision of the document.
- Hard-code a maximum number of revisions to be kept.
- If the revision number of the document is greater than the maximum number of revisions being kept, subtract the maximum number of revisions from the current revision number and delete that version of the document when saving any updates to the current revision.
