---
# frontmatter
path: "/learn/swift"
title: Couchbase Lite with Swift for iOS UIKit Developers
short_title: Couchbase Mobile Swift
description: 
  - Take a deep dive into Couchbase Lite's Swift SDK
  - View real examples and demos
  - Learn about QueryBuilder and Sync Gateway
content_type: learn
technology:
  - mobile
tags:
  - iOS
sdk_language:
  - swift
tutorials:
  - tutorial-quickstart-ios-uikit-basic
  - tutorial-quickstart-ios-uikit-query
  - tutorial-quickstart-ios-uikit-sync
related_paths: 
  - /learn/swift
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

In this learning path you will get started with the Couchbase Lite Swift SDK. You will learn how to get and insert documents using the key-value engine, query the database using the QueryBuilder engine, and learn how to sync information between your mobile app and a Couchbase Server using Sync Gateway. 

## Prerequisites

Before you get started you should take the following prerequisites into consideration:

- Familiarity with building Swift Apps with Xcode
- iOS (Xcode 12/13) - Download latest version from the <a target="_blank" rel="noopener noreferrer" href="https://itunes.apple.com/us/app/xcode/id497799835?mt=12">Mac App Store</a> or via <a target="_blank" rel="noopener noreferrer" href="https://github.com/RobotsAndPencils/XcodesApp">Xcodes</a>
> **Note**: If you are using an older version of Xcode, which you need to retain for other development needs, make a copy of your existing version of Xcode and install the latest Xcode version.  That way you can have multiple versions of Xcode on your Mac.  More information can be found in <a target="_blank" rel="noopener noreferrer" href="https://developer.apple.com/library/archive/technotes/tn2339/_index.html#//apple_ref/doc/uid/DTS40014588-CH1-I_HAVE_MULTIPLE_VERSIONS_OF_XCODE_INSTALLED_ON_MY_MACHINE__WHAT_VERSION_OF_XCODE_DO_THE_COMMAND_LINE_TOOLS_CURRENTLY_USE_">Apple's Developer Documentation</a>. The open source <a target="_blank" rel="noopener noreferrer" href="https://github.com/RobotsAndPencils/XcodesApp ">Xcodes</a> project makes managing multiple installations of Xcode easier.

- curl HTTP client 
  * You could use any HTTP client of your choice. But we will use *curl* in our tutorial. Package manager users can use <a target="_blank" rel="noopener noreferrer" href="https://brew.sh/">homebrew</a>. 

- Docker
  * We will be using Docker to run images of both Couchbase Server and the Sync Gateway — to download Docker, or for more information, see: <a target="_blank" rel="noopener noreferrer" href="https://docs.docker.com/get-docker/">Get Docker</a>.

## Agenda

- Quickstart in Couchbase Lite with iOS, Swift, and UIKit
- Quickstart in Couchbase Lite Query with iOS, Swift, and UIKit
- Quickstart in Couchbase Lite Data Sync with iOS, Swift, and UIKit
