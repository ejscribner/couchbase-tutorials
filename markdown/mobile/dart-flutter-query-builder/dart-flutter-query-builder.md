---
# frontmatter
path: "/dart-flutter-query-builder"
title:  Couchbase Lite Query Builder Engine with Dart and Flutter 
short_title: Query Builder  
description: 
  - Learn how to query documents in Couchbase Lite
  - Explore the Query Builder Engine
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

Couchbase Lite brings powerful querying and Full-Text-Search(FTS) capabilties to the edge. The query builder interface is based on <a target="_blank" rel="noopener noreferrer" href="https://www.couchbase.com/sqlplusplus">SQL++</a>, Couchbase’s declarative query language that extends <a target="_blank" rel="noopener noreferrer" href="https://www.sqlite.org/index.html">SQL</a> for JSON. If you are familiar with SQL, you will feel right at home with the semantics of the new API.  The query builder API is designed using the <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Fluent_interface">Fluent API Design Pattern</a>, and it uses method cascading to read to like a Domain Specific Language (DSL). This makes the interface very intuitive and easy to understand.

In this step of the learning path you will learn the fundamentals of:

* Using the QueryBuilder API 
* Using Live Queries with streams
* Using JSON Serialization to "deserialize" documents from the database in to dart classes
* Using indexes to speed up a query
* Using the count function with the QueryBuilder API
* Using the LIKE operator to search for documents with a specific value in a field

## App Overview

While the demo app has a lot of functionality, this step will walk you through:

* Log in into the application
* Scrolling the list of projects 
* Review the code for displaying projects 

> **NOTE**:  This step assumes you completed the previous step `Batch operations` that loaded the sample data into the application.   This part of the learning path will not work if you don't complete the previous steps.

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
* Verify that you see sample projects on the screen.  If you do not see sample projects, please complete the previous step **Batch operations** to load sample data before continuing.

![Project Listing,400](project_listing.gif)

## Data Model

A reminder that Couchbase Lite is a JSON Document Store. A `Document` is a logical collection of named fields and values. The values are any valid JSON types. In addition to the standard JSON types, Couchbase Lite supports `Date` and `Blob` data types. While it is not required or enforced, it is a recommended practice to include a _"documentType"_ property that can serve as a namespace for related documents.

### The Project Document

The sample app was loaded with a collection of `Document` with a _"documentType"_ property of _"project"_ in the previous step.  Each document represents a project that a team would would work on and have to complete before the due date based on a selected location, which is another document type.   

An example of a document would be:

