---
# frontmatter
path: "/android-kotlin-learning-key-value"
title:  Learn Couchbase Lite Key Value Engine with Kotlin and Jetpack Compose
short_title: Key Value Engine 
description: 
  - Learn how to run Couchbase Lite in Standalone mode.
  - Use the Key Value engine to create and update documents.
content_type: tutorial
filter: mobile
technology: 
  - mobile
  - kv
landing_page: mobile
landing_order: 2
exclude_tutorials: true 
tags:
  - Android
sdk_language:
  - kotlin
length: 30 Mins
---

## Introduction

In this part of our learning path, you will walk through the "Audit Inventory" demo application of using Couchbase Lite in *standalone mode*, which means the database does not sync information from other resources using replication.  While the demo app has a lot of functionality, this step will walk you through:  

* Installing Couchbase Lite on Android 
* Database operations for creating, opening, closing, and deleting a database
* Document create, read, update, and delete (CRUD) operations via key-value pair

In this step of the learning path, you will be working with the code that allows users to log in and make changes to their user profile information.  User profile information is persisted as a `Document` in the local Couchbase Lite `Database`. When the user logs out and logs back in again, the profile information is loaded from the `Database`.

![User Profile App Demo,400](user_profile.gif)

## Installation

### Fetching App Source Code

#### Clone Source Code

* Clone the `Learn Couchbase Lite with Kotlin and Jetpack Compose` repository from GitHub.

```bash
git clone https://github.com/couchbase-examples/android-kotlin-cbl-learning-path.git
```

### Installing Couchbase Lite Framework

* The Demo app already contains the appropriate additions for downloading and utilizing the Kotlin Android Couchbase Lite dependency module.  However, in the future, to include Couchbase Lite support within an Andorid app add the following within <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/build.gradle#L21">src/build.gradle</a>

```bash
allprojects {
    repositories {
        ...

        maven {
            url "https://mobile.maven.couchbase.com/maven2/dev/"
        }
    }
}
``` 
 
Then add the following to the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/build.gradle#L130">app/build.gradle</a> file.

```bash
dependencies {
    ...

    implementation "com.couchbase.lite:couchbase-lite-android-ktx:3.0.0"
}
```

### Try it out

* Open src/build.gradle using Android Studio.
* Build and run the project.
* Verify that you see the login screen.

![User Profile Login Screen Image](user_profile_login.png '#width=250px')

## Data Model

Couchbase Lite is a JSON Document Store. A `Document` is a logical collection of named fields and values. The values are any valid JSON types. In addition to the standard JSON types, Couchbase Lite supports `Date` and `Blob` data types. While it is not required or enforced, it is a recommended practice to include a _"type"_ property that can serve as a namespace for related documents.

### The User Profile Document

The sample app deals with a single `Document` with a _"documentType"_ property of _"user"_.  The document ID is of the form **"user::&lt;email&gt;"**.
An example of a document would be:

```json
{
  "surname":"Doe",
  "givenName":"Jane",
  "jobTitle":"Developer",
  "team":"team1",
  "email":"demo@example.com"
  "documentType":"user",
  "imageData":
  {
   "length":217527,
   "content_type":"image/jpeg",
   "digest":"sha1-+8y7vkRd2J95kVe/yG2WhuEFa4o=",
   "@type":"blob"
  },
}

```

Special <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/3.0/android/blob.html">**Blob**</a> data type that is associated with the profile image.

#### Team Membership

The team property designates which team a user is a member of.  The team property is a security boundary used as part of the database name, which means users in the same team will use the same database file if a user shares the same physical device or emulator.  To simplify things in this learning path, the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/services/MockAuthenticationService.kt#L33">**MockAuthenticationService**</a> class defines users and which teams they belong to.  Security rules, team membership, and authentication would normally be handled in an OAuth provider or a custom system in an actual mobile application.    

### UserProfile

Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/profile/UserProfileViewModel.kt#L101">*UserProfileViewModel.kt*</a> ViewModel in the com.couchbase.learningpath.ui.profile  directory.  For the purpose of this tutorial the _"user"_ `Document` is first stored within an `Any` of type `HashMap<String, Any>`.

```kotlin
val profile = HashMap<String, Any>()
profile["givenName"] = givenName.value as Any
profile["surname"] = surname.value as Any
profile["jobTitle"] = jobTitle.value as Any
profile["email"] = emailAddress.value as Any
profile["team"] = team.value as Any
profile["documentType"] = "user" as Any
profilePic.value?.let {
  val outputStream = ByteArrayOutputStream()
  it.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
  profile["imageData"] =
      Blob("image/jpeg", outputStream.toByteArray()) as Any
}
```

