---
# frontmatter
path: "/dart-flutter-query-sql"
title:  Learn Couchbase Lite SQL++ Querying with Dart and Flutter 
short_title: Query with SQL++
description: 
  - Learn how to query documents in Couchbase Lite using SQL++
  - Use Live Queries with stream and Dart 
  - Use JSON Serialization to "deserialize" documents from the database in to Dart data class 
  - Use indexes to speed up a query and try the count function 
content_type: tutorial
filter: mobile
technology: 
  - mobile
landing_page: mobile
landing_order: 3
exclude_tutorials: true 
tags:
  - Android
  - iOS
  - Flutter
sdk_language:
  - dart 
length: 30 Mins
---

## Introduction

Couchbase Mobile supports SQL++ query strings using the SQL++ Query API.  SQL++ is Couchbase’s declarative query language that extends SQL for JSON. The structure and semantics of the query format are based on that of Couchbase Server’s SQL++ query language — see <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/index.html">N1QL Reference Guide</a> and <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/server/current/learn/data/n1ql-versus-sql.html">N1QL Data Model</a>.

In this step of the learning path you will learn the fundamentals of:


* Querying using SQL++ Strings 
* Using Live Queries with async streams
* Using JSON Serialization to "deserialize" documents from the database in to Dart data class
* Using indexes to speed up a query
* Using the count function with the SQL++ API
* Using the LIKE operator to search for documents with a specific value in a field

## App Overview

While the demo app has a lot of functionality, this step will walk you through:

* Log in into the application
* Selecting a project from the list of projects
* Scrolling the list of stock items audited
* Review the code for displaying stock items that have been audited

> **NOTE**:  This step assumes you completed the previous step `Batch operations` that loaded the sample data into the application.  This part of the learning path will not work if you don't complete the previous steps.

## Installation

### Fetching App Source Code

#### Clone Source Code

* If you haven't already cloned the repo from the previous step, clone the `Learn Couchbase Lite with Dart and Flutter` repository from GitHub.

```bash
git clone https://github.com/couchbase-examples/flutter_cbl_learning_path.git
```

### Try it out

* Open src/build.gradle using Android Studio.
* Build and run the project.
* Log in to the app with  **_"demo@example.com"_** and **_"P@ssw0rd12"_** for user Id and password fields respectively.
* Verify that you see sample projects on the screen.  Tapping on a Project will bring up the audit inventory counts for that project.  
* If you do not see sample projects and inventory audits, please complete the previous step **Batch operations** to load sample data before continuing.

![Audit Listing,400](audit_listing.gif)

### The Audit Document

The sample app was loaded with a collection of `Document` with a _"type"_ property of _"audit"_ in the previous sections of the learning path.  Each document represents a item that that a team would would record with how many of those items they found in the warehouse while working on a project. 

An example of a document would be:
```json
{
	"team": "team1",
	"modifiedOn": "2022/10/12",
	"documentType": "audit",
	"createdBy": "demo@example.com",
	"modifiedBy": "demo@example.com",
	"projectId": "c4a8fbac-083a-4ad5-87e5-2fe1c03a3689",
	"createdOn": "2022/10/12",
	"auditId": "d3fb4d2e-0c75-4a85-b9b9-418a3b5f8303",
	"notes": "Found item Langres Psion Ale - Sweet Ale with Langres flavors in warehouse",
	"auditCount": 42330,
	"stockItem": {
		"name": "Langres Psion Ale",
		"description": "Sweet Ale with Langres flavors",
		"itemId": "e53dddf3-2058-4963-9293-66a87c84b29b",
		"price": 52.76,
    "style": "Imperial Stout"
	}
}
```

#### The Audit Data Class 
When a _"audit"_ item is retreived from the database it is stored within an data class of type **Audit**.

