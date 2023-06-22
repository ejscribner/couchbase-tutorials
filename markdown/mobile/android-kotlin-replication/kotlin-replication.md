---
# frontmatter
path: "/android-kotlin-replication"
title: Sync Gateway, Kotlin, and Jetpack Compose
short_title: Data Sync with Sync Gateway 
description: 
  - Learn how to set up replication of documents in Couchbase Lite using Sync Gateway
  - Explore your Couchbase Lite client's configuration options
content_type: tutorial
filter: mobile
technology: 
  - mobile
landing_page: mobile
landing_order: 3
exclude_tutorials: true 
tags:
  - Android
sdk_language:
  - kotlin
length: 30 Mins
---

## Introduction

In this part of our learning path, you will walk through the "Audit Inventory" demo application of using Couchbase Lite with the Replicator, which means the database will sync information using two way replication between the mobile app and a Couchbase Server using Sync Gateway. 

In previous steps of the learning path we have enabled Live Queries on both the Project Listing screen and the Audit Listing screen.  Once replication is started those screens will update anytime new documents or changes to existing documents are replicated to the mobile device.

> **NOTE**:  This step assumes you completed the all previous steps of the learning path and specifically the <a target="_blank" rel="noopener noreferrer"  href="sync-gateway-setup?learningPath=learn/android-kotlin">`Sync Gateway Setup`</a> that sets up Sync Gateway and Couchbase Server for this demo in docker on your local computer.  You **MUST** complete this part of the learning path before moving forward. 

In this step of the learning path you will learn the fundamentals of:

* Configure your Couchbase Lite clients for replication with the Sync Gateway

## App Overview

While the demo app has a lot of functionality, this step will walk you through:

* Log in into the application
* Scrolling the list of projects 
* Setting up Replication 
* Starting Replication 
* Reviewing the code
* Validating the data is properly replicated between server and mobile device(s)

## Installation

### Fetching App Source Code

#### Clone Source Code

* If you haven't already cloned the repo from the previous steps, clone the `Learn Couchbase Lite with Kotlin and Jetpack Compose` repository from GitHub.

```bash
git clone https://github.com/couchbase-examples/android-kotlin-cbl-learning-path.git
```
#### When to Start Replication

Developers need to decide when to start replication.  For some apps it makes sense after the user logs in, while for others it might make more sense once the application is fully loaded.  In this app, two-way Replication between the app and the Sync Gateway is enabled from the Replication screen manually.  Replication can't be started until the configuration is filled out, which is handled by another screen.

## Try it out 

* Log in to the app with any username and password. Let's use the values _"**demo@example.com**"_ and _"**P@ssw0rd12**"_ for username and password fields respectively. 

* In the Demo App the Replicator screen can be found by tapping on the Drawer menu icon (sometimes referred to the Hamburger icon) in the upper left hand corner of the screen and tap on the Replication link.

![Overflow Menu](./replicator_overflow_menu.png '#width=350px')

* The Replication Status screen will not allow you to start the replicator until it is configured.  You can configure the replicator by tapping on the cog icon in the upper right hand corner of the App Bar.  This will navigate to the Replication Configuration screen.

 ![Replicator Status No Config](./replicator_status_notstarted.png '#width=350px') 
 
* The Replication Configuration screen allows you to set several of the settings that are required to start the replicator.

![Replicator Config](./replicator_config.png '#width=350px')

* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/replication.html#lbl-cfg-tgt">Sync Gateway Server URL</a> is the URL that the Sync Gateway is running on.  By default is set to `ws://10.0.2.2/projects` which is the IP address used by emulators to talk to your local computer.  If you are running this on a physical device, you will need to change this IP to your local computers IP.
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/replication.html#lbl-cfg-keep-alive">Heartbeat</a> is part of the retry configuration and is used to detect connection errors.  The current value is set to 60 seconds.  
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/replication.html#lbl-cfg-sync">Replicator Type</a> - this is often referred to `Sync Mode` and defaults to Push and PUll 
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/replication.html#lbl-cfg-sync">Continious</a> is also part of the `Sync Mode` settings and defaults to on which means the application will contiue to replicate until manually stopped.
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/replication.html#lbl-cfg-sync">Accept Only Self-Signed Certs</a> is an Enterprise only feature and currently is turned on.  When this setting is turned off client validates the server’s certificates against the system CA certificates. The server must supply a chain of certificates whose root is signed by one of the certificates in the system CA bundle.
* The Authentication information is read-only and is the username and password that you signed into the mobile app with.  This will be used to authenticate against Sync Gateway so that the documents that are replicated are only the ones that the user's team has access to.
* Tap the Save button - it will save the configuration and returns you to the main Replicator screen.
* The Replication Status screen now has new buttons on it since a configuration is available to stop, start, and delete the configuration.

![Replicator Start Available](./replicator_status_start_available.png '#width=350px')

> **NOTE**: At this point your Couchbase Server and Sync Gateway servers should be started in Docker which was covered in the <a target="_blank" rel="noopener noreferrer"  href="sync-gateway-setup?learningPath=learn/android-kotlin">`Sync Gateway Setup`</a> step of the learning path. If you start replication and the Sync Gateway Server is not started, you will time out trying to connect to it.
 
