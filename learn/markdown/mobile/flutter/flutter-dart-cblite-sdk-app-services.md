---
# frontmatter
path: "/learn/flutter-dart-sdk-app-services"
title: Couchbase Lite and Capella App Services with Dart and Flutter 
short_title: Introduction
description: 
  - Deep dive on how to use the community Dart SDK for Couchbase Lite with Capella App Services
  - Explore real examples and demos
content_type: learn
technology:
  - mobile
tags:
  - Android
  - iOS
  - Flutter
  - App Services
tutorials:
  - dart-flutter-prebuilt-database
  - dart-flutter-batch-operations 
  - dart-flutter-query-builder
  - dart-flutter-query-sql
  - app-services-lp-audit-inventory
related_paths: 
  - /learn/flutter-dart-cblite-sdk-sync
download_file: null
sdk_language:
  - dart 
length: 3 Hour
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

>**Note**:  The <a target="_blank" rel="noopener noreferrer"  href="https://github.com/cbl-dart/cbl-dart">Dart SDK for Couchbase Lite</a> is a community based project on GitHub and is not officially supported by Couchbase.  If you have questions or issues with the SDK, please <a target="_blank" rel="noopener noreferrer"  href="https://github.com/cbl-dart/cbl-dart/discussions">post them on the GitHub project</a>.

In this learning path you will be reviewing an Mobile Application written in <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/kotlin">Dart</a> and <a target="_blank" rel="noopener noreferrer"  href="https://developer.android.com/jetpack/compose/mental-model">Flutter</a> that uses the community supported Dart SDK for Couchbase Lite. You will learn the basics of:

- How to get and insert documents using the key-value engine
- How to get and insert documents using JSON strings
- How to use a pre-built Couchbase Lite database
- How to insert documents using batch operations
- How to query the database using the QueryBuilder engine 
- How to query the database using SQL++
- How to sync information between the mobile demo app and Couchbase Capella using App Services 


>**Note: This tutorial will require either having an account already set up with Capella, Couchbase Database as a Service (DBaaS) offering or signing up for a free trial. Please see the <a target="_blank" rel="noopener noreferrer"  href="/learn/flutter-dart-cblite-sdk-sync">Sync Gateway</a> version of this learning path for developers looking to learn Couchbase Mobile with Couchbase Server and Sync Gateway via Docker containers.**

## Prerequisites

Before you get started you should take the following prerequisites into consideration:

- Familiarity with building <a target="_blank" rel="noopener noreferrer"  href="https://dart.dev/">Dart</a> and <a target="_blank" rel="noopener noreferrer"  href="https://flutter.dev">Flutter</a> Apps
- Familiarity with <a target="_blank" rel="noopener noreferrer"  href="https://bloclibrary.dev/">Bloc</a> and <a target="_blank" rel="noopener noreferrer"  href="https://bloclibrary.dev/#/architecture">statement management patterns</a> in Flutter
- Android SDK installed and setup (> v.32.0.0)
- Android Build Tools (> v.32.0.0)
- XCode 13 or later installed and setup 
- Android device or emulator running API level 23 (Android 6.0 Marshmallow) or above
- iOS device or simulator setup for iOS 14 or later
- IDE of choice (IntelliJ, Android Studio, VS Code, etc.)
- Flutter > 3.0 installed, setup, and configured for your IDE of choice

- curl HTTP client 
  * You could use any HTTP client of your choice. But we will use *curl* in our tutorial. Mac OS Package Manager users can use <a target="_blank" rel="noopener noreferrer" href="https://brew.sh/">homebrew</a>. Windows Package Manager users can use <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/windows/package-manager/winget/">winget</a>. 

