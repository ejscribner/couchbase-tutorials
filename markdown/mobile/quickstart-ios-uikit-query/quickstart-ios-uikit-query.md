---
# frontmatter
path: "/tutorial-quickstart-ios-uikit-query"
title: Quickstart in Couchbase Lite Query with iOS, Swift, and UIKit
short_title: Couchbase Lite Query
description: 
  - Build an iOS App in Swift with UIKit and Couchbase Lite using Query
  - Learn the basics of the QueryBuilder interface
  - See how you can bundle, load, and use a prebuilt instance of Couchbase Lite
content_type: quickstart
filter: mobile
technology: 
  - mobile
  - query
  - fts
landing_page: mobile
landing_order: 4
tags:
  - iOS
sdk_language:
  - swift
length: 30 Mins
---

## Introduction

Couchbase Lite brings powerful querying and Full-Text-Search(FTS) capabilties to the edge. The new query interface is based on <a target="_blank" rel="noopener noreferrer" href="https://www.couchbase.com/products/n1ql">N1QL</a>, Couchbase’s declarative query language that extends <a target="_blank" rel="noopener noreferrer" href="https://www.sqlite.org/index.html">SQL</a> for JSON. If you are familiar with SQL, you will feel right at home with the semantics of the new API.  The query API is designed using the <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Fluent_interface">Fluent API Design Pattern</a>, and it uses method cascading to read to like a Domain Specific Language (DSL). This makes the interface very intuitive and easy to understand.

Couchbase Lite can be used as a standalone embedded database within your mobile app.

This tutorial will walk through a simple swift app that will

* Demonstrate how you can bundle, load and use a  **_prebuilt_** instance of Couchbase Lite
* Introduce you to the basics of the `QueryBuilder` interface

You can learn more about Couchbase Mobile <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/mobile">here</a>.

## Prerequisites

This tutorial assumes familiarity with building Swift apps with Xcode and with the basics of Couchbase Lite.

* If you are unfamiliar with the basics of Couchbase Lite, it is recommended that you walk through the <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-ios-uikit-basic">Quickstart in Couchbase Lite with iOS, Swift, and UIKit</a> on using Couchbase Lite as a standalone database

