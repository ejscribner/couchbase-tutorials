---
# frontmatter
path: "/tutorial-quickstart-xamarin-forms-sync"
title: Quickstart in Couchbase Lite Data Sync with C#, .NET, and Xamarin Forms
short_title: C# and Xamarin Data Sync
description:
  - Build an app that uses Data Sync in C# with Xamarin with Couchbase Lite
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
landing_order: 9
tags:
  - .NET
  - Xamarin
sdk_language:
  - csharp
length: 30 Mins
---

## Introduction

Couchbase Sync Gateway is a key component of the Couchbase Mobile stack. It is an internet-facing synchronization mechanism that securely syncs data across devices as well as between devices and the cloud. Couchbase Mobile uses a websocket based <a href="https://blog.couchbase.com/data-replication-couchbase-mobile/" target="blank" rel="noopen noreferrer">replication protocol</a>.

The core functions of the Sync Gateway include:

* Data Synchronization across devices and the cloud
* Authorization & Access Control
* Data Validation

This tutorial will demonstrate how to -

* Setup the Couchbase Sync Gateway to sync content between multiple Couchbase Lite enabled clients. We will will cover the basics of the <a href="https://docs.couchbase.com/sync-gateway/3.0/configuration-overview.html" target="_blank" rel="noopener noreferrer">Sync Gateway Configuration</a>.
* Configure your Sync Gateway to enforce data routing, access control and authorization. We will cover the basics of <a href="https://docs.couchbase.com/sync-gateway/3.0/sync-function.html" target="_blank" rel="noopener noreferrer">Sync Function API</a>.
* Configure your Couchbase Lite clients for replication with the Sync Gateway.
* Use `"Live Queries"` or Query events within your Couchbase Lite clients to be asynchronously notified of changes.

We will be using Xamarin (iOS/Android/UWP) apps as examples of Couchbase Lite enabled clients.

> You can learn more about the Sync Gateway <a href="https://docs.couchbase.com/sync-gateway/3.0/index.html" target="_blank" rel="noopener noreferrel">here</a>.

## Prerequisites

* This tutorial assumes familiarity with building apps with <a target="_blank" rel="noopener noreferrer" href="https://dotnet.microsoft.com/en-us/apps/xamarin">Xamarin</a>, more specifically <a target="_blank" rel="noopener noreferrer" href="https://dotnet.microsoft.com/en-us/apps/xamarin/xamarin-forms">Xamarin.Forms</a> using C# and <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/visualstudio/xaml-tools/xaml-overview?view=vs-2022">XAML</a>.

* If you are unfamiliar with the basics of Couchbase Lite, it is recommended that you walk through the following tutorials:
  *  <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-xamarin-forms-basic">Fundamentals Tutorial</a> on using Couchbase Lite as a standalone database.
  *  Using queries with a prebuild version of Couchbase Lite database - see: <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-xamarin-forms-query">Query tutorial</a>.

