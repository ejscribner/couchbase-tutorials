---
# frontmatter
path: "/tutorial-quickstart-csharp-aspnet"
title: Quickstart in Couchbase with C# and ASP.NET 
short_title: ASP.NET and C# Start
description: 
  - Build a REST API with Couchbase's C# SDK and ASP.NET
  - Learn how to connect to a cluster to create, read, update, and delete documents
  - Write simple parameterized N1QL queries
content_type: quickstart
filter: sdk
technology:
  - kv
  - query
exclude_tutorials: false
tags:
  - REST API
  - ASP.NET
sdk_language:
  - csharp
length: 30 Mins
---

## Abstract

In this article, you will learn how to connect to a Couchbase cluster to create, read, update, and delete documents and how to write simple parametrized N1QL queries.

<!--

**remove gitpod until they fix it**

[![Try it now!](https://da-demo-images.s3.amazonaws.com/runItNow_outline.png?couchbase-example=aspnet-quickstart-repo&source=github)](https://gitpod.io/#https://github.com/couchbase-examples/aspnet-quickstart)

-->

## Prerequisites

To run this prebuilt project, you will need:

* Follow [Couchbase Installation Options](/tutorial-couchbase-installation-options) for installing the lastest Couchbase Database Server Instance
* [.NET SDK v5](https://dotnet.microsoft.com/download/dotnet/5.0) installed
* Code Editor installed (Visual Studio Professional, Visual Studio for Mac, or Visual Studio Code)

## Clone The Project

```shell
git clone https://github.com/couchbase-examples/aspnet-quickstart
```

## Install Dependencies

```shell
cd src/Org.Quickstart.API
dotnet restore
```

**Note:** Nuget packages auto restore when building the project in Visual Studio Professional 2019 and Visual Studio for Mac

### DependencyInjection Nuget package

The Couchbase SDK for .NET includes a nuget package called `Couchbase.Extensions.DependencyInjection` which is designed for environments like ASP.NET that takes in a configuration to connect to Couchbase and automatically registers interfaces that you can use in your code to perform full `CRUD (create, read, update, delete)` operations and queries against the database.

### Database Server Configuration

All configuration for communication with the database is stored in the appsettings.Development.json file.  This includes the connection string, username, password, bucket name, colleciton name, and scope name.  The default username is assumed to be `admin` and the default password is assumed to be `P@$$w0rd12`.  If these are different in your environment you will need to change them before running the application.

### Creating the bucket, username, and password 

With this tutorial, it's required that a database user and bucket be created prior to running the application.  

#### Capella Users 

For Capella users, follow the directions found on the [documentation website](https://docs.couchbase.com/cloud/clusters/data-service/manage-buckets.html#add-bucket) for creating a bucket called `user_profile`.  Next, follow the directions for [Configure Database Credentials](https://docs.couchbase.com/cloud/clusters/manage-database-users.html); name it `admin` with a password of `P@$$w0rd12`.  

Next, open the [appsettings.Development.json](https://github.com/couchbase-examples/aspnet-quickstart/blob/main/src/Org.Quickstart.API/appsettings.Development.json#L13) file.  Locate the ConnectionString property and update it to match your Wide Area Network name found in the [Capella Portal UI Connect tab](https://docs.couchbase.com/cloud/get-started/connect-to-cluster.html#connect-to-your-cluster-using-the-built-in-sdk-examples). Note that Capella uses TLS so the connection string must start with couchbases://.  Note that this configuration is designed for development environments only.

```json
  "Couchbase": {
    "BucketName": "user_profile",
    "ScopeName": "_default",
    "CollectionName": "profile",
    "ConnectionString": "couchbases://yourassignedhostname.cloud.couchbase.com",
    "Username": "admin",
    "Password": "P@$$w0rd12",
    "IgnoreRemoteCertificateNameMismatch": true,
    "HttpIgnoreRemoteCertificateMismatch": true,
    "KvIgnoreRemoteCertificateNameMismatch":  true
  }
```

Couchbase Capella users that do not follow these directions will get  exception errors and the Swagger portal will return errors when running the APIs.

#### Local Installation and Docker Users

For local installation and docker users, follow the directions found on the [documentation website](https://docs.couchbase.com/server/current/manage/manage-buckets/create-bucket.html) for creating a bucket called `user_profile`.  Next, follow the directions for [Creating a user](https://docs.couchbase.com/server/current/manage/manage-security/manage-users-and-roles.html); name it `admin` with a password of `P@$$w0rd12`.  For this tutorial, make sure it has `Full Admin` rights so that the application can create collections and indexes. 

Next, open the [appsettings.Development.json](https://github.com/couchbase-examples/aspnet-quickstart/blob/main/src/Org.Quickstart.API/appsettings.Development.json#L13) file and validate the configuration information matches your setup. 

> **NOTE:** For docker and local Couchbase installations, Couchbase must be installed and running on localhost (<http://127.0.0.1:8091>) prior to running the the ASP.NET app.

### Running The Application

At this point the application is ready and you can run it:

```shell
dotnet run
```

Once the site is up and running you can launch your browser and go to the [Swagger start page](https://localhost:5001/swagger/index.html) to test the APIs.

## What We'll Cover

A simple REST API using ASP.NET and the Couchbase SDK version 3.x with the following endpoints:

* [POST a Profile](#post-profile) – Create a new user profile
* [GET a Profile by Key](#getbykey-profile) – Get a specific profile
* [PUT Profile](#put-profile) – Update a profile
* [DELETE Profile](#delete-profile) – Delete a profile
* [GET Profiles by Searching](#get-profiles) – Get all profiles matching First or Last Name

## Document Structure

We will be setting up a REST API to manage some profile documents. Our profile document will have an auto-generated GUID for its key, first and last name of the user, an email, and hashed password. For this demo we will store all profile information in just one document in a collection named `profile`:

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

To begin clone the repo and open it up in the IDE of your choice to learn about how to create, read, update and delete documents in your Couchbase Server.  Before we can get into the controller code, let's review the standard way you setup the Couchbase SDK in ASP.NET.

**`Org.Quickstart.API.Startup`:**

ASP.NET has an interface called `IHostApplicationLifetime` that you can add to your Configure method to help with registration of lifetime events.  The Couchbase SDK provides the `ICouchbaseLifetimeService` interface for handling closing the database connections when the application closes.

It's best practice to register for the ASP.NET `ApplicationStop` lifetime event and call the `ICouchbaseLifetimeService` Close method so that the database connection and resources are closed and removed gracefully.

The Couchbase .NET SDK will handle all communications to the database cluster, so you shouldn't need to worry about creating a pool of connections.

```csharp
if (_env.EnvironmentName == "Testing")
{
  //add cors policy
  app.UseCors(_devSpecificOriginsName);

  //setup the database once everything is setup and running integration tests need to make sure database is fully working before running,hence running Synchronously
  appLifetime.ApplicationStarted.Register(() => {
    var db = app.ApplicationServices.GetService<DatabaseService>();
    db.CreateBucket().RunSynchronously();
    db.CreateIndex().RunSynchronously();
  });
} else {
   //setup the database once everything is setup and running
  appLifetime.ApplicationStarted.Register(async () => {
	var db = app.ApplicationServices.GetService<DatabaseService>();

     //warning - we assume the bucket has already been created
     //if you don't create it you will get errors

    //create collection to store documents in
    await db.CreateCollection();
                    
    //creates the indexes for our SQL++ query
    await db.CreateIndex();
	});
}
```

<!-- [abstract] -->
The DatabaseService class is a convience class that has a method SetupDatabase which is called in the ASP.NET `ApplicationStarted` lifetime event.  This is used to to automatically create the bucket, collection, scope, and indexes used in this Quickstart and reads this configuration information in from the appsettings.Development.json file.

## POST a Profile

For CRUD operations we will use the [Key Value operations](https://docs.couchbase.com/dotnet-sdk/current/howtos/kv-operations.html) that are built into the Couchbase SDK to create, read, update, and delete a document.  Every document will need a ID (simlar to a primary key in other databases) in order to save it to the database.

Open the ProfileController.cs file found in the Controllers folder and navigate to the Post method.  Let’s break this code down.  First, we check that both an email and password exist in the request.  Next, we get a variable that we can use to get a connection to the bucket which allows us to get another variable to connect to the collection that we want to store our document in.

```csharp
if (!string.IsNullOrEmpty(request.Email) && !string.IsNullOrEmpty(request.Password))
{
  var bucket = await _bucketProvider.GetBucketAsync(_couchbaseConfig.BucketName);
  var collection = bucket.Collection(_couchbaseConfig.CollectionName);
  var profile = request.GetProfile();
  profile.Pid = Guid.NewGuid();
  await collection.InsertAsync(profile.Pid.ToString(), profile);

  return Created($"/api/v1/profile1/{profile.Pid}", profile);
}
else
{
  return UnprocessableEntity();
}
```

<!-- [abstract] -->
from Post method of Controllers/ProfileController.cs

After this we use a helper method built into the ProfileCreateRequestCommand class that returns a new Profile object:

```csharp
public Profile GetProfile()
{
  return new Profile
  {
    Pid = new Guid(),
    FirstName = this.FirstName,
    LastName = this.LastName,
    Email = this.Email,
    Password = this.Password
  };
}
```

<!-- [abstract] -->
from Models/ProfileCreateRequestCommand.cs

The `Pid` that we’re saving into the account object is a unique key.  This is what we will use for our `Key` to the document.

Rather than saving the password in the account object as plain text, we hash it with [Bcrypt](https://www.nuget.org/packages/BCrypt.Net-Next/) in the setter of the Profile object:

```csharp
private string _password;
public string Password
{
  get
  {
    return _password;
  }
  set
  {
    _password = BCrypt.Net.BCrypt.HashPassword(value);
  }
}
```

<!-- [abstract] -->
from Models/Profile.cs

Our `profile` document is ready to be persisted to the database.  We create an async call to the `collection` using the `InsertAsync` method and then return the document saved and the result all as part of the same object back to the user.

## GET a Profile by Key

Navigate to the GetById method in the ProfileController.cs file in the Controllers folder.  We only need the profile ID or our `Key` from the user to retrieve a particular profile document using a basic key-value operation which is passed in the method signature as a Guid.  Since we created the document with a unique key we can use that key to find the document in the scope and collection it is stored in.

```csharp
var bucket = await _bucketProvider.GetBucketAsync(_couchbaseConfig.BucketName);
var scope = bucket.Scope(_couchbaseConfig.ScopeName);
var collection = scope.Collection(_couchbaseConfig.CollectionName);
var result = await collection.GetAsync(id.ToString());
```

<!-- [abstract] -->
from GetById method of Controllers/ProfileController.cs

If the document wasn't found in the database we return the NotFound method which results in a 404 status code.

## PUT Profile

Update a Profile by Profile ID

Now let's navigate to the Update method of the ProfileController class.  We first look up the existing document and make sure it exists, if it does not, return a 500 level error code and message: "Cannot update: document not found".

Then, the entire document gets replaced except for the document key and the `pid` field.  The ProfileUpdateRequestCommand has a helper method that returns a Profile from the request object.

Finally, we create an async call to the `collection` using the `ReplaceAsync` method and then return the document saved and the result just as we did in the previous endpoint.

```csharp
var bucket = await _bucketProvider.GetBucketAsync(_couchbaseConfig.BucketName);
var collection = bucket.Collection(_couchbaseConfig.CollectionName);
var result = await collection.GetAsync(request.Pid.ToString());
var profile = result.ContentAs<Profile>();

var updateResult = await collection.ReplaceAsync<Profile>(request.Pid.ToString(), request.GetProfile());
```

<!-- [abstract] -->
from Update method of Controllers/ProfileController.cs

## DELETE Profile

Navigate to the Delete method in the ProfileController class.  We only need the `Key` or id from the user to delete a document using a basic key-value operation.

```csharp
var bucket = await _bucketProvider.GetBucketAsync(_couchbaseConfig.BucketName);
var collection = bucket.Collection(_couchbaseConfig.CollectionName);
await collection.RemoveAsync(id.ToString());
```

<!-- [abstract] -->
from Delete method of Controllers/ProfileController.cs

## GET Profiles by Searching

[N1QL](https://docs.couchbase.com/dotnet-sdk/current/howtos/n1ql-queries-with-sdk.html) is a powerful query language based on SQL, but designed for structed and flexible JSON documents. We will use a N1QL query to search for profiles with Skip, Limit, and Search options.

Navigate to the List method in the ProfileController class.  This endpoint is different from all of the others because it makes the N1QL query rather than a key-value operation. This means more overhead because the query engine is involved. We did create an [index](https://docs.couchbase.com/server/current/learn/services-and-indexes/indexes/indexing-and-query-perf.html) specific for this query, so it should be performant.

First, the method signature uses the [FromQuery] annotation to destructure the query to get the individual `skip`, `limit`, and `firstNameSearch` values and store them in the ProfileRequestQuery object.

Then, we build our N1QL query using the parameters we just built.

Finally, we pass that `query` to the `cluster.QueryAsync` method and return the result.

Take notice of the N1QL syntax and how it targets the `bucket`.`scope`.`collection`.

```csharp
var cluster = await _clusterProvider.GetClusterAsync();
var query = $"SELECT p.* FROM  {_couchbaseConfig.BucketName}.{_couchbaseConfig.ScopeName}.{_couchbaseConfig.CollectionName}
p WHERE lower(p.firstName) LIKE '%{request.Search.ToLower()}%' OR lower(p.lastName) LIKE '%{request.Search.ToLower()}%'
LIMIT {request.Limit} OFFSET {request.Skip}";

var results = await cluster.QueryAsync<Profile>(query);
var items = await results.Rows.ToListAsync<Profile>();
if (items.Count == 0)
    return NotFound();

return Ok(items)
```

<!-- [abstract] -->
from List method of Controllers/ProfileController.cs

### Running The Tests

To run the standard integration tests, use the following commands:

```shell
cd ../Org.Quickstart.IntegrationTests/
dotnet restore
dotnet test
```

### Project Setup Notes

This project was based on the standard ASP.NET Template project and the default weather controller was removed.  The HealthCheckController is provided as a santity check and is used in our unit tests.

A fully list of nuget packages are referenced below:

```xml
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.3.0" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="Swashbuckle.AspNetCore.Annotations" Version="6.3.0" />
<PackageReference Include="CouchbaseNetClient" Version="3.2.8" />
<PackageReference Include="Couchbase.Extensions.DependencyInjection" Version="3.2.8" />
```

## Conclusion

Setting up a basic REST API in ASP.NET with Couchbase is fairly simple, this project when run with Couchbase Server 7 installed creates a bucket in Couchbase, an index for our parameterized [N1QL query](https://docs.couchbase.com/dotnet-sdk/current/howtos/n1ql-queries-with-sdk.html), and showcases basic CRUD operations needed in most applications.
