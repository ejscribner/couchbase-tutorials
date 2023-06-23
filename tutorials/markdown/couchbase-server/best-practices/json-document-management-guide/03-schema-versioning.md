---
# frontmatter
path: "/tutorial-schema-versioning"
title: Schema Versioning
short_title: Schema Versioning
description: 
  - Learn why it's important to store a schema version within a document, and see how doing so allows schema management through code
  - See best practices for versioning your schemas
  - Learn how schemas evolve and see examples of how to update document structures accordingly
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

Storing the schema version within the document is a best practice that provides a mechanism to migrate and upgrade models as they change over time. For this example, the pseudo-code provided is intended to illustrate an approach to schema management through code. There are many different ways to solve this problem, think of this exercise as things to consider during development, not necessarily how it is coded.

**Document ID:** `user:123`

**Document Body:**

```json
{  
  "_type":"user",  
  "_schema": "1.0",  
  "_created": 1544759124,
  "userId": 123,  
  "name": "Joe Smith",
  "phone": "1234567890",
  "email": "joe.smith@acme.com"
}
```

The easiest approach to begin managing documents is to use a Class to represent a Document, this should be a 1:1 relationship. Funneling all operations at the document level to a single class enables you to make rapid changes, whereas if changes to the document are allowed throughout the codebase any schema changes will subsequently require more code modifications and testing.

```js
public class User {
  var _type: string
  var _schema: numeric
  var _created: datetime
  var _modified: datetime
  var userId: integer
  var name: string
  var phone: string
  var email: string
}
```

Next, we need to add the constructor

```js
public class User {
  var _type: string
  var _schema: numeric
  var _created: datetime
  var _modified: datetime
  var userId: integer
  var name: string
  var phone: string
  var email: string

  constructor (doc) {
    this._type = doc._type
    this._schema = doc._schema
    this._created = doc._created
    this._modified = doc._modified
    this.userId = doc.userId
    this.name = doc.name
    this.phone = doc.phone
    this.email = doc.email
  }
}
```

Now that the user class is defined, it can start to be used and it's instance properties referenced directly, for example:

```js
user = new User(...) // create a new instance of User
print(user.phone) // output the users phone
user.phone = "111-222-3333" // update the users phone number
```

To control our schema, and how it is consumed throughout the application, direct references should not be allowed, instead, the values exposed from the document are better served through accessors (i.e. getters and setters). The use of accessors is highly beneficial, as a method is used to access the value or modify the value. The method can apply business rules and can be changed without impacting existing consumers.

```js
public class User {
  private var _type: string
  private var _schema: numeric
  private var _created: datetime
  private var _modified: datetime
  private var userId: integer
  private var name: string
  private var phone: string
  private var email: string

  constructor (doc) {
    this.set_Type(doc._type)
    this.set_Schema(doc._schema)
    this.set_Created(doc._created)
    this.set_Modified(doc._modified)
    this.setUserId(doc.userId)
    this.setName(doc.name)
    this.setPhone(doc.phone)
    this.setEmail(doc.email)
  }
  ...
  public getPhone() {
    // return the phone formatted as: (111) 111-1111
    return "(" + this.phone.substring(0, 3) + ") " +
      this.phone.substring(3, 6) + "-" +
      this.phone.substring(6)
  }
  public setPhone(value string) {
    value = value.replace("[^:digit:]", "") // remove any non-numeric characters
    // validate the phone
    if (value.length != 10) {
      throw("invalid phone number")
    }
    this.phone = value
  }
  ...
}
```

Using the accessors, instead of references would look similar to:

```js
user = new User(...) // create a new instance of User
print(user.getPhone()) // output the users name
user.setPhone("111-222-3333") // update the users phone number
```

As this functionality will be common across all of the documents within our domain, centralize these shared properties and methods into a Base class that all document classes extend.

```js
public class Base {
  private var _type: string
  private var _schema: numeric
  private var _created: datetime
  private var _modified: datetime

  constructor (doc) {
    this.populate(doc) // load the document
  }
  private populate(doc) {
    // loop doc properties and dynamically call set accessors
    // loading the entire document
  }
  ...
  public get_Modified() {
    return this._modified;
  }
  public set_Modified(value datetime) {
    this._modified = value
  }
}

public class User extends Base {
  private var userId: integer
  private var name: string
  private var phone: string
  private var email: string

  constructor User(doc) {
    super(doc)
    this.set_Type("user")
    this.set_Schema("1.0")
  }
  ...
  public getName() {
    return this.name;
  }
  public setName(value string) {
    this.name = value
  }
}
```

### Evolving the Schema

Let's say at some point in the near future, the decision is made to split the `name` field out into first and last name. This is a simple update to the document structure, as follows:

