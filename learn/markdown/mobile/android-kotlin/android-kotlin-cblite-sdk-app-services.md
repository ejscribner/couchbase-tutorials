---
# frontmatter
path: "/learn/android-kotlin-app-services"
title: Couchbase Lite and Capella App Services with Kotlin and JetPack Compose
short_title: Introduction 
description: 
  - Deep dive on how to use Couchbase Lite Android Kotlin SDK with Capella App Services
  - Explore real examples and demos
content_type: learn
technology:
  - mobile
tags:
  - Android
  - App Services
tutorials:
  - android-kotlin-learning-key-value
  - android-kotlin-prebuilt-database
  - android-kotlin-batch-operations
  - android-kotlin-query-builder
  - android-kotlin-query-sql
  - app-services-lp-audit-inventory
  - android-kotlin-replication-app-services
related_paths: 
  - /learn/android-kotlin-sync
download_file: null
sdk_language:
  - kotlin
length: 2 Hour
---

Couchbase Mobile brings the power of NoSQL to the edge. It is comprised of three components:

- Couchbase Lite, an embedded, NoSQL JSON Document Style database for your mobile apps
- Capella App Services, an highly scalable synchronization mechanism that securely syncs data between mobile clients and 
- Couchbase Capella, a fully managed Database as a Service delivering a highly scalable, distributed NoSQL database platform

Couchbase Mobile supports flexible deployment models. You can deploy:
- Couchbase Lite as a standalone embedded database within your mobile apps or,
- Couchbase Lite enabled mobile clients with a Sync Gateway to synchronize data between your mobile clients or,
- Couchbase Lite enabled clients with a Sync Gateway to sync data between mobile clients and the Couchbase Server, which can persist data in the cloud (public or private)
- Couchbase Lite enabled clients with Couchbase Capella, a fully managed Database as a Service, using Capella's App Services to sync data between the mobile client and Couchbase Capella in the cloud

In this learning path you will be reviewing an Android Application written in <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/kotlin">Kotlin</a> and <a target="_blank" rel="noopener noreferrer"  href="https://developer.android.com/jetpack/compose/mental-model">JetPack Compose</a> that uses the Couchbase Lite Android SDK for Kotlin. You will learn the basics of:

- How to get and insert documents using the key-value engine
- How to get and insert documents using JSON strings
- How to use a pre-built Couchbase Lite database
- How to insert documents using batch operations
- How to query the database using the QueryBuilder engine 
- How to query the database using SQL++
- How to sync information between the mobile demo app and Couchbase Capella using App Services 

>**Note: This tutorial will require either having an account already set up with Capella, Couchbase Database as a Service (DBaaS) offering or signing up for a free trial. Please see the [Sync Gateway](/learn/android-kotlin-sync) version of this learning path for developers looking to learn Couchbase Mobile with Couchbase Server and Sync Gateway via Docker containers.**

## Prerequisites

Before you get started you should take the following prerequisites into consideration:

- Familiarity with building Android Apps with <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/kotlin">Kotlin</a>, <a target="_blank" rel="noopener noreferrer"  href="https://developer.android.com/jetpack/compose/mental-model">JetPack Compose</a>, and Android Studio 
- [Android Studio Chipmunk or above](https://developer.android.com/studio)
- Android SDK installed and setup (> v.32.0.0)
- Android Build Tools (> v.32.0.0)
- Android device or emulator running API level 23 (Android 6.0 Marshmallow) or above
- JDK 11 (now embedded into Android Studio 4+)

- curl HTTP client 
  * You could use any HTTP client of your choice. But we will use *curl* in our tutorial. Mac OS Package Manager users can use <a target="_blank" rel="noopener noreferrer" href="https://brew.sh/">homebrew</a>. Windows Package Manager users can use <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/windows/package-manager/winget/">winget</a>. 

- Couchbase Capella
  * Couchbase Capella provides a free 30 day trial of Couchbase cluster, it is the easiest and fastest way to get started with Couchbase. Be up and running in just under 10 minutes with a fully managed database-as-a-service (DBaaS) and 50GB of initial storage and no upfront payment needed. You can try out our N1QL query language (SQL for JSON) for free along with App Services which allows you to sync information between any mobile application and Capella, eliminating database management efforts and reducing overall costs.

  * You can sign-up for Couchbase Capella following the link below:  
    * [Signing Up with Couchbase Capella Free Trial](https://developer.couchbase.com/tutorial-capella-sign-up-ui-overview)

## Learning Path Structure

Each section of the learning path will walk through a different feature of the demo application.   The parts in this learning path build on one another and sometimes show multiple ways to achieve the same results learned, as the Couchbase Lite SDK is very flexible. Once you understand the basics, you can decide which method works best for your team to query the database, return data, and display it for the end-user to interact with on the screen.

## Inventory Demo Application 

### Overview

The demo application used in this learning path is based on auditing <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Inventory">inventory</a> in various warehouses for a fictitious company.  Most companies have some inventory - from laptops to office supplies and must audit their stock from time to time. For example, when a user's laptop breaks, the Information Technology department can send out a replacement from the inventory of spare laptops they have on hand. 

Users running the mobile app would log into the application to see the projects they are assigned to work on. Then, the user would look at the project to see which warehouse they need to travel to. Once at the warehouse, they would inspect the number of items on hand in stock, tracking them in the mobile application.  Finally the data can be synced back to the server for use with other analytical data.

### Architecture

The demo application uses <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/jetpack/guide">application architecture</a> concepts in developing modern Android applications recommended by the Android development team.  

<a target="_blank" rel="noopener noreferrer" href="https://insert-koin.io/">Koin</a>, the popular open-source Kotlin based injection library, is used to manage dependency inversion and injection.  ViewModels, Repositories, and Services are all registered using Koin.  By using Koin, we can target JDK 11 versus Hilt or Dagger, which requires JDK 8.  Koin is also written in Kotlin so it has a more friendly syntax to Kotlin developers.  

The application structure is a single Activity that uses <a target="_blank" rel="noopener noreferrer"  href="https://developer.android.com/jetpack/compose/mental-model">JetPack Compose</a> to render the multiple compose-based views.  In addition, the <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/jetpack/compose/navigation">Navigation Graph</a> is used to handle routing and navigation between various views.  

The Database Manager is a custom class that manages the database state and lifecycle.  Querying and updating documents in the database is handled using the <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/jetpack/guide#data-layer">repository pattern</a>.  <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/jetpack/guide#domain-layer">ViewModels</a> will query or post updates to the repository and control the state of objects that the compose-based Views can use to display information. 

### Application Flow

The demo application starts with the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/InventoryApplication.kt#L38">`InventoryApplication`</a> class, which inherits from the default Application class provided by Android.  <a target="_blank" rel="noopener noreferrer" href="https://insert-koin.io/docs/reference/koin-android/start">Koin</a> recommends this structure to set up all the dependencies, including services, repositories, and ViewModels.  

<a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/MainActivity.kt#L36">`MainActivity`</a> then defines <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/MainActivity.kt#L39">`setContent`</a>, which sets up lifecycle management and creates the navigation controller used to handle navigation in the application.  The <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/InventoryNavGraph.kt#L52">`InventoryNavGraph`</a> function and <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/InventoryNavGraph.kt#L137">`MainActions`</a> class handles routing between views and sets the start destination to the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/login/LoginView.kt#L32">`LoginView`</a> function.  Next, the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/login/LoginViewModel.kt#L15">`LoginViewModel`</a> uses the mock implementation of the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/services/MockAuthenticationService.kt#L14">`AuthenticationService`</a> interface to test if the user has provided the correct username and password.  Finally, the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/login/LoginView.kt#L32">`LoginView`</a> uses the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/InventoryNavGraph.kt#L52">`InventoryNavGraph`</a>  to route the user to the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/project/ProjectListView.kt#L31">`ProjectListView`</a> if they enter the proper credentials.  The user can interact with the application in several ways, thus routing the user to different views based on their interactions.

### JetPack Compose - Dark and Light Theme 

The Audit Inventory Demo app uses JetPack Compose theming engine to offer both light and dark theme versions of the UI.  All screen shots provided in the learning path are taken in dark theme.  The dark theme is available by selecting dark mode in the Display section of the settings menu of your Android emulator.

## Agenda

* **Couchbase Lite Key Value Engine with Kotlin and Jetpack Compose**
  * Learn how to install Couchbase Lite on Android 
  * Learn database operations for creating, opening, closing, and deleting a database
  * Learn document create, read, update, and delete (CRUD) operations via key-value pair
  * Learn how to use the Blob data type to store images

* **Learn how-to include a Pre-built Database with Kotlin and Jetpack Compose**
  * Including a prebuilt database in an Android mobile application
  * Preparing the prebuilt database for use
  * Creating an Index
  * Validating the database works for future steps

* **Learn how-to use Couchbase Lite Batch operations with Kotlin and Jetpack Compose**
  * Inserting documents into the database in batch
  * Using JSON serialization to serialize objects to be stored in the database
  * Use the Visual Studio Code Couchbase Lite plug-in to review the documents added

* **Learn how-to use Couchbase Lite Query Builder Engine with Kotlin and Jetpack Compose**
  * Creating a Query using Query Builder and the count function
  * Using the QueryBuilder API
  * Using Live Queries with queryChangeFlow and Kotlin Co-Routine Flows
  * Using JSON Serialization to "deserialize" documents from the database in to Kotlin data class
  * Using indexes to speed up a query
  * Using the count function with the QueryBuilder API
  * Using the LIKE operator with the QueryBuilder API

* **Learn how-to use Couchbase Lite SQL++ Querying with Kotlin and Jetpack Compose**
  * Querying using SQL++ Strings
  * Using Live Queries with queryChangeFlow and Kotlin Co-Routine Flows using Live Data and Mutable Live Data
  * Using JSON Serialization to "deserialize" documents from the database in to Kotlin data class
  * Using indexes to speed up a query
  * Using the count function with SQL++ 
  * Using the LIKE operator with SQL++ and Parameters 

* **Learn how-to setup Couchbase Capella and App Services for use with Audit Inventory Demo App** 
  * Data Synchronization across devices and the cloud
  * Authorization & Access Control
  * Setting up Couchbase Capella projects, cluster, and buckets 
  * Setting up App Services including security, authentication, and data synchronization 

* **Learn how-to setup Couchbase Lite Replication with Couchbase Capella App Services, Kotlin, and Jetpack Compose** 
  * Configure your Couchbase Lite clients for replication with Couchbase Capella App Services 
  * Review various options in the ReplicatorConfig 