```dart
@JsonSerializable(explicitToJson: true)
class Audit {
 String auditId;
 String projectId;
 StockItem? stockItem;
 int auditCount;
 String notes;
 String documentType = "audit";

 //security tracking
 String team;
 String createdBy;
 String modifiedBy;
 DateTime? createdOn;
 DateTime? modifiedOn;

 Audit({
  required this.auditId,
  required this.projectId,
  required this.stockItem,
  required this.auditCount,
  required this.notes,
  required this.team,
  required this.createdBy,
  required this.modifiedBy,
  required this.createdOn,
  required this.modifiedOn});

 factory Audit.fromJson(Map<String, dynamic> json) => _$AuditFromJson(json);

 Map<String, dynamic> toJson() => _$AuditToJson(this);
}
```

## Exploring the SQL++ Query String API with the Count Function

The SQL++ Query String API in Couchbase Lite is extensive.  On the Developer - Database Information screen we display the number of audit documents found in the inventory database.  The `SQL++ Query String` API along with the count function was used to calculate this number.  To see the Developer Information screen:

* Launch the Invenory Application on your emulator
* Login in using the username *demo@example.com* and password *P@ssw0rd12* 
* Click the Drawer menu icon (sometimes referred to the Hamburger icon) and tap on Developer
* Tap on the Database Information button

### Counting number of documents by type

The "DeveloperInfoWidget" screen displays the count of how many documents are in the inventory database with the type set to 'audit'.  

![Developer - Database Information](dev_info_count.png '#width=400px')

The DeveloperInfoWidget class obtains this information from the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/developer/bloc/dev_info_bloc.dart#L47"> **DevInfoBloc**</a> class, which emits this information.   The `DevInfoBloc` calls the AutitRepository which runs the query to calculate the count.

```dart
final auditCounter = await _auditRepository.count();
```
* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/audit/data/audit_repository.dart#L72"> **audit_repository.dart**</a> file and locate the `count` function.

```dart
Future<int> count() async {
```

* We build the Query using the `SQL++ Query String` API that will look for Documents that match the specified criteria.

```kotlin
var count = 0;
try {
 var attributeCount = 'count';

 var db = _databaseProvider.inventoryDatabase;
 if (db != null) {
  var query = await AsyncQuery.fromN1ql(db,
   'SELECT COUNT(*) AS count FROM _ AS item WHERE documentType="$auditDocumentType"'); // <1>
  var result = await query.execute(); // <2>
  var results = await result.allResults(); // <3>
  count = results.first.integer(attributeCount); // <4>
 }
} catch (e) {
 debugPrint(e.toString());
}
return count;
```
1. Call the AsyncQuery API fromN1ql method and passing the database and the query as a string. 
2. We run the Query by calling the `execute()` method. 
3. We run the `allResults()` method to get all the results from the result. 
4. We get the results by looking at the first result in the collection and getting an integer value for the key "count" which we defined in the `SELECT` clause

## Futher Exploring the SQL++ Query String API

There are several minor but notable behavior differences between SQL++ for Mobile queries and N1QL for Server.  More information on the differences can be found in the <a target="_blank" rel="noopener noreferrer"  href="https://docs.couchbase.com/couchbase-lite/current/swift/query-n1ql-mobile-server-diffs.html">SQL++ Server Differences</a> documentation. In our example, we will be using the API to make a simple _pattern matching_ query using the equalTo operator.  This example will use Live Query with Dart to return a stream of changes.

### Fetching Audit Documents

From the "Login" screen, when a user logs in with the proper credentials they are presented with a list of projects there team is assigned to work on.  From the project listing when a user taps on a project they are presented with a listing of audit items that was recorded as inventory items at the location of the project. 

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/audit/views/audit_list_widget.dart#L17"> **audit_list_widget.dart**</a> file and locate the `build` function.

* The live query is an <a target="_blank" rel="noopener noreferrer" href="https://api.dart.dev/stable/2.18.2/dart-async/Stream-class.html">AsyncListenStream<T></a> which is emit to state as List<Audit> in the `AuditListBloc`. 

