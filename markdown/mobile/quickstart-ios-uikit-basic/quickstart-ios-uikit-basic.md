---
# frontmatter
path: "/tutorial-quickstart-ios-uikit-basic"
title: Quickstart in Couchbase Lite with iOS, Swift, and UIKit
short_title: Couchbase Lite Fundamentals
description: 
  - Learn how to install Couchbase Lite
  - Build an iOS App in Swift with UIKit and Couchbase Lite
  - Learn how to Create, Read, Update, and Delete documents
content_type: quickstart
filter: mobile
technology: 
  - mobile
  - kv
  - query
landing_page: mobile
landing_order: 1
tags:
  - iOS
sdk_language:
  - swift
length: 30 Mins
---

## Introduction

Couchbase Mobile brings the power of NoSQL to the edge. It is comprised of three components:

* **_Couchbase Lite_**, an embedded, NoSQL JSON Document Style database for your mobile apps
* **_Sync Gateway_**, an internet-facing synchronization mechanism that securely syncs data between mobile clients and server, and
* **_Couchbase Server_**, a highly scalable, distributed NoSQL database platform

Couchbase Mobile supports flexible deployment models. You can deploy

* Couchbase Lite as a standalone embedded database within your mobile apps or,
* Couchbase Lite enabled mobile clients with a Sync Gateway to sychronize data between your mobile clients or,
* Couchbase Lite enabled clients with a Sync Gateway to sync data between mobile clients and the Couchbase Server, which can persist data in the cloud (public or private)

This tutorial will walk you through a very basic example of how you can use *Couchbase Lite 3 in standalone mode* within your Swift app. In this mode, Couchbase Lite will serve as a local, embedded data store within your iOS App and can be a replacement for SQLite or Core Data.

You will learn the fundamentals of

* Database Operations
* Document CRUD Operations

