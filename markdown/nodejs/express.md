---
# frontmatter
path: "/tutorial-quickstart-nodejs"
# title and description do not need to be added to markdown, start with H2 (##)
title: Using Node.js, Couchbase, and Express
short_title: Node.js and Express
description:
  - Build a basic REST API using Express and the Couchbase Node.js SDK
  - Set up your own cluster and build primary indices to support a basic search query
  - Watch CRUD operations in action with Couchbase
content_type: quickstart
filter: sdk
technology:
  - kv
  - index
  - query
tags:
  - Express
  - REST API
sdk_language: 
  - nodejs
length: 30 Mins
---

[![Try it now!](https://da-demo-images.s3.amazonaws.com/runItNow_outline.png?couchbase-example=nodejs-quickstart-repo&source=devPortal)](https://gitpod.io/#https://github.com/couchbase-examples/nodejs-quickstart)

In this article, you will learn how to connect to a Couchbase cluster to create, read, update, and delete documents, and write simple parametrized N1QL queries using the Couchbase Node JS SDK.

We will be using the latest version of Couchbase (version 7) that enables scopes and collections. For the easiest setup experience, we recommend trying Couchbase Capella, our fully-managed DBaaS offering. [Claim your free trial!](https://cloud.couchbase.com/sign-up)

Alternatively, you can [install Couchbase with docker](https://docs.couchbase.com/server/current/getting-started/do-a-quick-install.html) or [directly on your local device](https://docs.couchbase.com/server/current/install/install-intro.html).

## Prerequisites

To run this prebuilt project, you will need:

- A Couchbase Capella cluster or Couchbase 7 installed locally
- NodeJS & NPM (v12+)
- Code Editor
- See the [Couchbase Installation Options](/tutorial-couchbase-installation-options) for more details on setting up a cluster

## Source Code

```shell
git clone https://github.com/couchbase-examples/nodejs-quickstart
```

### Configure environment variables appropriately

We've included a `dev.env` file with some basic default values, but you may need to update these according to your configuration.
- `CB_URL` - The Couchbase endpoint to connect to. Use `localhost` for a local/Docker cluster, or the Wide Area Network address for a Capella instance (formatted like `cb.<xxxxxx>.cloud.couchbase.com`)
- `CB_USER` - The username of an authorized user on your cluster. Follow [these instructions](https://docs.couchbase.com/cloud/clusters/manage-database-users.html#create-database-credentials) to create database credentials on Capella
- `CB_PASS` - The password that corresponds to the user specified above
- `CB_BUCKET` - The bucket to connect to. We'll use `user_profile` for this
- `IS_CAPELLA` - `true` if you are using Capella, `false` otherwise. This flag determines if the connection should use TLS or not, as TLS is required for Capella.

**NOTE on TLS:** The connection logic in this sample app ignores mismatched certificates with the parameter `tls_verify=none`. While this is super helpful in streamlining the connection process for development purposes, it's not very secure and should **not** be used in production. To learn how to secure your connection with proper certificates, see [the Node.js TLS connection tutorial](/tutorial-nodejs-tls-connection).

### Setup and Run The Application

Install our NPM dependencies:

```shell
npm install
```

If you are using Capella, you'll have to manually create a bucket named `user_profile` and a collection named `profile`. See the documentation on [managing buckets](https://docs.couchbase.com/cloud/clusters/data-service/manage-buckets.html) and [creating a collection](https://docs.couchbase.com/cloud/clusters/data-service/scopes-collections.html#create-a-collection) for more information. Note that this collection should be created on the `_default` scope.


If you have Couchbase running locally, we can the bucket and collection by running the following command:

```shell
npm run init-db
```

Now we are ready to run our application:

```shell
npm start
```

If your database is set up correctly, we will now have an API running on port 3000 as specified in the `dev.env` file. Let's go over what we have done to create this API demo application.

## What We'll Cover

A simple REST API using Express and the [Couchbase NodeJS SDK](https://docs.couchbase.com/nodejs-sdk/current/hello-world/start-using-sdk.html), with the following endpoints:

- [POST Profile](#post-profile) – Create a new user profile
- [GET Profile by Key](#get-profile-by-key) – Get a specific profile
- [PUT Profile](#put-profile) – Update a profile
- [DELETE Profile](#delete-profile) – Delete a profile
- [GET Profiles](#get-profiles) – Get all profiles matching First or Last Name

## Document Structure

We will be setting up a REST API to manage some profile documents. Our profile document will have an auto-generated UUID for its key, first and last name of the user, an email, and hashed password. For this demo we will store all profile information in just one document in a collection named `profile`:

```json
{
  "email": "johnwick@couchbase.com",
  "password": "$2a$10$tZ23pbQ1sCX4BknkDIN6NekNo1p/Xo.Vfsttm.USwWYbLAAspeWsC",
  "firstName": "John",
  "lastName": "Wick",
  "pid": "b181551f-071a-4539-96a5-8a3fe8717faf"
}
```

## Let's Review the Code

We will be going over the `App.js` file located in the `/src` directory. Let's clone the repo onto our machine, get it up and running, and open the `App.js` to learn about how to create, read, update and delete documents in our Couchbase Server.

**`src/server.js`:**

The `server.js` file bootstraps our application by importing our `app.js` file and runs the `ensureProfileIndex()` before starting up the application, as we need those indexes for any use of N1QL queries in our application:

```js
import { app, ensureProfileIndex } from './app.js'

const startApiServer = async() => {
  await ensureProfileIndex()
    .then(() => {
      app.listen(process.env.APP_PORT,
        () => console.info(`Running on port ${process.env.APP_PORT}...`)
      )
    })
}

startApiServer()
```

**`src/app.js`:**

We import our dependencies and database connection:

```js
import express from 'express'
import bcrypt from 'bcryptjs'
import { v4 } from 'uuid'
import cors from 'cors'

import { couchbase, cluster, profileCollection } from '../db/connection'
```

The import of the database connection uses [`/db/connection.js`](https://github.com/couchbase-examples/nodejs-quickstart/blob/master/db/connection.js):

```js
import * as couchbase from 'couchbase'

const options = { username: process.env.CB_USER, password: process.env.CB_PASS }
const cluster = new couchbase.Cluster(process.env.CB_URL, options)
const bucket = cluster.bucket(process.env.CB_BUCKET)
const defaultScope = bucket.scope('_default')
const profileCollection = defaultScope.collection('profile')

module.exports = { couchbase, cluster, profileCollection }
```

In the [`connection.js`](https://github.com/couchbase-examples/nodejs-quickstart/blob/db/connection.js) file, we import the NodeJS SDK for Couchbase, create a connection to the database. The environment variables for `CB_URL`, `CB_USER`, `CB_PASS`, `CB_BUCKET`, which can be set for your development and testing environment respectively in the [`/config/` directory](https://github.com/couchbase-examples/nodejs-quickstart/blob/master/config). I have added both in the repo (`dev.env` and `test.env`), for the tutorial we will only focus on the dev environment. Feel free to explore the repo's [readme.md](https://github.com/couchbase-examples/nodejs-quickstart) file for additional instructions if you are interested in testing.

After we have our configuration for database connection in place, we can create our express app:

```js
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
```

We also wanted to show the easiest way of integrating Swagger into our project, as seen below, the Swagger client is located at `/api-docs` when the project is running.

```js
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
const swaggerDocument = YAML.load('./swagger.yaml')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get('/', function (req, res) {
  res.send('<a href="/api-docs">Profile Store Docs</a>')
})
```

## Ensure Primary Index Exists

The first time the app is run, we create two primary indexes, one for our user_profile bucket and another for our `profile` collection. The collection index is used by the `"/profiles"` endpoint that utilizes a N1QL query to search the database for profile documents where `firstName` or `lastName` match the search value. The bucket index can be used in the case that any documents are added to the bucket's default collection or manually from the Couchbase Web UI.

This function on app startup will only add the index if it does not exist already:

```js
const ensureIndexes = async() => {
  try {
    const bucketIndex = `CREATE PRIMARY INDEX ON ${process.env.CB_BUCKET}`
    const collectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.profile;`
    await cluster.query(bucketIndex)
    await cluster.query(collectionIndex)
    console.log(`Index Creation: SUCCESS`)
  } catch (err) {
    if (err instanceof couchbase.IndexExistsError) {
      console.info('Index Creation: Indexes Already Exists')
    } else {
      console.error(err)
    }
  }
}
```

Now we can move on to reviewing each of the individual endpoints:

## POST Profile

We create a profile document using the SDK `.insert()` method using the `profileCollection`.

```js
app.post("/profile", async (req, res) => {
  if (!req.body.email || !req.body.pass) {
    return res.status(400).send({ "message": `${!req.body.email ? 'email ' : ''}${
      (!req.body.email && !req.body.pass)
        ? 'and pass are required' : (req.body.email && !req.body.pass)
          ? 'pass is required' : 'is required'
    }`})
  }

  const id = v4()
  const profile = { pid: id, ...req.body, pass: bcrypt.hashSync(req.body.pass, 10) }
  await profileCollection.insert(id, profile)
    .then((result) => res.send({ ...profile, ...result }))
    .catch((e) => res.status(500).send({
      "message": `Profile Insert Failed: ${e.message}`
    }))
})
```

Let’s break this code down.

First, we check that both an email and password exist and then create a `profile` object based on the data that was sent in the request. The `pid` that we’re saving into the account object is a unique key.

After we check for required body parameters, we create an async call to the `profileCollection` using the `insert` method and then return the document saved and the result all as part of the same object back to the user. We utilize the spread operator again to make this simple. `insert` is a basic key-value operation.

## GET Profile by Key

Retrieve a Profile by Profile ID using the SDK `.get()` method` using the `profileCollection`.

```js
app.get("/profile/:pid", async (req, res) => {
  try {
    await profileCollection.get(req.params.pid)
      .then((result) => res.send(result.value))
      .catch((error) => res.status(500).send({
        "message": `KV Operation Failed: ${error.message}`
      }))
  } catch (error) {
    console.error(error)
  }
})
```

We only need the profile ID from the user to retrieve a particular profile document using a basic key-value operation. We can catch the error if the key-value operation fails and return an error message.

## PUT Profile

Update a Profile by Profile ID by using the SDK `.upsert()` method on the `profileCollection`.

```js
app.put("/profile/:pid", async (req, res) => {
  try {
    await profileCollection.get(req.params.pid)
      .then(async (result) => {
        /* Create a New Document with new values,
          if they are not passed from request, use existing values */
        const newDoc = {
          pid: result.value.pid,
          firstName: req.body.firstName ? req.body.firstName : result.value.firstName,
          lastName: req.body.lastName ? req.body.lastName : result.value.lastName,
          email: req.body.email ? req.body.email : result.value.email,
          pass: req.body.pass ? bcrypt.hashSync(req.body.pass, 10) : result.value.pass,
        }
        /* Persist updates with new doc */
        await profileCollection.upsert(req.params.pid, newDoc)
          .then((result) => res.send({ ...newDoc, ...result }))
          .catch((e) => res.status(500).send(e))
      })
      .catch((e) => res.status(500).send({
        "message": `Profile Not Found, cannot update: ${e.message}`
      }))
  } catch (e) {
    console.error(e)
  }
})
```

We don't need to specify the `pid` as it already exists, so when we create the profile document, we just need the profile information (`firstName`, `lastName`, `email`, and `password`). The user may only be changing one or many fields in the document so we first retrieve the existing document and check for differences and only update the fields needed to be changed.

We first look up the existing document and make sure it exists, if it does not, return a 500 level error code and message: "Cannot update: document not found".

Then, all changed fields in the document get replaced except for the document key and the `pid` field.

Next, we replace the existing fields if we have a value from the HTTP Request (`req.body.whatever`). If we do not have a value in the request for a specific field, we simply reuse the existing document's `result.value.whatever.

Finally, we create an async call to the `profileCollection` using the `upsert` method and then return the document saved and the result just as we did in the previous endpoint.

## DELETE Profile

Delete Profile by Profile ID by using the SDK `.delete()` method on the `profileCollection`.

```js
app.delete("/profile/:pid", async (req, res) => {
  try {
    await profileCollection.remove(req.params.pid)
      .then((result) => res.send(result.value))
      .catch((error) => res.status(500).send({
        "message": `Profile Not Found, cannot delete: ${error.message}`
      }))
  } catch (e) {
    console.error(e)
  }
})
```

We only need the profile ID from the user to delete using a basic key-value operation.

## GET Profiles

Get user profiles  using the `cluster.query()` method in the SDK and results are returned based on firstName or lastName with support to paginate results.

```js
app.get("/profiles", async (req, res) => {
  try {
    const options = {
      parameters: {
        SKIP: Number(req.query.skip || 0),
        LIMIT: Number(req.query.limit || 5),
        SEARCH: `%${req.query.search.toLowerCase()}%`
      }
    }
    const query = `
      SELECT p.*
      FROM ${process.env.CB_BUCKET}._default.profile p
      WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH
      LIMIT $LIMIT OFFSET $SKIP;
    `
    await cluster.query(query, options)
      .then((result) => res.send(result.rows))
      .catch((error) => res.status(500).send({
        "message": `Query failed: ${error.message}`
      }))
  } catch (e) {
    console.error(e)
  }
})
```

This endpoint is different from the others as it makes a N1QL query rather than a key-value operation. This involves additional overhead because the query engine is involved. Remember that the `profileCollection` index (primary) was set up specifically to enable this endpoint.

Our `req.body` has three query params: `skip`, `limit`, and `search`.

We also have default values set up in case they are not provided, `0` for skip or `5` for limit.

Then, we build our N1QL query using the parameters we just created.

Finally, we pass that `query` and the `options` to the `cluster.query()` method and return the result.

Take notice of the N1QL syntax format and how it targets `bucket`.`scope`.`collection`.

### Project Setup Notes

We have set up a `.babelrc` file at the root of our project so that we can use ES6 and imports in our project:

```json
{
  "presets": [
    "@babel/preset-env"
  ]
}
```

We have created a start script in our `package.json` that executes babel-node and the starting point of our application `src/server.js`:

```json
"scripts": {
  "start": "env-cmd ./config/dev.env nodemon --exec babel-node src/server",
},
```

There are other scripts that we have added for our maintenance and testing of the project on GitHub using GitHub actions, a lot of this is above and beyond the scope of this quickstart, and can be done in many different ways, but we wanted to include as much as we can to help you on your journey as far as configuring a project for use with JavaScript and in our case ES6 using Babel and basic testing and CI setup.

```json
  "scripts": {
    "init-test-db": "env-cmd ./config/test.env npx babel-node ./src/initializeCbServer.js",
    "init-test-index": "env-cmd ./config/test.env npx babel-node ./src/createIndex.js",
    "test": "env-cmd ./config/test.env jest --verbose",
    "test:ci": "npm run init-test-db && npm run init-test-index && env-cmd ./config/test.env jest --verbose",
    "init-db": "env-cmd ./config/dev.env npx babel-node ./src/initializeCbServer.js",
    "start": "env-cmd ./config/dev.env nodemon --exec babel-node src/server",
    "clean": "rm -rf dist",
    "build": "npm run clean && babel ./src --out-dir dist --copy-files"
  },
```

## Conclusion

Setting up a basic REST API in NodeJS and Express with Couchbase is fairly simple, this project when run with Couchbase Server 7 installed creates a bucket and collection in Couchbase for us to store our documents, two primary indexes used for documents in our collection of documents created manually under the `_default` scope and collection, when the program is running, we can do basic CRUD operations.
