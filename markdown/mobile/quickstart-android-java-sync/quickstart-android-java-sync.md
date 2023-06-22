---
# frontmatter
path: "/tutorial-quickstart-android-java-sync"
title: Quickstart in Couchbase Lite Data Sync with Android and Java 
short_title: Data Sync Fundamentals
description: 
  - Build an Android App that uses Data Sync in Java with Couchbase Lite
  - Learn how you can sync your data across devices and to the cloud with Sync Gateway
  - Gain experience working with channels in Sync Gateway
content_type: quickstart
filter: mobile
technology: 
  - mobile
  - sync gateway
  - kv
  - query
landing_page: none 
landing_order: 8
tags:
  - Android
sdk_language:
  - android-java
length: 30 Mins
---

## Introduction

Couchbase Sync Gateway is a key component of the Couchbase Mobile stack. It is an Internet-facing synchronization mechanism that securely syncs data across devices as well as between devices and the cloud. Couchbase Mobile uses a websocket based <a href="https://blog.couchbase.com/data-replication-couchbase-mobile/" target="blank" rel="noopen noreferrer">replication protocol</a>.

The core functions of the Sync Gateway include:

* Data Synchronization across devices and the cloud
* Authorization & Access Control
* Data Validation

This tutorial will demonstrate how to -

* Setup a basic Couchbase Sync Gateway configuration to sync content between multiple Couchbase Lite enabled clients. We will will cover the basics of the <a href="https://docs.couchbase.com/sync-gateway/3.0/configuration-overview.html" target="_blank" rel="noopener noreferrer">Sync Gateway Configuration</a>.
* Configure your Sync Gateway to enforce data routing, access control and authorization. We will cover the basics of <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/sync-function.html">Sync Function API</a>.
* Configure your Couchbase Lite clients for replication with the Sync Gateway
* Use "Live Queries" or Query events within your Couchbase Lite clients to be asyncronously notified of changes.

We will be using a Android Java App as an example of a Couchbase Lite enabled client.

> You can learn more about the Sync Gateway here in the <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/index.html">Sync Gateway Documentation</a>.

## Prerequisites

This tutorial assumes familiarity with building <a target="_blank" rel="noopener noreferrer" href="https://www.android.com/">Android</a> apps using <a target="_blank" rel="noopener noreferrer" href="https://openjdk.java.net/">Java</a> and with the basics of Couchbase Lite.

* If you are unfamiliar with the basics of Couchbase Lite, it is recommended that you walk through the following tutorials
  * Fundamentals of using Couchbase Lite as a standalone database - see <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-android-java-basic">Quickstart in Couchbase Lite with Android and Java</a>
  * Query Basics with a prebuilt version of Couchbase Lite database - see <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-android-java-query">Quickstart in Couchbase Lite Query with Android and Java</a>
* <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/studio">Android Studio 3.4 or above</a>
* Android SDK installed and setup (> v.28.0.0)
* Android Build Tools (> v.28.0.0)
* Android device or emulator running API level 21 or above
* JDK 8 (now embedded into Android Studio 4+)