* For iOS/Mac development, you will need a Mac running MacOS 11 or 12
* iOS/Mac (Xcode 12/13) - Download latest version from the <a target="_blank" rel="noopener noreferrer" href="https://itunes.apple.com/us/app/xcode/id497799835?mt=12">Mac App Store</a> or via <a target="_blank" rel="noopener noreferrer" href="https://github.com/RobotsAndPencils/XcodesApp">Xcodes</a>
> **Note**: If you are using an older version of Xcode, which you need to retain for other development needs, make a copy of your existing version of Xcode and install the latest Xcode version.  That way you can have multiple versions of Xcode on your Mac.  More information can be found in <a target="_blank" rel="noopener noreferrer" href="https://developer.apple.com/library/archive/technotes/tn2339/_index.html#//apple_ref/doc/uid/DTS40014588-CH1-I_HAVE_MULTIPLE_VERSIONS_OF_XCODE_INSTALLED_ON_MY_MACHINE__WHAT_VERSION_OF_XCODE_DO_THE_COMMAND_LINE_TOOLS_CURRENTLY_USE_">Apple's Developer Documentation</a>.  The open source <a target="_blank" rel="noopener noreferrer" href="https://github.com/RobotsAndPencils/XcodesApp">Xcodes</a> project simplifies this process.
* For Android development SDK version 22 or higher.  You can manage your Android SDK version in <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/xamarin/android/get-started/installation/android-sdk?tabs=macos">Visual Studio</a>.
* For Universal Windows Platform (UWP) development, a Windows computer running Windows 10 1903 or higher.
> **Note**:  You can not edit or debug UWP projects with Visual Studio for Mac and you can't edit or debug Mac projects with Visual Studio for PC.
* Visual Studio for <a target="_blank" rel="noopener noreferrer" href="https://visualstudio.microsoft.com/vs/mac/">Mac</a> or <a target="_blank" rel="noopener noreferrer" href="https://visualstudio.microsoft.com/vs/">PC</a> version 2019 or higher.
* curl HTTP client
  * You could use any HTTP client of your choice. But we will use *curl* in our tutorial. Download latest version from [curl website](https://curl.haxx.se/download.html).  MacOS Package manager users can use <a target="_blank" rel="noopener noreferrer" href="https://brew.sh/">homebrew</a>.  Windows Package Manager users can use <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/windows/package-manager/winget/">winget</a>.
* Docker
  * We will be using Docker to run images of both Couchbase Server and the Sync Gateway — to download Docker, or for more information, see: <a target="_blank" rel="noopener noreferrer" href="https://docs.docker.com/get-docker/">Get Docker</a>.

## System Overview

We will be working with a simple "User Profile" app which we introduced in the <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-xamarin-forms-basic">Fundamentals Tutorial</a> and extended in the <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-xamarin-forms-query">Query tutorial</a>.

In this tutorial, we will be further extending that app to support data sync. It will do the following:

* Allows users to log in and create or update his/her user profile information. The user profile view is **_automatically updated_** everytime the profile information changes in the underlying database.
* The user profile information is synced with a remote Sync Gateway which then syncs it to other devices (subject to access control and routing configurations specified in the `sync function`).

![App with Sync](./userprofile_app_overview.gif)

## Solution Overview

The User Profile demo app is a Xamarin.Forms based solution that supports iOS and Android mobile platforms along with the UWP desktop platform.  The solution utilizes various design patterns and principles such as <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel">MVVM</a>, <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Inversion_of_control">IoC</a>, and the Repository Pattern.

The solution consists of seven projects:

* **UserProfileDemo**: A .NET Standard project responsible for maintaining view-level functionality.
* **UserProfileDemo.Core**: A .NET Standard project responsible for maintaining viewmodel-level functionality.
* **UserProfileDemo.Models**: A .NET Standard project consisting of simple data models.
* **UserProfileDemo.Repositories**: A .NET Standard project consisting of repository classes responsible for Couchbase Lite database initilization, interaction, etc.
* **UserProfileDemo.iOS**: A Xamarin.iOS platform project responsible for building the `.ipa` file.
* **UserProfileDemo.Android**: A Xamarin.Android platform project responsible for building the `.apk` file.
* **UserProfileDemo.UWP**: A UWP platform project responsible for building the `.exe` file.

## Couchbase Lite Nuget

Before diving into the code for the apps, it is important to point out the Couchbase Lite dependencies within the solution. The <a target="_blank" rel="noopener noreferrer" href="https://www.nuget.org/packages/Couchbase.Lite/">Couchbase.Lite Nuget package</a> is included as a reference within four projects of this solution:

1. UserProfileDemo.Repositories
2. UserProfileDemo.iOS
3. UserProfileDemo.Android
4. UserProfileDemo.UWP

The `Couchbase.Lite` Nuget package contains the core functionality for Couchbase Lite. In the following sections you will dive into the capabilities it the package provides.


## App Installation

* To clone the project from GitHub, type the following command in your terminal

```bash
git clone https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-sync
 ```

### Try it out

1. Open the `UserProfileDemo.sln`. The project would be located at `/path/to/dotnet-xamarin-cblite-userprofile-sync/src`.

```bash
open UserProfileDemo.sln
```

2. Build and run the project using two simulators/emulators.
3. Verify that you see the login screen on both the simulators/emulators.

![User Profile Login Screen Image](./user_profile_login.png)

## Data Model

If have followed along the tutorial on <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-xamarin-forms-query">Query tutorial</a>, you can skip this section and proceed to the [Backend Installation](#backend-installation) section as we have not made any changes to the Data model for this tutorial.

Couchbase Lite is a JSON `Document` Store. A `Document` is a logical collection of named fields and values.The values are any valid JSON types. In addition to the standard JSON types, Couchbase Lite supports some special types like `Date` and `Blob`.  While it is not required or enforced, it is a recommended practice to include a **_"type"_** property that can serve as a namespace for related.

### The User Profile Document

The app deals with a single `Document` with a **_"type"_** property of **_"user"_**.  The document ID is of the form _"user::demo@example.com"_.
An example of a document would be

```json
{
    "type":"user",
    "name":"Jane Doe",
    "email":"jane.doe@earth.org",
    "address":"101 Main Street",
    "image":CBLBlob (image/jpg),
    "university":"Missouri State University"
}
```

### UserProfile Encoding

The **_"user"_** Document is encoded to a `class` named _UserProfile_.

```csharp
public class UserProfile
{
    public string type => "user";
    public string Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Address { get; set; }
    public byte[] ImageData { get; set; }
    public string Description { get; set; }
    public string University { get; set; }
}
```

## The University Document

The app comes bundled with a collection of documents of type **_"university"_**. Each `Document` represents a university.

```json
{
    "type":"university","web_pages": [
      "http://www.rpi.edu"
    ],
    "name": "Rensselaer Polytechnic Institute",
    "alpha_two_code": "US",
    "state-province": null,
    "domains": [
      "rpi.edu"
    ],
    "country": "United States"
}
```

### UniversityRecord Encoding

The _"university"_ `Document` is encoded to a `class` named _University_.

```csharp
public class University
{
    public string Name { get; set; }
    public string Country { get; set; }
}
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

We have a custom docker image `priyacouch/couchbase-server-userprofile:7.0.0-dev` of Couchbase Server, which creates an empty bucket named **userprofile** and an RBAC user **admin** with **sync gateway** role.

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
  c. Go to **"buckets"** menu and confirm **"userprofile"** bucket is created

![userprofile bucket](./confirm-bucket-created.png '#width=300px')

  - Go to **"security"** menu and confirm **"admin"** user is created.

![userprofile bucket](./confirm-admin-user-created.png '#width=300px')


### Sync Gateway 

Now we will install, configure, and run Sync Gateway.

#### Configuration

When using Sync Gateway, we can opt to provide a bootstrap configuration -- see: <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/configuration-overview.html">Sync Gateway Configuration</a>.  We would then provision database, sync and other configuration using the Admin REST endpoints Alternatively, we can continue to run in legacy-mode, using the Pre-3.0 configuration.

In this tutorial - for the purposes of backward compatibility - we will run 3.x using its <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/configuration-properties-legacy.html">legacy configuration option</a>.  That is, we will be running with the *`disable_persistent_config`* option in the configuration file set to *`true`*.  You can, if you wish, run a 2.8 version of Sync Gateway instead.

The configuration files corresponding to this sample application are shown in Table 1.  They are available in the github repo hosting the app, which you cloned - look in: `/path/to/cloned/repo/dotnet-xamarin-cblite-userprofile-sync/src/` 

**Table 1. Available configuration files**
| Release | Filename |
| ------- | -------- |
| 3.x | <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-sync/blob/main/src/sync-gateway-config-userprofile-demo-3-x-legacy.json">sync-gateway-config-userprofile-demo-3-x-legacy.json</a>|
| 2.x | <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-sync/blob/main/src/sync-gateway-config-userprofile-demo-2-x.json">sync-gateway-config-userprofile-demo-2-x.json</a>|

### Deploy

Let us configure and launch Sync Gateway in a Docker container.

1. Switch to the the folder containing the cloned configuration files, using:

```bash
cd /path/to/cloned/repo/dotnet-xamarin-cblite-userprofile-sync/src
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
-d -v %cd%/sync-gateway-config-userprofile-demo-3-x-legacy.json:^
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

1. Open the your configuration file using a text editor of your choice.  It will be located in the repo at `/path/to/cloned/repo/dotnet-xamarin-cblite-userprofile-sync/src`.

2. Locate the `sync` setting in the file you used. 

Now you can follow along with the rest of the sections below.

### Authorization

We use *Basic Authentication* in our application.  The Id of the user making the request is specified in the `Authorization` header.

Locate the *`/*Authorization*/`* section of the Sync Function.  You will see we are using the Sync functions <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/sync-function-api-require-user-cmd.html">`requireUser()`</a> API to verify that the `email` property specified in the Document matches the Id of the user making the request. 

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
2. If this a new document, then verify that the `Id` of the Document is of the required format (i.e. **_"user::demo@example.com"_**). We throw an exception if that's not the case.
3. If this is a document update, then verify that the `email` property value has not changed. Again, we throw an exception if that's not the case.

> **NOTE**:  You can learn more about the Sync Function in the documentation here: <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/sync-function.html">Sync Function API</a>.

### Data Routing

<a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/channels.html">`Channels`</a> are a mechanism to "tag" documents.  They are typically used to route/seggregate documents based on the contents of those document. 

When combined with the <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/sync-function-api-access-cmd.html">`access()`</a> and <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/sync-function-api-require-access-cmd.html">`requireAccess() `</a> API, the <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/channels.html">channel()</a> API can be used to enforce [Access Control](#access-control). 

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

We can enforce access control to channels using the <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/sync-gateway/3.0/sync-function-api-access-cmd.html">access ( ) </a> API. This approach ensures that only users with access to a specific channel will be able to retrieve documents in the channel.

```js
 // Give user read access to channel
 access(username, channelId);
```

## Starting Replication

Two-way Replication between the app and the Sync Gateway is enabled when user logs into the app.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-sync/blob/main/src/UserProfileDemo.Repositories/DatabaseManager.cs">DatabaseManager.cs</a> file and locate the `StartReplicationAsync` method.

```csharp
public async Task StartReplicationAsync(
  string username,
  string password,
  string[] channels,
  ReplicatorType replicationType = ReplicatorType.PushAndPull,
  bool continuous = true) 
```

* Next, we create an instance of the `ReplicatorConfig` instance that specifies the source and target database and you can optionally, override the default configuration settings.

```csharp
var configuration = new ReplicatorConfiguration(database, targetUrlEndpoint) // <1>
{
    ReplicatorType = replicationType, // <2>
    Continuous = continuous, // <3>
    Authenticator = new BasicAuthenticator(username, password), // <4>
    Channels = channels?.Select(x => $"channel.{x}").ToArray() // <5>
};
```

**<1>** Initialize with `Source` as the local Couchbase Lite database and the `remote` target as the Sync Gateway
**<2>** Replication `type` of `PushAndPull` indicates that we require two-way sync. A value of `.Pull` specifies that we only pull data from the Sync Gateway. A value of `.Push` specifies that we only push data.
**<3>** The `Continuous` mode is specified to be _true_ which means that changes are synced in real-time. A value of _false_  which implies that data is only pulled from the Sync Gateway.
**<4>** This is where you specify the authentication credentials of the user. In the [Authorization](#authorization) section, we discussed that the Sync Gateway can enforce authorization check using the `RequireUser` API.
**<5>** The `Channels` are used to specify the channels to pull from. Only documents belonging to the specified channels are synced. This is subject to [Access Control](#access-control) rights enforced at the Sync Gateway. This means that if a client does not have access to documents in a channel, the documents will not be synched even if the client specifies it in the replicator configuration.

* Initialize the `Replicator` with the `ReplicatorConfiguration`

```csharp
_replicator = new Replicator(configuration);
```

* We attach a callback listener to the `Replicator` to be asynchronously notified of state changes. This could be useful for instance, to inform the user of the progress of the replication. This is an optional step.

```csharp
_replicatorListenerToken = _replicator.AddChangeListener(OnReplicatorUpdate);
```

* Which is handled by a method called `OnReplicatorUpdate`

```csharp
void OnReplicatorUpdate(object sender, ReplicatorStatusChangedEventArgs e)
{
    var status = e.Status;

    switch (status.Activity)
    {
        case ReplicatorActivityLevel.Busy:
            Console.WriteLine("Busy transferring data.");
            break;
        case ReplicatorActivityLevel.Connecting:
            Console.WriteLine("Connecting to Sync Gateway.");
            break;
        case ReplicatorActivityLevel.Idle:
            Console.WriteLine("Replicator in idle state.");
            break;
        case ReplicatorActivityLevel.Offline:
            Console.WriteLine("Replicator in offline state.");
            break;
        case ReplicatorActivityLevel.Stopped:
            Console.WriteLine("Completed syncing documents.");
            break;
    }

    if (status.Progress.Completed == status.Progress.Total)
    {
        Console.WriteLine("All documents synced.");
    }
    else
    {
        Console.WriteLine($"Documents {status.Progress.Total - status.Progress.Completed} still pending sync");
    }
}
```

* Start the replicator

```csharp
_replicator.Start();
```

## Stopping Replication

When user logs out of the app, the replication is stopped before the database is closed.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-sync/blob/main/src/UserProfileDemo.Repositories/DatabaseManager.cs">DatabaseManager.cs</a> file and locate the `Stop` function.

```csharp
public void StopReplication()
```

* Stop the replicator and remove any associated change listeners

```csharp
_replicator.RemoveChangeListener(_replicatorListenerToken);
_replicator.Stop()
```

**NOTE:** All open replicators must be stopped before database is closed. There will be an exception if you attempt to close the database without closing the active replicators.

## Query Events / Live Queries

Couchbase Lite applications can set up live queries in order to be asynchronously notified of changes to the database that affect the results of the query. This can be very useful, for instance, in keeping a UI View up-to-date with the results of a query.

In our app, the user profile view is kept up-to-date using a live query that fetches the user profile data used to populate the view. This means that, if the replicator pulls down changes to the user profile, they are automatically reflected in the view.

To see this:

1. Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-sync/blob/main/src/UserProfileDemo.Repositories/UserProfileRepository.cs">UserProfileRepository.cs</a> file and locate the `GetAsync` function. Calling this method and passing in a value for the `Action<UserProfile>` named `userProfileUpdated` implies that the caller wishes to be notified of any changes to query results via delegation.

```csharp
public async Task<UserProfile> GetAsync(string userProfileId, Action<UserProfile> userProfileUpdated)
```

2. Build the Query using `QueryBuilder` API. If you are unfamiliar with this API, please check out our <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-xamarin-forms-query">Query tutorial</a>.

```csharp
_userQuery = QueryBuilder
    .Select(SelectResult.All())
    .From(DataSource.Database(database))
    .Where(Meta.ID.EqualTo(Expression.String(userProfileId))); 
```

* We query for documents based on document Id. In our app, there should be exactly one user profile document corresponding to this Id.

3. Attach listener callback to the query to make it **_live_**:

```csharp
_userQueryToken = _userQuery.AddChangeListener(
  (object sender, QueryChangedEventArgs e) => // <1>
{
    if (e?.Results != null && e.Error == null)
    {
        foreach (var result in e.Results.AllResults())
        {
            var dictionary = result.GetDictionary("userprofile"); // <2>
            if (dictionary != null)
            {
                userProfile = new UserProfile // <3>
                {
                    Name = dictionary.GetString("name"), // <4>
                    Email = dictionary.GetString("email"),
                    Address = dictionary.GetString("address"),
                    University = dictionary.GetString("university"),
                    ImageData = dictionary.GetBlob("imageData")?.Content
                };
            }
        }
        if (userProfile != null)
        {
            userProfileUpdated.Invoke(userProfile);
        }
    }
});
```

**<1>** Attach a listener callback to the query. Attaching a listerner automatically makes it **_live_** so any time there is a change in the user profile data in the underlying database, the callback would be invoked.
**<2>** The `SelectResult.all()` method is used to query all the properties of a document. In this case, the document in the result is embedded in a dictionary where the key is the database name, which is **_"userprofiles"_**. So, we retrieve the [`DictionaryObject`](http://docs.couchbase.com/mobile/2.0/couchbase-lite-swift/Classes/DictionaryObject.html) at key **_"userprofiles"_**.
**<3>** Create an instance of [UserProfile](#user-profile). This will be populated with the query results.
**<4>**  We use appropriate **_type getters_** to retrieve values and populate the **_UserProfile_** instance

## Exercises
> **Tip**:
> If you are running the application in Android emulator(s) then you will need to change the URL of the remote Sync Gateway in DatabaseManager.cs.
> 1. Find and uncomment the following line: 
>   readonly Uri _remoteSyncUrl = new Uri("ws://10.0.2.2:4984");
> 2. Comment out the standard line: 
>   readonly Uri _remoteSyncUrl = new Uri("ws://localhost:4984");

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

## Handling Conflicts during Data Syncronization

Data conflicts are inevitable in an environment where you can potentially have multiple writes updating the same data concurrently. Couchbase Mobile supports **_Automated Conflict Resolution_**.

You can learn more about automated conflict resolution in this blog <a target="_blank" rel="noopener noreferrer"  href="https://blog.couchbase.com/document-conflicts-couchbase-mobile/">Document Conflicts & Resolution</a>.


## Learn More

Congratulations on completing this tutorial!

This tutorial walked you through an example of how to use a Sync Gateway to synchronize data between Couchbase Lite enabled clients. We discussed how to configure your Sync Gateway to enforce relevat access control, authorization and data routing between Couchbase Lite enabled clients.

Check out the following links for further details

### Further Reading

* <a target="_blank" rel="noopener noreferrer"  href="https://docs.couchbase.com/sync-gateway/3.0/configuration-overview.html">Sync Gateway Configuration</a>

* <a target="_blank" rel="noopener noreferrer"  href="https://blog.couchbase.com/category/couchbase-mobile/?ref=blog-menu">Couchbase Mobile Blog</a>

* <a target="_blank" rel="noopener noreferrer"  href="https://blog.couchbase.com/?s=sync+function">Sync function blogs</a>

* <a target="_blank" rel="noopener noreferrer"  href="https://blog.couchbase.com/data-replication-couchbase-mobile/">Overview of Replication Protocol</a>

* <a target="_blank" rel="noopener noreferrer"  href="https://blog.couchbase.com/document-conflicts-couchbase-mobile/">Document Conflicts & Resolution</a>
