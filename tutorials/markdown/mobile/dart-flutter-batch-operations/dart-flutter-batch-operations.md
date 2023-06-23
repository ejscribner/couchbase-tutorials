---
# frontmatter
path: "/dart-flutter-batch-operations"
title:  Learn Couchbase Lite Batch operations with Dart and Flutter 
short_title: Batch operations 
description: 
  - Learn how to use batch operations to add documents in Couchbase Lite
  - Insert documents into the database in batch
  - Use JSON to serialize objects in the database
  - Explore the Visual Studio Code plug-in for Couchbase Lite
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

In this part of the learning path, you will be working with the "Audit Inventory" demo app app that allows users to log in and access the developer screens in order to add 10 sample projects into the inventory database using batch operations.  In this step of the learning path you will learn the fundamentals of:

* Inserting documents into the database in batch
* Using JSON serialization to serialize objects to be stored in the database
* Validating the documents were created 
* Use the Visual Studio Code Couchbase Lite plug-in to review the documents added

## App Overview

While the demo app has a lot of functionality, this step will walk you through:

* Log in into the application
* Accessing the Developer Screen
* Use the Load Sample Data button 
* Review the project document count added 
* Review the project documents added in the app

![App Demo,400](load_sample_data.gif)

> **NOTE**:  This step assumes you completed the previous step `Include Pre-built Database`.   This part of the learning path will be confusing if you did not complete the previous step. 

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

A reminder that Couchbase Lite is a JSON Document Store. A `Document` is a logical collection of named fields and values. The values are any valid JSON types. In addition to the standard JSON types, Couchbase Lite supports `Date` and `Blob` data types. While it is not required or enforced, it is a recommended practice to include a _"documentType"_ property that can serve as a namespace for related documents.

### The Project Document

In this step we will create a collection of `Document` with a _"documentType"_ property of _"project"_.  Each document represents a project that a team would would work on and have to complete before the due date based on a selected warehouse, which is another document type.   

An example of a document would be:

```json
{
	"team": "team1",
	"modifiedOn": "1656804469897",
	"documentType": "project",
	"createdBy": "demo@example.com",
	"dueDate": "2022-10-31",
	"name": "Santa Clara Warehouse Audit",
	"description": "Audit of warehouse stock located in Santa Clara, CA.",
	"modifiedBy": "demo@example.com",
	"warehouse": {
		"documentType": "warehouse",
		"name": "Santa Clara Warehouse",
   	"shippingTo": [
			"AZ",
			"CA",
			"HI",
			"NV"
		],
		"warehouseId": "e1839e0b-57a0-472c-b29d-8d57e256ef32",
		"city": "Santa Clara",
		"address1": "3250 Dr Olcott Street",
		"postalCode": "95054",
		"latitude": 32.3803024,
		"state": "CA",
		"salesTax": 0.0913,
		"longitude": -121.9674197,
		"yearToDateBalance": 0.0
	},
	"projectId": "663953ba-9e4c-4090-9e07-642c1778d467",
	"createdOn": "1656804469897"
}
```

#### The Project Data Class 
When a _"project"_ is retreived from the database it is stored within an data class of type **Project**.

```dart
@JsonSerializable(explicitToJson: true)
class Project {
  String projectId;
  String name;
  String description;
  bool isComplete;
  String documentType = 'project';
  DateTime? dueDate;
  Warehouse? warehouse;

  //security tracking
  String team;
  String createdBy;
  String modifiedBy;
  DateTime? createdOn;
  DateTime? modifiedOn;

  Project( {
    required this.projectId,
    required this.name,
    required this.description,
    required this.isComplete,
    required this.dueDate,
    required this.warehouse,
    required this.team,
    required this.createdBy,
    required this.createdOn,
    required this.modifiedBy,
    required this.modifiedOn});

  String dueDateToString() {
    var date = dueDate;
    if (date != null) {
      return '${date.month}/${date.day}/${date.year}';
    }
    return '';
  }
  factory Project.fromJson(Map<String, dynamic> json) =>
      _$ProjectFromJson(json);

  Map<String, dynamic> toJson() => _$ProjectToJson(this);
}
```

#### The Warehouse Class 

When a _"warehouse"_ from a project is retreived from the database it is stored within a data class of type **Warehouse**.

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

#### The StockItem Data Class 
When a _"item"_ is retreived from the database it is stored within an Data Class of type **StockItem**.

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

## Batch operations 

If you’re making multiple changes to a database at once, it’s faster to group them together.  Batch operations are still transactional:  no other Database instance, including ones managed by the replicator can make changes during the execution of the block of code running the batch operation, and other instances will not see partial changes.  Batch operations can be very useful for loading data quickly and we will use them to load some random sample data into the database.

### Triggering the loading of Sample Data 

To load sample data a user would

* Log in to the app with any email Id and password.
* Tap the Drawer menu icon found in the upper left hand corner of the screen
* Tap the Developer menu item
* Tap the Load Sample Data button

### Loading the Sample Data - Widget and Bloc 