* curl HTTP client
  * You could use any HTTP client of your choice. But we will use *curl* in our tutorial. Download latest version from [curl website](https://curl.haxx.se/download.html).  MacOS Package manager users can use <a target="_blank" rel="noopener noreferrer" href="https://brew.sh/">homebrew</a>.  Windows Package Manager users can use <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/windows/package-manager/winget/">winget</a>.

  * Docker
    * We will be using Docker to run images of both Couchbase Server and the Sync Gateway — to download Docker, or for more information, see: <a target="_blank" rel="noopener noreferrer" href="https://docs.docker.com/get-docker/">Get Docker</a>.

## System Overview

We will be working with a simple "User Profile" app which we introduced in the <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-android-java-basic">Quickstart in Couchbase Lite with Android and Java</a> tutorial and extended in the <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-android-java-query">Quickstart in Couchbase Lite Query with Android and Java</a> tutorial.

In this tutorial, we will be extending that app to support data sync.

The app does the following

* Allows users to log in and create or update his/her user profile information. The user profile view is **_automatically updated_** every time the profile information changes in the underlying database.

* The user profile information is synced with a remote Sync Gateway which then syncs it to other devices (subject to access control and routing configurations specified in the `sync function`).

![App with Sync](./userprofile_app_overview.gif)

## App Installation

### Fetching App Source Code

To clone the project from GitHub, type the following command in your terminal:

```bash
git clone https://github.com/couchbase-examples/android-java-cblite-userprofile-sync
```
### Installing Couchbase Lite

* The User Profile Standalone Demo app already contains the appropriate additions for downloading and utilizing the Java Android Couchbase Lite dependency module.  However, in the future, to include Couchbase Lite support within an Andorid app add the following within <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-java-cblite-userprofile-standalone/blob/main/src/build.gradle">src/build.gradle</a>

```bash
allprojects {
    repositories {
        ...

        maven {
            url "https://mobile.maven.couchbase.com/maven2/dev/"
        }
    }
}
``` 

Then add the following to the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-java-cblite-userprofile-query/blob/main/src/app/build.gradle">app/build.gradle</a> file.

```bash
dependencies {
    ...

    implementation 'com.couchbase.lite:couchbase-lite-android-ee:3.0.0'
}
```

### Try it out

* Open build.gradle using Android Studio.
* Build and run the project.
* Verify that you see the login screen.

![User Profile Login Screen Image](./user_profile_login.png)

## Sample App Architecture

The sample app follows the <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter">MVP pattern</a>, separating the internal data model, from a passive view through a presenter that handles the logic of our application and acts as the conduit between the model and the view.

![MVP Architecture](./mvp_architecture.png)

In the Android Studio project, the code is structured by feature. You can select the Android option in the left navigator to view the files by package.

![MVP Android Studio](./mvp_as.png)

Each package contains 3 different files:

* **Activity**: This is where all the view logic resides.

* **Presenter**: This is where all the business logic resides to fetch and persist data to a web service or the embedded Couchbase Lite database.

* **Contract**: An interface that the `Presenter` and `Activity` implement.

![MVP Package](./mvp_package.png)

## Data Model

If you fhave followed along the tutorial on link:[Query Basics], you can skip this section and proceed to the [Backend Installation](#backend-installation) section since we have not made any changes to the Data model for this tutorial.

Couchbase Lite is a JSON Document Store. A Document is a logical collection of named fields and values.  The values are any valid JSON types. In addition to the standard JSON types, Couchbase Lite supports some special types like `Date` and `Blob`.
While it is not required or enforced, it is a recommended practice to include a _"type"_ property that can serve as a namespace for related.

### The User Profile Document

The app deals with a single Document with a _"type"_ property of _"user"_.  The document ID is of the form **_"user::demo@example.com"_**.
An example of a document would be

```json
{
    "type":"user",
    "name":"Jane Doe",
    "email":"jame.doe@earth.org",
    "address":"101 Main Street",
    "image":CBLBlob (image/jpg),
    "university":"Missouri State University"
}
```

### UserProfile Encoding

For this tutorial the _"user"_ `Document` is first stored within an `Object` of type `Map<String, Object>`.

```java
Map<String, Object> profile = new HashMap<>();
profile.put("name", nameInput.getText().toString());
profile.put("email", emailInput.getText().toString());
profile.put("address", addressInput.getText().toString());
profile.put("university", universityText.getText().toString());
profile.put("type", "user");
byte[] imageViewBytes = getImageViewBytes();

if (imageViewBytes != null) {
    profile.put("imageData", new com.couchbase.lite.Blob("image/jpeg", imageViewBytes));
}
```

## The University Document

The app comes bundled with a collection of Documents of type _"university"_. Each `Document` represents a university.

```json
{
    "type":"university","web_pages": [
      "http://www.missouristate.edu/"
    ],
    "name": "Missouri State University",
    "alpha_two_code": "US",
    "state-province": MO,
    "domains": [
      "missouristate.edu"
    ],
    "country": "United States"
}
```

### University Record Encoding

When _"university"_ `Document` is retrieved from the database it is stored within an `Object` of type `Map<String, Object>`.

```java
Map<String, Object> properties = new HashMap<>()
properties.put("name", row.getDictionary("universities").getString("name"));
properties.put("country", row.getDictionary("universities").getString("country"));
properties.put("web_pages", row.getDictionary("universities").getArray("web_pages"));]
```

## Backend Installation

We will install [Couchbase Server](#couchbase-server) and [Sync Gateway](#sync-gateway) using Docker.

### Prerequisites

- You must have Docker installed on your laptop. For more on Docker — see: <a target="_blank" rel="noopener noreferrer" href="https://docs.docker.com/get-docker/">Get Docker</a>.
- On Windows, you may need admin privileges.
- Ensure that you have sufficient memory and cores allocated to docker. At Least 3GB of RAM is recommended.

### Docker Network

Couchbase Server and Sync Gateway Server need to communicate with each other over the network.  A network bridge in docker allows network traffic between servers.  Create a docker network bridge named **workshop**.

```bash
docker network ls

docker network create -d bridge workshop
```
### Couchbase Server

#### Install

We have a custom docker image priyacouch/couchbase-server-userprofile:7.0.0-dev of Couchbase Server, which creates an empty bucket named **userprofile** and an RBAC user **admin** with **sync gateway** role.

Alternatively, you can follow the instructions in our documentation — see: <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/get-started-prepare.html">Get Started - Prepare</a>, to install Couchbase Server and configure it with the relevant bucket.

* Optionally, remove any existing Docker container.

```bash
docker stop cb-server && docker rm cb-server
```

* Start Couchbase Server in a Docker container

```bash
docker run -d --name cb-server \
--network workshop \
-p 8091-8094:8091-8094 -p 11210:11210 \
priyacouch/couchbase-server-userprofile:7.0.0-dev
```

### Test Server Installation

The server could take a few minutes to deploy and fully initialize; so be patient.

1. Check the Docker logs using the command:

```bash
docker logs -f cb-server
```

When the setup is completed, you should see output similar to that shown in below:

![Server set up output](./log-output.png '#width=300px')

2. Now check the required data is in place: 
  a. Open up http://localhost:8091 in a browser.
  b. Sign in as **Administrator** and **password** in login page.
  c. Go to **buckets** menu and confirm **userprofile** bucket is created

![userprofile bucket](./confirm-bucket-created.png '#width=300px')

  - Go to **security** menu and confirm **admin** user is created.

![userprofile bucket](./confirm-admin-user-created.png '#width=300px')


### Sync Gateway 

Now we will install, configure, and run Sync Gateway.

#### Configuration

When using Sync Gateway, we can opt to provide a bootstrap configuration -- see: <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/configuration-overview.html">Sync Gateway Configuration</a>.  We would then provision database, sync and other configuration using the Admin REST endpoints Alternatively, we can continue to run in legacy-mode, using the Pre-3.0 configuration.

In this tutorial - for the purposes of backward compatibility - we will run 3.x using its
<a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/configuration-properties-legacy.html">legacy configuration option</a>.  That is, we will be running with the *`disable_persistent_config`* option in the configuration file set to *`true`*.  You can, if you wish, run a 2.8 version of Sync Gateway instead.

The configuration files corresponding to this sample application are shown in Table 1.
They are available in the github repo hosting the app, which you cloned - look in: 
`/path/to/cloned/repo/android-java-cblite-userprofile-sync/src/` 

**Table 1. Available configuration files**
| Release | Filename |
| ------- | -------- |
| 3.x | <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-java-cblite-userprofile-sync/blob/main/src/sync-gateway-config-userprofile-demo-3-x-legacy.json">sync-gateway-config-userprofile-demo-3-x-legacy.json</a>|
| 2.x | <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-java-cblite-userprofile-sync/blob/main/src/sync-gateway-config-userprofile-demo-2-x.json">sync-gateway-config-userprofile-demo-2-x.json</a>|

### Deploy

Let us configure and launch Sync Gateway in a Docker container.

1. Switch to the the folder containing the cloned configuration files, using:

```bash
cd /path/to/cloned/repo/android-java-cblite-userprofile-sync/src
```

2. Make sure no Sync Gateway container exists, using:

```bash
docker stop sync-gateway && docker rm sync-gateway
```
3.  Listing the json files in the directory you should see configuration files for the latest major version and the previous major version in this folder.  Choose an appropriate version.

#### **For non-Windows Systems**

Launch Sync Gateway in a Docker container using directions below based on the version you are using.

#### Sync Gateway 3.x 

Configuring and running Sync Gateway 3.x in Docker using the configuration in `sync-gateway-config-userprofile-demo-3-x-legacy.json`.

Note the use of `disable_persistent_config` in the configuration file to force legacy configuration mode. 

```bash
docker run -p 4984-4986:4984-4986 \
--network workshop \
--name sync-gateway \
-d \
-v `pwd`/sync-gateway-config-userprofile-demo-3-x-legacy.json \
/etc/sync_gateway/sync_gateway.json \
couchbase/sync-gateway:3.0.0-enterprise \
/etc/sync_gateway/sync_gateway.json
```

#### Sync Gateway 2.x 

Configuring and running Sync Gateway 2.8.

```bash
docker run -p 4984-4986:4984-4986 \
--network workshop \
--name sync-gateway \
-d \
-v `pwd`/sync-gateway-config-userprofile-demo-2-x.json:\
/etc/sync_gateway/sync_gateway.json \
couchbase/sync-gateway:2.8.4-enterprise \
/etc/sync_gateway/sync_gateway.json
```

#### **For Windows Systems**

#### Sync Gateway 3.x 

Configure and run Sync Gateway 3.0 in legacy mode.

```bash
docker run -p 4984-4986:4984-4986 ^
--network workshop ^
--name sync-gateway ^
-d -v %cd%sync-gateway-config-userprofile-demo-3-x-legacy.json:^
/etc/sync_gateway/sync_gateway.json ^
couchbase/sync-gateway:3.0.0-enterprise ^
/etc/sync_gateway/sync_gateway.json
```

#### Sync Gateway 2.x 

Configuring and running Sync Gateway 2.8.

```bash
docker run -p 4984-4986:4984-4986 ^
--network workshop ^
--name sync-gateway ^\
-d ^
-v %cd%/sync-gateway-config-userprofile-demo-2-x.json:^
etc/sync_gateway/sync_gateway.json ^
couchbase/sync-gateway:2.8.4-enterprise ^
/etc/sync_gateway/sync_gateway.json
```

#### Test the Installation

Now we can confirm that the Sync Gateway is up and running.

1. Check the log messages.

```bash
docker logs -f sync-gateway
```
  You will see a series of log messages.  Make sure there are no errors.

2. Open up <a target="_blank" rel="noopener noreferrer" href="http://localhost:4984">http://localhost:4984</a> in your browser.  You should see equivalent of the following message:

```bash
{"couchdb":"Welcome","vendor": { "name":"Couchbase Sync Gateway", "version":"3.0" },
"version":"Couchbase Sync Gateway/3.0.0(460;26daced) EE"}
```
Now that we have the server and the sync gateway installed, we can verify data sync between Couchbase Lite enabled apps.

## Sync Function

A key component of the sync process is the Sync Function and we will first look at how that can be set-up to control how data sync works.

The Sync Function is a Javascript function that is specified as part of the [Sync Gateway Configuration](#configuration). It handles [Authorization](#authorization), [Data Validation](#data-validation), [Data Routing](#data-routing), and [Access Countrol](#access-control).

1. Open the your configuration file using a text editor of your choice.  It will be located in the repo at `/path/to/cloned/repo/android-java-cblite-userprofile-sync/src`.

2. Locate the `sync` setting in the file. 

Now you can follow along with the rest of the sections below.

### Authorization

We use *Basic Authentication* in our application.  The Id of the user making the request is specified in the `Authorization` header.

Locate the *`/*Authorization*/`* section of the Sync Function.  You will see we are using the Sync functions <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/documentation/mobile/2.0/guides/sync-gateway/sync-function-api-guide/index.html#requireuserusername">`requireUser()`</a> API to verify that the `email` property specified in the Document matches the Id of the user making the request. 

```js
function sync(doc, oldDoc) {
   ....
   /* Authorization */

  // Verify the user making the request is the same as the one in doc's email
  requireUser(doc.email);
  .....
}
```

### Data Validation

In this case, we are doing some basic validation of the contents of the Document:

```js
/* Data Validation */

// Validate the presence of email field.
// This is the "username" 
validateNotEmpty("email", doc.email);

// Validate that the document Id _id is prefixed by owner 
var expectedDocId = "user" + "::" + doc.email;


if (expectedDocId != doc._id) {
  // reject document
  throw({forbidden: "user doc Id must be of form user::email"});
}
```

1. Verify that the `email` property is not null. If it's null, we throw a JS exception (see `validateNotEmpty()` function)
2. If this a new document, then verify that the `Id` of the Document is of the required format (i.e. **_"user::&lt;email&gt;"_**). We throw an exception if that's not the case.
3. If this is a document update, then verify that the `email` property value has not changed. Again, we throw an exception if that's not the case.

> **NOTE**:  You can learn more about the Sync Function in the documentation here: <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/sync-function.html">Sync Function API</a>.

### Data Routing

<a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/channels.html">`channels`</a> are a mechanism to "tag" documents.  They are typically used to route/seggregate documents based on the contents of those document. 

Combined with <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/sync-function-api-access-cmd.html">access()</a> and <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/sync-function-api-require-access-cmd.html">`requireAccess() `</a> API, the <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/channels.html">channel()</a> API can be used to enforce [Access Control](#access-control). 

As we shall see in a later section, clients can use channels to pull only a subset of documents.

```js
  /* Routing */
  // Add doc to the user's channel.
  var email = getEmail();

  var channelId = "channel."+ username; 
  channel(channelId); 
```

1. Retrieve the the email property specified in the document. We will uses this as our user and channel name.
2. Next, we generate the channel name from the email property.
3. Finally we route the document to the channel. The channel comes into existence the first time a document is added to it.


### Access Control

We can enforce access control to channels using the <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/sync-function-api-access-cmd.html">access () API</a>. This approach ensures that only users with access to a specific channel will be able to retrieve documents in the channel.

```js
 // Give user read access to channel
 access(username, channelId);
```

## Starting Replication

Two-way Replication between the app and the Sync Gateway is enabled when the user logs into the app.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-java-cblite-userprofile-standalone/blob/main/src/app/src/main/java/com/couchbase/userprofile/util/DatabaseManager.java">**DatabaseManager.java**</a> file and locate the `startPushAndPullReplicationForCurrentUser()` function.

```java
public static void startPushAndPullReplicationForCurrentUser(String username, String password)
```

* Next, we create an instance of the `ReplicatorConfiguration` instance that specifies the source and target database and you can optionally, override the default configuration settings.

```java
ReplicatorConfiguration config = new ReplicatorConfiguration(userprofileDatabase, new URLEndpoint(url)); // <1>
config.setReplicatorType(ReplicatorConfiguration.ReplicatorType.PUSH_AND_PULL); // <2>
config.setContinuous(true); // <3>
config.setAuthenticator(new BasicAuthenticator(username, password)); // <4>
config.setChannels(Arrays.asList("channel." + username)); // <5>
```

1. Initialize with `source` as the local Couchbase Lite database and the `remote` target as the Sync Gateway
2. Replication `type` of `PUSH_AND_PULL` indicates that we require two-way sync. A value of `.PUSH` specifies that we only pull data from the Sync Gateway. A value of `.PULL` specifies that we only push data.
3. The `continuous` mode is specified to be _true_ which means that changes are synced in real-time. A value of _false_  implies that data is only pulled from the Sync Gateway.
4. This is where you specify the authentication credentials of the user. In the [Authorization](#authorization) section, we discussed that the Sync Gateway can enforce authorization checks using the `requireUser` API.
5. The `channels` are used to specify the channels to pull from. Only documents belonging to the specified channels are synced. This is subject to [Access Control](#access-control) rights enforced at the Sync Gateway. This means that if a client does not have access to documents in a channel, the documents will not be synched even if the client specifies it in the replicator configuration.

* Initialize the `Replicator` with the `ReplicatorConfiguration`

```java
replicator = new Replicator(config)

```

In order to follow the replicator's progress, we can attach a callback listener to it.

Attaching a callback listener to the `Replicator` means we will be asynchronously notified of state changes.  This could be useful for instance, to inform the user of the progress of the replication.  It is an optional step shown below.

```java
replicatorListenerToken = replicator.addChangeListener(new ReplicatorChangeListener() {
  @Override
  public void changed(ReplicatorChange change) {
    if (change.getReplicator().getStatus().getActivityLevel().equals(Replicator.ActivityLevel.IDLE)) {
      Log.e("Replication Comp Log", "Scheduler Completed");
    }
    if (change.getReplicator().getStatus().getActivityLevel().equals(Replicator.ActivityLevel.STOPPED)
            || change.getReplicator().getStatus().getActivityLevel().equals(Replicator.ActivityLevel.OFFLINE)) {
      Log.e("Rep Scheduler  Log", "ReplicationTag Stopped");
    }
  }
});
````
Now, with all that done, we can start the replicator. 

```java
replicator.start()
```

## Stopping Replication

When the user logs out of the app, the replication is stopped before the database is closed.

1. Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-java-cblite-userprofile-standalone/blob/main/src/app/src/main/java/com/couchbase/userprofile/util/DatabaseManager.java">**DatabaseManager.java**</a> file and locate the `stopAllReplicationForCurrentUser()` function.

```java
public static void stopAllReplicationForCurrentUser()

```

2. Stop the replicator and remove any associated change listeners

```java
replicator.removeChangeListener(replicatorListenerToken)
replicator.stop();
```

> **TIP**: When you close a database, any active replicators, listeners and-or live queries are also be closed.

## Query Events / Live Queries

Couchbase Lite applications can set up **live queries** in order to be asynchronously notified of changes to the database that affect the results of the query.  This can be very useful, for instance, in keeping a UI View up-to-date with the results of a query.

In our app, the user profile view is kept up-to-date using a live query that fetches the user profile data used to populate the view.  This means that, if the replicator pulls down changes to the user profile, they are automatically reflected in the view.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-java-cblite-userprofile-sync/blob/main/src/app/src/main/java/com/couchbase/userprofile/profile/UserProfilePresenter.java"> **UserProfilePresenter.java**</a> file and locate the `fetchProfile()` function.

```java
public void fetchProfile()
```

* Build the Query using `QueryBuilder` API. If you are unfamiliar with this API, please see: <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-android-java-query">Quickstart in Couchbase Lite Query with Android and Java</a> tutorial.

```java
Query query = QueryBuilder
  .select(SelectResult.all())
  .from(DataSource.database(database))
  .where(Meta.id.equalTo(Expression.string(docId))); 
```

> **Note**:  We query for documents based on document Id. In our app, there should be exactly one user profile document corresponding to this Id.

* Attach listener callback to the query to make it live

```java
query.addChangeListener(new QueryChangeListener() {

  @Override
  public void changed(QueryChange change) { // <1>
    ResultSet rows = change.getResults();
    Result row = null;
    Map<String, Object> profile = new HashMap<>(); // <2>
    profile.put("email", DatabaseManager.getSharedInstance().currentUser);
    while ((row = rows.next()) != null) {
      Dictionary dictionary = row.getDictionary("userprofile"); // <3>

      if (dictionary != null) {
        profile.put("name", dictionary.getString("name")); // <4>
        profile.put("address", dictionary.getString("address")); // <4>
        profile.put("imageData", dictionary.getBlob("imageData")); // <4>
        profile.put("university", dictionary.getString("university")); // <4>
        profile.put("type", dictionary.getString("type")); // <4>
      }
    }
    mUserProfileView.showProfile(profile);
}
});
```

1. Attach a listener callback to the query. Attaching a listener automatically makes it _live_ so any time there is a change in the user profile data in the underlying database, the callback would be invoked
2. Create an instance of UserRecord. This will be populated with the query results.
3. The `SelectResult.all()` method is used to query all the properties of a document. In this case, the document in the result is embedded in a dictionary where the key is the database name, which is **_"userprofile"_**. So we retrieve the [`Dictionary`](https://docs.couchbase.com/mobile/2.0/couchbase-lite-java/db021/index.html?com/couchbase/lite/Dictionary.html) at key **_"userprofile"_**.
4. We use appropriate _type getters_ to retrieve values and populate the **_UserRecord_** instance

## Exercises

### Exercise 1

In this exercise, we will observe how changes made on one app are synced across to the other app

1. The app should be running in two simulators side by side
2. Log into both the simulators with the same userId and password. Use the values **_"demo@example.com"_** and **_"password"_** for user Id and password fields respectively
3. On one simulator, enter values in the user and address fields.
4. Confirm that changes show up in the app on the other simulator.
5. Similarly, make changes to the app in the other simulator and confirm that the changes are synced over to the first simulator.

### Exercise 2

In this exercise, we will observe changes made via Sync Gateway are synced over to the apps

1. Make sure you have completed Exercise 1. This is to ensure that you have the appropriate user profile document (with document Id of "user::demo@example.com") created through the app and synced over to the Sync Gateway.

2. Open the command terminal and issue the following command to get the user profile document via GET Document REST API. We will be using `curl` to issue the request. If you haven't done so, please install curl as indicated in the Prerequisites section.

```bash
curl -X GET http://localhost:4984/userprofile/user::demo@example.com --user demo@example.com
```
> **NOTE**:  This GET retrieves the userprofile document with the id **user::demo@example.com**

3. Your response should look something like the response below. The exact contents depend on the user profile information that you provided via your mobile app.

```bash
{
    "_attachments": { <2>
        "blob_1": {
            "content_type": "image/jpeg",
            "digest": "sha1-S8asPSgzA+F+fp8/2DdIy4K+0U8=",
            "length": 14989,
            "revpos": 2,
            "stub": true
        }
    },
    "_id": "user::demo@example.com",
    "_rev": "2-3a76cfa911e2c54d1e82b29dbffc7f4e5a9bc265", //<1>
    "address": "",
    "email": "demo@example.com",
    "image": {
        "@type": "blob",
        "content_type": "image/jpeg",
        "digest": "sha1-S8asPSgzA+F+fp8/2DdIy4K+0U8=",
        "length": 14989
    },
    "name": "",
    "type": "user",
    "university": "Missouri State University"
}
```

   * If you had updated an image via the mobile app, you should see an **"_attachments"** property. This entry holds an array of attachments corresponding to each image blob entry added by the mobile app. This property is added by the Sync Gateway when it processes the document. You can learn more about how image Blob types are mapped to attachments <a target="_blank" rel="noopener noreferrer"  href="https://docs.couchbase.com/couchbase-lite/3.0/swift/blob.html">here</a>.

   * Record the revision Id of the document.  You will need this when you update the document

4. In the command terminal, issue the following command to update the user profile document via <a target="_blank" rel="noopener noreferrer"  href="https://docs.couchbase.com/sync-gateway/3.0/rest-api.html#/document/AddOrUpdateDocument">PUT Document REST API</a>.  

> **NOTE**: We chose to show how to update the address field via the REST API.  You can choose to update any other profile information if you like.  You will be prompted to enter the users password when you submit the curl command.

```bash
curl -X PUT \
  'http://localhost:4985/userprofile/user::demo@example.com?rev=3-12d203d6024c8b844c5ed736c726ac63379e05dc' \
  -H 'Accept: application/json' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
    "address": "101 Main Street", //<1>
    "email": "demo@example.com",
    "image": {
        "@type": "blob",
        "content_type": "image/jpeg",
        "digest": "sha1-S8asPSgzA+F+fp8/2DdIy4K+0U8=",
        "length": 14989
    },
    "name": "",
    "type": "user",
    "university": "Missouri State University"
}'
```
  > Here, in the `PUT`, we specify the:
  > * user id (`user::demo@example.com`)
  > * revision Id (from the previous step `3-033fcbaf269d65a9247067be76d664f1111d033b`) to select the item we want to update

5. Confirm that you get a HTTP **_"201 Created"_** status code

6. As soon as you update the document via the Sync Gateway REST API, confirm that the changes show up in the mobile app on the simulator.

![App Sync](./sync_from_sgw.gif)

## Handling Conflicts during Data Synchronization

Data conflicts are inevitable in an environment where you can potentially have multiple writes updating the same data concurrently. Couchbase Mobile supports **_Automated Conflict Resolution_**.

You can learn more about automated conflict resolution in this blog <a target="_blank" rel="noopener noreferrer"  href="https://blog.couchbase.com/document-conflicts-couchbase-mobile/">Document Conflicts & Resolution</a>.

## Learn More

Congratulations on completing this tutorial!

This tutorial walked you through an example of how to use a Sync Gateway to synchronize data between Couchbase Lite enabled clients. We discussed how to configure your Sync Gateway to enforce relevant access control, authorization and data routing between Couchbase Lite enabled clients.

Check out the following links for further details

### Further Reading

* <a target="_blank" rel="noopener noreferrer"  href="https://docs.couchbase.com/sync-gateway/3.0/configuration-overview.html">Sync Gateway Configuration</a>

* <a target="_blank" rel="noopener noreferrer"  href="https://blog.couchbase.com/category/couchbase-mobile/?ref=blog-menu">Couchbase Mobile Blog</a>

* <a target="_blank" rel="noopener noreferrer"  href="https://blog.couchbase.com/?s=sync+function">Sync function blogs</a>

* <a target="_blank" rel="noopener noreferrer"  href="https://blog.couchbase.com/data-replication-couchbase-mobile/">Overview of Replication Protocol</a>

* <a target="_blank" rel="noopener noreferrer"  href="https://blog.couchbase.com/document-conflicts-couchbase-mobile/">Document Conflicts & Resolution</a>
