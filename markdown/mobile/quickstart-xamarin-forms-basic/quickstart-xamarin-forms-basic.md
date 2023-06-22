---
# frontmatter
path: "/tutorial-quickstart-xamarin-forms-basic"
title: Quickstart in Couchbase Lite with C#, .NET, and Xamarin Forms
short_title: C# and Xamarin Start
description: 
  - Learn how to install Couchbase Lite
  - Build an App in .NET with C#, Xamarin Forms, and Couchbase Lite
  - Learn how to Create, Read, Update, and Delete documents
content_type: quickstart
filter: mobile
technology: 
  - mobile
  - kv
  - query
landing_page: mobile
landing_order: 3
tags:
  - .NET
  - Xamarin
sdk_language:
  - csharp
length: 30 Mins
---

## Introduction

Couchbase Mobile brings the power of NoSQL to the edge.  It is comprised of three components:

* **Couchbase Lite**, an embedded, NoSQL JSON Document Style database for your mobile apps.
* **Sync Gateway**, an internet-facing synchronization mechanism that securely syncs data between mobile clients and server.
* **Couchbase Server**, a highly scalable, distributed NoSQL database platform.

Couchbase Mobile supports flexible deployment models. You can deploy

* Couchbase Lite as a standalone embedded database within your mobile apps or,
* Couchbase Lite enabled mobile clients with a Sync Gateway to sychronize data between your mobile clients or,
* Couchbase Lite enabled clients with a Sync Gateway to sync data between mobile clients and the Couchbase Server, which can persist data in the cloud (public or private)

This tutorial will walk you through a very basic example of how you can use *Couchbase Lite in standalone mode* within your Xamarin Forms app for **iOS**, **Android**, and **UWP**.

You will learn the fundamentals of

* Database Operations
* Document CRUD Operations

You can learn more about Couchbase Mobile <a target="_blank" rel="noopener noreferrer" href="https://developer.couchbase.com/mobile">here</a>.

## Prerequisites

This tutorial assumes familiarity with building apps with <a target="_blank" rel="noopener noreferrer" href="https://dotnet.microsoft.com/en-us/apps/xamarin">Xamarin</a>, more specifically <a target="_blank" rel="noopener noreferrer" href="https://dotnet.microsoft.com/en-us/apps/xamarin/xamarin-forms">Xamarin.Forms</a> using C# and <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/visualstudio/xaml-tools/xaml-overview?view=vs-2022">XAML</a>.

