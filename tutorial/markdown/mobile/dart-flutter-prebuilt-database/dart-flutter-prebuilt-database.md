---
# frontmatter
path: "/dart-flutter-prebuilt-database"
title:  Include a Pre-built Database with Dart and Flutter 
short_title: Include Pre-built Database 
description: 
  - Learn how to include a pre-built database in an Flutter application with Dart 
  - Create an Index and validate the database will work for future steps
content_type: tutorial
filter: mobile
technology: 
  - mobile
landing_page: mobile
landing_order: 3
exclude_tutorials: true 
tags:
  - Flutter 
sdk_language:
  - dart 
length: 30 Mins
---

## Introduction

In this part of the learning path, you will be working with the "Audit Inventory" demo app that allows users to log in and access the developer screens in order to validate the use of a pre-build database in the demo application that is used to store warehouse and stock item documents.  The warehouse and stock item documents will be used in future steps of the learning path when we need to add projects and audits to the database.  

In this step of the learning path you will learn the fundamentals of:

* Including a prebuilt database in an Flutter application 
* Preparing the prebuilt database for use
* Creating an Index 
* Validating the database works for future steps 

## App Overview

While the demo app has a lot of functionality, this step will walk you through:

* Log in into the application
* Accessing the Developer Screen
* Accessing the Developer - Database Information screen
* Reviewing the Logcat logs
* Reviewing the files on the emulator using Device File Explorer

![App Demo,300](app_demo_location_count.gif)

## Installation

### Fetching App Source Code

#### Clone Source Code

* If you haven't already cloned the repo from the previous step, clone the `Learn Couchbase Lite with Dart and Flutter` repository from GitHub.

```bash
git clone https://github.com/couchbase-examples/flutter_cbl_learning_path.git
```

### Try it out

* Open src folder using your favorite IDE
* Build and run the project.
* Log in to the app with  **_"demo@example.com"_** and **_"P@ssw0rd12"_** for user Id and password fields respectively.
* Verify that you see the `No Data was found` message on the Projects screen.

![Projects No Items Screen Image](projects_no_items_screen.png '#width=300px')

## Data Model

A reminder that Couchbase Lite is a JSON Document Store. A `Document` is a logical collection of named fields and values. The values are any valid JSON types. In addition to the standard JSON types, Couchbase Lite supports `Date` and `Blob` data types. While it is not required or enforced, it is a recommended practice to include a _"type"_ property that can serve as a namespace for related documents.

### The Warehouse Document

The sample app comes bundled with a collection of `Document` with a _"documentType"_ property of _"warehouse"_.  Each document represents an warehouse location that a team would visit in order to perform an audit of the inventory at that location. 

An example of a document would be:

```json
{
  "warehouseId":"e1839e0b-57a0-472c-b29d-8d57e256ef32",
  "name":"Santa Clara Warehouse",
  "address1":"3250 Dr Olcott Street",
  "address2":"",
  "city":"Santa Clara",
  "state":"CA",
  "postalCode":"95054",
  "salesTax":0.0913,
  "latitude":32.3803024,
  "longitude":-121.9674197,
  "documentType":"warehouse",
  "yearToDateBalance":0,
  	"shippingTo": [
			"AZ",
			"CA",
			"HI",
			"NV"
		],
}
```

### The Warehouse Data Class 
When a _"warehouse"_ is retreived from the database it is stored within an Data Class of type Warehouse.

```dart
@JsonSerializable(explicitToJson: true)
class Warehouse {
  final String warehouseId;
  final String name;
  final String address1;
  final String? address2;
  final String city;
  final String state;
  final String postalCode;
  final double salesTax;
  final double yearToDateBalance;
  final double latitude;
  final double longitude;
  final List<String>? shippingTo;
  final String documentType = "warehouse";

  const Warehouse(
      this.warehouseId,
      this.name,
      this.address1,
      this.address2,
      this.city,
      this.state,
      this.postalCode,
      this.salesTax,
      this.yearToDateBalance,
      this.latitude,
      this.longitude,
      this.shippingTo);

  @override
  String toString(){
    return name;
  }

  factory Warehouse.fromJson(Map<String, dynamic> json) =>
      _$WarehouseFromJson(json);

  Map<String, dynamic> toJson() => _$WarehouseToJson(this);
}
```
### The Item Document

The sample app comes bundled with a collection of `Document` with a _"documentType"_ property of _"item"_.  Each document represents an item in stock that a team would count in order to perform an audit of the inventory in the warehouse. 

