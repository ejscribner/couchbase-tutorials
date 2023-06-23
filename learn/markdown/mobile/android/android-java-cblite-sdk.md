---
# frontmatter
path: "/learn/android-java"
title: Couchbase Lite with Java for Android Developers
short_title: Couchbase Mobile Android Java
description: 
  - Take a deep dive into Couchbase Lite's Android Java SDK
  - View real examples and demos
  - Learn about QueryBuilder and Sync Gateway
content_type: learn
technology: 
  - mobile
tags:
  - Android
sdk_language:
  - android-java
tutorials:
  - tutorial-quickstart-android-java-basic
  - tutorial-quickstart-android-java-query 
  - tutorial-quickstart-android-java-sync 
related_paths: 
  - /learn/android-java
download_file: null
length: 2 Hour
---

Couchbase Mobile brings the power of NoSQL to the edge. It is comprised of three components:

- Couchbase Lite, an embedded, NoSQL JSON Document Style database for your mobile apps
- Sync Gateway, an internet-facing synchronization mechanism that securely syncs data between mobile clients and server, and
- Couchbase Server, a highly scalable, distributed NoSQL database platform

Couchbase Mobile supports flexible deployment models. You can deploy:
- Couchbase Lite as a standalone embedded database within your mobile apps or,
- Couchbase Lite enabled mobile clients with a Sync Gateway to synchronize data between your mobile clients or,
- Couchbase Lite enabled clients with a Sync Gateway to sync data between mobile clients and the Couchbase Server, which can persist data in the cloud (public or private)

In this learning path you will get started with the Couchbase Lite Android SDK. You will learn how to get and insert documents using the key-value engine, query the database using the QueryBuilder engine, and learn how to sync information between your mobile app and a Couchbase Server using Sync Gateway. 

## Prerequisites

Before you get started you should take the following prerequisites into consideration:

- Familiarity with building Android Apps with Java and Android Studio 
- [Android Studio 3.4 or above](https://developer.android.com/studio)
- Android SDK installed and setup (> v.30.0.0)
- Android Build Tools (> v.30.0.0)
- Android device or emulator running API level 22 or above
- JDK 8 (now embedded into Android Studio 4+)

- curl HTTP client 
  * You could use any HTTP client of your choice. But we will use *curl* in our tutorial. Mac OS Package Manager users can use <a target="_blank" rel="noopener noreferrer" href="https://brew.sh/">homebrew</a>. Windows Package Manager users can use <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/windows/package-manager/winget/">winget</a>. 

- Docker
  * We will be using Docker to run images of both Couchbase Server and the Sync Gateway — to download Docker, or for more information, see: <a target="_blank" rel="noopener noreferrer" href="https://docs.docker.com/get-docker/">Get Docker</a>.

## Agenda

- Quickstart in Couchbase Lite with Android and Java
- Quickstart in Couchbase Lite Query with Android and Java
- Quickstart in Couchbase Lite Data Sync with Android and Java 
