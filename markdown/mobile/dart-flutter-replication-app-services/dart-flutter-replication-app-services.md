---
# frontmatter
path: "/dart-flutter-replication-app-services"
title:  Couchbase Capella App Services, Dart, and Flutter 
short_title: Data Sync with App Services 
description: 
  - Learn how to set up replication of documents in Couchbase Lite using Capella App Services 
  - Explore the various features of App Services 
content_type: tutorial
filter: mobile
technology: 
  - mobile
  - capella
landing_page: mobile
landing_order: 3
exclude_tutorials: true 
tags:
  - Android
  - iOS
  - Flutter
  - App Services
sdk_language:
  - dart 
length: 30 Mins
---

## Introduction

In this part of our learning path, you will walk through the "Audit Inventory" demo application of using Couchbase Lite with the Replicator, which means the database will sync information using two way replication between the mobile app and Couchbase Capella App Services. 

In previous steps of the learning path we have enabled Live Queries on both the Project Listing screen and the Audit Listing screen.  Once replication is started those screens will update anytime new documents or changes to existing documents are replicated to the mobile device.

> **NOTE**:  This step assumes you completed the all previous steps of the learning path and specifically the `Couchbase Capella App Services Setup` that sets up Capella and App Services for this demo.  **You MUST complete this part of the learning path before moving forward**. 

In this step of the learning path you will learn the fundamentals of:

* Configure your Couchbase Lite clients for replication with Couchbase Capella App Services 

## App Overview

While the demo app has a lot of functionality, this step will walk you through:

* Log in into the application
* Scrolling the list of projects 
* Setting up Replication 
* Starting Replication 
* Reviewing the code
* Validating the data is properly replicated between App Services and mobile device(s)

## Installation

### Fetching App Source Code

#### Clone Source Code

* If you haven't already cloned the repo from the previous step, clone the `Learn Couchbase Lite with Dart and Flutter` repository from GitHub.

```bash
git clone https://github.com/couchbase-examples/flutter_cbl_learning_path.git
```

## Couchbase Capella App Services Connect Hostname

In order to start replication with Couchbase Capella App Services, you will need to know the hostname of the Couchbase Capella App Services instance. You can find this by logging into <a target="_blank" rel="noopener noreferrer" href="https://cloud.couchbase.com/">Couchbase Capella</a>.
 
* Click on `App Services` in the left side navigation menu

* Click on your `Trial - App Services` instance

* Click on the `projects` App Endpoint

* Click on the `Connection` tab

* Copy URL under Public Connection.  This should look something similar to:
  * wss://hostname.apps.cloud.couchbase.com:4984/projects
  * We will use this URL in a later step, so make sure you have it available.

## Update the Replication URL in the Audit Inventory Demo App 

In Android Studio navigate to <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/flutter_cbl_learning_path/blob/main/src/lib/features/database/replicator_provider.dart#L57">replicator_provider.dart</a> found in the lib -> features -> database.

- Locate the `var url` definition

- Update the `host` and `path` to match the URL you copied from the Couchbase Capella App Services instance

- You will need to make sure that the path is the information after the port number and slash.  So for example if we were to look at this URL from App Services:  **wss://hostname.apps.cloud.couchbase.com:4984/projects**

  - I would put the following in for the host:
    - **hostname.apps.cloud.couchbase.com**
  - I would the following in for path:
    - **projects**

```dart
// <1>
var url = Uri(scheme: 'wss',
    port: 4984,
    host: 'put_your_url_in_here',             //change this line to match your configuration!!
    path: 'projects',
);

var basicAuthenticator = BasicAuthenticator(username: user.username, password: user.password);
var endPoint = UrlEndpoint(url);

// <2>
_replicatorConfiguration = ReplicatorConfiguration(
    database: db,
    target: endPoint,
    authenticator: basicAuthenticator,
    continuous: true,
    replicatorType: ReplicatorType.pushAndPull,
    heartbeat: const Duration(seconds: 60),
);

//check for nulls
var config = _replicatorConfiguration;
if(config != null) {

  // <3>
  _replicator = await Replicator.createAsync(config);
```
1. It's critical that the URL is correct.  If you have a typo or the URL is incorrect, replication will not work.  Make sure you have the correct URL. 
2. Update the `replicatorConfiguration` to use the `url` you created in the previous step
3. The replicator is created by passing in the `replicatorConfiguration` object

> **NOTE**:  DO NOT use the url provided in the example as it will not work.  You must use the url you copied from the Couchbase Capella App Services instance.

## When to Start Replication

Developers need to decide when to start replication.  For some apps it makes sense after the user logs in, while for others it might make more sense once the application is fully loaded.  In this app, two-way Replication between the app and the App Services is enabled from the Replication screen manually.  

## Try it out 

* Log in to the app with any username and password. Let's use the values _"**demo@example.com**"_ and _"**P@ssw0rd12**"_ for username and password fields respectively. 