> **TIP**:  Anytime documents change or are added to the database that satisify this query, the listen(change) would fire in the AuditListBloc and the AuditListBloc would fire the AuditListLoadedEvent that would update state.  The `live query` API can dynmamically update your UI without the need for end user interaction, which will come in handy in future sections of the learning path when we review replication.  

```dart
case DataStatus.loaded:
case DataStatus.changed:
 return SafeArea(
  child: ListView.builder(
   itemCount: state.items.length,
   itemBuilder: (BuildContext context, int index) {
    return  GestureDetector(
     onTap: () => {
      routerService.routeTo(
       ScreenRoute(
        routeToScreen: RouteToScreen.auditEditor,
        audit: state.items[index],
        projectId: state.items[index].projectId)
      )
    },
  child: AuditCard(item: state.items[index], routerService: routerService)
  );
}));
```

* To see how the `List<Audit>` items is created, open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/audit/bloc/audit_list_bloc.dart#L44"> **audit_list_bloc.dart**</a> file and locate the `_onInitialize` function.

```dart
  Future<void> _onInitialize (
      AuditListInitializeEvent event, 
      Emitter<AuditListState> emit) async {
```
* The bloc listens to the stream provided by the `AuditRepository.getDocuments` method.

```dart
try {
 emit(state.copyWith(status: DataStatus.loading));
 // <1>
 var stream = await _repository.getDocuments(event.projectId);
 // <2>
 if (stream != null) {
  // <3>
  stream.listen((change) async {
  // <4>
   var items = <Audit>[];
   // <5>
   var results = await change.results.allResults();
   //<6>
   for (var result in results) {
    // <7>
    var map = result.toPlainMap();
    var dao = AuditDao.fromJson(map);
    // <8>
    items.add(dao.item);
   }
  // <9>
  add(AuditListLoadedEvent(items: items));
  });
 }
} catch (e) {
 emit(state.copyWith(status: DataStatus.error, error: e.toString()));
 debugPrint(e.toString());
}
```

1. Get the stream from the repository based on passing the projectId that was selected.
2. Check the stream to see if it is null.  If it is not null, then we will listen to the stream.
3. Listen to the stream for changes via the `change` parameter. 
4. Create local variable to hold the list of Audits items.
5. Get the `ResultSet` from the change object.
6. Loop through the results in the Result Set.
7. Convert the results to a plain map and then to a DOA (Data Access Object).
8. Add the Audit item to the list. 
9. If the bloc is not closed, then emit the AuditListLoadedEvent with the list of Audit items.  The bloc could be closed for several reasons including the app going to the background.  If the change fires reason while the app is in the background, this would be bad since the application is not in the foreground and the UI can't be updated.  The `isClosed` check prevents this from happening.

* To see how to build a live query that returns a stream, open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/audit/data/audit_repository.dart#L19"> **audit_repository.dart**</a> file and locate the getDocuments function.

```dart
Future<AsyncListenStream<QueryChange<ResultSet>>?>? getDocuments(String projectId) async {
```

* We first get the current authenticated user so we can get the team that the user is assigned to.  
* Next we build a Query using the AsyncQuery classes fromN1ql method that takes in a database and SQL++ query.  Notice how parameter names start with a dollar sign and the dollar sign must be escaped with a \.

```dart
// <1>
var query = await AsyncQuery.fromN1ql(db, "SELECT * FROM _ AS item WHERE documentType=\"audit\" AND projectId=\$projectId AND team=\$team");

//<2>
var parameters = Parameters();
parameters.setValue(projectId, name: "projectId");
parameters.setValue(team, name: "team");

//<3>
await query.setParameters(parameters);
return query.changes();
```

1. Build a query using the AsyncQuery `fromN1ql` method 
2. Create a paramters collection to store the parameters in.  Add the parameters and there values to the collection.
3. Set the query parameters property to the parameter collection and return the stream.

#### Indexing the Query 

* Creating indexes for non-FTS based queries is optional. However, to speed up queries, you can create indexes on the properties that you would query against. Indexing is handled eagerly.