* Once replication starts you will see status messages appear in the mobile app.  Replication shouldn't take long and when it's done the replicator status will change to IDLE.

![Replicator Complete](./replicator_status_completed.png '#width=350px')  

## Validate Documents Replicated

Valdiating that the documents replicated from the device and from server can be done from the mobile app and from Couchbase Server since we have two-way replication enabled.

### Demo App

* In the Demo App navigate to the Home screen which can be found by tapping on the Drawer menu icon (sometimes referred to the Hamburger icon) in the upper left hand corner of the screen and tap on the Home link.

* Scrolling through the list you should see three new documents starting with the word `Warehouse` and then a number.  The numbers are different for each group of teams.
  * Team1:  Warehouse 100, Warehouse 101, Warehouse 102
  * Team2:  Warehouse 200, Warehouse 201, Warehouse 202
  * Team3:  Warehouse 300, Warehouse 301, Warehouse 302 

![Replicator Warehouse Documents](./replicator_warehouse_documents.png '#width=350px')  

* You can test other team members by logging out and logging in as `demo2@example.com` or `demo4@example.com` with the same password and starting the replicator to see those documents listed above.
 
### Couchbase Server with Administration Console 

* Open your web browser of choice and navigate to the following URL: <a target="_blank" rel="noopener noreferrer" href="http://localhost:8091/">http://localhost:8091/</a>

* Log into the portal using the same username and password that was displayed in the top of the Couchbase Server docker logs:

 * Username: **Administrator**
 * Password: **P@$w0rd12**

* From the Cluster > Dashboard page click on Buckets link on the navigation menu on the left side of the screen.

* On this screen you can see the number items in the buck should have increased from the Sync Gateway Setup step of the learning path.  To view the documents, click on the Documents link to open the Document browser.

![Couchbase Server Buckets](./cbserver_bucket_documents.png '#width=800px')  

* Change the Limit box from the default value to 50 and click the Retrieve Docs button.

* Scrolling through the list you should find your random documents that were created on the mobile device during the Batch operations step of the learning path.

## Reviewing the Replicator code

Now that we have tried out replication, let's review how the replicator and replicator configuration code is setup. All code used by the ReplicatorViewModel and ReplicatorConfigViewModel us located in the ReplicatorServiceDb class. 

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/services/ReplicatorServiceDb.kt#L17"> **ReplicatorServiceDb.kt**</a> file.

* The override of replicatorConfig is used to setup the config with default values that you saw on the Replication Configuration screen.
  
```kotlin
//if your sync gateway server is running on a different IP change it here
override var replicationConfig = mutableStateOf(
 ReplicatorConfig(
  username = loggedInUser.username,
  password = loggedInUser.password,
  endpointUrl = "ws://10.0.2.2:4984/projects",
  replicatorType = "PUSH AND PULL",
  heartBeat = 60L,
  continuous = true,
  selfSignedCert = true
 )
)
```
* As stated in the comments if your Sync Gateway server is not running on your local computer, this is where you would change that setting.

* Anytime the replication configuration is changed on this screen the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/services/ReplicatorServiceDb.kt#L60"> **updateReplicatorConfig**</a> function is called. 

```kotlin
replicatorManager?.let { replicatorResources ->
 val urlEndPoint = URLEndpoint(URI(replicationConfig.endpointUrl)) // 1
 replicatorResources.replicatorConfiguration = ReplicatorConfiguration(replicatorResources.database, urlEndPoint) // 2
 replicatorResources.replicatorConfiguration?.let { replicatorConfiguration -> //3
  replicatorConfiguration.isContinuous = replicationConfig.continuous // 4

  when (replicationConfig.replicatorType) { // 5
   "PULL" -> replicatorConfiguration.type = ReplicatorType.PULL // 5
   "PUSH" -> replicatorConfiguration.type = ReplicatorType.PUSH // 5
   else -> replicatorConfiguration.type =  ReplicatorType.PUSH_AND_PULL // 5
  }
  val authenticator = BasicAuthenticator( // 6
   replicationConfig.username, // 6
   replicationConfig.password.toCharArray() // 6
  )
  replicatorConfiguration.setAuthenticator(authenticator) //6
  replicatorResources.replicator =                            
  Replicator(replicatorManager?.replicatorConfiguration!!) //7
  }

 canStartReplication.value = true //8
 this.replicationConfig.value = replicationConfig //9
}
```
1. The endpoint URL for the Sync Gateway server is created
2. A ReplicatorConfiguration is created using the database and urlEndpoint created in #1.
3. Because the ReplicatorConfiguration could be null we need to unbox it for usage and create a reference to it using  replicatorConfiguration 
4. Set the continuous setting for the replicator
5. Set the Sync Mode of the replicator to either PUSH, PULL, or PUSH_AND_PULL 
6. Set the username and password that will be used to communicate with the Sync Gateway server.
7. Create a new Replicator reference using the configuration that can be used to start and stop replication
8.  Set the canStartReplication state varible which is used in the UI to hide and show the Start, Stop, and Delete buttons on the main Replicator Status screen
9.  Save the configuration for future modifications on the Replication Configuration screen.