* In the Demo App the Replicator screen can be found by tapping on the Drawer menu icon (sometimes referred to the Hamburger icon) in the upper left hand corner of the screen and tap on the Replication link.

![Overflow Menu](./replicator_overflow_menu.png '#width=350px')

* The Replication Status screen has buttons on it since a configuration is available to stop, start, and delete the configuration.

![Replicator Start Available](./replicator_status_start_available.png '#width=350px')

> **NOTE**: At this point your Capella App Services should be started and tested, which was covered in the <a target="_blank" rel="noopener noreferrer"  href="app-services-lp-audit-inventory?learningPath=learn/android-kotlin">`Couchbase Capella App Services Setup`</a> step of the learning path. If you start replication and the App Services is not setup properly, you will time out trying to connect to it.
 
* Once replication starts you will see status messages appear in the mobile app.  Replication shouldn't take long and when it's done the replicator status will change to IDLE.

![Replicator Complete](./replicator_status_completed.png '#width=350px')  

## Validate Documents Replicated

Valdiating that the documents replicated from the device and from server can be done from the mobile app and from Couchbase Capella App Services.

### Demo App

* In the Demo App navigate to the Home screen which can be found by tapping on the Drawer menu icon (sometimes referred to the Hamburger icon) in the upper left hand corner of the screen and tap on the Home link.

* Scrolling through the list you should see three new documents starting with the word `Warehouse` and then a number.  The numbers are different for each group of teams.
  * Team1:  Warehouse 100, Warehouse 101, Warehouse 102
  * Team2:  Warehouse 200, Warehouse 201, Warehouse 202
  * Team3:  Warehouse 300, Warehouse 301, Warehouse 302 

![Replicator Warehouse Documents](./replicator_warehouse_documents.png '#width=350px')  

* You can test other team members by logging out and logging in as `demo2@example.com` or `demo4@example.com` with the same password and starting the replicator to see those documents listed above.  Note that these users should have been created in App Services in the previous step.  If you didn't create these users, this will not work as they will not be able to authenticate into App Services.
 
### Couchbase Capella and App Services

* Open your web browser of choice and log into <a target="_blank" rel="noopener noreferrer" href="https://cloud.couchbase.com/">Couchbase Capella</a>. 

* Click on the `Clusters` link on the left side navigation menu

* Click on the `Trial - Cluster` located under Clusters. 

* Click on `Tools` from the toolbar menu and select `Documents`.

* On this screen you can see the number items in the buck should have increased from the the previous step of the learning path.  To view the documents, click on the Documents link to open the Document browser.

* Change the Limit box from the default value to 200 and click the Retrieve Docs button.

* Scrolling through the list you should find your random documents that were created on the mobile device during the Batch operations step of the learning path.  For example - prior to sync we didn't have any documents of documentType='audit' and now the bucket should have MANY audit documents.

![Create Bucket workflow,1500](capella-review-docs.gif)

## Reviewing the Replicator code

Now that we have tried out replication, let's review how the replicator and replicator configuration code is setup. All code used by the ReplicatorBloc and ReplicatorProvider. 

* Open the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbase-examples/android-kotlin-cbl-learning-path/blob/main/src/app/src/main/java/com/couchbase/learningpath/services/ReplicatorServiceDb.kt#L17"> **ReplicatorServiceDb.kt**</a> file.

* As stated earlier, the override of replicatorConfig is used to setup the config with default values that you saw on the Replication Configuration screen.
  
```kotlin
//if your sync gateway server is running on a different IP change it here
override var replicationConfig = mutableStateOf(
 ReplicatorConfig(
  username = loggedInUser.username,
  password = loggedInUser.password,
  endpointUrl = "wss://hostname.apps.cloud.couchbase.com:4984/projects",
  replicatorType = "PUSH AND PULL",
  heartBeat = 60L,
  continuous = true,
  selfSignedCert = false 
 )
)
```

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
1. The endpoint URL for the App Services is created
2. A ReplicatorConfiguration is created using the database and urlEndpoint created in #1.
3. Because the ReplicatorConfiguration could be null we need to unbox it for usage and create a reference to it using  replicatorConfiguration 
4. Set the continuous setting for the replicator
5. Set the Sync Mode of the replicator to either PUSH, PULL, or PUSH_AND_PULL 
6. Set the username and password that will be used to communicate with the App Services server.
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

Congratulations on completing this step of the learning path!  In this section, we walked through setting up the Replicator Config and started two-way replication between a mobile app and Couchbase Capella App Services. 

### References 

* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/cloud/app-services/index.html">Documentation:  App Services</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/query-live.html#using-kotlin-flows-and-livedata">Using Kotlin Flows and LiveData</a>
* <a target="_blank" rel="noopener noreferrer" href="https://docs.couchbase.com/couchbase-lite/current/android/conflict.html">Documentation:  Handling Data Conflicts</a>
