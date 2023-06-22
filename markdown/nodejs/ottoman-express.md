---
# frontmatter
path: "/tutorial-quickstart-ottomanjs"
# title and description do not need to be added to markdown, start with H2 (##)
title: Using Ottoman.js and Express
short_title: Ottoman.js and Express
description: 
  - Build a REST API with Couchbase's proprietary Ottoman.js ODM
  - Learn how to create models and schemas to uplevel your Couchbase development workflow
  - See how Ottoman can create indices automatically, so you can focus on writing code instead
content_type: quickstart
filter: sdk
technology:
  - connectors
tags:
  - Ottoman
  - Express
  - REST API
sdk_language:
  - nodejs
length: 30 Mins
---

[![Try it now!](https://da-demo-images.s3.amazonaws.com/runItNow_outline.png?couchbase-example=ottomanjs-quickstart-repo&source=devPortal)](https://gitpod.io/#https://github.com/couchbase-examples/ottomanjs-quickstart)

In this article, you will learn how to connect to a Couchbase cluster using [Ottoman JS](https://ottomanjs.com/) instead of the NodeJS SDK to create, read, update, and delete documents, and write simple parametrized N1QL queries (using [Ottoman's Query Builder](https://ottomanjs.com/guides/ottoman-couchbase.html#query-building)).

We will be using the latest version of Couchbase Server (version 7) that enables scopes and collections and we will need to specify in our Ottoman models what collection we want to use for our documents.

## Prerequisites

To run this prebuilt project, you will need:

- NodeJS & NPM (v12+)
- Code Editor
- Docker
- Follow [Couchbase Installation Options](/tutorial-couchbase-installation-options#container-deployment) for installing the lastest Couchbase Database Server Instance
<!-- - [Couchbase 7+ Running on Docker](https://gist.github.com/ejscribner/bf362fc358e9df8ce59bf2b63ca947dd) -->

## Source Code

```shell
git clone https://github.com/couchbase-examples/ottomanjs-quickstart
```

### Setup and Run The Application

Install our NPM dependencies:

```shell
npm install
```

After installation of Couchbase 7, and if it is running on localhost `http://127.0.0.1:8091` we can create a bucket named `user_profile` and a collection named `profile` by running the following command:

```shell
npm run init-db
```

The `init-db` command calls a script found at `/src/initializeCbServer.js`, here we go ahead and create our bucket and collection with this script. Although Ottoman can take care of the creation of collections for us, we let the script take care of it.

Now we are ready to run our application:

```shell
npm start
```

If your database is set up correctly, we will now have an API running on port 3000 as specified in the `dev.env` file. Let's go over what we have done to create this API demo application.

## What We'll Cover

A simple REST API using Express and [Ottoman JS](https://ottomanjs.com), an object-document mapping built on top of the [Couchbase NodeJS SDK v3.x](https://docs.couchbase.com/nodejs-sdk/current/hello-world/start-using-sdk.html) with the following endpoints:

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
  "pid": "b181551f-071a-4539-96a5-8a3fe8717faf",
  "type": "profile"
}
```

The `type` property of our Profile Model is managed and created by Ottoman for internal use and ensuring backward compatibility with older Couchbase versions, we can mostly ignore it.

## Creating an Ottoman Schema and Model for our Profile documents

To work with documents in Ottoman we must first set up our `Schema` and `model`, let's take a look at the `/shared/profile.model` before moving onto the `App.js` and related code:

```js
import { model, Schema } from 'ottoman'

const ProfileSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  pass: { type: String, required: true },
})
```

We can set lots of different attributes of our model's schema here using `new Schema` like required properties, what type they are, and more. Next we set up any required indexes for basic searching on a particular field:

```js
ProfileSchema.index.findByName = { by: 'name', type: 'n1ql' }
```

And finally we define our `model` using this `Schema` where we could also specify `scopeName` and `collectionName` if we do not plan on using the `_default`:

```js
const ProfileModel = model('profile', ProfileSchema, {
  idKey: 'pid',
  collectionName: 'profile' 
})

module.exports = {
  ProfileModel
}
```

## Let's Review the Code

We will be going over the `server.js` and the `App.js` files located in the `/src` directory. Let's open the `server.js` file first to see how it kicks off the application server and then the `App.js` file to learn about how we create, read, update and delete documents in our Couchbase Server.

**`src/server.js`:**

The `server.js` file bootstraps our application, it imports some definitions from our `app.js` file, and connects to our server through `ottoman.connect()`. The call to `ottoman.start()` method is just a shortcut to run `ensureCollections` and `ensureIndexes` (Ottoman's methods ensuring collections and indexes exist or get created by Ottoman). We need these indexes for any n1ql related operations we do with Ottoman like using the `find()` method as we will do in our [GET Profiles](#get-profiles) endpoint.

Next, we start up the express application by listening to our desired port.

```js
import { app, ottoman } from './app.js'

const startApiServer = async() => {
  try {
    await ottoman.connect({
      bucketName: process.env.CB_BUCKET,
      connectionString: process.env.CB_URL,
      username: process.env.CB_USER,
      password: process.env.CB_PASS,
    })
    // By default start function will wait for indexes, but you can disable it setting ignoreWatchIndexes to true. 
    // It's not required to execute the start method in order for Ottoman work.
    await ottoman.start()
    
    const port = process.env.APP_PORT
    app.listen(port, () => {
      console.log(`API started at http://localhost:${port}`)
      console.log(`API docs at http://localhost:${port}/api-docs/`)
    })
  } catch (e) {
    console.log(e)
  }
}

startApiServer()
```

**`src/app.js`:**

We import our dependencies and database connection:

```js
import express from 'express'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import { ottoman, FindOptions } from '../db/ottomanConnection'
import { ProfileModel } from './shared/profiles.model'
import { makeResponse } from './shared/makeResponse'
```

<hr class="mb-3"/>  

One of our import statements in this file pulls in: [`/db/ottomanConnection.js`](https://github.com/couchbase-examples/ottomans-quickstart/blob/master/db/ottomanConnection.js). This gives us access to some of the Ottoman resources we need for our endpoints to persist data to Couchbase.

```js
import { Ottoman, getOttomanInstances, ValidationError, FindOptions } from 'ottoman'

const ottoman = new Ottoman({
  modelKey: 'type',
  scopeName: '_default',
  collectionName: '_default',
})

module.exports = { ottoman, getOttomanInstances, ValidationError, FindOptions }
```

In the [`ottomanConnection.js`](https://github.com/couchbase-examples/ottomanjs-quickstart/blob/db/ottomanConnection.js) file, we forward the assets from Ottoman that we will use in `App.js`. The environment variables for `CB_URL`, `CB_USER`, `CB_PASS`, `CB_BUCKET`, are defined in your `dev` and `test` environments respectively in the [`/config/` directory](https://github.com/couchbase-examples/ottomanjs-quickstart/blob/master/config). I have added both in the repo (`dev.env` and `test.env`), for the tutorial we will only focus on the dev environment. Feel free to explore the repo's [readme.md](https://github.com/couchbase-examples/ottomanjs-quickstart) file for additional instructions if you are interested in testing.

<hr class="mb-3"/>  

After we have our configuration for database connection in place, we can create our express app:

```js
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
```

We also wanted to show the easiest way of integrating Swagger into our project, as seen below, the Swagger client is located at `/swagger-ui` when the project is running.

```js
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
const swaggerDocument = YAML.load('./swagger.yaml')
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get('/', function (req, res) {
  res.send('<body onload="window.location = \'/swagger-ui/\'"><a href="/swagger-ui/">Click here to see the API</a>')
})
```

## Shared Directory

One of the first places we should look in the Express application before going too far is the `./src/shared` directory. Here we have a few files containing code that we use reuse in our application. One way we can clean up the work we need to do in Express is to have a method specifically for making a response after we complete a database operation and want to use its result and apply try/catch logic for the handling of errors.

In the `shared` directory you will find a file named `makeResponse.js`.

```js
import { ValidationError} from '../../db/ottomanConnection'

async function makeResponse(res, action) {
  try {
    const result = await action()
    res.json(result)
  } catch (e) {
    const status = e.message !== undefined && e.message.indexOf('not found') !== -1 ? 404 : 500
    res.status(e instanceof ValidationError ? 400 : status)
    res.json({ message: e.message })
  }
}

module.exports = {
  makeResponse
}
```

This file will handle your resulting call to the database from Ottoman and ensure that we either send a good response and status code back to the client or an error if caught.

Now we can move on to reviewing each of the individual endpoints in the `App.js` each of which uses the makeResponse at some point to do an operation on the database and handle the response:

## POST Profile

We create a profile document using Ottoman's [`.save()`](https://ottomanjs.com/classes/document.html#save) method and our model named: `ProfileModel`.

```js
app.post('/profile', async (req, res) => {
  if (!req.body.email || !req.body.pass) {
    return res.status(400).send({ 'message': `${!req.body.email ? 'email ' : ''}${
      (!req.body.email && !req.body.pass) 
        ? 'and pass are required' : (req.body.email && !req.body.pass) 
          ? 'pass is required' : 'is required'
    }`})
  }

  await makeResponse(res, () => {
    res.status(200)
    const profile = new ProfileModel({
      ...req.body, pass: bcrypt.hashSync(req.body.pass, 10)
    })
    return profile.save()
  })
})
```

Let’s break this code down.

First, we check that both an email and password exist and then create a `profile` object based on the data that was sent in the request. Ottoman will create a `pid` for us, a unique key.

After we check for required body parameters, we create a call to the `makeResponse()` to handle a call to ottoman's `save()`. We create a profile document with `profile.save()` and the profile it uses conforms to its Ottoman model called `ProfileModel`.

## GET Profile by Key

Retrieve a Profile by Profile ID using Ottoman's [`.findById()`](https://ottomanjs.com/classes/findbyidoptions.html) method using the `ProfileModel`.

```js
app.get('/profile/:pid', 
  async (req, res) => await makeResponse(res, () => 
    ProfileModel.findById(req.params.pid)
  )
)
```

We only need the profile ID from the user to retrieve a particular profile document using a basic key-value operation. We can catch the error if the key-value operation fails and return an error message.

## PUT Profile

Update a Profile by Profile ID by using the SDKs [`findById()`]() and [`.upsert()`](https://ottomanjs.com/interfaces/imodel.html#replacebyid) method on the `profileCollection`.

```js
app.put('/profile/:pid', 
  async (req, res) => {
    ProfileModel.findById(req.params.pid)
      .then(async (result) => {
        /* Create a New Document with new values, 
          if they are not passed from request, use existing values */
        const newDoc = {
          pid: result.pid,
          firstName: req.body.firstName ? req.body.firstName : result.firstName,
          lastName: req.body.lastName ? req.body.lastName : result.lastName,
          email: req.body.email ? req.body.email : result.email,
          pass: req.body.pass ? bcrypt.hashSync(req.body.pass, 10) : result.pass,
        }
        /* Persist updates with new doc */
        await makeResponse(res, () => {
          return ProfileModel.replaceById(req.params.pid, newDoc)
        })
      })
})
```

Now, this is a typical approach to first find the document we want and then replace it, the code is pretty straightforward and something you might be familiar with using the NodeJS SDK, but what if there was a better way?

We can do all of this in one operation using the Ottoman [`findOneAndUpdate()`](https://ottomanjs.com/advanced/how-ottoman-works.html#model-findoneandupdate) method which works similar to the [`find()`](https://ottomanjs.com/advanced/how-ottoman-works.html#model-find) method which we have yet to go over:

```js
await makeResponse(res, () => {
    return ProfileModel.findOneAndUpdate(
    { airportname: { $like: 'United%' } },
    { airportname: 'United Updated' },
    { new: true }, // To get updated object
  )
})
```

## DELETE Profile

Delete Profile by Profile ID by using Ottoman's [`removeById()`](https://ottomanjs.com/interfaces/imodel.html#removebyid) method on the `ProfileModel`. We just need to supply the `id` of the document we want to remove.

```js
app.delete('/profile/:pid', 
  async (req, res) => await makeResponse(res, () => {
    ProfileModel.removeById(req.params.pid)
    res.status(204)
  })
)
```

## GET Profiles

The Ottoman [`find()`](https://ottomanjs.com/advanced/how-ottoman-works.html#model-find) method takes many options, here we allow for the client to pass us limit and skip options, as well to `searchFirstName` using our generated Ottoman index and all we had to do was specify this search option in our model:

```js
app.get('/profiles', async (req, res) => {
  await makeResponse(res, async () => {
    const { limit, searchFirstName, skip } = req.query
    const options = new FindOptions({ 
      limit: Number(limit || 5), 
      skip: Number(skip || 0),
      searchFirstName: `%${searchFirstName}%`
    })
    const filter = (searchFirstName)
      ? { firstName: { $like: `%${searchFirstName}%`, $ignoreCase: true } }
      : {}
    const result = await ProfileModel.find(filter, options)
    const { rows: items } = result
    return { items }
  })
})
```

This endpoint is different from some of the others as it makes a N1QL query rather than a key-value operation. This involves additional overhead because the query engine is involved. Remember that the `ProfileModel` index (primary) was set up by Ottoman automatically, but you can disable this and set up your indexes.

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
    "test": "env-cmd ./config/test.env jest --verbose",
    "test:ci": "npm run init-test-db && env-cmd ./config/test.env jest --verbose",
    "init-db": "env-cmd ./config/dev.env npx babel-node ./src/initializeCbServer.js",
    "start": "env-cmd ./config/dev.env nodemon --exec babel-node src/server",
    "clean": "rm -rf dist",
    "build": "npm run clean && babel ./src --out-dir dist --copy-files"
  },
```

## Conclusion

Setting up a basic REST API in NodeJS and Express with Ottoman is fairly simple, this project when run with Couchbase Server 7 installed creates a bucket and collection in Couchbase for us to store our documents, automatically generates our indexes based on our document model's `Schema` by using the `index` keyword and gives us the options to decide what type of index it will be:

```js
ProfileSchema.index.findByName
```

This wraps up our Ottoman quickstart, we highly recommend reading through the [NodeJS Quickstart](/learn/nodejs), and learning how to work with documents in Couchbase through the SDK or Ottoman so that you have all the info needed to choose the correct tool.