* For iOS/Mac development, you will need a Mac running MacOS 11 or 12
* iOS/Mac (Xcode 12/13) - Download latest version from the <a target="_blank" rel="noopener noreferrer" href="https://itunes.apple.com/us/app/xcode/id497799835?mt=12">Mac App Store</a> or via <a target="_blank" rel="noopener noreferrer" href="https://github.com/RobotsAndPencils/XcodesApp">Xcodes</a>
> **Note**: If you are using an older version of Xcode, which you need to retain for other development needs, make a copy of your existing version of Xcode and install the latest Xcode version.  That way you can have multiple versions of Xcode on your Mac.  More information can be found in [Apple's Developer Documentation](https://developer.apple.com/library/archive/technotes/tn2339/_index.html#//apple_ref/doc/uid/DTS40014588-CH1-I_HAVE_MULTIPLE_VERSIONS_OF_XCODE_INSTALLED_ON_MY_MACHINE__WHAT_VERSION_OF_XCODE_DO_THE_COMMAND_LINE_TOOLS_CURRENTLY_USE_).
* For Android development SDK version 22 or higher.  You can manage your Android SDK version in <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/xamarin/android/get-started/installation/android-sdk?tabs=macos">Visual Studio</a>.
* For Universal Windows Platform (UWP) development, a Windows computer running Windows 10 1903 or higher
> **Note**:  You can not edit or debug UWP projects with Visual Studio for Mac and you can't edit or debug Mac projects with Visual Studio for PC.
* Visual Studio for <a target="_blank" rel="noopener noreferrer" href="https://visualstudio.microsoft.com/vs/mac/">Mac</a> or <a target="_blank" rel="noopener noreferrer" href="https://visualstudio.microsoft.com/vs/">PC</a>.

## App Overview

We will be working with a very simple _User Profile_ app.  It does one thing -- Allow a user to log in and create or update their user profile data.  

The user profile data is persisted as a Document in the local Couchbase Lite Database.  So, when the user logs out and logs back in again, the profile information is loaded from the Database.

![user profile](./user_profile.gif)

## Installation

* To clone the project from GitHub, type the following command in your terminal

```bash
git clone https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-standalone
```

### Try it out

* Open the `UserProfileDemo.sln`. The project would be located at `/path/to/userprofile-couchbase-mobile-xamarin/src`.

```bash
open UserProfileDemo.sln
```

* Build the solution using your preferred IDE (e.g. Visual Studio for <a target="_blank" rel="noopener noreferrer" href="https://visualstudio.microsoft.com/vs/mac/">Mac</a> or <a target="_blank" rel="noopener noreferrer" href="https://visualstudio.microsoft.com/vs/">PC</a>.
* <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/xamarin/get-started/first-app/index?pivots=windows">Run the app</a> on a device or simulator/emulator.
* Verify that you see the login screen.

![User Profile Login Screen Image](./user_profile_login.png '#width=300px')

## Solution Overview

The User Profile demo app is a Xamarin.Forms based solution that supports iOS and Android mobile platforms along with the UWP desktop platform.

The solution utilizes various design patterns and principles such as <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel">MVVM</a>, <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Inversion_of_control">IoC</a>, and the Repository Pattern.

The solution consists of seven projects.

* **UserProfileDemo**: A .NET Standard project responsible for maintaining view-level functionality.
* **UserProfileDemo.Core**: A .NET Standard project responsible for maintaining viewmodel-level functionality.
* **UserProfileDemo.Models**: A .NET Standard project consisting of simple data models.
* **UserProfileDemo.Repositories**: A .NET Standard project consisting of repository classes responsible for Couchbase Lite database initilization, interaction, etc.
* **UserProfileDemo.iOS**: A Xamarin.iOS platform project responsible for building the `.ipa` file.
* **UserProfileDemo.Android**: A Xamarin.Android platform project responsible for building the `.apk` or `.aab` file.
* **UserProfileDemo.UWP**: A Universal Windows Platform (UWP) project responsible for building the `.exe` file that can run on Windows.

Now that you have an understanding of the solution architecture let's dive into the app!

## Couchbase Lite Nuget

Before diving into the code for the apps, it is important to point out the Couchbase Lite dependencies within the solution. The <a target="_blank" rel="noopener noreferrer" href="https://www.nuget.org/packages/Couchbase.Lite/">Couchbase.Lite Nuget package</a> is included as a reference within four projects of this solution:

1. UserProfileDemo.Repositories
2. UserProfileDemo.iOS
3. UserProfileDemo.Android
4. UserProfileDemo.UWP

The `Couchbase.Lite` Nuget package contains the core functionality for Couchbase Lite. In the following sections you will dive into the capabilities it the package provides.

## Getting started on Android 

In order to use Couchbase Lite within a Xamarin app for Android you will need to activate it.

Open <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-standalone/blob/main/src/UserProfileDemo.Android/MainActivity.cs">MainActivity.cs</a> in the `UserProfileDemo.Android` project.

```csharp
Couchbase.Lite.Support.Droid.Activate(this);
```

## Data Model

Couchbase Lite is a JSON Document Store. A `Document` is a logical collection of named fields and values.The values are any valid JSON types. In addition to the standard JSON types, Couchbase Lite supports `Date` and `Blob` data types.
While it is not required or enforced, it is a recommended practice to include a _"type"_ property that can serve as a namespace for related documents.

### The User Profile Document

The app deals with a single `Document` with a _"type"_ property of _"user"_.  The document ID is of the form *`"user::demo@example.com"`*.
An example of a document would be:

```json
{
    "type":"user",
    "name":"Jane Doe",
    "email":"jane.doe@earth.org",
    "address":"101 Main Street",
    "image":CBLBlob (image/jpg)
}
```

A special `blob` data type that is associated with the profile image -- see <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/3.0/swift/blob.html">Working with Blobs</a>.  

### The User Record 

The **_"user"_** `Document` is encoded to a class named _UserProfile_ that resides in the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-standalone/blob/main/src/UserProfileDemo.Models/UserProfile.cs">UserProfileDemo.Models</a> project.

```csharp
public class UserProfile
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Address { get; set; }
    public byte[] ImageData { get; set; }
    public string Description { get; set; }
}
```

## Basic Database Operations

In this section, we will do a code walkthrough of the basic Database operations

### Create / Open a Database

When a user logs in, we create an empty Couchbase Lite database for the user if one does not exist.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-standalone/blob/main/src/UserProfileDemo.Repositories/BaseRepository.cs">BaseRepository.cs</a> file and locate the `Database` property. When the `Database` property is used for the first time a Couchbase Lite database will be opened, or created if it does not already exist via the instantiation of a new object.

```csharp
Database _database;
protected Database Database
{
    get
    {
        if (_database == null)
        {
            _database = new Database(DatabaseName, DatabaseConfig);
        }

        return _database;
    }
    private set => _database = value;
}
```

* We create an instance of the `DatabaseConfiguration` within <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-standalone/blob/main/src/UserProfileDemo.Repositories/UserProfileRepository.cs">UserProfileRepository.cs</a> via an `abstract` requirement from the parent class, `BaseRepository`. This is an optional step. In our case, we would like to override the default path of the database. Every user has their own instance of the `Database` that is located in a folder corresponding to the user. Please note that the default path is platform specific.

```csharp
DatabaseConfiguration _databaseConfig;
protected override DatabaseConfiguration DatabaseConfig
{
    get
    {
        if (_databaseConfig == null)
        {
            if (AppInstance.User?.Username == null)
            {
                throw new Exception($"Repository Exception: A valid user is required!");
            }

            _databaseConfig = new DatabaseConfiguration
            {
                Directory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                                AppInstance.User.Username)
            };
        }

        return _databaseConfig;
    }
    set => _databaseConfig = value;
}
```

* Then we create a local Couchbase Lite database named "userprofile" for the user. If a database already exists for the user, the existing version is returned.

```csharp
_database = new Database(DatabaseName, DatabaseConfig);
```

### Listening to Database Changes

You can be asynchronously notified of any change (add, delete, update) to the `Database` by registering a change listener with the `Database`. In our app, we are not doing anything special with the `Database` change notification other than logging the change. In a real world app, you would use this notification for instance, to update the UI.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-standalone/blob/main/src/UserProfileDemo.Repositories/BaseRepository.cs">BaseRepository.cs</a> file and locate the `Database.AddChangeListener` function usage within the constructor. 

```csharp
DatabaseListenerToken = Database.AddChangeListener(OnDatabaseChangeEvent);
```

* To register a change listener with the database we add the delegate method `OnDatabaseChangeEvent`. This is an optional step. The `AddChangeListener` method returns a `ListenerToken`. The `ListenerToken` is required to remove the listener from the database.  The listener is a delegate method that takes two parameters of type `object` and `DatabaseChangedEventArgs` respectively.

```csharp
void OnDatabaseChangeEvent(object sender, DatabaseChangedEventArgs e)
{
    foreach (var documentId in e.DocumentIDs)
    {
        var document = Database?.GetDocument(documentId);

        string message = $"Document (id={documentId}) was ";

        if (document == null)
        {
            message += "deleted";
        }
        else
        {
            message += "added/updated";
        }

        Console.WriteLine(message);
    }
}
```

### Close Database

When a user logs out, we close the Couchbase Lite database associated with the user, deregister any database change listeners, and free up memory allocations.

Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-standalone/blob/main/src/UserProfileDemo.Repositories/BaseRepository.cs">BaseRepository.cs</a> file and locate the `Dispose` method. In our sample `Dispose` handles the removal of database listeners, removing various objects from memory, and closing the database.  `Dispose` will be called when a user logs out.

```csharp
public void Dispose()
{
    DatabaseConfig = null;

    Database.RemoveChangeListener(DatabaseListenerToken);
    Database.Close();
    Database = null;
}
```

### Try it out

1. The app can be tested using a simulator/emulator or device.
2. Log into the app with any username and password. Let's use the values **_"demo@example.com"_** and **_"password"_** for username and password fields respectively. If this is the first time that the user is signing in, a new Couchbase Lite database will be created. If not, the user's existing database will be opened.
3. Confirm that the console log output has a message similar to the one below. In this example, logging in with a username of **_"demo@example.com"_**.

For iOS on a Mac - this will open or create a database at path
```bash
/Users/[user_name]/Library/Developer/CoreSimulator/Devices/[unique_device_id]/data/Containers/Data/Application/[unique_app_id]/Library/Application Support/demo@example.com
```

4. Note the folder location of the database, which is indicated in the above log message
5. Open the folder in your Finder app and verify that a database with name **_"userprofile"_** is exists for the user

![User Profile Database Location](./db_location.png '#width=300px')

## Document Operations

Once an instance of the Couchbase Lite database is created/opened for the specific user, we can perform basic `Document` functions on the database. In this section, we will walkthrough the code that describes basic `Document` operations

### Reading a Document

Once the user logs in, the user is taken to the "Your Profile" screen. A request is made to load [The "User Profile" Document](#the-user-profile-document) for the user. When the user logs in the very first time, there would be no **_user profile_** document for the user.

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-standalone/blob/main/src/UserProfileDemo.Core/ViewModels/UserProfileViewModel.cs">UserProfileViewModel.cs</a> file and locate the `userProfileDocId` definition. This document Id is constructed by prefixing the term "user::" to the username of the user.

```csharp
string UserProfileDocId => $"user::{AppInstance.User.Username}";
```

* The `UserProfileViewModel` is tasked with retrieving the profile for a logged in user. It does this by using a class that implements `IUserProfileRepository`.

```csharp
var up = UserProfileRepository?.Get(UserProfileDocId);
```

* In the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-standalone/blob/main/src/UserProfileDemo.Repositories/UserProfileRepository.cs">UserProfileRepository.cs</a> file, locate the `Get` function.

```csharp
public override UserProfile Get(string userProfileId)
```

* We try to fetch the document with specified `userProfileDocId` from the database.

```csharp
var document = Database.GetDocument(userProfileId); // (1)

if (document != null)
{
    userProfile = new UserProfile // (2)
    {
    Id = document.Id,
    Name = document.GetString("Name"),
    Email = document.GetString("Email"), // (3) 
    Address = document.GetString("Address"),
    ImageData = document.GetBlob("ImageData")?.Content
    }; // (4)
}
```

1. Fetch an **immutable** copy of the `Document` from the database.
2. Create an instance of [The User Record](#the-user-record) object.
3. Set the `email` property of the UserProfile with the username of the logged in user. 
> **Note:** This value is not editable after it is not initially saved.
4. If the document exists and is fetched succesfully, a variety of methods exist that can be used to fetch members of the `Document`. Specifically, note the support of the `GetBlob` type to fetch the value of a property of type `Blob`.

### Creating / Updating a Document

A [The "User Profile" Document](#the-user-profile-document) is created for the user when the user taps the "Done" button on the "Profile Screen".
The function below applies whether you are creating a document or updating an existing version

* The `UserProfileViewModel` is tasked with setting values of a profile for a logged in user, and saving them to the database. It does this by using a class that implements `IUserProfileRepository`.

```csharp
bool? success = UserProfileRepository?.Save(userProfile);
```

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/dotnet-xamarin-cblite-userprofile-standalone/blob/main/src/UserProfileDemo.Repositories/UserProfileRepository.cs">UserProfileRepository.cs</a> file and locate the `Save` function.

```csharp
public override bool Save(UserProfile userProfile)
```

* We create a *mutable* instance of the `Document`. By default, all APIs in Couchbase Lite deal with immutable objects, thereby making them **thread-safe** by design. In order to mutate an object, you must explicitly get a mutable copy of the object.  Use appropriate type-setters to set the various properties of the `Document`:

```csharp
var mutableDocument = new MutableDocument(userProfile.Id);
mutableDocument.SetString("Name", userProfile.Name);
mutableDocument.SetString("Email", userProfile.Email);
mutableDocument.SetString("Address", userProfile.Address);
mutableDocument.SetString("type", "user");
if (userProfile.ImageData != null)
{
    mutableDocument.SetBlob("ImageData", new Blob("image/jpeg", userProfile.ImageData));
}
```

> Specifically, note the support of the `SetBlob` type to fetch the value of a property of type `Blob`.

* Save the document

```csharp
Database.Save(mutableDocument);
```

### Deleting a Document

We do not delete a `Document` in this sample app. However, deletion of a document is pretty straightforward and this is how you would do it.

```csharp
var document = Database.GetDocument(id);

if (document != null)
{
    Database.Delete(document);
}
```

### Try It Out

1. You should have followed the steps discussed in the "Try It Out" section under [Create / Open a Database](#create-open-a-database).
2. Enter a "name" for the user in the Text Entry box and Tap "Done".
3. Confirm that you see an alert message "Succesfully Updated Profile". The first time, you update the profile screen, the Document will be created.

![User Profile Document Creation](./doc_create.png '#width=300px')

4. Now tap on the "Upload Image" button and select an image from the Photo Album. Tap "Done".

![image selection](./image_selection.gif)

5. Confirm that you see an alert message "Succesfully Updated Profile". The Document will be updated this time.
6. Tap "Log Off" and log out of the app
7. Log back into the app with the same user email Id and password that you used earlier. In my example, I used _"demo@example.com"_ and _"password"_. So I will log in with those credentials again.
8. Confirm that you see the profile screen  with the _name_ and _image_ values that you set earlier.  

![log off](./log_off_on.gif)

## Learn More

Congratulations on completing this tutorial!

This tutorial walked you through a very basic example of how to get up and running with Couchbase Lite as a local-only, standalone embedded data store in your iOS, Android, or UWP app. If you want to learn more about Couchbase Mobile, check out the following links.

### Further Reading

* <a target="_blank" rel="noopener noreferrer" href="https://www.couchbase.com/products/mobile">Introduction to Couchbase Mobile</a>
* <a target="_blank" rel="noopener noreferrer" href="https://blog.couchbase.com/beta-release-mobile-edge-computing/">Couchbase Mobile 3.0 Annoucement</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/3.0/index.html">Couchbase Lite Reference Guide</a>
* <a target="_blank" rel="noopener noreferrer" href="https://blog.couchbase.com/category/couchbase-mobile/">Couchbase Mobile Blogs</a>