* iOS (Xcode 12/13) - Download latest version from the <a target="_blank" rel="noopener noreferrer" href="https://itunes.apple.com/us/app/xcode/id497799835?mt=12">Mac App Store</a> or via <a target="_blank" rel="noopener noreferrer" href="https://github.com/RobotsAndPencils/XcodesApp">Xcodes</a>
> **Note**: If you are using an older version of Xcode, which you need to retain for other development needs, make a copy of your existing version of Xcode and install the latest Xcode version.  That way you can have multiple versions of Xcode on your Mac.  More information can be found in [Apple's Developer Documentation](https://developer.apple.com/library/archive/technotes/tn2339/_index.html#//apple_ref/doc/uid/DTS40014588-CH1-I_HAVE_MULTIPLE_VERSIONS_OF_XCODE_INSTALLED_ON_MY_MACHINE__WHAT_VERSION_OF_XCODE_DO_THE_COMMAND_LINE_TOOLS_CURRENTLY_USE_).

## App Overview

We will be working with a very simple "User Profile" app. If you had walked through the <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-ios-uikit-query">Quickstart in Couchbase Lite Query with iOS, Swift, and UIKit tutorial</a>, you will recognize that this version extends the functionality introduced in the app introduced in that tutorial.

This app does the following

* Allows users to log in and create or update his/her user profile information. You could do that in the <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/tutorial-quickstart-ios-uikit-query">Quickstart in Couchbase Lite Query with iOS, Swift, and UIKit tutorial</a>
* Includes a second record type. As part of profile information, users can now select a "university" from a list of possible options.
* The list of matching universities is found by quering (using the new Query API) a local prebuilt "University" Database, which is bundled in the app. 
* The user profile information is persisted as a Document in the local Couchbase Lite Database. So subsquently, when the user logs out and logs back in again, the profile information is loaded from the Database.


![App Overview](./university_app_overview.gif)

## Installation


* To clone the project from GitHub, type the following command in your terminal

```bash
git clone https://github.com/couchbase-examples/ios-swift-cblite-userprofile-query
```

### Installing Couchbase Lite XCFramework

Next, we will download the Couchbase Lite 3.0 XCFramework. 

The Couchbase Lite iOS XCFramework is distributed via SPM, CocoaPods, Carthage, or you can download the pre-built framework.  See the <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/3.0/swift/gs-install.html"> Getting Started - Install</a> documentation for more information. 

In our example, we will be downloading the pre-built version of the XCFramework, using a script. To do this, type the following in a command terminal:

```bash
  cd /path/to/UserProfileQueryDemo/src

  sh install_tutorial.sh
```

Now, let's verify the installation.


### Try it Out

* Open the `UserProfileQueryDemo.xcodeproj`. The project would be located at ` /path/to/UserProfileQueryDemo/src`

```bash
open UserProfileQueryDemo.xcodeproj
```

* Build and run the project using the _simulator_ in Xcode. While you can run the app on a real device, we recommend the Simulator so you can see the debug logs in the output console.
* Verify that you see the login screen

![User Profile Login Screen Image](./user_profile_login.png '#width=300px')

## Data Model

Couchbase Lite is a JSON Document Store. A Document is a logical collection of named fields and values. The values are any valid JSON types.

In addition to the standard JSON types, Couchbase Lite supports some special types like Date and Blob. While it is not required or enforced, it is a recommended practice to include a "type" property that can serve as a namespace for related documents.

The app deals with two Document types: User Profile and University.


### The "User Profile" Document

The User Profile Document has a type property of user.Its document ID is of the form "user::demo@example.com".  An example of a document would be

```json
{
    "type":"user",
    "name":"Jane Doe",
    "email":"jame.doe@earth.org",
    "address":"101 Main Street",
    "image":CBLBlob (image/jpg),
    "university":"Rensselaer Polytechnic"
}
```

### UserRecord

The **_"user"_** Document is encoded to a native struct named **_UserRecord_**.

```swift
let kUserRecordDocumentType = "user"
typealias ExtendedData = [[String:Any]]
struct UserRecord : CustomStringConvertible{
  let type = kUserRecordDocumentType
  var name:String?
  var email:String?
  var address:String?
  var imageData:Data?
  var extended:ExtendedData? 
  
    var description: String {
      return "name = \(String(describing: name)), 
      email = \(String(describing: email)), 
      address = \(String(describing: address)), 
      imageData = \(imageData?.debugDescription 
      ?? " ")"
    }
}
```

## The "University" Document

The app comes bundled with a collection of Documents of type **_"university"_**. Each Document represents a university.

```json
{
    "type":"university","web_pages": [
      "http://www.rpi.edu/"
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

### UniversityRecord

The **_"university"_** Document is encoded to a native struct named **_UniversityRecord_**.

```swift
typealias Universities = [UniversityRecord]
// Native object
struct UniversityRecord : CustomStringConvertible{
  var alphaTwoCode:String?
  var country:String?
  var domains:[String]?
  var name:String?
  var webPages:[String]?
  
var description: String {
      return "name = \(String(describing: name)), country = \(String(describing: country)), domains = \(String(describing: domains)), webPages = \(webPages), alphaTwoCode = \(String(describing: alphaTwoCode)) "
  }
}
```

## Using a Prebuilt Database

There are several reasons why you may want to bundle your app with a prebuilt database. This would be suited for data that does not change or change that often, so you can avoid the bandwidth and latency involved in fetching/syncing this data from a remote server. This also improves the overall user experience by reducing the start-up time.

In our app, the instance of Couchbase Lite that holds the pre-loaded "university" data is separate from the Couchbase Lite instance that holds "user" data hold the pre-loaded data. A separate Couchbase Lite instance is not required. However, in our case, since there can be many users potentially using the app on a given device, it makes more sense to keep it separate. This is to avoid duplication of pre-loaded data for every user.

### Location of the cblite file

The pre-built database will be in the form of a `cblite` file. It should be be in your app project bundle

* In the `UserProfileQueryDemo.xcodeproj` project explorer, locate the `universities.cblite2` file

![Prebuilt Database Location](./cblite_location.png)

### Loading the Prebuilt Database

* Open the **DatabaseManager.swift** file and locate the `openPrebuiltDatabase()` function. The prebuilt database is common to all users of the app (on the device). So it will be loaded once and shared by all users on the device.

```swift
func openPrebuiltDatabase(handler:(_ error:Error?)->Void) {
```

* First, we create an instance of `DatabaseConfiguration` object and specify the path where the database would be located

```swift
var options = DatabaseConfiguration()
guard let universityFolderUrl = _applicationSupportDirectory else {
  fatalError("Could not open Application Support Directory for app!")
  return
}
let universityFolderPath = universityFolderUrl.path
let fileManager = FileManager.default
if !fileManager.fileExists(atPath: universityFolderPath) {
  try fileManager.createDirectory(atPath: universityFolderPath,
                                  withIntermediateDirectories: true,
                                  attributes: nil)

}
// Set the folder path for the CBLite DB
options.directory = universityFolderPath
```

* Then we determine if the "universities" database already exists at the specified location. It would not be present if this is the first time we are using the app, in which case, we locate the **_"universities.cblite"_** resource in the App's main bundle and we copy it over to the Database folder.

If the database is already present at the specified Database location, we simply open the database

```swift
// Load the prebuilt "universities" database if it does not exist as the specified folder
if Database.exists(withName: kUniversityDBName, inDirectory: universityFolderPath) == false
{
  // Load prebuilt database from App Bundle and copy over to Applications support path
  if let prebuiltPath = Bundle.main.path(forResource: kUniversityDBName, ofType: "cblite2") {
      try Database.copy(fromPath: prebuiltPath, toDatabase: "\(kUniversityDBName)", withConfig: options)
  }
  // Get handle to DB  specified path
  _universitydb = try Database(name: kUniversityDBName, config: options)

// Create indexes to facilitate queries
  try createUniversityDatabaseIndexes()
}
else
{
  // Gets handle to existing DB at specified path
  _universitydb = try Database(name: kUniversityDBName, config: options)
}
```

### Indexing the Prebuilt Database

* Creating indexes for non-FTS based queries is optional. However, in order to speed up queries, you can create indexes on the properties that you would query against. Indexing is handled eagerly.

* In the **DatabaseManager.swift** file, locate the `createUniversityDatabaseIndexes()` function. We create an index on the `name` and `location` properties of the documents in the **_university_** database.

```swift
fileprivate func createUniversityDatabaseIndexes()throws {
  // For searches on type property
  try _universitydb?.createIndex(IndexBuilder.valueIndex(items:  ValueIndexItem.expression(Expression.property("name")),ValueIndexItem.expression(Expression.property("location"))), withName: "NameLocationIndex")
}
```

### Closing the Database

When a user logs out, we close the Prebuilt Database along with other user-specific databases

* In the **DatabaseManager.swift** file, locate the `closePrebuiltDatabase()` function.

```swift
func closePrebuiltDatabase() -> Bool {
```

* Closing the database is pretty straightforward

```swift
try db.close()
try universitydb.close()
```

### Try It Out

* The app should be running in the simulator
* Log into the app with any email Id and password. Let's use the values **_"demo@example.com"_** and **_"password"_** for user Id and password fields respectively. If this is the first time that **_any_** user is signing in to the app, the pre-built database will be loaded from the App Bundle. In addition, new user-specific Database will be created / opened.
* Confirm that the console log output has a message similar to the one below. This output also indicates the location of the Prebuilt database as well as the Database for the user. This would be within the Application Support folder.  In this example, we are logging in with a user email Id of **_"demo@example.com"_**.


```bash
Will open Prebuilt DB  at path /Users/priya.rajagopal/Library/Developer/CoreSimulator/Devices/E4E62394-9940-4AF8-92FC-41E3C794B216/data/Containers/Data/Application/A9425551-7F52-461D-B4F5-CC04315154D6/Library/Application Support

2018-05-04 17:04:16.319360-0400 UserProfileDemo[54115:13479070] CouchbaseLite/2.0.0 (Swift; iOS 11.3; iPhone) Build/806 Commit/2f2a2097+CHANGES LiteCore/2.0.0 (806)

2018-05-04 17:04:16.319721-0400 UserProfileDemo[54115:13479070] CouchbaseLite minimum log level is Verbose
Will open/create DB  at path /Users/priya.rajagopal/Library/Developer/CoreSimulator/Devices/E4E62394-9940-4AF8-92FC-41E3C794B216/data/Containers/Data/Application/A9425551-7F52-461D-B4F5-CC04315154D6/Library/Application Support/demo@example.com
```

* The above log message indicate the location of the Prebuilt database as well as the Database for the user. This would be within the _Application Support_ folder.
* Open the folder in your Finder app and verify that a Database with name _"univerities"_ exists along with a user specific Database with name _"userprofile"_

![Database Locations](./db_locations.png)

## Exploring the Query API

The Query API in Couchbase Lite is extensive. In our app, we will be using the `QueryBuilder` API to make a simple _pattern matching_ query using the `like` operator.

### Fetching University Document

From the "Your Profile" screen, when the user taps on the "Select University" button, a search screen is displayed where the user can enter the search criteria (name and optionally, the location) for the university. 

When the search criteria is entered, the local _"universities"_ Database is queried for [The "University" Document](#the-university-document) documents that match the specified search criteria.

* Open the **UniversityPresenter.swift** file and locate the `fetchUniversityRecords()` function.

```swift
func fetchUniversitiesMatchingName( _name:String,country countryStr:String?, handler:@escaping(_ universities:Universities?, _ error:Error?)->Void)
{
  do {
```

* We build the Query using the `QueryBuilder` API that will look for Documents that match the specified criteria.

```swift
 var whereQueryExpr = Function.lower(Expression.property(UniversityDocumentKeys.name.rawValue))
  .like(Expression.string("%\(name.lowercased())%"))

if let countryExpr = countryStr {
  let countryQueryExpr = Function.lower(Expression.property(UniversityDocumentKeys.country.rawValue))
      .like(Expression.string("%\(countryExpr.lowercased())%"))
  whereQueryExpr = whereQueryExpr.and(countryQueryExpr))
}

let universityQuery = QueryBuilder.select(SelectResult.all()) 
  .from(DataSource.database(db)) 
  .where(whereQueryExpr)

print(try? universityQuery.explain())
```

* Build a `QueryExpression` that uses the `like` operator to look for the specified **_"name"_** string in the **_"name"_** property. Notice couple of things here: (a) The use of **wildcard "%" operator** to denote that we are looking for the presence of the string anywhere in the **_"name"_** property and (b) The use of `Function.lowercase()` to convert the search string into lowercase equivalent. Since `like` operator does **_case-senstive matching_**, we convert the search string and the property value to lowercase equivalents and compare the two.

* If the location criteria was specified in the search, then Build a `QueryExpression` that uses the `like` operator to look for the specified **_"location"_** string in the **_"location"_** property.

* The `SelectResult.all()` specifiees that we are interested in all properties in Documents that match the specified criteria

* The `DataSource.database(db)` specified the Data Source

*  We include the `where` clause that is the logical ANDing of the QueryExpression. 

* We run the Query by calling the `execute()` method on the Query that was constructed in the previous step

```swift
var universities = Universities()

for result in try universityQuery.execute() {
  if let university = result.dictionary(forKey: "universities"){

    var universityRecord = UniversityRecord()
    universityRecord.name =  university.string(forKey: UniversityDocumentKeys.name.rawValue) 
    universityRecord.country  =  university.string(forKey: UniversityDocumentKeys.country.rawValue)
    universityRecord.webPages  =  university.array(forKey: UniversityDocumentKeys.webPages.rawValue)?.toArray() as? [String] 

    universities.append(universityRecord)
  }
}
```

* Create an instance of [UniversityRecord](#university-record) type
* Use specific type getters to fetch property values. These[UniversityRecord](#university-record) instance is populated with these property values.
* Getters also available for `array` types. This returns a Couchbase Lite `ArrayObject` type. So you would have to use `toArray()` to convert the Couchbase Lite native array equivalent.

### Try It Out

* You should have followed the steps discussed in the "Try It Out" section under [Loading the Prebuilt Database](#loading-the-prebuilt-database)
* Tap on "Select University" button 
* You should see a screen show that allows you enter the search criteria for the university
* Enter "Harv" for name . You can optionally enter "united states" for location
* Confirm that you see a list of universities that match the criteria

![University List](./university_list.gif)

* Select a university
* Press "Done" button
* Confirm that the university you selected shows up in the University label 

![University Selection](./university_selection.gif)

* You can optionally fill in other entries in the User Profile screen
* Tap "Done" button
* Confirm that you see an alert message "Succesfully Updated Profile". The Document will be updated this time.
* Tap "Log Off" and log out of the app
* Log back into the app with the same user email Id and password that you used earlier. In my example, I used **_"demo@example.com"_** and **_"password"_**. So I will log in with those credentials again.
* Confirm that you see the profile screen  with the **_university_** value that you set earlier.

![Log Off and Log Back On](./profile_update.gif)

## Learn More

Congratulations on completing this tutorial!

This tutorial walked you through an example of how to use a pre-built Couchbase Lite database. We looked at a simple Query example. Check out the following links for further details on the Query API including a Xcode playground for testing the APIs.

### Further Reading

* <a target="_blank" rel="noopener noreferrer" href="https://blog.couchbase.com/sql-for-json-query-interface-couchbase-mobile/">Fundamentals of the Couchbase Lite Query API</a>
* <a target="_blank" rel="noopener noreferrer" href="https://blog.couchbase.com/querying-array-collections-couchbase-mobile/">Handling Arrays in Queries</a>
* <a target="_blank" rel="noopener noreferrer" href="https://blog.couchbase.com/full-text-search-couchbase-mobile-2-0/">Couchbase Lite Full Text Search API</a>
* <a target="_blank" rel="noopener noreferrer" href="https://blog.couchbase.com/join-queries-couchbase-mobile/">Couchbase Lite JOIN Query</a>