```json
{  
  "_type":"user",  
  "_schema": "2.0",  
  "_created": 1544759124,
  "userId": 123,  
  "firstName": "Joe",
  "lastName": "Smith",
  "phone": "1234567890",
  "email": "joe.smith@acme.com"
}
```

Easy enough, but now we have to deal with the structure change in the data objects:

```js
public class User extends Base {
  private var userId: integer
  private var firstName: string
  private var lastName: string
  private var phone: string
  private var email: string

  constructor User(doc) {
    super(doc)
    this.set_Type("user")
    this.set_Schema("2.0")
  }
}
```

Simple right? Only, what happens when you try to load a user document that's still formatted for version 1.0? In this case, we will introduce a `migrate()` into our class that is the first method called from the constructor

```js
public class User extends Base {
  private var userId: integer
  private var firstName: string
  private var lastName: string
  private var phone: string
  private var email: string

  constructor User(doc) {
    doc = migrate(doc) // transform the document
    super(doc)
    this.set_Type("user")
    this.set_Schema("2.0")
  }
  private migrate(doc){
    if(doc._schema == "1.0") {
      this.setFirstName(doc.name.split(" ")[0])
      this.setLastName(doc.name.split(" ")[1])
      delete doc.name
      doc._schema = "2.0"
    }
  }
}
```

Our `migrate()` method, now has the business rules in place to transform a version 1.0 document to a version 2.0 document. As part of our code changes, we would've introduced accessors for the new properties: `getFirstName()`, `setFirstName()`, `getLastName()`, `setLastName()`. But what about the old accessors? Should they be removed?  They could be removed, but then all code referencing those methods would need to be refactored as well, it is safer to just update their implementation:

```js
  public getName() {
    return this.getFirstName() + " " + this.getLastName()
  }

  public setName(name) {
    setFirstName(name.split(" ")[0])
    setLastName(name.split(" ")[1])
  }
```

By maintaining the older accessor methods, you're protecting against any code locations that are missed during the refactoring and are still calling the older methods.

### Further Evolutions

Now let's say that the phone property is changed from a single value to a list of multiple phone numbers:

```json
{  
  "_type":"user",  
  "_schema": "3.0",  
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

Now you've got to extend the modifications routines for this additional schema change:

```js
public class User extends Base {
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
  }
  ...
  public getPhones() {
    return this.phones
  }
  public setPhones(value) {
    return this.phones = value
  }
  public addPhone(type, phone) {
    // validate the type
    if (!["other", "mobile", "home", "work"].contains(type)) {
      throw("invalid type")
    }
    phone = phone.replace("[^:digit:]", "") // remove any non-numeric characters
    // validate the phone
    if (phone.length != 10) {
      throw("invalid phone number")
    }
    this.phones.push({
      type: type,
      phone: phone
    })
  }
  public getPhone() {
    // return the phone formatted as: (111) 111-1111
    var phone = this.getPhones()[0];
    return "(" + phone.substring(0, 3) + ") " +
      phone.substring(3, 6) + "-" +
      phone.substring(6)
  }
  public setPhone(value string) {
    addPhone("other", value)
  }
  ...
  private migrate(doc){
    if(doc._schema == "1.0") {
      doc = migrateFromV1toV2(doc)
    }
    if(doc._schema == "2.0") {
      doc = migrateFromV2toV3(doc)
    }
  }
  private migrateFromV1toV2(doc){
    this.setFirstName(doc.name.split(" ")[0])
    this.setLastName(doc.name.split(" ")[1])
    delete doc.name
    doc._schema = "2.0"
  }
  private migrateFromV2toV3(doc){
    this.addPhone("other", doc.phone)
    delete doc.phone
    doc._schema = "3.0"
  }
}
```

We're no longer dealing with a scalar value, but a complex array/list. Based on your access patterns and use case this has the potential to be more involved. For example along with property specific accessors `getPhones()` and `setPhones()` you may want to have `addPhone()`, `removePhone()`, `updatePhone()`, etc.

## Summary

So, as you've seen, by adding a schema version number to the document, there are ways of handling in the code the migrations of documents from the older versions to the newer, without having to perform a massive data conversion on your Couchbase bucket. You have a choice of doing an at request time migration, or you could still choose to do a mass migration of data but the rules for that migration are in reusable code. This is primarily concerned with data values that change the data type, are deprecated from the document model, or other changes that your application needs to deal with as your data model evolves.

In summary, you need to:

- Put some metadata into your documents, such as the document type and version.
- In your data object loader/serialization method, include functionality to migrate the document from one version to the next.
- Be sure to keep the schema migration routines in order, as new revisions are created and the schema evolves.