```json
{
	"team": "team1",
	"modifiedOn": "2022-10-12",
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
	"createdOn": "2022-10-10"
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

## Exploring the Query Builder API with the Count Function

The Query API in Couchbase Lite is extensive.  On the Developer - Database Information screen we display the number of warehouse documents found in the warehouse database.  The `QueryBuilder` API along with the count function was used to calculate this number.  To see the Developer Information screen:

* Launch the Invenory Application on your Android emulator or iOS simulator.
* Login in using the username *demo@example.com* and password *P@ssw0rd12* 
* Click the Drawer menu icon (sometimes referred to the Hamburger icon) and tap on Developer
* Tap on the Database Information button

### Counting number of documents by type

The "DeveloperInfoWidget" screen displays the count of how many documents are in the warehouse database with the type set to 'warehouse'.  

![Developer - Database Information](developer-database-info.png '#width=300px')

The DeveloperInfoWidget class obtains this information from the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/developer/bloc/dev_info_bloc.dart#L47"> **DevInfoBloc**</a> class, which emits this information.   The `DevInfoBloc` calls the WarehouseRepository which runs the query to calculate the count.

```dart
final warehouseCounter = await _warehouseRepository.count();
```

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/project/data/warehouse_repository.dart#L22"> **warehouse_repository.dart**</a> file and locate the `count` function.

```dart
Future<int> count() async {
```

* We build the Query using the `QueryBuilder` API that will look for Documents that match the specified criteria.

```dart
var count = 0;
try {
 const attributeCount = 'count';

 final db = _databaseProvider.warehouseDatabase;
 if (db != null) {
  final query = QueryBuilder.createAsync()
   .select(
    SelectResult.expression(Function_.count(Expression.string("*")))
   .as(attributeCount))
  .from(DataSource.database(db))
  .where(Expression.property(attributeDocumentType)
  .equalTo(Expression.string(documentType))); // <1>

  final result = await query.execute(); // <2>
  final results = await result.allResults(); // <3>
  count = results.first.integer(attributeCount); // <4>
 }
} catch (e) {
 debugPrint(e.toString());
}
return count;
```
1. Call the Query Builder API to create a Query 
2. Call the `execute` function to execute the query 
3. Call the `allResults` function to get all the results from the query 
4. We get the results by looking at the first result in the collection and getting an integer value for the key which we defined in the `select` clause as `attributeCount`.

## Further Exploring the Query Builder API - return List of Projects Documents

The Query Builder API in Couchbase Lite is extensive. In our second example, we will be using the `QueryBuilder` API to make a simple _pattern matching_ query using the equalTo operator.  This example will use Live Query with dart streams. 

### Fetching Project Documents

From the "Login" screen, when a user logs in with the proper credentials they are presented with a list of projects there team is assigned to work on.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/project/views/project_list_widget.dart#L14"> **project_list_widget.dart**</a> file and locate the `build` function.

* The live query is an <a target="_blank" rel="noopener noreferrer" href="https://api.dart.dev/stable/2.18.2/dart-async/Stream-class.html">AsyncListenStream<T></a> which is emit to state as List<Project> in the `ProjectListBloc`.

> **TIP**:  Anytime documents change or are added to the database that satisify this query, the listen(change) would fire in the ProjectListBloc and the ProjectListBloc would fire the ProjectListLoadedEvent that would update state.  The `live query` API can dynmamically update your UI without the need for end user interaction, which will come in handy in future sections of the learning path when we review replication.  

```dart
case DataStatus.loaded:
case DataStatus.changed:
 return SafeArea(
  child: ListView.builder(
   itemCount: state.items.length,
   itemBuilder: (BuildContext context, int index) {
    return GestureDetector(
     onTap: () => {
      routerService.routeTo(ScreenRoute(
      routeToScreen: RouteToScreen.audits,
      projectId: state.items[index].projectId,
      auditListBloc:
       BlocProvider.of<AuditListBloc>(context)))
     },
     child: ProjectCard(
      project: state.items[index],
      routerService: routerService));
 }));
```

* To see how the `List<Project>` items is created, open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/project/bloc/project_list_bloc.dart#L49"> **project_list_bloc.dart**</a> file and locate the `_onInitialize` method.

```dart
Future<void> _onInitialize(
      ProjectListInitializeEvent event, 
      Emitter<ProjectListState> emit) async {
```
* The bloc listens to the stream provided by the `ProjectRepository.getDocuments()` method.

```dart
if (_liveQueryStream == null) {
 // <1>
 _liveQueryStream = await _repository.getDocuments();
// <2>
 if (_liveQueryStream != null) {
 // <3>
 var stream = _liveQueryStream;
 emit(state.copyWith(status: DataStatus.loading));
 // <4>
 stream?.listen((change) async {
  // <5>
  var items = <Project>[];
  // <6>
  var results = await change.results.allResults();
  // <7>
  for (var result in results) {
    // <8>
    var map = result.toPlainMap();
    var dao = ProjectDao.fromJson(map);
   // <9>
    items.add(dao.item);
   }
  // <10>
   if (!isClosed) {
   add(ProjectListLoadedEvent(items: items));
   }
  });
//await stream?.listening;
 }
}
```
1. Check the _liveQueryStream to see if it is null.  If it is null, then we will create a new stream, otherwise we assume the stream is already setup and being listened to.
2. Set the _liveQueryStream to the `AsyncListenStream` of `QueryChange<ResultSet>` returned by the `ProjectRepository.getDocuments()` method.
3. Get a local reference to the stream for nully checking purposes.
4. Listen to the stream for changes via the `change` parameter. 
5. Create local variable to hold the list of Project items.
6. Get the `ResultSet` from the change object.
7. Loop through the results in the Result Set.
8. Convert the results to a plain map and then to a DOA (Data Access Object).
9. Add the Project item to the list. 
10. If the bloc is not closed, then emit the ProjectListLoadedEvent with the list of Project items.  The bloc could be closed for several reasons including the app going to the background.  If the change fires reason while the app is in the background, this would be bad since the application is not in the foreground and the UI can't be updated.  The `isClosed` check prevents this from happening.

* To see how to build a live query that returns a stream, open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/project/data/project_repository.dart#L36"> **project_repository.dart**</a> file and locate the getDocuments function.

```dart
 Future<AsyncListenStream<QueryChange<ResultSet>>?>? getDocuments() async {
```

* We first build a Query using the `QueryBuilder` API that will look for Documents that match the specified criteria.

```kotlin
var query = QueryBuilder.createAsync() //<1>
 .select(SelectResult.all()) //<2>
 .from(DataSource.database(db).as('item')) //<3>
 .where(Expression.property(attributeDocumentType)
  .equalTo(Expression.string(projectDocumentType))
 .and(Expression.property('team')
  .equalTo(Expression.string(team)))); // <4>
return query.changes(); // <5>
```
1. Create a query using the `QueryBuilder` API and the createAsync method.
2. The `SelectResult.all()` specifies that we are interested in all properties in Documents that match the specified criteria
3. The DataSource.database(db).as('item') specified the Data Source. 
4. The `Expression` builds a `QueryExpression` used to find documents where the `documentType` property and the `team` properties are equal to the values passed in
5.  Return any changes to the documents that match this criteria by callling the `query.changes()` method which returns the AsyncListenStream of QueryChange<ResultSet>.

#### Indexing the Query 

* Creating indexes for non-FTS based queries is optional. However, to speed up queries, you can create indexes on the properties that you would query against. Indexing is handled eagerly.

* In the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/database/database_provider.dart#L198">**database_provider.dart**</a>  file, locate the `_createTeamDocumentTypeIndex` method. 
* We create an index on the `documentType` and `team` properties of the documents in the _inventory_ database. 

```dart
Future<void> _createTeamDocumentTypeIndex() async {
 final documentTypeExpression =
  Expression.property(documentTypeAttributeName); //<1>
 final teamExpression = Expression.property( teamAttributeName); //<2>
 final valueIndexItems = {
  ValueIndexItem.expression(documentTypeExpression),
  ValueIndexItem.expression(teamExpression)
 }; //<3>
 final index = IndexBuilder.valueIndex(valueIndexItems);  //<4>
 var inventoryDb = inventoryDatabase; //<5>
 if (inventoryDb != null) {         //<6> 
  final indexes = await inventoryDb.indexes; //<7>
  if (!(indexes.contains(teamIndexName))) {  //<8>
   await inventoryDb.createIndex(teamIndexName, index); //<9>
  }
 }
}
```
1. Create the expresion for the `documentType` attribute.  
2. Create the expression for the `team` attribute.
3. Create a collection of valueIndexItems to set the index to. 
4. Create the index using the IndexBuilder API. 
5. Get a reference to the _inventory_ database for null checking purproses. 
6. Check the database to make sure it's not null
7. Get the list of indexes from the database.  We don't want to try to create the index if it already exists.
8. Check to see if the index already exists.
9. If the index doesn't exist, then create it.

## Query Builder API - Searching for Warehouses with the LIKE Operator 

The Query Builder API supports serveral operators including the LIKE which can be used for string matching.  We use the LIKE operator on the data editor screen for Projects to find a warehouse to add to a project.  Let's review the code.  

> **NOTE**: The like operator performs case sensitive matches.  To perform case insensitive matching, use lowercase or uppercase functions to ensure all comparators have the same case, thereby removing the case issue.

On the Project Editor screen we provide a link to the Warehouse Section screen.  To see the Project Editor screen:

* Launch the Invenory Application on your Android Emulator or iOS Simulator.
* Login in using the username *demo@example.com* and password *P@ssw0rd12* 
* Click the + icon to add a Project  
* Type in a name for the project on the Name field.  
* Tap the button `Select Warehouse` 

![Project Editor screen](project_editor_screen_nowarehouse_selected.png '#width=300px')

* In the City box enter Sa
* In the State box enter Ca
* Hit the Search button
* A listing of warehouses should return that match these results

![Select Project screen](select_project_warehouse.png '#width=300px')

Let's review the code for the Warehouse Section screen.

### Warehouse Selection 

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/project/views/project_editor_form.dart#L324"> **project_editor_form.dart**</a> file and locate the `_WarehouseSearchButton` class.

* The build method adds an Elevated Button
* The onPressed method adds the blocs WarehouseSearchSubmitChangeEvent when a user taps on the Search button. 
 
```dart
Widget build(BuildContext context) {
 return BlocBuilder<WarehouseSearchBloc, WarehouseSearchState>(
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
       .read<WarehouseSearchBloc>()
       .add(const WarehouseSearchSubmitChangedEvent());
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
* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/project/bloc/warehouse_search_bloc.dart"> **warehouse_search_bloc.dart**</a> file and locate the `_onSubmitted` method.

```dart
FutureOr<void> _onSubmitted(
 WarehouseSearchSubmitChangedEvent event, 
 Emitter<WarehouseSearchState> emit) async {
 if (state.searchCity.isNotEmpty) { // <1>
 //get warehouse list from repository
 try {
  var items =
   await _repository.search(state.searchCity, state.searchState);  // <2>
  if (items.isNotEmpty) {
   emit(state.copyWith(
    error: '',
    status: FormEditorStatus.dataLoaded,
    warehouses: items)); //<3>
   } else {
   emit(state.copyWith(
    error: 'No warehouses found matching criteria.',
    status: FormEditorStatus.error)); //<4>
   }
  } catch (e) {
  emit(state.copyWith(
   error: e.toString(), status: FormEditorStatus.error));
  }
 } else {
 emit(state.copyWith(
  error: 'Error - City can\'t be blank',
  status: FormEditorStatus.error));
 }
}
```
1. Check to make sure that the city field is not empty.  If it is, then we can't search for a warehouse as city is a required field. 
2. Call the repository to search for warehouses.  The repository will use the Query Builder API to search for warehouses. 
3. If the search returns a list of warehouses, then emit the state with the list of warehouses. 
4. If not, then emit the state with an error message. 

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/project/data/warehouse_repository.dart#L72"> **warehouse_repository.dart**</a> file and locate the `search` method.

```dart
Future<List<Warehouse>> search(String searchCity, String? searchState) async {
```
* This method does not use live query, so we return a List of Warehouse objects.

```dart
List<Warehouse> items = [];
 try {
  var db = _databaseProvider.warehouseDatabase;
  if (db != null) {
   // <1>
   var whereExpression = Function_
    .lower(Expression.property(attributeDocumentType))
    .equalTo(Expression.string(documentType));
   // <2>
   var cityExpression = Function_
    .lower(Expression.property(cityAttributeName))
    .like(Expression.string("%${searchCity.toLowerCase()}%"));

   whereExpression = whereExpression.and(cityExpression);

   // <3>
   if(searchState != null && searchState.isNotEmpty){
    var stateExpression = Function_.lower(Expression.property(stateAttributeName))
     .like(Expression.string("%${searchState.toLowerCase()}%"));

    whereExpression = whereExpression.and(stateExpression);
   }

   // <4>
  var query = QueryBuilder.createAsync()
   .select(SelectResult.all())
   .from(DataSource.database(db).as('warehouse'))
   .where(whereExpression);

  // <5>
  var result = await query.execute();
  var results = await result.allResults();

  // <6>
  for (var r in results) {
   var map = r.toPlainMap();
   var warehouseDoa = WarehouseDao.fromJson(map);
   items.add(warehouseDoa.warehouse);
   }
  }  
 } catch (e) {
  debugPrint(e.toString());
 }
return items;
```
1. Create a query expression off the type attribute and use the equalTo function to pass in the documentType value.  This makes sure we only match warehouse documents.
2. Create a query expression off the city attribute and use the like function to pass in the searchCity value.  We make sure to use the searchCity toLowerCase method to make the search case insensitive. 
3. If the searchState value is not null, then we will create a query expression off the state attribute and use the like function to pass in the searchState value.  We make sure to use the searchState toLowerCase method to make the search case insensitive. 
4. We will build a query using the QueryBuilder API to select all the results from the database and pass in our whereQueryExpression with our like statement(s). 
5. We loop through all the results and add them to the warehouses list that is then returned. 

## Learn More

Congratulations on completing this step of our learning path!

This step of the learning path walked you through the Query Builder API in Couchbase Lite and used it to return documents from the database and we looked at calling the Query API built-in count function. Check out the following links for further documenation and continue on to the next step to learn more about how to use Query Builder with SQL++ syntax.

### References 

* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/querybuilder.html">Documentation: Querybuilder</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/querybuilder.html#lbl-like-ops">Documentation: Querybuilder - Like Operator</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/mobile/3.0.0/couchbase-lite-android/com/couchbase/lite/Function.html">API Documentation: Querybuilder - Functions</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-resultsets.html">Documentation: Result Sets</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-live.html">Documentation: Live Query - Working with Queries</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-troubleshooting.html">Documentation: Query Troubleshooting
</a>