To review the entire process, let's start by opening the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/developer/views/developer_menu_widget.dart#L91">**developer_menu_widget.dart**</a> file and locate the `build` function.  This function defines the button and calls `context.read<DevDataLoadBloc>.add(DevDataLoadStartEvent())` when the **onPressed* event is called.   

```dart
Padding(
  padding: const EdgeInsets.all(16.0),
  child: OutlinedButton(
    key: const Key('menu_sample_data'),
    style: OutlinedButton.styleFrom(
      padding: const EdgeInsets.only(
          top: 20, bottom: 20, left: 60, right: 60),
      backgroundColor: Theme.of(context).backgroundColor,
      foregroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
    ),
    onPressed: () => {
      context
          .read<DevDataLoadBloc>()
          .add(DevDataLoadStartEvent())
    },
    child: const Text("Load Sample Data"),
  ),
),
```

* Now open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/developer/bloc/dev_data_load_bloc.dart#L19">**dev_data_load_bloc.dart**</a> file and locate the `_initialize()` method.  

```dart
Future<void> _initialize(
 DevDataLoadEvent event, Emitter<DevDataLoadState> emit) async {
 try {
  //start loading data into collection
  emit(const DevDataLoadState(status: DevDataLoadStatus.loading));
  //call the data loader
  await _projectRepository.loadSampleData();

  //validate that we added some projects
  var projectCount = await _projectRepository.count();
  if (projectCount > 0) {
   emit(const DevDataLoadState(
    status: DevDataLoadStatus.success, error: ''));
  } else {
   emit(const DevDataLoadState(
    status: DevDataLoadStatus.failed,
    error: 'Project Count is still zero so no projects were added.  Please check logs for more information on what failed.'));
  }
 } catch (e) {
  var error = state.copyWith(DevDataLoadStatus.failed, e.toString());
   emit(error);
   debugPrint(e.toString());
  }
}
```
1.  This method is defined as Future<void> with the async keyword in order to run asynchronously.  This is important because we will be making calls to the database and we don't want to block the UI thread.
2.  This will call the project repositories loadSampleData function

### Loading the Sample Data - ProjectRepository 

Now that it's clear how the UI and Bloc interact with the repository, open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/project/data/project_repository.dart#L155">**project_repository.dart**</a> file and locate the `loadSampleData` function.  You can see by the method signature that it's using `Future` and `async`.  By using the asynchronous calls and the `Database.openAsync` function, we keep database operations from blocking the main UI thread.

```dart
Future<void> loadSampleData() async {
```    

* Next we need to define some services and data we will use to generate the random data required.  

```dart
var currentUser = await _authenticationService.getCurrentUser();
var warehouses = await _warehouseRepository.get();
var stockItems = await _stockItemRepository.get();
```

1.  Retreive the current logged in user that will be set to the projects createdBy and modifiedBy fields, along with which team the project is assigned to.
2.  Use the warehouse repository to get a collection of warehouses.  This is using the pre-built database that was discussed in the previous part of this learning path.
3.  Use the stock item repository to get a collection of stock items.  This is using the pre-built database that was discussed in the previous part of this learning path.

* Next we get a reference to the inventoryDatabase from the DatabaseProvider.  Since the database could be null, we use an if statement to check if it's null or not.

```dart
final db = _databaseProvider.inventoryDatabase;
  if (db != null) {
``` 

* Finally, we use the database.inBatch function to define a unit of work to add in our random projects to the database using a JSON formatted string by encoding our Project object using the standard Dart JSON encoding library.

```dart
/* batch operations for saving multiple documents is a faster way to process
groups of documents at once */
db.inBatch(() async {
  // <1>
  //create 12 new projects with random data
 var uuid = const Uuid();
 final random = Random();
 const minYear = 2022;
 const maxYear = 2025;
 const minMonth = 1;
 const maxMonth = 12;
 const minDay = 1;
 const maxDay = 28;
 var date = DateTime.now();
  //create 12 new projects with random data
  // <2>
 for (var projectIndex = 0; projectIndex <= 11; projectIndex++) {
 //get data items to create project
 String projectId = uuid.v4();
 var warehouse = warehouses[projectIndex]; // <3>
 var yearRandom = minYear + random.nextInt(maxYear - minYear);
 var monthRandom = minMonth + random.nextInt(maxMonth - minMonth);
 var dayRandom = minDay + random.nextInt(maxDay - minDay);
 var dueDate = DateTime.utc(yearRandom, monthRandom, dayRandom);
 //create project
 var projectDocument = Project(
  //<4>
  projectId: projectId,
  name: '${warehouse.name} Audit',
  description:
  'Audit of warehouse stock located in ${warehouse.city}, ${warehouse.state}.',
  isComplete: false,
  dueDate: dueDate,
  warehouse: warehouse,
  team: currentUser!.team,
  createdBy: currentUser.username,
  createdOn: date,
  modifiedBy: currentUser.username,
  modifiedOn: date);
 var didSave = await save(projectDocument); // <5>
 if (didSave) {
  // <6>
  //create random audit counts per project // <7>
  for (var auditIndex = 0; auditIndex <= 49; auditIndex++) {
   var auditId = uuid.v4();
   var stockCount = 1 + random.nextInt(10000 - 1);
   var stockItemIndex = random.nextInt(stockItems.length);
   var stockItem = stockItems[stockItemIndex];
   var auditDocument = Audit(
    auditId: auditId,
    projectId: projectId,
    stockItem: stockItem,
    auditCount: stockCount,
    notes:
    'Found item ${stockItem.name} - ${stockItem.description} in warehouse',
    team: currentUser.team,
    createdBy: currentUser.username,
    modifiedBy: currentUser.username,
    createdOn: date,
    modifiedOn: date);
    await _auditRepository.save(auditDocument);
   }
  }
 }
});
```