* In the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/database/database_provider.dart#L254">**database_provider.dart**</a>  file, locate the `createAuditIndex` function. 
* We create an index on the `type`, `projectId`, and `team` properties of the documents in the _inventory_ database. 

```dart
Future<void> _createAuditIndex() async {
 final documentTypeExpression =
  Expression.property(documentTypeAttributeName);
 final projectIdExpression = Expression.property(projectIdAttributeName);
 final teamExpression = Expression.property(teamAttributeName);

 final valueIndexItems = {
  ValueIndexItem.expression(documentTypeExpression),
  ValueIndexItem.expression(projectIdExpression),
  ValueIndexItem.expression(teamExpression),
 };

 final index = IndexBuilder.valueIndex(valueIndexItems);

 var inventoryDb = inventoryDatabase;
 if (inventoryDb != null) {
  final indexes = await inventoryDb.indexes;
  if (!(indexes.contains(auditIndexName))) {
   await inventoryDb.createIndex(auditIndexName, index);
  }
 }
}
```
1. Create the expresion for the `documentType` attribute.  
1. Create the expresion for the `projectId` attribute.  
2. Create the expression for the `team` attribute.
3. Create a collection of valueIndexItems to set the index to. 
4. Create the index using the IndexBuilder API. 
5. Get a reference to the _inventory_ database for null checking purproses. 
6. Check the database to make sure it's not null
7. Get the list of indexes from the database.  We don't want to try to create the index if it already exists.
8. Check to see if the index already exists.
9. If the index doesn't exist, then create it.

## SQL++ Query String API - Searching for Stock Items with the LIKE Operator 

The SQL ++ Query String API supports serveral operators including the LIKE which can be used for string matching.  We use the LIKE operator on the data editor screen for audits to find a stock item to add to a audit.  Let's review the code.  

> **NOTE**: The like operator performs case sensitive matches.  To perform case insensitive matching, use lowercase or uppercase functions to ensure all comparators have the same case, thereby removing the case issue.

On the Audit Editor screen we provide a link to the Stock Item Section screen.  To see the Audit Editor screen:

* Launch the Invenory Application on your emulator
* Login in using the username *demo@example.com* and password *P@ssw0rd12* 
* Tap on one of the Projects to bring up the Audit List screen   
* Tap the + button to add a new audit
* Tap the button `Select Stock Item` 

![Audit Editor screen](audit_editor_screen_noitem.selected.png '#width=300px')

* In the Name box enter ipa 
* In the Description box enter pepper 
* Hit the Search button
* A listing of stock items should return that match these results

![Select Stock Item screen](select_audit_stockitem.png '#width=300px')

Let's review the code for the Stock Item Section screen.

### Stock Item Selection 

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/audit/views/audit_editor_form.dart#L222"> **audit_editor_form.dart**</a> file and locate the `_StockItemSearchButton` class.

* The build method adds an Elevated Button
* The onPressed method adds the blocs StockItemSearchSubmitChangedEvent when a user taps on the Search button. 
 
```dart
Widget build(BuildContext context) {
 return BlocBuilder<StockItemSearchBloc, StockItemSearchState>(
  builder: (context, state) {
   if (state.status == FormEditorStatus.dataSaved ||
    state.status == FormEditorStatus.cancelled) {
     Navigator.of(context).pop();
    return const Text('');
   } else {
    return Padding(
     padding: const EdgeInsets.only(top: 16.0, left: 8.0, right: 8.0),
     child: ElevatedButton(
      onPressed: () {
       context
        .read<StockItemSearchBloc>()
        .add(const StockItemSearchSubmitChangedEvent());
      },
      child: const Padding(
       padding: EdgeInsets.all(8.0),
        child: Text(
         "Search",
         style: TextStyle(color: Colors.white, fontSize: 24.0),
    ))),
   );
  }
 });
}
``` 
 
* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/audit/bloc/stockitem_search_bloc.dart#L40"> **stockitem_search_bloc.dart**</a> file and locate the `_onSubmitted` method.

```dart
FutureOr<void> _onSubmitted(
 StockItemSearchSubmitChangedEvent event,
 Emitter<StockItemSearchState> emit) async {

 if (state.searchName.isNotEmpty){
  try {
   var items = await _repository.search(state.searchName, state.searchDescription);
   if (items.isNotEmpty){
    emit(state.copyWith(error: '', status: FormEditorStatus.dataLoaded, items: items));
   } else {
    emit(state.copyWith(error: 'No stock items found matching criteria.', status: FormEditorStatus.error));
   }
  } catch (e){
  emit(state.copyWith(error: e.toString(), status: FormEditorStatus.error));
  }
 } else {
  emit(state.copyWith(error: 'Error - Search Name can\'t be blank', status: FormEditorStatus.error));
 }
}
```
1. Check to make sure that the name field is not empty.  If it is, then we can't search for a stock item as name is a required field. 
2. Call the repository to search for stock items.  The repository will use the Query API to search for stock items. 
3. If the search returns a list of stock items, then emit the state with the list of stock items. 
4. If not, then emit the state with an error message. 

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/audit/data/stock_item_repository.dart#L38"> **stock_item_repository.dart**</a> file and locate the `search` method.

```dart
Future<List<StockItem>> search(
 String? searchName,
 String? searchDescription) async {
```
* This method does not use live query, so we return a List of StockItem objects.

```dart
List<StockItem> items = [];
 try {
  if (searchName != null) {
   var db = _databaseProvider.warehouseDatabase;
   if (db != null) {
   // <1>
    var queryString = 'SELECT * FROM _ AS item WHERE documentType="$documentType" AND lower($nameAttributeName) LIKE (\'%\' || \$parameterName || \'%\')';
    // <2>
    var parameters = Parameters();
    // <3>
    parameters.setString(searchName.toLowerCase(), name: 'parameterName');
    // <4>
    if (searchDescription != null && searchDescription.isNotEmpty){
     queryString = '$queryString AND lower($descriptionAttributeName) LIKE (\'%\' || \$parameterDescription || \'%\')';
     parameters.setString(searchDescription, name: 'parameterDescription');
    }
    // <5>
    var query = await AsyncQuery.fromN1ql(db, queryString);
    // <6>
    query.setParameters(parameters);
    // <7>
    var result = await query.execute();
    var results = await result.allResults();
    // <8>
    for(var r in results){
     var map = r.toPlainMap();
     var stockItemDoa = StockItemDao.fromJson(map);
     items.add(stockItemDoa.item);
   }
  }
 }
} catch (e){
  debugPrint(e.toString());
}
return items;
```
1. Create a query string using SQL++ syntax.  Notice the like statement % must be escaped charactered with a backslash. 
2. Create a parameters object. 
3. Add the searchName parameter to the parameters object. 
4. Check the search description to see if it has a value in it.  If it does add it to the query string and parameters object.
5. Query using the AsyncQuery class using the fromN1ql method.
6.  Set the parameters on the query object.
7.  Execute the query and get the results.
8.  Loop through the results and add them to the list of StockItem objects.

## Learn More

Congratulations on completing this step of our learning path!

This step of the learning path walked you through the SQL++ Query API in Couchbase Lite and used it to return documents from the database using serveral methods. Check out the following links for further documenation and continue on to the next step.

### References 

* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-n1ql-mobile.html">Documentation: SQL++ Query Strings</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-n1ql-mobile.html#purpose-21">Documentation: SQL++ Query Strings - Comparision Operators</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-n1ql-mobile.html#lbl-functions">Documentation: SQL++ Query Strings - Functions</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-n1ql-mobile-server-diffs.html">Documentation: SQL++ Differences</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-resultsets.html">Documentation: Result Sets</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-live.html">Documentation: Live Query - Working with Queries</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-troubleshooting.html">Documentation: Query Troubleshooting
</a>
