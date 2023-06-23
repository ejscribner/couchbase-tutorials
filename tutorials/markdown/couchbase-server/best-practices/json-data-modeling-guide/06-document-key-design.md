---
# frontmatter
path: "/tutorial-document-key-design"
title: Document Key Design
short_title: Document Key Design
description: 
  - Learn how to design your document keys to ensure your application can perform its best
  - See examples of several patterns you can follow when designing a document key
  - Explore the benefits of combining key design patterns
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
length: 10 Mins
---

The most important part of NoSQL database modeling is how do we design our document keys. There are different patterns as mentioned below when it comes to designing a document key.

- Prefixing
- Predictable
- Counter ID
- Unpredictable
- Combinations

## Prefixing

Multiple data sets are expected to share a common bucket in Couchbase. To ensure each data set has an isolated keyspace, it is a best practice to include a type/class/use-case/sub-domain prefix in all document keys.  As an example of a User Model, you might have a property called `"userId": 123`, the document key might look like `user:123`, `user_123`, or `user::123`. Every Document ID is a combination of two or more parts/values, that should be delimited by a character such as a colon or an underscore. Pick a delimiter, and be consistent throughout your enterprise.

- DocType:ID
  `userprofile:fredsmith79`
  `playlist:003c6f65-641a-4c9a-8e5e-41c947086cae`
- AppName:DocType:ID
  `couchmusic:userprofile:fredsmith79`
- DocType:ParentID:ChildID
  `playlist:fredsmith79:003c6f65-641a-4c9a-8e5e-41c947086cae`

## Predictable

Let's say we're storing a user profile. Assuming no cookies, what are we guaranteed to know about our user after they've logged in? Well, one thing would be their login name.

So, if we want to make life easy for ourselves in retrieving our user profile, then we can key it with that user's login name. Everything else we need to know about that person could be derived from their user profile, in one way or another.

Pretty quickly we might encounter a problem: for a user to change their login name, we now have to either create a new user profile under a new key or create a look-up document. We could insist that our users can never change their login names but it's unreasonable to make our users suffer unnecessarily.

The main downside of a predictable key is that, usually, it'll be an element of the data that we're storing.

![Predictable Key](./assets/predictable_key.png)

## Counter ID

We can get Couchbase to generate the key for us using a counter. if you're using a counter ID pattern, every insert (not update) requires 2 mutations. One to increment the counter and the other to mutate the document.

Here's how it works:

1. Someone fills out the new user account form and clicks "Submit".
2. We increment our counter document and it returns the next number up (e.g. 123).
3. We create a new user profile document keyed with 123.
4. We then create look-up documents for things such as their user id, enabling us to do a simple look-up on the data we hold at login time.

![Counter Key](./assets/counter_key.png)

We also get some additional benefits from this pattern, such as a counter providing us with some details of many user profiles we've created during the application's lifetime.

## Unpredictable

This pattern uses system generated unique IDs like UUID.

![Unpredictable Key](./assets/unpredictable_key.png)

## Combinations

It's when we combine both these methods that we can start to do really interesting things with key names.

We've looked before at when to embed data in one large document and when it's best to refer to other documents. When we choose to refer to data held in separate documents, we can build predictable key names from components that tell us something about what the document holds.

Let's look at our user profile again. The main document is stored under the key 1001. We're working on an ecommerce site so we also want to know all of the orders our customer has made. Simple: we store the list of orders under the key `1001:orders`.

Similarly, our system might judge what sort of marketing emails to send to customers based on their total spend with the site. Rather than have the system calculate that afresh each time, we instead do it the NoSQL way: we calculate it once and then store it for later retrieval under the key `1001:orders:value`.