The `HashMap<String, Any>` object functions are used as a data storage mechanism between the app's UI and the backing functionality of the Couchbase Lite `Document` object.

## Basic Database Operations

In this section, we will do a code walkthrough of the basic Database operations.

### Initialize Couchbase Lite

Before you can start using Couchbase Lite on Android, you would have to initialize it. Couchbase Lite needs to be initialized with the appropriate Android Application Context. 

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/DatabaseManager.kt#L36">**DatabaseManager.kt**</a> file and locate the `init` constructor.

```kotlin
class InventoryDatabase private constructor (private val context: Context) {
    ...
    init {
        //setup couchbase lite
        CouchbaseLite.init(context)
        ...
    }
```

### Create and Open a Database

When a user logs in, we create an empty Couchbase Lite database if one does not exist.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/DatabaseManager.kt#L69">**DatabaseManager.kt**</a> file and locate the `initializeDatabases` function.

```kotlin
fun initializeDatabases(currentUser: User) 
```
> NOTE:  You will notice that this code has initialization for two different databases, the inventory database that we will be usign in this step, and the warehouse database.  For this step you can ignore the code that initializes the warehouse database as we will cover it in a later step.

* We create an instance of the `DatabaseConfiguration` within <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/DatabaseManager.kt#L73">**DatabaseManager.kt**</a>. Each team has their own instance of the Database that is located in a folder corresponding to the team name.  Please note that the default path is platform-specific.  

```kotlin
val dbConfig = DatabaseConfigurationFactory.create(context.filesDir.toString())
```

* Then we create a local Couchbase Lite database named **"*teamname*_userprofiles"**. If a database already exists, the existing version is returned.
```kotlin
// create or open a database to share between team members to store
// projects, assets, and user profiles
// calculate database name based on current logged in users team name
val teamName = (currentUser.team.filterNot { it.isWhitespace() }).lowercase()
currentInventoryDatabaseName = teamName.plus("_").plus(defaultInventoryDatabaseName)
inventoryDatabase = Database(currentInventoryDatabaseName, dbConfig)
```

### Close a Database

When a user logs out or the app goes to the background, we close the Couchbase Lite database.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/DatabaseManager.kt#L60">**DatabaseManger.kt**</a> file and locate the `closeDatabases()` function.

```kotlin
fun closeDatabases() {
```

* Closing the database is pretty straightforward

```kotlin
inventoryDatabase?.close()
``` 

### Deleting a Database 
Deletion of a database is pretty straightforward and this is how you would do it.

```kotlin
fun deleteDatabases() {
  try {
    closeDatabases()
    Database.delete(currentInventoryDatabaseName, context.filesDir)
    Database.delete(warehouseDatabaseName, context.filesDir)
  } catch (e: Exception) {
    android.util.Log.e(e.message, e.stackTraceToString())
  }
}

fun closeDatabases() {
  try {
    inventoryDatabase?.close()
    locationDatabase?.close()
  } catch (e: java.lang.Exception) {
    android.util.Log.e(e.message, e.stackTraceToString())
  }
}
```

### Try it out

* The app can be tested using a simulator/emulator or device.
* Log in to the app with any username and password. Let's use the values _"**demo@example.com**"_ and _"**P@ssw0rd12**"_ for username and password fields respectively. If this is the first time that the user is signing in, a new Couchbase Lite database will be created. If not, the existing database will be opened.

## Document Operations

Once an instance of the Couchbase Lite database is created/opened for the specific user, we can perform basic `Document` functions on the database. In this section, we will walk through the code that describes basic `Document` operations

### Reading a Document

