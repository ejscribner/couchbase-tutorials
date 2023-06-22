---
# frontmatter
path: "/tutorial-using-json-documents"
title: Using JSON documents
short_title: JSON documents
description:
  - A brief introduction to the JSON data format that illustrates the readability and ease of use
  - Learn about the basic data types supported in JSON and view a few example documents
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

_**JavaScript Object Notation**_ (JSON) is a lightweight data-interchange format which is easy to read and change. JSON is language-independent although it uses similar constructs to JavaScript. JSON documents enable you to benefit from all the Couchbase features, such as indexing and querying; they also to provide a logical structure for more complex data and enable you to provide logical connections between different records.

The following are basic data types supported in JSON:

- Numbers, including integer and floating point
- Strings, including all Unicode characters and backslash escape characters
- Boolean: true or false
- Arrays, enclosed in square brackets: `["one", "two", "three"]`
- Objects, consisting of key-value pairs, and also known as an _associative array_ or hash. The key must be a string and the value can be any supported JSON data type.

For more information about creating valid JSON documents, please refer to [http://www.json.org](http://www.json.org).

When you use JSON documents to represent your application data, you should think about the document as a logical container for information. This involves thinking about how data from your application fits into natural groups. It also requires thinking about the information you want to manage in your application. Doing data modeling for Couchbase Server is a similar process that you would do for traditional relational databases; there is however much more flexibility and you can change your mind later on your data structures. As a best practice, during your data/document design phase, you want to evaluate:

- What are the _**things**_ you want to manage in your applications, for instance, _users_, _breweries_, _beers_ and so forth.
- What do you want to store about the _**things**_. For example, this could be _alcohol percentage_, _aroma_, _location_, etc.
- How do the _**things**_ in your application fit into natural groups.

For instance, if you are creating a beer application, you might want a particular document structure to represent a beer:

```json
{
  "name": "Hoptimus Prime",
  "description": "North American Ale Beer",
  "category": "North American Ale",
  "updated": "2010-07-22 20:00:20"
}
```

For each of the keys in this JSON document you would provide unique values to represent individual beers. If you want to provide more detailed information in your beer application about the actual breweries, you could create a JSON structure to represent a brewery:

```json
{
  "name": "Legacy Brewing Co.",
  "address": "525 Canal Street",
  "city": "Reading",
  "state": "Pennsylvania",
  "website": "legacybrewing.com",
  "description": "Brewing Company"
}
```

Performing data modeling for a document-based application is no different than the work you would need to do for a relational database. For the most part it can be much more flexible, it can provide a more realistic representation or your application data, and it also enables you to change your mind later about data structure. For more complex items in your application, one option is to use nested pairs to represent the information:

```json
{
  "name": "Legacy Brewing Co.",
  "address": "525 Canal Street",
  "city": "Reading",
  "state": "Pennsylvania",
  "website": "legacybrewing.com",
  "description": "Brewing Company",
  "geo": {
    "location": [
      "-105.07",
      "40.59"
    ],
    "accuracy": "RANGE_INTERPOLATED"
  },
  "beers": [
    "beer:id4058",
    "beer:id7628"
  ]
}
```

In this case we added a nested attribute for the geolocation of the brewery and for beers. Within the location, we provide an exact longitude and latitude, as well as level of accuracy for plotting it on a map. The level of nesting you provide is your decision; as long as a document is under the maximum storage size for Couchbase Server, you can provide any level of nesting that you can handle in your application.

In traditional relational database modeling, you would create tables that contain a subset of information for an item. For instance a _brewery_ may contain types of beers which are stored in a separate table and referenced by the _beer ID_. In the case of JSON documents, you use key-values pairs, or even nested key-value pairs.
