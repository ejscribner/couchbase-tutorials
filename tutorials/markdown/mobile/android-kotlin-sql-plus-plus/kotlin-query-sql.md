---
# frontmatter
path: "/android-kotlin-query-sql"
title:  Learn Couchbase Lite SQL++ Querying with Kotlin and Jetpack Compose
short_title: Query with SQL++
description: 
  - Learn how to query documents in Couchbase Lite using SQL++
  - Use Live Queries with queryChangeFlow and Kotlin Co-Routine Flows using Live Data and Mutable Live Data 
  - Use JSON Serialization to "deserialize" documents from the database in to Kotlin data class 
  - Use indexes to speed up a query and try the count function with the QueryBuilder API
content_type: tutorial
filter: mobile
technology: 
  - mobile
landing_page: mobile
landing_order: 3
exclude_tutorials: true 
tags:
  - Android
  - SQL++ (N1QL)
sdk_language:
  - kotlin
length: 30 Mins
---

## Introduction

Couchbase Mobile supports SQL++ query strings using the SQL++ Query API.  SQL++ is Couchbase’s declarative query language that extends SQL for JSON. The structure and semantics of the query format are based on that of Couchbase Server’s SQL++ query language — see <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/index.html">N1QL Reference Guide</a> and <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/server/current/learn/data/n1ql-versus-sql.html">N1QL Data Model</a>.

In this step of the learning path you will learn the fundamentals of:


* Querying using SQL++ Strings 
* Using Live Queries with queryChangeFlow and Kotlin Co-Routine Flows using Live Data and Mutable Live Data
* Using JSON Serialization to "deserialize" documents from the database in to Kotlin data class
* Using indexes to speed up a query
* Using the count function with the QueryBuilder API
* Using the LIKE operator to search for documents with a specific value in a field

## App Overview

While the demo app has a lot of functionality, this step will walk you through:

* Log in into the application
* Selecting a project from the list of projects
* Scrolling the list of stock items audited
* Review the code for displaying stock items that have been audited

> **NOTE**:  This step assumes you completed the previous step <a target="_blank" rel="noopener noreferrer"  href="android-kotlin-batch-operations?learningPath=learn/android-kotlin">`Batch operations`</a> that loaded the sample data into the application.  This part of the learning path will not work if you don't complete the previous steps.

## Installation

### Fetching App Source Code

#### Clone Source Code

* If you haven't already cloned the repo from the previous steps, clone the `Learn Couchbase Lite with Kotlin and Jetpack Compose` repository from GitHub.

```bash
git clone https://github.com/couchbase-examples/android-kotlin-cbl-learning-path.git
```
### Try it out

* Open src/build.gradle using Android Studio.
* Build and run the project.
* Log in to the app with  **_"demo@example.com"_** and **_"P@ssw0rd12"_** for user Id and password fields respectively.
* Verify that you see sample projects on the screen.  Tapping on a Project will bring up the audit inventory counts for that project.  
* If you do not see sample projects and inventory audits, please complete the previous step <a target="_blank" rel="noopener noreferrer"  href="android-kotlin-batch-operations?learningPath=learn/android-kotlin">**Batch operations**</a> to load sample data before continuing.

![Audit Listing,400](audit_listing.gif)

### The Audit Document

The sample app was loaded with a collection of `Document` with a _"type"_ property of _"audit"_ in the previous sections of the learning path.  Each document represents a item that that a team would would record with how many of those items they found in the warehouse while working on a project. 