Once the user logs in, the user is taken to the "Projects" screen.  From this screen the user would tap on the Drawer menu icon (sometimes referred to the Hamburger icon) in the upper left hand corner of the screen and tap on the Update User Profile text button.  A request is made to load [The "User Profile" Document](#the-user-profile-document) for the user. When the user logs in the very first time, there would be no _user profile_ document for the user.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/userprofile/UserProfileRepository.kt#L97">**UserProfileRepository.kt**</a> file and locate the `getCurrentUserDocumentId` function. This document Id is constructed by prefixing the term "user::" to the email Id of the user.

```kotlin
private fun getCurrentUserDocumentId(currentUser: String): String {
  return "user::${currentUser}"
}
```

* Next, in the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/userprofile/UserProfileRepository.kt#L23">**UserProfileRepository.kt**</a> file, locate the `get` method.

```kotlin
override suspend fun get(currentUser: String): Map<String, Any> {
```

> **Note**: The `get` function is required by the interface KeyValueRepository found in the file <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/KeyValueRepository.kt#L9">**KeyValueRepository.kt**</a>.

* We try to fetch the `Document` with specified `documentId` from the database.

```kotlin
val results = HashMap<String, Any>()  //  <1>
results["email"] = currentUser as Any  //  <2>

val database = InventoryDatabase.getInstance(context).database
database?.let { db ->
  val documentId = getCurrentUserDocumentId(currentUser)
  val doc = db.getDocument(documentId)  //  <3>
  if (doc != null) {
      if (doc.contains("givenName")) { //  <4>
          results["givenName"] = doc.getString("givenName") as Any  //  <4>
      }
      if (doc.contains("surname")) { //  <4>
          results["surname"] = doc.getString("surname") as Any  //  <4>
      }
      if (doc.contains("jobTitle")) { //  <4>
          results["jobTitle"] = doc.getString("jobTitle") as Any  //  <4>
      }
      if (doc.contains("team")) { //  <4>
          results["team"] = doc.getString("team") as Any  //  <4>
      }
      if (doc.contains("imageData")) { //  <4>
          results["imageData"] = doc.getBlob("imageData") as Any  // <4>
      }
  }
}
return@withContext results  //  <5>
```

1. Create an instance of the [UserProfile](#userprofile) via `HashMap<String, Any>`.
2. Set the `email` property of the UserProfile with the email Id of the logged-in user. This value is not editable.
3. Fetch an *immutable* copy of the Document from the Database
4. If the document exists and is fetched successfully, we use appropriate type-getters to fetch the various members of the Document based on the property name. Specifically, note the support of the `getBlob` type to fetch the value of a property of type `Blob`
5. Return the newly constructed [UserProfile](#userprofile) object.

### Creating / Updating a Document

A ["User Profile" Document](#the-user-profile-document) is created for the user when the user taps the "Save" button on the "Edit Profile" view.  The method below applies whether you are creating a document or updating an existing version.

* Open the <a target="_blank" ref="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/data/userprofile/UserProfileRepository.kt#L54">*UserProfileRepository.kt*</a> file and locate the `save` function.

```kotlin
override suspend fun save(data: Map<String, Any>): Boolean {
```

* We create a **mutable** instance of the Document. By default, all APIs in Couchbase Lite deal with immutable objects, thereby making them *thread-safe* by design.  To mutate an object, you must explicitly get a mutable copy of the object. Use appropriate type-setters to set the various properties of the Document.

```kotlin
val mutableDocument = MutableDocument(documentId, data)
```

* Save the document.

```kotlin
database?.save(mutableDocument)
}
```

### Deleting a Document

We don't delete a `Document` in this sample app. However, deletion of a document is pretty straightforward and this is how you would do it.

```kotlin
val document = db.getDocument(documentId)

document?.let {
  db.delete(it)
  result = true
}
```

### Try It Out

* You should have followed the steps discussed in the "Try It Out" section under [Create and Open a Database](#create-and-open-a-database).
* Enter a "First Name", "Last Name", and "Job Title" for the user in the Text Entry boxes and Tap "Save".
* Confirm that you see a "Successfully Updated Profile" toast message. The first time you update the profile screen, the `Document` will be created.


![User Profile Document Creation](doc_create.png '#width=250px')

* Now tap on the "Photo" image and select an image from the Photo Album.  Note that emulators don't have photos included in most images by default, so you might need to add a photo to select.  Also some versions of Android differ in the UI used to browse for images.  

![image selection](image_selection.gif)

* Tap "Save"
* Confirm that you see the toast message "Successfully Updated Profile". The `Document` will be updated this time.
* Tap the Drawer menu icon in the upper left hand corner
* Tap "Logout" to log out of the app
* Log back into the app with the same user email Id and password that you used earlier. In my example, I used **"demo@example.com"** and **"P@ssw0rd12"**. (Logging in with those credentials again)
* Tap the Drawer menu icon in the upper left hand corner again
* Confirm that you see the user profile widget with the _name_ and _image_ values that you set earlier.  

![log off](log_off_on.gif)

## Learn More

Congratulations on completing the first step of the learning path by reviewing the code that saves User Profiles!  In this section, we walked through a very basic example of how to get up and running with Couchbase Lite as a local-only, standalone embedded data store in your Android app.  Continue on to the next step to learn how to use a pre-built database with Couchbase Lite. 

### References 

* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/gs-install.html">Documentation: Installing Couchbase Lite on Android</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/database.html">Documentation: Database for Android</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/document.html">Documentation:  Documents - Data Model</a>