1. Call the database inBatch function a definition of processing multiple documents to be added to the database.
2. Define a loop to add in 12 new project documents to the database 
3. Get the warehouse to use in the project document from the collection of warehouses 
4. Create a new Project object with random data and the warehouse from step 3 
5. Save the document to the database 
6. Repeat same sort of steps for creating random audit items for each project

> **NOTE**: In this example we are using objects and JSON serialization to save it to the database.  This is an alternative API to using a `Map<String, Object?>` as we did in the key value part of our learning path.  Developers that are used to working with JSON encoding and decoding might find this pattern more comfortable to save data to the database.
  

### Try It Out

* The app should be running in the emulator. 
* Log in to the app with any email Id and password. Let's use the values **_"demo@example.com"_** and **_"P@ssw0rd12"_** for user Id and password fields respectively. If this is the first time that **_any_** user is signing in to the app, the pre-built database will be loaded from the App Bundle. In addition, a new team-specific Database will be created / opened.
* Tap the Drawer menu icon found in the upper left hand corner of the screen
* Tap the Developer menu item
* Tap the Load Sample Data button
* Tap the Drawer menu icon found in the upper left hand corner of the screen
* Tap the Home menu item

![App Demo,400](load_sample_data.gif)

You should now see 12 sample projects that you can scroll through.  

## Review Data with Visual Studio Code Plug-in 

Visual Studio Code has a plug-in for Couchbase Lite that allows you to open and review documents in a database.  This is useful for debugging and testing your app.  To download Visual Studio Code, follow the link <a target="_blank" rel="noopener noreferrer" href="https://code.visualstudio.com/download">here</a>.

### Save files to folder on your computer from emulator

>**NOTE**: The previous tutorial in this learning path on pre-built databases showed you how to locate the database files on an Android Emulator or iOS Simulator.  Please refer to that tutorial for instructions on how to find the path. 

**For Android**:  To open the database, you must first copy it from the Emulator to our local computer.  To this open Device File Explorer in Android and browse to the local of our applications files folder as shown above.  Once in the directory, locate the directory **team1_inventory.cblite2** directory an open it to show all the files in it.  Select all the files and right click and select Save As from the pop-up menu and save the files to a location on your computer that you can access which we will use in the next step.

![Save To in Device File Explorer](device_file_explorer_save_to.jpg '#width=400px')

**For iOS**:  To open the database, you must first copy the **team1_inventory.cblite2** directory from the simulator folder to a seperate location so we don't break the database.  It's recommended to copy the database file from the simulators folder to a folder in your users home directory that you can access with Visual Studio Code. 

### Install Coucbase Lite Plug-in in Visual Studio Code

Open Visual Studio Code and select the Extensions icon from the menu.  In the search box type __"Couchbase Lite"__ and hit enter. Select the Couchbase Lite listing and click the Install button. 

![Install Coucbase Lite Plugin](couchbase_lite_plugin.jpg '#width=800px')

### Open the database in Visual Studio Code
With Visual Studio Code open click File and select Open Folder.  Browse to the folder you saved the database files in and click Open.  Now select the team1_inventory.cblite2 folder and right click on it and select Open Database.  You should get a new option listed in your file browser called CBLITE EXPLORER in Visual Studio Code.  When opening this section you should now see your database and you can see a listing of files.  If you click the chevron by each file listing you can get a listing of fields in the document.  To open the document, right click on the document name and select __"Get Document"__.

![Get Document in Visual Studio Code](vscode_get_document.png '#width=400px')

The document show open in the text editor.  To format the document select View and select Command Palette.  In the box that opens type in __"Format Document"__.  Select the Format Document option that appears.  

![Format Document in Visual Studio Code](vscode_format_document.png '#width=800px')

This will format the document to make it easier to read.  You can now scroll through the document and review the data.

## Learn More

Congratulations on completing this step of our learning path!

This step of the learning path walked you through an example of how to use the in batch operations to add 10 sample projects to a Couchbase Lite database. Check out the following links for further documenation and continue on to the next step to learn more about how to use Query Builder to render the project listing screen.

### References 

* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/document.html#batch-operations">Documentation: Batch operations</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/document.html#lbl-document">Documentation: Converting JSON string to Document</a>
* <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/kotlin/coroutines#executing-in-a-background-thread">Android Documentation: Co-Routines - Background Threading</a>
* <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/topic/libraries/architecture/coroutines#viewmodelscope">Android Documentation: ViewModel Scope</a>
