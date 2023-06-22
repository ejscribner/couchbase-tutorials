---
# frontmatter
path: '/tutorial-quickstart-golang-gin-gonic'
title: Quickstart in Couchbase with Golang and Gin Gonic
short_title: Golang and Gin Gonic
description:
  - Learn to build a REST API in Golang using Gin Gonic and Couchbase
  - See how you can persist and fetch data from Couchbase using primary indices
  - Explore CRUD operations in action with Couchbase
content_type: quickstart
filter: sdk
technology: 
  - kv
  - index
  - query
tags:
  - Gin Gonic
  - REST API
sdk_language:
  - golang
length: 30 Mins
---

[![Try it now!](https://da-demo-images.s3.amazonaws.com/runItNow_outline.png?couchbase-example=golang-quickstart-repo&source=devPortal)](https://gitpod.io/#https://github.com/couchbase-examples/golang-quickstart)

<!-- [abstract] -->

In this article, you will learn how to connect to a Couchbase cluster to create, read, update, and delete documents and how to write simple parametrized N1QL queries.

## Prerequisites

To run this prebuilt project, you will need to have Couchbase Server locally installed OR have a Couchbase Capella account :

- Follow [Get Started with Couchbase Capella](https://docs.couchbase.com/cloud/get-started/get-started.html) for more information about Couchbase Capella.
- Follow [Couchbase Installation Options](https://developer.couchbase.com/tutorial-couchbase-installation-options) for installing the latest Couchbase Database Server Instance
- Basic knowledge of [Golang](https://go.dev/tour/welcome/1) and [Gin Gonic](https://gin-gonic.com/docs/)
- [Golang v1.19.x](https://go.dev/dl/) installed
- Code Editor installed
- Note that this tutorial is designed to work with the latest Golang SDK (2.x) for Couchbase. It will not work with the older Golang SDK for Couchbase without adapting the code.

## Source Code

```shell
git clone https://github.com/couchbase-examples/golang-quickstart
```

## Install Dependencies

Any dependencies will be installed by running the go run command, which installs any dependencies required from the go.mod file.


## Database Server Configuration

All configuration for communication with the database is stored in the `.env` file. This includes the Connection string, username, password, bucket name, collection name and scope name. The default username is assumed to be `Administrator` and the default password is assumed to be `Password1$`. If these are different in your environment you will need to change them before running the application.

### Running Couchbase Capella

When running Couchbase using Capella, the application requires the bucket and the database user to be setup from Capella Console. The directions for creating a bucket can be found on the [documentation website](https://docs.couchbase.com/cloud/clusters/data-service/manage-buckets.html#add-bucket). When following the directions, name the bucket "user_profile". Next, follow the directions for [Configure Database Credentials](https://docs.couchbase.com/cloud/clusters/manage-database-users.html) and name the username `Administrator` and password `Password1$`.

Next, open the `.env` file. Locate CONNECTION_STRING and update it to match your Wide Area Network name found in the [Capella Portal UI Connect Tab](https://docs.couchbase.com/cloud/get-started/connect-to-cluster.html#connect-to-your-cluster-using-the-built-in-sdk-examples). Note that Capella uses TLS so the Connection string must start with couchbases://. Note that this configuration is designed for development environments only.

```
CONNECTION_STRING=couchbases://yourhostname.cloud.couchbase.com
BUCKET=user_profile
COLLECTION=default
SCOPE=default
USERNAME=Administrator
PASSWORD=Password1$
```

### Running Couchbase Locally

For local installation and Docker users, follow the directions found on the [documentation website](https://docs.couchbase.com/server/current/manage/manage-buckets/create-bucket.html) for creating a bucket called `user_profile`. Next, follow the directions for [Creating a user](); name the username `Administrator` and password `Password1$`. For this tutorial, make sure it has `Full Admin` rights so that the application can create collections and indexes.

Next, open the `.env` file and validate that the configuration information matches your setup.

> **NOTE:** For docker and local Couchbase installations, Couchbase must be installed and running on localhost (<http://127.0.0.1:8091>) prior to running the the Golang application.


### Running The Application

At this point the application is ready. Make sure you are in the src directory. You can run it with the following command from the terminal/command prompt:

```shell
go run .
```

Once the site is up and running, you can launch your browser and go to the [Swagger start page](http://127.0.0.1:8080/docs/index.html) to test the APIs.

## What We'll Cover

A simple REST API using Golang, Gin Gonic, and the Couchbase SDK version 2.x with the following endpoints:

- [POST a Profile](#post-a-profile) – Create a new user profile
- [GET a Profile by Key](#get-a-profile-by-key) – Get a specific profile
- [PUT Profile](#put-profile) – Update a profile
- [DELETE Profile](#delete-profile) – Delete a profile
- [GET Profiles by Searching](#get-profiles-by-searching) – Get all profiles matching First or Last Name

## Document Structure

We will be setting up a REST API to manage some profile documents. Our profile document will have an auto-generated UUID for its key, first and last name of the user, an email, and hashed password. For this demo, we will store all profile information in just one document in a collection named `profile`:

```json
{
  "Pid": "b181551f-071a-4539-96a5-8a3fe8717faf",
  "FirstName": "John",
  "LastName": "Doe",
  "Email": "john.doe@couchbase.com",
  "Password": "$2a$10$tZ23pbQ1sCX4BknkDIN6NekNo1p/Xo.Vfsttm.USwWYbLAAspeWsC"
}
```

As we can see, we want our user's password to be encrypted in the database too, we can achieve this simply with `bcrypt`, an implementation of the [crypto library](https://pkg.go.dev/golang.org/x/crypto) we have installed.

## Let's Review the Code

To begin, open the code in the IDE of your choice to learn how to create, read, update, and delete documents.

## POST a Profile

For CRUD operations, we will use the [Key Value operations](https://docs.couchbase.com/go-sdk/current/howtos/kv-operations.html) that are built into the Couchbase SDK to create, read, update, and delete a document. Every document will need an ID (similar to a primary key in other databases) to save it to the database.

Open the `profile_controller` file found in the `controllers` folder and navigate to the Insertprofile method. Let's break this code down. This brings in the information passed to the controller in the body of the request. Rather than saving the password received as plain text, we hash it with Bcrypt `GenerateFromPassword` function. Note that the `GenerateFromPassword` function requires a byte array. The function returns a byte array which must be converted to a string while inserting the document.

```golang
key := uuid.New().String()
hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
```
<!-- [abstract] -->

from post method of controllers/profile_controller.go

Next, we create a new_profile document with the data received from the request.
```golang
new_profile := models.RequestBody{
	Pid:       key,
	FirstName: data.FirstName,
	LastName:  data.LastName,
	Email:     data.Email,
	Password:  string(hashedPassword),
	}
```

<!-- [abstract] -->

from post method of controllers/profile_controller.go

Our new_profile document is ready to be persisted to the database. We call the collection using the variable `col` and then call the insert method by passing the profile_key which is the generated UUID, as the key. Once the document is inserted we then return the document saved and the result all as part of the same object back to the user.

```golang
result, err := col.Insert(profile_key, new_profile, nil)
getResult, err := col.Get(profile_key, nil)
err = getResult.Content(&getDoc)
context.JSON(http.StatusOK, responses.ProfileResponse{Status: http.StatusOK, Message: "Document successfully inserted", Profile: getDoc})
```

<!-- [abstract] -->

from insert method of controllers/profile_controller.go

## GET a Profile by Key

Navigate to the `GetProfile` method of the `profile_controller` file in the `controllers` folder. We only need the profile ID (`Pid`) or our `Key` from the user to retrieve a particular profile document using a basic key-value operation which is passed in the method signature as a string.

```golang
getResult, err := col.Get(Pid, nil)
context.JSON(http.StatusOK, responses.ProfileResponse{Status: http.StatusOK, Message: "Successfully fetched Document", Profile: getDoc})

```

<!-- [abstract] -->

from GetProfile method of controllers/profile_controller.go

If the document wasn't found in the database, we return the `NotFound` method.

## PUT Profile

Update a Profile by Profile ID (pid)
Let's navigate to the `UpdateProfile` function of the `profile_controller` file. The entire document gets replaced except for the document key which is the pid field. 

Rather than saving the password as plain text, we hash it with [Bcrypt](https://pkg.go.dev/golang.org/x/crypto/bcrypt) `GenerateFromPassword` function.

```golang
profile_id := context.Param("id")
data.Pid = profile_id
hashedPassword, err_password := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
```

<!-- [abstract] -->

from UpdateProfile method of controllers/profile_controller.go

We create a call to the collection using the upsert method and then return the document saved and the result just as we did in the previous endpoint.

```golang
_, err := col.Upsert(profile_id, data, nil)
if errors.Is(err, gocb.ErrDocumentNotFound) {
	context.JSON(http.StatusNotFound, responses.ProfileResponse{Status: http.StatusNotFound, Message: "Error, Document with the key does not exist", Profile: err.Error()})
		return

}
getResult, err := col.Get(profile_id, nil)
err = getResult.Content(&getDoc)
context.JSON(http.StatusOK, responses.ProfileResponse{Status: http.StatusOK, Message: "Successfully Updated the document", Profile: getDoc})
```

<!-- [abstract] -->

from UpdateProfile method of controllers/profile_controller.go

## DELETE Profile

Navigate to the `DeleteProfile` method in the `profile_controller` class. We only need the Key or id from the user to remove a document using a basic key-value operation.

```golang
result, err := col.Remove(profile_id, nil)
```

<!-- [abstract] -->

from DeleteProfile method of controllers/profile_controller.go

## GET Profiles by Searching

[N1QL](https://docs.couchbase.com/go-sdk/current/howtos/n1ql-queries-with-sdk.html) is a powerful query language based on SQL, but designed for structured and flexible JSON documents. We will use an N1QL query to search for profiles with Skip, Limit, and Search options.

Navigate to the `SearchProfile` method in the `profile_controller` file. This endpoint is different from all of the others because it makes the N1QL query rather than a key-value operation. This usually means more overhead because the query engine is involved. We did create an [index](https://docs.couchbase.com/server/current/learn/services-and-indexes/indexes/indexing-and-query-perf.html) specific for this query, so it should be performant.

First, the query string is used to get the individual skip, limit, and search values using the context. Then, we build our N1QL query using the parameters that were passed in.
Take notice of the N1QL syntax and how it targets the `bucket`.`scope`.`collection`.

Finally, we pass that query to the cluster.query method and return the result. We create an interface{} type to iterate over the results and save the results in profiles which will be returned to the user.

```golang
#get search word,limit and skip
search := context.Query("search")
limit := context.Query("limit")
skip := context.Query("skip")

#create query
query:= fmt.Sprintf("SELECT p.* FROM %s.%s.%s p WHERE lower(p.FirstName) LIKE '%s' OR lower(p.LastName) LIKE '%s' LIMIT %s OFFSET %s%s",bucket_name,scope_name,collection_name,search_query,search_query,limit,skip,";")
results, _ := cluster.Query(query, nil)

#loop through results
for results.Next() {
	err := results.Row(&s)
		if err != nil {
			panic(err)
		}
		profiles = append(profiles, s)

	}
```

<!-- [abstract] -->

from SearchProfile method of controllers/profile_controller.go

### Running The Tests

To run the standard integration tests, use the following commands from the src directory:

```bash
cd test
go test -v
```

## Conclusion

Setting up a basic REST API in Golang and Gin Gonic with Couchbase is fairly simple,this project when run will showcase basic CRUD operations along with creating an index for our parameterized  [N1QL query](https://docs.couchbase.com/go-sdk/current/howtos/n1ql-queries-with-sdk.html) which is used in most applications.