- Couchbase Capella
  * Couchbase Capella provides a free 30 day trial of Couchbase cluster, it is the easiest and fastest way to get started with Couchbase. Be up and running in just under 10 minutes with a fully managed database-as-a-service (DBaaS) and 50GB of initial storage and no upfront payment needed. You can try out our N1QL query language (SQL for JSON) for free along with App Services which allows you to sync information between any mobile application and Capella, eliminating database management efforts and reducing overall costs.

  * You can sign-up for Couchbase Capella following the link below:  
    * [Signing Up with Couchbase Capella Free Trial](https://developer.couchbase.com/tutorial-capella-sign-up-ui-overview)

## Learning Path Structure

Each section of the learning path will walk through a different feature of the demo application.   The parts in this learning path build on one another and sometimes show multiple ways to achieve the same results learned, as the Dart Couchbase Lite SDK is very flexible. Once you understand the basics, you can decide which method works best for your team to query the database, return data, and display it for the end-user to interact with on the screen.

## Inventory Demo Application 

### Overview

The demo application used in this learning path is based on auditing <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Inventory">inventory</a> in various warehouses for a fictitious company.  Most companies have some inventory - from laptops to office supplies and must audit their stock from time to time. For example, when a user's laptop breaks, the Information Technology department can send out a replacement from the inventory of spare laptops they have on hand. In this app, the items we are auditing are cases of beer.  

Users running the mobile app would log into the application to see the projects they are assigned to work on. Then, the user would look at the project to see which warehouse they need to travel to. Once at the warehouse, they would inspect the number of cases of beer, tracking them in the mobile application.  Finally the data can be synced back to the server for use with other analytical data.

### Architecture

The demo application uses <a target="_blank" rel="noopener noreferrer" href="https://bloclibrary.dev/#/">bloc</a>, a very popular <a target="_blank" rel="noopener noreferrer"  href="https://bloclibrary.dev/#/architecture">statement management pattern</a>for Dart. 

Bloc is used to manage dependency inversion, injection, and state management.  Repositories and Services are registered using Bloc's <a target="_blank" rel="noopener noreferrer" href="https://pub.dev/documentation/flutter_bloc/latest/flutter_bloc/MultiRepositoryProvider-class.html">MultiRepositoryProvider</a>.  The sample application is broken down into features which can be found in the src/lib/features directory.

The <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/database/database_provider.dart">Database Provider</a>, found in the src/lib/features/database/ diretory, is a custom class that manages the database state and lifecycle.  Querying and updating documents in the database is handled using the <a target="_blank" rel="noopener noreferrer" href="https://bloclibrary.dev/#/architecture?id=repository">repository pattern</a>.  Blocs will query or post updates to the repository and control the state of objects that the Flutter widgets can use to display information. 

### Application Flow

The application structure starts with the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/main.dart#L15">main function</a>.  It creates an <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/inventory_audit_app.dart#L16">InventoryAuditApp</a> that is a Stateless Widget and sets up all repositories and services using <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/inventory_audit_app.dart#L47">MultiRepositoryProvider</a>.  The <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/router/bloc/route_bloc.dart#L10 ">RouteBloc</a> defined is used to handle all routing calls.  This bloc defines a child, <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/app_view.dart#L13">AppView</a>, which is a stateful widget that uses a MultiBlocListern to react to changes in the route state and thus render new screens as requested.  

The default state of the app is for the user to not be authenticated, which will call the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/login/views/login_screen.dart">LoginScreen</a> widget to render.  LoginScreen uses a <a target="_blank" rel="noopener noreferrer" href="https://pub.dev/documentation/flutter_bloc/latest/flutter_bloc/BlocProvider-class.html">BlocProvider</a> to inject <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/login/bloc/login_bloc.dart">LoginBloc</a> into the render tree which defines <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/login/views/login_form.dart#L6">LoginForm</a> as a child to render the UI.  When a user taps the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/login/views/login_form.dart#L130">_LoginButton</a>, the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/login/bloc/login_event.dart#L28">LoginSubmitted</a> event is added to LoginBloc, which runs the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/login/bloc/login_bloc.dart#L47">_onSubmitted</a> method to update state with if the user logged in properly or not.  If the user is authenticated properly the state is updated and the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/app_view.dart#L57">BlocListner for RouteState</a> will push the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/project/views/project_list_screen.dart#L12">ProjectListScreen</a>widget to the render tree.  

The user can use the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/drawer/views/menu_drawer.dart#L7">menu drawer</a> to navigate to other sections of the app or use the Floating Action button to <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/featu">add a new Project</a>.

## Agenda

* **Couchbase Lite Key Value Engine with Dart and Flutter**
  * Learn how to install Couchbase Lite with Dart and Flutter  
  * Learn database operations for creating, opening, closing, and deleting a database
  * Learn document create, read, update, and delete (CRUD) operations via key-value pair
  * Learn how to use the Blob data type to store images

* **Learn how-to include a Pre-built Database with Dart and Flutter**
  * Including a prebuilt database in an Flutter application 
  * Preparing the prebuilt database for use
  * Creating an Index
  * Validating the database works for future steps

* **Learn how-to use Couchbase Lite Batch operations with Dart and Flutter**
  * Inserting documents into the database in batch
  * Using JSON serialization to serialize objects to be stored in the database
  * Use the Visual Studio Code Couchbase Lite plug-in to review the documents added

* **Learn how-to use Couchbase Lite Query Builder Engine with Dart and Flutter**
  * Creating a Query using Query Builder and the count function
  * Using the QueryBuilder API
  * Using Live Query with Streams to listen for changes in the database
  * Using JSON Serialization to "deserialize" documents 
  * Using indexes to speed up a query
  * Using the count function with the QueryBuilder API
  * Using the LIKE operator with the QueryBuilder API

* **Learn how-to use Couchbase Lite SQL++ Querying with Dart and Flutter**
  * Querying using SQL++ Strings
  * Using Live Query with Streams to listen for changes in the database
  * Using JSON Serialization to "deserialize" documents 
  * Using indexes to speed up a query
  * Using the count function with SQL++ 
  * Using the LIKE operator with SQL++ and Parameters 

* **Learn how-to setup Couchbase Capella and App Services for use with Audit Inventory Demo App** 
  * Data Synchronization across devices and the cloud
  * Authorization & Access Control
  * Setting up Couchbase Capella projects, cluster, and buckets 
  * Setting up App Services including security, authentication, and data synchronization 

* **Learn how-to setup Couchbase Lite Replication with Couchbase Capella App Services, Dart, and Flutter 
  * Configure your Couchbase Lite clients for replication with Couchbase Capella App Services 
  * Review various options in the ReplicatorConfig 
