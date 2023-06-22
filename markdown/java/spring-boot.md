---
# frontmatter
path: "/tutorial-quickstart-java-springboot"
# title and description do not need to be added to markdown, start with H2 (##)
title: Start with Java and Spring Boot
short_title: Java and Spring Boot
description: 
  - Learn how to configure Spring Data with Couchbase
  - Explore key-based operations and SQL++ querying using Spring Data Couchbase repositories
  - Build a simple REST APIs that stores user profiles on a Couchbase cluster
content_type: quickstart
filter: sdk
technology:
  - kv
  - query
tags:
  - REST API
  - Spring Boot
  - Spring Data
sdk_language:
  - java
length: 30 Mins
---

<!-- 
  The name of this file does not need to be `tutorial-quickstart-java-springboot` because it is in the `tutorials/java/markdown` directory, so we can just call it `spring-boot`. The idea is that we can leave off `tutorial-quickstart` as a prefix.
-->

<!-- TODO:  Figure out how to add width to image size in try it now links -->
[![Try it now!](https://da-demo-images.s3.amazonaws.com/runItNow_outline.png?couchbase-example=java-springboot-quickstart-repo&source=github)](https://gitpod.io/#https://github.com/couchbase-examples/java-springboot-quickstart)

## Prerequisites

To run this prebuilt project, you will need:

- Follow [Couchbase Installation Options](/tutorial-couchbase-installation-options) for installing the latest Couchbase Database Server Instance (at least Couchbase Server 7)
- Java SDK v1.8 or higher installed
- Code Editor installed (IntelliJ IDEA, Eclipse, or Visual Studio Code)
- Maven command line

## Source Code

```shell
git clone https://github.com/couchbase-examples/java-springboot-quickstart
```

## Install Dependencies
```shell
mvn package
```

> Note: Maven packages auto restore when building the project in IntelliJ IDEA or Eclipse depending on IDE configuration.

### Database Server Configuration

All configuration for communication with the database is stored in the `/src/main/resources/application.properties` file.  This includes the connection string, username, and password.  The default username is assumed to be `Administrator` and the default password is assumed to be `password`.  If these are different in your environment you will need to change them before running the application.

### Dependency Injection via DBSetupRunner Class

The quickstart code provides a CommandLineRunner called DBSetupRunner in the runners folder that wires up the Bucket and Cluster objects for dependency injection. This runner also creates the bucket, collection, scope, and indexes for the tutorial to run properly automatically when the application starts.

## Running The Application

At this point the application is ready, and you can run it via your IDE or from the terminal:

```shell
mvn spring-boot:run -e -X
```

> Note: Couchbase Server 7 must be installed and running on localhost (http://127.0.0.1:8091) prior to running the Spring Boot app.

Once the site is up and running you can launch your browser and go to the Swagger Start Page]: `http://localhost:8080/swagger-ui/` to test the APIs.

## What We'll Cover

A simple REST API using Spring Boot and the Couchbase SDK version 3.x with the following endpoints:

- [POST a Profile](#post-a-profile) – Create a new user profile
- [GET a Profile by Key](#get-a-profile-by-key) – Get a specific profile
- [PUT Profile](#put-profile) – Update a profile
- [DELETE Profile](#delete-profile) – Delete a profile
- [GET Profiles by Searching](#get-profiles-by-searching)  – Get all profiles matching first or last Name

## Document Structure

We will be setting up a REST API to manage some profile documents. Our profile document will have an auto-generated UUID for its key, first and last name of the user, an email, and hashed password. For this demo we will store all profile information in just one document in a collection named `profile`:

```json
{
  "pid": "b181551f-071a-4539-96a5-8a3fe8717faf",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@couchbase.com",
  "password": "$2a$10$tZ23pbQ1sCX4BknkDIN6NekNo1p/Xo.Vfsttm.USwWYbLAAspeWsC"
}
```

As we can see, we want our user's password to be encrypted in the database too, we can achieve this simply with bcrypt, a dependency we have installed.

## Let's Review the Code

To begin clone the repo and open it up in the IDE of your choice to learn about how to create, read, update and delete documents in your Couchbase Server.

## POST a Profile

For CRUD operations we will use the [Key Value operations](https://docs.couchbase.com/java-sdk/current/howtos/kv-operations.html) that are built into the Couchbase SDK to create, read, update, and delete a document. Every document will need an ID (similar to a primary key in other databases) in order to save it to the database.

Open the ProfileController file found in the controllers folder and navigate to the save method.  Let’s break this code down. First, in the save method signature we have a ProfileRequest object. This brings in the information passed to the controller in the body of the request and is used to get a profile variable from the ProfileRequest object's getProfile method. Note that we auto-generate a random UUID for the pid.

```java
public Profile getProfile() {
  return new Profile(
    UUID.randomUUID().toString(),
    firstName,
    lastName,
    email,
    password);
}
```

> *from Post method of models/ProfileRequest.java*

Rather than saving the password in the account object as plain text, we hash it with [Bcrypt](https://github.com/jeremyh/jBCrypt) in the setter of the Profile object:

```java
public String getPassword() {
  return password;
}

public void setPassword(String password) {
  this.password = BCrypt.hashpw(password, BCrypt.gensalt());
}
```

> *from models/Profile.java*

Our `profile` document is ready to be persisted to the database.  We create call to the `collection` using the local variable `profileCol` and then call the `insert` method  and passing it the UUID from the Profile's `getPid` method as the key. Once the document is inserted we then return the document saved and the result all as part of the same object back to the user.

```java
Profile profile = userProfile.getProfile();
profileCol.insert(profile.getPid(), profile);
return ResponseEntity.status(HttpStatus.CREATED).body(profile);
```

> *from controllers/ProfileController.java*

## GET a Profile by Key

Navigate to the getProfile method in the ProfileController file in the controllers folder.  We only need the profile ID `pid` or our `Key` from the user to retrieve a particular profile document using a basic key-value operation which is passed in the method signature as a string.  Since we created the document with a unique key we can use that key to find the document in the scope and collection it is stored in.

```java
Profile profile = profileCol.get(pid).contentAs(Profile.class);
return ResponseEntity.status(HttpStatus.OK).body(profile);
```

> *from getProfile method of controllers/ProfileController.java*

## PUT Profile

Update a Profile by Profile ID

Now let's navigate to the update method of the ProfileController class.  The entire document gets replaced except for the document key and the `pid` field.  We create a call to the `collection` using the `upsert` method and then return the document saved and the result just as we did in the previous endpoint.

```java
profileCol.upsert(id, profile);
return ResponseEntity.status(HttpStatus.CREATED).body(profile);
```

> *from update method of controllers/ProfileController.java*

## DELETE Profile

Navigate to the delete method in the ProfileController class.  We only need the `Key` or id from the user to remove a document using a basic key-value operation.

```java
profileCol.remove(id.toString());;
```

> *from Delete method of controllers/ProfileController.java*

## GET Profiles by Searching

[N1QL](https://docs.couchbase.com/dotnet-sdk/current/howtos/n1ql-queries-with-sdk.html) is a powerful query language based on SQL, but designed for structured and flexible JSON documents. We will use a N1QL query to search for profiles with Skip, Limit, and Search options.

Navigate to the getProfiles method in the ProfileController class.  This endpoint is different from all of the others because it makes the N1QL query rather than a key-value operation. This means more overhead because the query engine is involved. We did create an [index](https://docs.couchbase.com/server/current/learn/services-and-indexes/indexes/indexing-and-query-perf.html) specific for this query, so it should be performant.

First, the method signature uses the `@RequestParam` annotation to get the individual `skip`, `limit`, and `search` values.  Then, we build our N1QL query using the parameters that were passed in.

Finally, we pass that `query` to the `cluster.query` method and return the result.

Take notice of the N1QL syntax and how it targets the `bucket`.`scope`.`collection`.

```java
final List<Profile> profiles = cluster.query("SELECT p.* FROM $bucketName._default.$collectionName p WHERE lower(p.firstName) LIKE $search OR lower(p.lastName) LIKE $search LIMIT $limit OFFSET $skip",
  queryOptions().parameters(JsonObject.create()
  .put("bucketName", dbProperties.getBucketName())
  .put("collectionName", CollectionNames.PROFILE)
  .put("search", "%"+ search.toLowerCase()+"%")
  .put("limit", limit)
  .put("skip", skip))
  .scanConsistency(QueryScanConsistency.REQUEST_PLUS))
  .rowsAs(Profile.class);
return ResponseEntity.status(HttpStatus.OK).body(profiles);
```

> *from getProfiles method of controllers/ProfileController.java*

### Running The Tests

To run the standard integration tests, use the following commands:

```shell
mvn test
```

### Project Setup Notes

This project was based on the standard [Spring Boot project](https://spring.io/guides/gs/rest-service/).  The HealthCheckController is provided as a santity check and is used in unit tests.

A full list of packages are referenced in the pom.xml file.

## Conclusion

Setting up a basic REST API in Spring Boot with Couchbase is fairly simple.  This project when run with Couchbase Server 7 installed creates a bucket in Couchbase, an index for our parameterized [N1QL query](https://docs.couchbase.com/java-sdk/current/howtos/n1ql-queries-with-sdk.html), and showcases basic CRUD operations needed in most applications.