An example of a document would be:

```json
{
  "itemId":"00b66fdf-9bdb-451b-bd2a-75bdf0459958",
  "name":"Bachensteiner Beard Export",
  "price":24.22,
  "description":"Tranquil Export with Bachensteiner flavors",
  "style": "Imperial Stout",
  "documentType":"item"
}
```

### The StockItem Data Class 
When a _"item"_ is retreived from the database it is stored within an Data Class of type StockItem.

```dart
@JsonSerializable(explicitToJson: true)
class StockItem {
  String itemId;
  String name;
  double price;
  String description;
  String style;
  String documentType = "item";

  StockItem(this.itemId, this.name, this.price, this.description, this.style);

  factory StockItem.fromJson(Map<String, dynamic> json) =>
      _$StockItemFromJson(json);

  Map<String, dynamic> toJson() => _$StockItemToJson(this);
}

```

## Using a Prebuilt Database 
There are several reasons why you may want to bundle your app with a prebuilt database. This would be suited for data that does not change or change that often, so you can avoid the bandwidth and latency involved in fetching/syncing this data from a remote server. This also improves the overall user experience by reducing the start-up time.

In our app, the instance of Couchbase Lite that holds the pre-loaded "warehouse" and "stockItem" data is separate from the Couchbase Lite instance that holds "user", "project", and "audit" data. A separate Couchbase Lite instance is not required. However, in our case, since there can be many users potentially using the app on a given device, it makes more sense to keep it separate. This is to avoid duplication of pre-loaded data for every user and to help speed up the app vs pulling down the warehoue and items when the app is first installed.

### Location of the cblite file 

The pre-built database will be in the form of a zip file. It should be in your app project.  

* In the startingWarehouse.zip file within the asset/database folder.

![Prebuilt Database Location](cblite_location.jpg '#width=300px')

> **Note:** The cblite folder will be extracted from the zip file.

All assets must be defined in the pubspec.yaml file.  The pubspec.yaml file is located in the root of the project.  The following lines should be added to the assets section of the pubspec.yaml file.

```yaml
  # To add assets to your application, add an assets section, like this:
  assets:
    - asset/images/couchbase.png
    - asset/database/startingWarehouses.zip 
```

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/database/database_provider.dart#L76">**database_provider.dart**</a> file and locate the `initDatabases` function. The prebuilt database is common to all users of the app (on the device). So it will be loaded once and shared by all users on the device.  Note that the currentUser is required to setup the inventory database for use which holds the user profile documents, as covered in the Key Value step of the learning path.

```dart
Future<void> initDatabases({required User user}) async 
```

* First, we create an instance of the `DatabaseConfiguration` object and specify the path where the database would be located

```dart
final dbConfig = DatabaseConfiguration(directory: cblDatabaseDirectory.path);
```

* Then we determine if the "warehouse" database already exists at the specified location. It would not be present if this is the first time we are using the app, in which case, we locate the _"startingWarehouses.zip"_ resource in the App's main bundle, unzip it, and then we copy it over to the Database folder.

If the database is already present at the specified Database location, we simply open the database.

```dart
// create the warehouse database if it doesn't already exist
if (!File("$cblPreBuiltDatabasePath/$databaseFileName").existsSync()) {
  await _unzipPrebuiltDatabase();
  await _copyWarehouseDatabase();
}
//open the warehouse database
warehouseDatabase = await Database.openAsync(warehouseDatabaseName, dbConfig);
```
> Note:  You MUST copy the pre-built database using the Database.copy function instead of opening it directly or you will run into issues with data syncronization.

### Indexing the Database

* Creating indexes for non-FTS based queries is optional. However, to speed up queries, you can create indexes on the properties that you would query against.  Indexes can slow down writes, so it's recommended adding indexes as you need them.  Indexing is handled eagerly.

* In the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/database/database_provider.dart#L175">**database_provider.dart**</a>  file, locate the ` Future<void> _createDocumentTypeIndex() async` function. 
* We create an index on the `documentType` property of the documents in the warehouseDb and inventoryDb using the databases createIndex function.  The createIndex function requires the name of the index along with the expression of what to index.

