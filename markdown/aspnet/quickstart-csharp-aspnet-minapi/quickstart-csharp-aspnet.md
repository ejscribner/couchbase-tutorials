---
# frontmatter
path: "/tutorial-quickstart-csharp-aspnet-minapi"
title: Quickstart in Couchbase with C# and ASP.NET Minimum API 
short_title: ASP.NET Minimum API and C# 
description: 
  - Build a REST API with Couchbase's C# SDK 3 and ASP.NET Minimum API
  - Explore real examples as you follow along
content_type: tutorial
filter: sdk
technology: 
  - kv
  - query
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
* [.NET SDK v6](https://dotnet.microsoft.com/download/dotnet/6.0) installed
* Basic knowledge of [ASP.NET Minimum API](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-6.0) 
* Code Editor installed (Visual Studio Professional, Visual Studio for Mac, or Visual Studio Code)

## Clone The Project

```shell
git clone https://github.com/couchbase-examples/aspnet-quickstart-minapi
```

## Install Dependencies

```shell
cd src/Couchbase.Quickstart
dotnet restore
```

**Note:** Nuget packages auto restore when building the project in Visual Studio Professional and Visual Studio for Mac

### DependencyInjection Nuget package

The Couchbase SDK for .NET includes a nuget package called `Couchbase.Extensions.DependencyInjection` which is designed for environments like ASP.NET that takes in a configuration to connect to Couchbase and automatically registers interfaces that you can use in your code to perform full `CRUD (create, read, update, delete)` operations and queries against the database.

### Database Server Configuration

All configuration for communication with the database is stored in the appsettings.Development.json file.  This includes the connection string, username, password, bucket name, colleciton name, and scope name.  The default username is assumed to be `admin` and the default password is assumed to be `P@$$w0rd12`.  If these are different in your environment you will need to change them before running the application.

### Creating the bucket, username, and password 

With this tutorial, it's required that a database user and bucket be created prior to running the application.  

#### Capella Users 

For Capella users, follow the directions found on the [documentation website](https://docs.couchbase.com/cloud/clusters/data-service/manage-buckets.html#add-bucket) for creating a bucket called `user_profile`.  Next, follow the directions for [Configure Database Credentials](https://docs.couchbase.com/cloud/clusters/manage-database-users.html); name it `admin` with a password of `P@$$w0rd12`.  

Next, open the [appsettings.Development.json](https://github.com/couchbase-examples/aspnet-quickstart-minapi/blob/main/src/Couchbase.Quickstart/appsettings.Development.json#L14) file.  Locate the ConnectionString property and update it to match your Wide Area Network name found in the [Capella Portal UI Connect tab](https://docs.couchbase.com/cloud/get-started/connect-to-cluster.html#connect-to-your-cluster-using-the-built-in-sdk-examples). Note that Capella uses TLS so the connection string must start with couchbases://.  Note that this configuration is designed for development environments only.

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

Next, open the [appsettings.Development.json](https://github.com/couchbase-examples/aspnet-quickstart-minapi/blob/main/src/Couchbase.Quickstart/appsettings.Development.json#L14) file and validate the configuration information matches your setup. 

> **NOTE:** For docker and local Couchbase installations, Couchbase must be installed and running on localhost (<http://127.0.0.1:8091>) prior to running the the ASP.NET app.

### Running The Application

At this point the application is ready and you can run it:

```shell
cd src/Couchbase.Quickstart
dotnet run 
```

Once the site is up and running you can launch your browser and go to the [Swagger start page](https://localhost:5001/swagger/index.html) to test the APIs.

## What We'll Cover

A simple REST API using ASP.NET Minimum API and the Couchbase SDK version 3.x with the following endpoints:

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

**<a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/aspnet-quickstart-minapi/blob/main/src/Couchbase.Quickstart/Program.cs#L18">Couchbase.Quickstart.Program</a>**

In order to use the `Couchbase.Extensions.DependencyInjection` framework, we must first register the service.  The Couchbase Services requires the database configuration information, which can be provided by reading the database configuration from the appsettings.json file.  

```csharp
//register the configuration for Couchbase and Dependency Injection Framework
builder.Services.Configure<CouchbaseConfig>(builder.Configuration.GetSection("Couchbase"));
builder.Services.AddCouchbase(builder.Configuration.GetSection("Couchbase"));
```

ASP.NET has an interface called `IHostApplicationLifetime` that you can add to your Configure method to help with registration of lifetime events.  The Couchbase SDK provides the `ICouchbaseLifetimeService` interface for handling closing the database connections when the application closes.

It's best practice to register for the ASP.NET `ApplicationStop` lifetime event and call the `ICouchbaseLifetimeService` Close method so that the database connection and resources are closed and removed gracefully.

```csharp
//remove couchbase from memory when ASP.NET closes
app.Lifetime.ApplicationStopped.Register(() =>
{
    var cls = app.Services.GetRequiredService<ICouchbaseLifetimeService>();
    if (cls != null)
    {
        cls.Close();
    }
});
```

The Couchbase .NET SDK will handle all communications to the database cluster, so you shouldn't need to worry about creating a pool of connections.

<!-- [abstract] -->
The DatabaseService class is a convience class that has a method SetupDatabase which is called in the ASP.NET `ApplicationStarted` lifetime event.  This is used to to automatically create the collection and indexes used in this Quickstart.

```csharp
if (app.Environment.EnvironmentName == "Testing")
{
    app.UseCors(_devSpecificOriginsName);
    //assume that bucket, collection, and indexes already exists due to latency in creating and async 
}
else
{
    //setup the database once everything is setup and running
    app.Lifetime.ApplicationStarted.Register(async () =>
    {
        var db = app.Services.GetService<Couchbase.Quickstart.Services.DatabaseService>();

        //**WARNING** - this code assumes the bucket has already been created
        //if you don't create it you will get errors
        if (db != null)
        {
            //create collection to store documents in
            await db.CreateCollection();

            //creates the indexes for our SQL++ query
            await db.CreateIndex();
        }
    });
}
```

## POST a Profile

For CRUD operations we will use the [Key Value operations](https://docs.couchbase.com/dotnet-sdk/current/howtos/kv-operations.html) that are built into the Couchbase SDK to create, read, update, and delete a document.  Every document will need a ID (simlar to a primary key in other databases) in order to save it to the database.

Open the Program.cs file navigate to the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/aspnet-quickstart-minapi/blob/main/src/Couchbase.Quickstart/Program.cs#L164">app.MapPost</a> method call.  Let’s break this code down.  

```csharp
app.MapPost("/api/v1/profiles", 
 async (
  ProfileCreateRequestCommand request, 
  IBucketProvider bucketProvider, 
  IOptions<CouchbaseConfig> options) => // <1>
{
 //get couchbase config values from appsettings.json 
 var couchbaseConfig = options.Value; // <2>

 //get the bucket, scope, and collection
 var bucket = await bucketProvider.GetBucketAsync(couchbaseConfig.BucketName); // <3>
 var scope = bucket.Scope(couchbaseConfig.ScopeName); // <4>
 var collection = scope.Collection(couchbaseConfig.CollectionName); // <5>

 //get profile from request
 var profile = request.GetProfile(); // <6>

 //set documentId 
 profile.Pid = Guid.NewGuid(); // <7>

 //save documentg
 await collection.InsertAsync(profile.Pid.ToString(), profile); // <8>
 return Results.Created($"/api/v1/profile/{profile.Pid}", profile); // <9>
});
```

1.  We bring in the request as an argument using the ProfileCreateRequestCommand record.  We need access to the bucket so we can use dependency injection to pass in the IBucketProvider and IOptions to get the configuration from our appsettings.json file.  2.
2.  Next we pull the configuration into a variable reference we can use with the bucket provider.  
3.  Next, we get a variable that we can use to get a connection to the bucket. 
4. Next, we use the bucket to get a reference to the scope. 
5. Next, we use the scope to get a reference to the collection that documents are stored in.
6. After this we use a helper method built into the ProfileCreateRequestCommand record that returns a new Profile object.  
7. The `Pid` that we’re saving into the account object is a unique key.  This is what we will use for our `Key` to the document.
8. Our `profile` document is ready to be persisted to the database.  We create an async call to the `collection` using the `InsertAsync` method.
9. Finally we return a link to the Get API for this document using the documentId that was used when we created the document.

## GET a Profile by Key

Navigate to the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/aspnet-quickstart-minapi/blob/main/src/Couchbase.Quickstart/Program.cs#L129">app.MapGet("/api/v1/profiles/{id}"</a> method call the Program.cs file.  We only need the profile ID or our `Key` from the user to retrieve a particular profile document using a basic key-value operation which is passed in the method signature as a Guid.  Since we created the document with a unique key we can use that key to find the document in the scope and collection it is stored in.  We need access to the bucket so we can use dependency injection to pass in the IBucketProvider and IOptions to get the configuration from our appsettings.json file.

```csharp
app.MapGet("/api/v1/profiles/{id}", async (Guid id, IBucketProvider bucketProvider, IOptions<CouchbaseConfig> options) =>
{
 try 
 { 
  //get couchbase config values from appsettings.json 
  var couchbaseConfig = options.Value; // <1>

  //get the bucket, scope, and collection
  var bucket = await bucketProvider.GetBucketAsync(couchbaseConfig.BucketName); // <2>
  var scope = bucket.Scope(couchbaseConfig.ScopeName); // <3>
  var collection = scope.Collection(couchbaseConfig.CollectionName); // <4>

  //get the docment from the bucket using the id
  var result = await collection.GetAsync(id.ToString()); // <5>

  //validate we have a document
  var resultProfile = result.ContentAs<Profile>(); // <6>
  if (resultProfile != null) // <6>
  {
    return Results.Ok(resultProfile); // <6>
  }
 }
 catch (Couchbase.Core.Exceptions.KeyValue.DocumentNotFoundException)
 {
  Results.NotFound(); // <7>
 }
 catch (Exception ex)
 {
  return Results.Problem(ex.Message);
 }

 return Results.NotFound(); 
});
```

1.  Next we pull the configuration into a variable reference we can use with the bucket provider.  
2.  Next, we get a variable that we can use to get a connection to the bucket. 
3. Next, we use the bucket to get a reference to the scope. 
4. Next, we use the scope to get a reference to the collection that documents are stored in.
5. Next, we use the colleciton to get the document from the database passing in the documentId. 
6. Next, we validate a document was returned from the database.  If the document was returned we return the document.
7. Finally, if the document wasn't found we return Results.NotFound telling the calling party that the document wasn't found in the database.

## PUT Profile

Navigate to the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/aspnet-quickstart-minapi/blob/main/src/Couchbase.Quickstart/Program.cs#L185">app.MapPut</a> method call the Program.cs file.  We first look up the existing document and make sure it exists, if it does not, return a 500 level error code and message: "Cannot update: document not found".

Then, the entire document gets replaced except for the document key and the `pid` field.  The ProfileUpdateRequestCommand has a helper method that returns a Profile from the request object.

Finally, we create an async call to the `collection` using the `ReplaceAsync` method and then return the document saved and the result just as we did in the previous endpoint.

```csharp
//get couchbase config values from appsettings.json 
var couchbaseConfig = options.Value;

//get the bucket, scope, and collection
var bucket = await bucketProvider.GetBucketAsync(couchbaseConfig.BucketName);
var collection = bucket.Collection(couchbaseConfig.CollectionName);

//get current profile from the database
var result = await collection.GetAsync(request.Pid.ToString());
if (result != null)
{
 var profile = result.ContentAs<Profile>();
 var updateResult = await collection.ReplaceAsync<Profile>(request.Pid.ToString(), request.GetProfile());

 return Results.Ok(request);
}
else
{
 return Results.NotFound();
}
```

## DELETE Profile

Navigate to the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/aspnet-quickstart-minapi/blob/main/src/Couchbase.Quickstart/Program.cs#L209">app.MapDelete</a> method call the Program.cs file.  We only need the `Key` or id from the user to delete a document using a basic key-value operation.  Note that in this code we first check if the document exists; if it doesn't then we return Results.NotFound().  Otherwise we remove the document using the RemoveAsync method call.

```csharp
    //get couchbase config values from appsettings.json 
    var couchbaseConfig = options.Value;

    //get the bucket and collection
    var bucket = await bucketProvider.GetBucketAsync(couchbaseConfig.BucketName);
    var collection = bucket.Collection(couchbaseConfig.CollectionName);

    //get the docment from the bucket using the id
    var result = await collection.GetAsync(id.ToString());

    //validate we have a document
    var resultProfile = result.ContentAs<Profile>();
    if (resultProfile != null)
    {
        await collection.RemoveAsync(id.ToString());
        return Results.Ok(id);
    }
    else
    {
        return Results.NotFound();
    }
```
## GET Profiles by Searching

[N1QL](https://docs.couchbase.com/dotnet-sdk/current/howtos/n1ql-queries-with-sdk.html) is a powerful query language based on SQL, but designed for structed and flexible JSON documents. We will use a N1QL query to search for profiles with Skip, Limit, and Search options.

Navigate to the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/aspnet-quickstart-minapi/blob/main/src/Couchbase.Quickstart/Program.cs#L90">app.MapGet("/api/v1/profiles"</a> method call the Program.cs file.  This endpoint is different from all of the others because it makes the N1QL query rather than a key-value operation. This means more overhead because the query engine is involved. We did create an [index](https://docs.couchbase.com/server/current/learn/services-and-indexes/indexes/indexing-and-query-perf.html) specific for this query, so it should be performant.

First, the method signature uses `search`, `limit`, and `skip` values for supporting basic paging operations.  Then, we build our N1QL query using the parameters we just built.

Finally, we pass that `query` to the `cluster.QueryAsync` method and return the result.

Take notice of the N1QL syntax and how it targets the `bucket`.`scope`.`collection`.

```csharp
//create query using parameters to advoid SQL Injection
var cluster = await clusterProvider.GetClusterAsync();
var query = $@"SELECT p.* FROM `{couchbaseConfig.BucketName}
 `.`{couchbaseConfig.ScopeName}
 `.`{couchbaseConfig.CollectionName}` 
 p WHERE lower(p.firstName) 
 LIKE '%' || $search || '%' 
 OR lower(p.lastName) LIKE '%' || $search || '%' 
 LIMIT $limit OFFSET $skip";

//setup parameters
var queryParameters = new Couchbase.Query.QueryOptions();
queryParameters.Parameter("search", search.ToLower());
queryParameters.Parameter("limit", limit == null ? 5 : limit);
queryParameters.Parameter("skip", skip == null ? 0 : skip);

var results = await cluster.QueryAsync<Profile>(query, queryParameters);

var items = await results.Rows.ToListAsync<Profile>();
if (items.Count() == 0)
 return Results.NotFound();

return Results.Ok(items);
```
### Running The Tests

To run the standard integration tests, use the following commands:

```shell
cd ../Couchbase.Quickstart.IntegrationTests/
dotnet restore
dotnet test
```

### Project Setup Notes

This project was based on the standard ASP.NET Template project and the default weather controller was removed.  

## Conclusion

Setting up a basic REST API in ASP.NET Minimum API with Couchbase is fairly simple, this project when run with Couchbase installed creates collection, an index for our parameterized [N1QL query](https://docs.couchbase.com/dotnet-sdk/current/howtos/n1ql-queries-with-sdk.html), and showcases basic CRUD operations needed in most applications.