* The <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/services/ReplicatorServiceDb.kt#L115"> **startReplication**</a> function is used to start the replicator.

```kotlin
override fun startReplication() {
 try {
  replicatorManager?.replicator?.start()
  isReplicationStarted = true
 } catch (e: Exception){
  Log.e(e.message, e.stackTraceToString())
 }
}
```

1. The start function is called on the replicatorManager's replicator

* The <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/services/ReplicatorServiceDb.kt#L115"> **stopReplication**</a> function is used to stop the replicator.

```kotlin
override fun stopReplication() {
 try {
  replicatorManager?.replicator?.stop()
  isReplicationStarted = false
  canStartReplication.value = false
 } catch (e: Exception){
  Log.e(e.message, e.stackTraceToString())
 }
}
```
1. The stop function is called on the replicatorManager's replicator

2. The canStartReplication variable is used to force the user to go back into the configuration screen and click save again before starting replicaton.  This is because when the application is sent to the background this method is called so that replication doesn't run in the background and try to update UI components that it doesn't have access to because they are no longer running on the main thread.

* To view the lifecycle code - open <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/services/ReplicatorServiceDb.kt#L115"> **MainViewModel.kt**</a> and locate the closeDatabase function.

```kotlin
val closeDatabase: () -> Unit = {
 viewModelScope.launch(Dispatchers.IO) {
  context.get()?.let {
   replicatorService.stopReplication()
   DatabaseManager.getInstance(it).closeDatabases()
  }
 }
}
```
1. In the closeDatabase funciton we stop replication before closing the database

* Now open <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/ui/MainActivity.kt#L156"> **MainViewModel.kt**</a> and locate the MainView function. 

```kotlin
@Composable
fun MainView(startDatabase: () -> Unit,
             closeDatabase: () -> Unit) {
```

* The MainView function takes in the startDatabase and closeDatabase functions from the MainViewModel and then tracks them in state.

```kotlin
// Safely update the current lambdas when a new one is provided
val currentOnStart by rememberUpdatedState(startDatabase)
val currentOnStop by rememberUpdatedState(closeDatabase)
```

* The DisposableEffect API is used passing in the lifecyleOwer to observe lifecycle events of the application.  These are used to detect when the application comes to the foreground or goes to the background.  When the application goes to the background we want to stop replication and close the database and when the application comes back to the foreground we want to open the database.

```kotlin
//if lifecycleOwner changes, dispose and reset the effect
DisposableEffect(lifecycleOwner) {
// Create an observer that triggers our remembered callbacks
 val observer = LifecycleEventObserver { _, event ->
  if (event == Lifecycle.Event.ON_START) {
   currentOnStart()
  } else if (event == Lifecycle.Event.ON_PAUSE) {
    currentOnStop()
  }
 }
 // Add the observer to the lifecycle
 lifecycleOwner.lifecycle.addObserver(observer)

 // When the effect leaves the Composition, remove the observer
 onDispose {
  lifecycleOwner.lifecycle.removeObserver(observer)
 }
}
``` 

1. The `Lifecycle.Event.ON_START` is used to call the startDatabase function in our MainViewModel
2. The `Lifecycle.Event.ON_PAUSE` is used to call the closeDatabase function in our MainViewModel. 
3. More information on DisposableEffect can be found in the <a target="_blank" rel="noopener noreferrer" href="https://developer.android.com/jetpack/compose/side-effects#disposableeffect">Android documentation</a>.

## Exercise 

In this exercise, we will observe how changes made on one app are synced across to the other app

1. The app should be running in two emulators side by side
2. Log into one of the emulators with the username **_"demo@example.com"_** and the password **_"P@ssw0rd12"_**.
3. On the other emulator log into the app with the username **_"demo1@example.com"_** and the password **_"P@ssw0rd12"_**.
4. Because demo and demo1 are on the same team - they should be able see changes made to documents by the other user.
5. On one simulator, edit the name and location values of a project.
6. Confirm that changes show up in the app on the other simulator.
7. Similarly, make changes to the app in the other simulator and confirm that the changes are synced over to the first simulator.

## Handling Conflicts during Data Synchronization

Data conflicts are inevitable in an environment where you can potentially have multiple writes updating the same data concurrently. Couchbase Mobile supports **_Automated Conflict Resolution_**.  You can learn more about this in the documentation on <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/conflict.html">Handling Data Conflicts</a>.

## Learn More

Congratulations on completing this step of the learning path!  In this section, we walked through setting up the Replicator Config and started two-way replication between a mobile app and Sync Gateway. 

### References 

* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/replication.html">Documentation: Data Sync using Sync Gateway</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-live.html#using-kotlin-flows-and-livedata">Using Kotlin Flows and LiveData</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/conflict.html">Documentation:  Handling Data Conflicts</a>