You can learn more about Couchbase Mobile [here](https://developer.couchbase.com/mobile).

## Prerequisites

This tutorial assumes familiarity with building Swift apps with Xcode.

* iOS (Xcode 12/13)
  Download latest version from the [Mac App Store](https://itunes.apple.com/us/app/xcode/id497799835?mt=12)
> **Note**: If you are using an older version of Xcode, which you need to retain for other development needs, make a copy of your existing version of Xcode and install the latest Xcode version.  That way you can have multiple versions of Xcode on your Mac.  More information can be found in [Apple's Developer Documentation](https://developer.apple.com/library/archive/technotes/tn2339/_index.html#//apple_ref/doc/uid/DTS40014588-CH1-I_HAVE_MULTIPLE_VERSIONS_OF_XCODE_INSTALLED_ON_MY_MACHINE__WHAT_VERSION_OF_XCODE_DO_THE_COMMAND_LINE_TOOLS_CURRENTLY_USE_).

## App Overview

We will be working with a very simple *User Profile* app. It does one thing - Allow a user to log in and create or update their user profile data. 

The user profile data is persisted as a Document in the local Couchbase Lite Database. So, when the user logs out and logs back in again, the profile information is loaded from the Database.

![App Overview](./user_profile.gif '#width=300px')
*Figure 1.  The sample user profile application running in a simulator*

## Installation

* To clone the project from GitHub, type the following command in your terminal

```bash
  git clone https://github.com/couchbase-examples/ios-swift-cblite-userprofile-standalone.git
```

### Installing Couchbase Lite XCFramework

Next, we will download the Couchbase Lite 3.0 XCFramework. 

The Couchbase Lite iOS XCFramework is distributed via SPM, CocoaPods, Carthage, or you can download the pre-built framework.  See the [Getting Started - Install](https://docs.couchbase.com/couchbase-lite/3.0/swift/gs-install.html) documentation for more information. 

In our example, we will be downloading the pre-built version of the XCFramework, using a script. To do this, type the following in a command terminal:

```bash
  cd /path/to/UserProfileDemo/src

  sh install_tutorial.sh
```

Now, let's verify the installation.

### Try it Out

* Open the `UserProfileDemo.xcodeproj` project file, located at `/path/to/UserProfileDemo/src`

```bash
open UserProfileDemo.xcodeproj
```

* Use Xcode to build and run the project using a simulator. 

* Verify that you see the login screen.

![User Profile Login Screen Image](./user_profile_login.png '#width=300px')

*Figure 2.  User Profile Login Screen Image*
 
## Data Model

Couchbase Lite is a JSON Document Store. A Document is a logical collection of named fields and values.  The values are any valid JSON types. In addition to the standard JSON types, Couchbase Lite supports `Date` and `Blob` data types. While it is not required or enforced, it is a recommended practice to include a **_"type"_** property that can serve as a namespace for related documents.

### The "User Profile" Document

The app deals with a single Document with a *"type"* property of *"user"*.  The document ID is of the form *"user::demo@example"*.

**Example 1. A user profile document example**

```json
{
    "type":"user",
    "name":"Jane Doe",
    "email":"jane.doe@earth.org",
    "address":"101 Main Street",
    "image":CBLBlob (image/jpg)
}
```

* The special `blob` data type that is associated with the profile image - see: [Working with Blob](https://docs.couchbase.com/couchbase-lite/3.0/swift/blob.html).  

### UserRecord

The **_"user"_** Document is encoded to a native struct named **_UserRecord_** as shown in Example 2.

**Example 2. The encoding of a UserRecord to a native structure**
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

## Basic Database Operations

In this section, we will do a code walk-through of the basic Database operations.

### Create / Open a Database

When a user logs in, we create an empty Couchbase Lite Database for the user if one does not exist.

* Open the *DatabaseManager.swift* file and locate the `openOrCreateDatabaseForUser()` function.

```swift
func openOrCreateDatabaseForUser(_ 
  user:String, 
  password:String, 
  handler:(_ error:Error?)->Void) {
```

* We create an instance of the `DatabaseConfiguration`. This is an optional step. In our case, we would like to override the default path of the Database. Every user has their own instance of the Database that is located in a folder corresponding to the user.

```swift
var options = DatabaseConfiguration()
guard let defaultDBPath = _applicationSupportDirectory else {
  fatalError("Could not open Application Support Directory for app!")
  return
}
// Create a folder for the logged in user if one does not exist
let userFolderUrl = defaultDBPath.appendingPathComponent(user, 
                                                         isDirectory: true)
let userFolderPath = userFolderUrl.path
let fileManager = FileManager.default
if !fileManager.fileExists(atPath: userFolderPath) {
  try fileManager.createDirectory(atPath: userFolderPath,
                                  withIntermediateDirectories: true,
                                  attributes: nil)
  
}
// Set the folder path for the CBLite DB
options.directory = userFolderPath
```

* Then we create a local Couchbase Lite database named *"userprofile"* for the user. If a database already exists for the user, the existing version is returned.

```swift
_db = try Database(name: kDBName, config: options)
```

### Listening to Database Changes
You can be asynchornously notified of any change (add, delete, update) to the Database by registering a change listener with the Database. In our app, we are not doing anything special with the Database change notification other than logging the change. In a real world app, you would use this notification for instance, to update the UI.

* Open the *DatabaseManager.swift* file and locate the `registerForDatabaseChanges()` function.

```swift
fileprivate func registerForDatabaseChanges() {
```

* We register a change listener with the database. This is an optional step. We track the `ListenerToken` as it is needed for removing the listener.

```swift
dbChangeListenerToken = db?.addChangeListener({ [weak self](change) in
  guard let `self` = self else {
      return
  }
  for docId in change.documentIDs   {
      if let docString = docId as? String {
          let doc = self._db?.document(withID: docString)
          if doc == nil {
              print("Document was deleted")
          }
          else {
              print("Document was added/updated")
          }
      }
  }
})
```

### Close a Database

When a user logs out, we close the Couchbase Lite Database associated with the user and deregister any database change listeners

* Open the *DatabaseManager.swift* file and locate the `closeDatabaseForCurrentUser()` function.

```swift
func closeDatabaseForCurrentUser() -> Bool {
```

* Closing the database is pretty straightforward

```swift
try db.close()
```

### Deregistering for  Database Changes

* Open the *DatabaseManager.swift* file and locate the `deregisterForDatabaseChanges()` function.

```swift
fileprivate func deregisterForDatabaseChanges() {
```

* We stop listening to database changes by passing in the `ListenerToken` associated with the listener.

```swift
if let dbChangeListenerToken = self.dbChangeListenerToken {
    db?.removeChangeListener(withToken: dbChangeListenerToken)
}
```

### Try It Out

* The app should be running in the simulator
* Log into the app with any email Id and password. Let's use the values _"demo@example.com"_ and _"password"_ for user Id and password fields respectively. If this is the first time that the user is signing in, a new Database will be created. If not, the user's existing database will be opened.
* Confirm that the console log output has a message similar to the one below. In my example, I am logging in with a user email Id of **_"demo@example.com"_**.

```bash
Will open/create DB  at path Will open/create DB  at path /Users/yourusername/Library/Developer/CoreSimulator/Devices/E4E62394-9940-4AF8-92FC-41E3C794B216/data/Containers/Data/Application/65EAD047-B29A-400C-803F-F799BAE99CBA/Library/Application Support/demo@example.com
```

* The above log message indicates the location of the Database for the user on your Mac.
* Open the folder in your Finder app from the log message and verify that a Database with name _"userprofile"_ is exists for the user

![User Profile Database Location](./db_location.png)

## Document Operations

Once an instance of the Couchbase Lite Database is created/opened for the specific user, we can perform basic Document functions on the Database. In this section, we will walkthrough the code that describes basic Document operations

### Reading a Document

Once the user logs in, the user is taken to the "Your Profile" screen. A request is made to load [The "User Profile" Document](#the-user-profile-document) for the user. When the user logs in the very first time, there would be no _user profile_ document for the user.

* Open the **UserPresenter.swift** file and locate the `userProfileDocId` definition. This document Id is constructed by prefixing the term "user::" to the email Id of the user.

```swift
lazy var userProfileDocId: String = {
  let userId = dbMgr.currentUserCredentials?.user
  return "user::\(userId ?? "")"
}()    
```

* In the *UserPresenter.swift* file, locate the `fetchRecordForCurrentUser()` function.

```swift
func fetchRecordForCurrentUser(handler:@escaping(_
records:UserRecord?, _ error:Error?)->Void) {
```

* We try to fetch the document with specified `userProfileDocId` from the database.

```swift
guard let db = dbMgr.db else {
  fatalError("db is not initialized at this point!")
}

var profile = UserRecord.init()
profile.email = self.dbMgr.currentUserCredentials?.user 
self.associatedView?.dataStartedLoading()

// fetch document corresponding to the user Id
if let doc = db.document(withID: self.userProfileDocId)  { 
  profile.email  =  doc.string(forKey: UserRecordDocumentKeys.email.rawValue)
  profile.address = doc.string(forKey:UserRecordDocumentKeys.address.rawValue)
  profile.name =  doc.string(forKey: UserRecordDocumentKeys.name.rawValue)
  profile.imageData = doc.blob(forKey:UserRecordDocumentKeys.image.rawValue)?.content
}
```
The code example above does the following:
* Create an instance of [UserRecord](#user-record) object
* Set the `email` property of the UserRecord with the email Id of the logged in user. This value is not editable.
* Fetch a *immutable* copy of the Document from the Database
* If document exists and is fetched succesfully, we use appropriate type-getters to fetch the various members of the Document based on the property name. Specifically, note the support of the `getBlob` type to fetch the value of a property of type `Blob`

### Creating / Updating a Document

A [The "User Profile" Document](#the-user-profile-document) is created for the user when the user taps the "Done" button on the "Profile Screen". The function below applies whether you are creating a document or updating an existing version

* Open the **UserPresenter.swift** file and locate the `setRecordForCurrentUser()` method.

```swift
func setRecordForCurrentUser( _ record:UserRecord?,
 handler:@escaping(_ error:Error?)->Void) {
```

* We create a *mutable* instance of the Document. By default, all APIs in Couchbase Lite deal with immutable objects, thereby making them *thread-safe* by design. In order to mutate an object,  you must explicitly get a mutable copy of the object.
Use appropriate type-setters to set the various properties of the Document

```swift
mutableDoc.setString(record?.type, forKey: UserRecordDocumentKeys.type.rawValue)

if let email = record?.email {
  mutableDoc.setString(email, forKey: UserRecordDocumentKeys.email.rawValue)
}
if let address = record?.address {
  mutableDoc.setString(address, forKey: UserRecordDocumentKeys.address.rawValue)
}

if let name = record?.name {
  mutableDoc.setString(name, forKey: UserRecordDocumentKeys.name.rawValue)
}

if let imageData = record?.imageData {
  let blob = Blob.init(contentType: "image/jpeg", data: imageData)
  mutableDoc.setBlob(blob, forKey: UserRecordDocumentKeys.image.rawValue)
}
```

* Specifically, note the support of the `setBlob` type to fetch the value of a property of type `Blob`.

* Save the document

```swift
do {
  // This will create a document if it does not exist and overrite it if it exists
  // Using default concurrency control policy of "writes always win"
  try? db.saveDocument(mutableDoc)
  handler(nil)
}
catch {
  handler(error)
}
```

### Deleting a Document

We don't delete a Document in this sample app. However, deletion of a document is pretty straightforward and this is how you would do it.

```swift
if let doc = db.document(withID: idOfDocToRemove) {
   try db.deleteDocument(doc)
}
```

### Try It Out

* You should have followed the steps discussed in the "Try It Out" section under [Create / Open a Database](#data-model)
* Enter a "name" for the user in the Text Entry box and Tap "Done"
* Confirm that you see an alert message "Succesfully Updated Profile". The first time, you update the profile screen, the Document will be created.

![User Profile Document Creation](./doc_create.png '#width=300px')

* Now tap on the "Tap!" button and select an image from the Photo Album. Tap "Done".
![Image Selection](./image_selection.gif '#width=300px')

* Confirm that you see an alert message "Succesfully Updated Profile". The Document will be updated this time.
* Tap "Log Off" and log out of the app
* Log back into the app with the same user email Id and password that you used earlier. In my example, I used *"demo@example.com"* and *"password"*. So I will log in with those credentials again.
* Confirm that you see the profile screen  with the *name* and *image* values that you set earlier. 

![Log Off and Log Back On](./log_off_on.gif '#width=300px')

## Learn More

Congratulations on completing this tutorial!

This tutorial walked you through a very basic example of how to get up and running with Couchbase Lite as a local-only, standalone embedded data store in your iOS app. If you want to learn more about Couchbase Mobile, check out the following links.

### Further Reading

* <a target="_blank" rel="noopener noreferrer" href="https://www.couchbase.com/products/mobile">Introduction to Couchbase Mobile</a>
* <a target="_blank" rel="noopener noreferrer" href="https://blog.couchbase.com/beta-release-mobile-edge-computing/">Couchbase Mobile 3.0 Annoucement</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/3.0/index.html">Couchbase Lite Reference Guide</a>
* <a target="_blank" rel="noopener noreferrer" href="https://blog.couchbase.com/category/couchbase-mobile/">Couchbase Mobile Blogs</a>