An example of a document would be:
```json
{
	"team": "team1",
	"modifiedOn": "1656804470003",
	"documentType": "audit",
	"createdBy": "demo@example.com",
	"modifiedBy": "demo@example.com",
	"projectId": "c4a8fbac-083a-4ad5-87e5-2fe1c03a3689",
	"createdOn": "1656804470003",
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

```kotlin
@Keep
@Serializable
@ExperimentalSerializationApi
data class Audit (
    var auditId: String = "",
    var projectId: String = "",
    var stockItem: StockItem? = null,
    var auditCount: Int = 0,
    var documentType: String = "",
    var notes: String = "",
    //security tracking
    var team: String = "",
    var createdBy: String = "",
    var modifiedBy: String = "",
    @Serializable(with = DateSerializer::class)
    var createdOn: Date? = null,
    @Serializable(with = DateSerializer::class)
    var modifiedOn: Date? = null
)
```

## Exploring the SQL++ Query String API with the Count Function

The SQL++ Query String API in Couchbase Lite is extensive.  On the Developer - Database Information screen we display the number of audit documents found in the inventory database.  The `SQL++ Query String` API along with the count function was used to calculate this number.  To see the Developer Information screen:

* Launch the Invenory Application on your emulator
* Login in using the username *demo@example.com* and password *P@ssw0rd12* 
* Click the Drawer menu icon (sometimes referred to the Hamburger icon) and tap on Developer
* Tap on the Database Information button

### Counting number of documents by type

The "DevDatabaseInfoView" screen displays the count of how many documents are in the inventory database with the type set to 'audit'.  

![Developer - Database Information](dev_info_audit_count.png '#width=400px')

The DevDatabaseInfoView function obtains this information from the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/developer/DevDatabaseInfoViewModel.kt#L107"> **DevDatabaseInfoViewModel**</a> class, which tracks this in a mutableStateOf variable.   The view model calls the AuditRepositoryDb which runs the query to calculate the count.

```kotlin
private suspend fun updateAuditCount() {
  viewModelScope.launch(Dispatchers.IO) {
   val auditCount = auditRepository.count()
    if (auditCount > 0) {
     withContext(Dispatchers.Main) {
      numberOfAudits.value = auditCount
      }
    }
  }
}
```

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/audits/AuditRepositoryDb.kt#L154"> **AuditRepositoryDb.kt**</a> file and locate the `count` function.

```kotlin
override suspend fun count(): Int {
```

* We build the Query using the `SQL++ Query String` API that will look for Documents that match the specified criteria.

```kotlin
var count = 0
try {
    val db = DatabaseManager.getInstance(context).inventoryDatabase
    db?.let { database ->

        val query =  database.createQuery("SELECT COUNT(*) 
        AS count FROM _ AS item WHERE 
        documentType=\"audit\"") // 1
        
        val results = query.execute().allResults() // 2
        count = results[0].getInt("count") // 3
    }
} catch (e: Exception) {
    Log.e(e.message, e.stackTraceToString())
}
```
1. Call the database API to create a Query using the createQuery function and passing in a string 
2. We run the Query by calling the `execute().allResults()` method on the Query that was constructed in the previous step
3. We get the results by looking at the first result in the collection and getting an integer value for the key "count" which we defined in the `SELECT` clause

## Futher Exploring the SQL++ Query String API

There are several minor but notable behavior differences between SQL++ for Mobile queries and N1QL for Server.  More information on the differences can be found in the <a target="_blank" rel="noopener noreferrer"  href="https://docs.couchbase.com/couchbase-lite/current/android/query-n1ql-mobile-server-diffs.html">SQL++ Server Differences</a> documentation. In our example, we will be using the API to make a simple _pattern matching_ query using the equalTo operator.  This example will use Live Query with Kotlin coroutine flows and live data.

### Fetching Audit Documents

From the "Login" screen, when a user logs in with the proper credentials they are presented with a list of projects there team is assigned to work on.  From the project listing when a user taps on a project they are presented with a listing of audit items that was recorded as inventory items at the location of the project. 

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/audit/AuditListView.kt#L58"> **AuditListView.kt**</a> file and locate the `AuditListView` function.

* The live query is converted from Live Data to state by calling the observeAsState function call on the Live Data list of audits provided by the view model.

```kotlin
val audits = viewModel.audits.observeAsState()
```

* To see how the live data list is created, open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/audit/AuditListViewModel.kt#L39"> **AuditListViewModel.kt**</a> file and locate the `getAudits` function.

```kotlin
viewModelScope.launch(Dispatchers.IO) {
  _auditFlow = auditRepository.getAuditsByProjectId(project.projectId)
  _auditFlow?.let {  f ->
    f.collect {
      _audits.postValue(it)
    }
  }
}
```
* The view model exposes the live data which is a list of audits from the repository getAuditsByProjectId function.  Since the repository returns a flow the flow must be unboxed and then collected with the results added to the live data by calling the postValue function.  

* The getAuditsByProjectId function takes in the project's projectId in order to filter out results to only the audits associated with that project.  

* To see how to build the flow, open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/audits/AuditRepositoryDb.kt#L30"> **AuditRepositoryDb.kt**</a> file and locate the getAuditsByProjectId function.

```kotlin 
override fun getAuditsByProjectId(projectId: String): Flow<List<Audit>>? { 
```
* We first build a Query using the databases createQuery function that takes in a SQL++ query.  Notice how parameter names start with a dollar sign and the dollar sign must be escaped with a \.

```kotlin
val query = database.createQuery("SELECT * FROM _ AS item WHERE type=\"audit\" AND projectId=\$auditProjectId AND team=\$auditTeam") // 1

val parameters = Parameters() // 2
parameters.setValue("auditProjectId", projectId) // 2
parameters.setValue("auditTeam", team) // 2

query.parameters = parameters // 3

val flow = query // 4
  .queryChangeFlow() // 5
  .map { qc -> mapQueryChangeToAudit(qc)} // 6
  .flowOn(Dispatchers.IO) // 7

query.execute() // 8
return flow // 9
```

1. Build a query using the databases `createQuery` function
2. Create a paramters collection to store the parameters in.  Add the parameters and there values to the collection.
3. Set the query parameters property to the parameter collection. 
4. Define a flow  
5. Use the queryChangeFlow function to return a flow 
6. The <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/kotlin/flow#modify">intermediate operator map</a> is used to change the results coming back using the mapQueryChangeToAudit function passing in the QueryChange.  This is used to deserialize the results from JSON to the Audit data class.
7. The flowOn function is used to make sure that the flow runs on the Dispatcher.IO context to keep the code from running on the main UI thread.
8. The query executes.  Remember this step **MUST** be done before returning the flow.  
9. Return the flow

> **REMINDER**:  Kotlin Co Routine Flows emit new values into the stream of data and are not returned until they are <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/kotlin/flow">collected</a>.  

#### Indexing the Query 

* Creating indexes for non-FTS based queries is optional. However, to speed up queries, you can create indexes on the properties that you would query against. Indexing is handled eagerly.

* In the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/DatabaseManager.kt#L186">**DatabaseManager.kt**</a>  file, locate the `createAuditIndex` function. 
* We create an index on the `type`, `projectId`, and `team` properties of the documents in the _inventory_ database. 

```kotlin
private fun createAuditIndex(){
 try {
  inventoryDatabase?.let {  // 1
   if (!it.indexes.contains(auditIndexName)) {
    // create index for Audits to return documents with
    // the type attribute set to audit, the projectId filtered
    // by value sent in using equals, and the team attribute filtered
    // by the value sent in using equals

    it.createIndex( // 3
     auditIndexName, // 4
     IndexBuilder.valueIndex(   // 5
      ValueIndexItem.property(typeAttributeName), // 5
      ValueIndexItem.property(projectIdAttributeName), // 5
      ValueIndexItem.property(teamAttributeName)) // 5
      )
    }
   }
  } catch (e: Exception){
    android.util.Log.e(e.message, e.stackTraceToString())
  }
}
```
1. The let keyword is used to unbox the database since it can be null. 
2. Call the database createIndex function which takes in a name of the index and then the properites to index 
3. The name of the index in string format.  auditIndexName is defined toward the top of the class with the value `idxAudit`
4.  The IndexBuilder's valueIndex function can be used to create the index
5.  The ValueIndexItem.property factory method can be used to create a ValueIndexItem by passing in the property of which to index.

## SQL++ Query String API - Searching for Stock Items with the LIKE Operator 

The SQL ++ Query String API supports serveral operators including the LIKE which can be used for string matching.  We use the LIKE operator on the data editor screen for audits to find a stock item to add to a audit.  Let's review the code.  

> **NOTE**: The like operator performs case sensitive matches.  To perform case insensitive matching, use lowercase or uppercase functions to ensure all comparators have the same case, thereby removing the case issue.

On the Audit Editor screen we provide a link to the Stock Item Section screen.  To see the Audit Editor screen:

* Launch the Invenory Application on your emulator
* Login in using the username *demo@example.com* and password *P@ssw0rd12* 
* Tap on one of the Projects to bring up the Audit List screen   
* Tap the + button to add a new audit
* Tap the button `No Stock Item Selected` 

![Project Editor screen](audit_editor_screen_noitem_selected.png '#width=300px')

* In the Name box enter ipa 
* In the Description box enter wicked 
* Hit the Search button
* A listing of stock items should return that match these results

![Select Stock Item screen](select_audit_stockitem.png '#width=300px')

Let's review the code for the Stock Item Section screen.

### Stock Item Selection 

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/audit/StockItemSelectionView.kt#L46"> **StockItemSelectionView.kt**</a> file and locate the `StockItemSelectionView` function.

* The StockItemSelectionView exposes the viewModel's onSearch which the StockItemSelector function uses with the Search button.  
 
```kotlin
StockItemSelector(
  searchName = viewModel.searchName.value,
  searchDescription = viewModel.searchDescription.value,
  onSearchNameChanged = viewModel.onSearchNameChanged,
  onSearchDescriptionChanged = viewModel.onSearchDescriptionChanged,
  onSearch = viewModel.onSearch,
  stockItemStatusMessage = viewModel.statusMessage.value,
  stockItems = viewModel.stockItemsState,
  onStockItemSelected = onStockItemSelected
)
``` 
 
* This is defined as OnSearch in the StockItemSelector function  

```kotlin
fun StockItemSelector(
    searchName: String,
    searchDescription: String,
    onSearchNameChanged: (String) -> Unit,
    onSearchDescriptionChanged: (String) -> Unit,
    onSearch: () -> Unit,
    stockItemStatusMessage: String,
    stockItems: List<StockItem>,
    onStockItemSelected: (StockItem) -> Unit)
```

* The search button then calls the OnSearch method on the OnClick listener.

```kotlin
Button(modifier = Modifier
  .padding(top = 4.dp),
  colors = ButtonDefaults.buttonColors(backgroundColor = Red500),
  onClick = {
      onSearch()
  })
```
* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/audit/StockItemSelectionViewModel.kt#L45"> **StockItemSelectionViewModel.kt**</a> file and locate the `onSearch` val definition.

```kotlin
val onSearch: () -> Unit = {
 viewModelScope.launch {  // <1>
  if (searchName.value.length >= 2) { // <2>
   isLoading.value = true
   val foundItems = stockItemRepository
    .getByNameDescription(searchName.value, searchDescription.value) // <3>
   if (foundItems.isNotEmpty()) { // <4>
    withContext(Dispatchers.Main) {
     stockItemsState.clear()
     stockItemsState.addAll(foundItems)
     isLoading.value = false
    } 
   } else { // <5>
    withContext(Dispatchers.Main) {
     stockItemsState.clear()
     statusMessage.value = "No stock items Found"
     isLoading.value = false
    }
   }
  }
 }
}
```
1. Since we will be talking to the database using suspend functions, we want to make sure we use viewModel Scope
2. Business logic to check if the searchName value is greater than or equal to 2 characters.  If so, then we can search for stock items.  
3. Call the stockItemRepository getByNameDescription function which takes in the searchName and searchDescription values.  
4. If the stock item list is not empty, then we can set the stockItemsState to the stock item list.  
5. If not, then we set the statusMessage to "No stock items Found".

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/devadv-2050/src/app/src/main/java/com/couchbase/learningpath/data/stockItem/StockItemRepositoryDb.kt#L64"> **StockItemRepositoryDb.kt**</a> file and locate the `getByNameDescription` function.

```kotlin
override suspend fun getByNameDescription(
    searchName: String,
    searchDescription: String?
): List<StockItem> {
```
* We wil use withContext(Dispatchers.IO) to make sure we are working on the IO thread since we will be talking to the database.

```kotlin
val stockItems = mutableListOf<StockItem>()
try {
 val db = databaseResources.warehouseDatabase
 db?.let { database ->
  var queryString = "SELECT * FROM _ as item WHERE 
  documentType=\"item\" AND lower(name) LIKE ('%' || 
  \$parameterName || '%')"  // 1
  var parameters = Parameters() // 2
  parameters.setString("parameterName", searchName.lowercase()) // 3
  searchDescription?.let { description ->
   if (description.isNotEmpty()) {  // 4
    queryString =
    queryString.plus(" AND lower(description) LIKE ('%' || \$parameterDescription || '%')")  // 5
    parameters.setString(
     "parameterDescription",
     searchDescription.lowercase()
    ) // 6
   }
   var query = database.createQuery(queryString) // 7
   query.parameters = parameters // 8
   var results = query.execute().allResults() // 9
   results.forEach { result ->  // 10
    val stockItem = Json.decodeFromString<StockItemDao>(result.toJSON()).item // 11
    stockItems.add(stockItem) // 12
    }
   }
 }
} catch (e: java.lang.Exception) {
 Log.e(e.message, e.stackTraceToString())
}
```
1. Create a SQL++ query off the name attribute and use the like function with a defined parameter labeled parameterName.  This is used to stop SQL injection bugs.
2. Create a Parameters object.
3. Add the parameterName to the Parameters object using the searchName varible passed in and making sure it's lowercase.
4. If the searchDescrpition value is not null
5. We append the query and add the like function to the query filtering out the description attribute using the parameterDescription label. 
6. Add the parameterDescription to the Parameters object using the searchDescription varible passed in and making sure it's lowercase.
7. Create a query using the queryString 
8. Add the parameters to the query
9. Excute the query using the Query API to select all the results 
10. Loop through all the results found in the database
11. Decode the result to a StockItemDao object and set it to the stockItem variable 
12. Add the stockItem to the stockItems list

## Learn More

Congratulations on completing this step of our learning path!

This step of the learning path walked you through the SQL++ Query API in Couchbase Lite and used it to return documents from the database using serveral methods. Check out the following links for further documenation and continue on to the next step to learn more about how to setup Couchbase Server and Sync Gateway with Docker and Docker Compose. 

### References 

* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-n1ql-mobile.html">Documentation: SQL++ Query Strings</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-n1ql-mobile.html#purpose-21">Documentation: SQL++ Query Strings - Comparision Operators</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-n1ql-mobile.html#lbl-functions">Documentation: SQL++ Query Strings - Functions</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-n1ql-mobile-server-diffs.html">Documentation: SQL++ Differences</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-resultsets.html">Documentation: Result Sets</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-live.html">Documentation: Live Query - Working with Queries</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-troubleshooting.html">Documentation: Query Troubleshooting
</a>