```dart
Future<void> _createDocumentTypeIndex() async {
 final expression = Expression.property(documentTypeAttributeName);
 final valueIndexItems = {ValueIndexItem.expression(expression)};
 final index = IndexBuilder.valueIndex(valueIndexItems);

 //copy to local per working with nullable fields
 //https://dart.dev/null-safety/understanding-null-safety#working-with-nullable-fields
 var warehouseDb = warehouseDatabase;
 if (warehouseDb != null) {
  final indexes = await warehouseDb.indexes;
  if (!(indexes.contains(documentTypeIndexName))) {
   await warehouseDb.createIndex(documentTypeIndexName, index);
  }
 }
 var inventoryDb = inventoryDatabase;
 if (inventoryDb != null) {
  final indexes = await inventoryDb.indexes;
  if (!(indexes.contains(documentTypeIndexName))) {
   await inventoryDb.createIndex(documentTypeIndexName, index);
  }
 }
}
```

### Closing the Database

When a user logs out, we close the pre-built database along with other user-specific databases

* In the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/database/database_provider.dart#L155">**database_provider.dart**</a> file, locate the `Future<void> closeDatabases() async` function.

* Closing the databases is pretty straightforward

```dart
Future<void> closeDatabases() async {
 try {
  debugPrint('${DateTime.now()} [DatabaseProvider] info: closing databases');

  if (inventoryDatabase != null) {
   await inventoryDatabase?.close();
  }
  if (warehouseDatabase != null) {
   await warehouseDatabase?.close();
  }
  debugPrint('${DateTime.now()} [DatabaseProvider] info: databases closed');
} catch (e){
 debugPrint('${DateTime.now()} [DatabaseProvider] error: trying to close databases ${e.toString()}');
}
 warehouseDatabase = null;
 inventoryDatabase = null;
}
```

### Try It Out

* The app should be running in the emulator. 
* Log in to the app with any email Id and password. Let's use the values **_"demo@example.com"_** and **_"P@ssw0rd12"_** for user Id and password fields respectively. If this is the first time that **_any_** user is signing in to the app, the pre-built database will be loaded from the App Bundle. In addition, a new team-specific Database will be created / opened.
* Confirm that the debug log output has a message similar to the one below. This output also indicates the location of the pre-built database as well as the inventory database. In this example, we are logging in with a user email Id of **_"demo@example.com"_**.

```bash
flutter: 2022-10-10 16:35:18.668060 [DatabaseProvider] info: initializing databases

flutter: 16:35:18.819504| [DB] info: Copying prebuilt database from /Users/labeaaa/Library/Developer/CoreSimulator/Devices/58842C04-D81E-47B8-B61C-46F56D0AAD83/data/Containers/Data/Application/17F578E6-129B-4594-8924-7FE0341F63E8/Documents/databases/startingWarehouses.cblite2 to /Users/labeaaa/Library/Developer/CoreSimulator/Devices/58842C04-D81E-47B8-B61C-46F56D0AAD83/data/Containers/Data/Application/17F578E6-129B-4594-8924-7FE0341F63E8/Documents/databases/warehouse.cblite2
```

* The above log messages are from an iOS Simulator and indicates the location of the pre-built database as was as the database for the inventory data.  

* For Android Emulators, the log message indicates the location would be within the _files_ folder.

* For the iOS Simulator you can use the Finder to locate the database.  Open up the folder indicated in the log message and you should see the database file. 

![Finder file listing](finder_files.png '#width=500px')

* For Android emulators and physical devices you can use Device File Explorer that comes with Android Studio.  <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/studio/debug/device-file-explorer">**Open the folder on your computer**</a> and verify that a Database with name _"warehouse"_ exists along with a team specific Database with name _"teamname_inventory"_ where teamname is the name of the team the user is assigned to.

![Device File Explorer file listing](device_explorer_files.png '#width=500px')

* Click the Drawer menu icon (sometimes referred to the Hamburger icon) and tap on Developer
* Tap on the Database Information button
* Validate the Location Database Path, Warehouse Database Name, and Warehouse Count which should be 55 
* Validate that the Stock Item Count is 3000 
![Developer - Database Information](developer-database-info.png '#width=300px')

## Learn More

Congratulations on completing this step of our learning path!

This step of the learning path walked you through an example of how to use a pre-built Couchbase Lite database. Check out the following links for further documenation and continue on to the next step that covers how to insert documents into the database using Batch operations.

References 

* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/prebuilt-database.html">Documentation: Pre-built Database</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/indexing.html">Documentation: Indexing your Data</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/querybuilder.html#indexing">Documentation: Querybuilder - Indexing</a>
