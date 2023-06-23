---
# frontmatter
path: "/learn/xamarin"
title: Couchbase Lite with .NET for Xamarin Forms Developers
short_title: Couchbase Mobile for Xamarin
description: 
  - Take a deep dive into Couchbase Lite's .NET SDK with Xamarin
  - View real examples and demos
  - Learn about QueryBuilder and Sync Gateway
content_type: learn
technology: 
  - mobile
tags:
  - iOS
  - Android 
  - .NET
  - Xamarin
sdk_language:
  - csharp
tutorials:
  - tutorial-quickstart-xamarin-forms-basic
  - tutorial-quickstart-xamarin-forms-query
  - tutorial-quickstart-xamarin-forms-sync
related_paths: 
  - /learn/xamarin
download_file: null
length: 2 Hour
---

Couchbase Mobile brings the power of NoSQL to the edge. It is comprised of three components:

- Couchbase Lite, an embedded, NoSQL JSON Document Style database for your mobile apps
- Sync Gateway, an internet-facing synchronization mechanism that securely syncs data between mobile clients and server, and
- Couchbase Server, a highly scalable, distributed NoSQL database platform

Couchbase Mobile supports flexible deployment models. You can deploy:
- Couchbase Lite as a standalone embedded database within your mobile apps or,
- Couchbase Lite enabled mobile clients with a Sync Gateway to synchronize data between your mobile clients or,
- Couchbase Lite enabled clients with a Sync Gateway to sync data between mobile clients and the Couchbase Server, which can persist data in the cloud (public or private)

In this learning path you will get started with the Couchbase Lite .NET SDK using a Xamarin Forms mobile app. You will learn how to get and insert documents using the key-value engine, query the database using the QueryBuilder engine, and learn how to sync information between your mobile app and a Couchbase Server using Sync Gateway. 

## Prerequisites

Before you get started you should take the following prerequisites into consideration:

* This learning path assumes familiarity with building apps with <a target="_blank" rel="noopener noreferrer" href="https://dotnet.microsoft.com/en-us/apps/xamarin">Xamarin</a>, more specifically <a target="_blank" rel="noopener noreferrer" href="https://dotnet.microsoft.com/en-us/apps/xamarin/xamarin-forms">Xamarin.Forms</a> using C# and <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/visualstudio/xaml-tools/xaml-overview?view=vs-2022">XAML</a>.

* For iOS/Mac development, you will need a Mac running MacOS 11 or 12
* iOS/Mac (Xcode 12/13) - Download latest version from the <a target="_blank" rel="noopener noreferrer" href="https://itunes.apple.com/us/app/xcode/id497799835?mt=12">Mac App Store</a> or via <a target="_blank" rel="noopener noreferrer" href="https://github.com/RobotsAndPencils/XcodesApp">Xcodes</a>
> **Note**: If you are using an older version of Xcode, which you need to retain for other development needs, make a copy of your existing version of Xcode and install the latest Xcode version.  That way you can have multiple versions of Xcode on your Mac.  More information can be found in <a target="_blank" rel="noopener noreferrer" href="https://developer.apple.com/library/archive/technotes/tn2339/_index.html#//apple_ref/doc/uid/DTS40014588-CH1-I_HAVE_MULTIPLE_VERSIONS_OF_XCODE_INSTALLED_ON_MY_MACHINE__WHAT_VERSION_OF_XCODE_DO_THE_COMMAND_LINE_TOOLS_CURRENTLY_USE_">Apple's Developer Documentation</a>.  The open source <a target="_blank" rel="noopener noreferrer" href="https://github.com/RobotsAndPencils/XcodesApp">Xcodes</a> project simplifies this process.
* For Android development SDK version 22 or higher.  You can manage your Android SDK version in <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/xamarin/android/get-started/installation/android-sdk?tabs=macos">Visual Studio</a>.
* For Universal Windows Platform (UWP) development, a Windows computer running Windows 10 1903 or higher.
> **Note**:  You can not edit or debug UWP projects with Visual Studio for Mac and you can't edit or debug Mac projects with Visual Studio for PC.
* Visual Studio for <a target="_blank" rel="noopener noreferrer" href="https://visualstudio.microsoft.com/vs/mac/">Mac</a> or <a target="_blank" rel="noopener noreferrer" href="https://visualstudio.microsoft.com/vs/">PC</a>.

* curl HTTP client
  * You could use any HTTP client of your choice, but we will use *curl* in our learning path. Download latest version from [curl website](https://curl.haxx.se/download.html).  MacOS Package manager users can use <a target="_blank" rel="noopener noreferrer" href="https://brew.sh/">homebrew</a>.  Windows Package Manager users can use <a target="_blank" rel="noopener noreferrer" href="https://docs.microsoft.com/en-us/windows/package-manager/winget/">winget</a>.

- Docker
  * We will be using Docker to run images of both Couchbase Server and the Sync Gateway — to download Docker, or for more information, see: <a target="_blank" rel="noopener noreferrer" href="https://docs.docker.com/get-docker/">Get Docker</a>.

## Agenda

- Quickstart in Couchbase Lite with C#, .NET, and Xamarin Forms
- Quickstart in Couchbase Lite Query with C#, .NET, and Xamarin Forms
- Quickstart in Couchbase Lite Data Sync with C#, .NET, and Xamarin Forms
