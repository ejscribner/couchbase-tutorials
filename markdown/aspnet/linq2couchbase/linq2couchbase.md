---
# frontmatter
path: "/tutorial-linq-vscode"
title: .NET Core with Linq2Couchbase First Query
short_title: Linq and Couchbase
description:
  - Use the Couchbase C# SDK in a .NET Core console application to create new database records and look them up with Linq2Couchbase
  - Learn how to use Linq in conjunction with Couchbase and explore the Linq2Couchbase tool
content_type: tutorial
filter: sdk
technology:
  - connectors
exclude_tutorials: false
tags:
  - ASP.NET
  - linq
sdk_language:
  - csharp
length: 30 Mins
---

## Prerequisite: Run Couchbase Server

1. Couchbase Server 6.5 is already running.
2. An empty bucket named "default" has been created.
3. Both a primary index and an adaptive index have been created and built on the default bucket.
4. If you still need to perform these tasks please use the following:

[10-minute Couchbase Docker Container Configuration](/tutorial-docker-image-manual-cb65)

5. Visual Studio Code is installed. This tutorial uses <a href="https://code.visualstudio.com/" target="_blank">Visual Studio Code 1.44</a>
6. A <a href="https://dotnet.microsoft.com/download/dotnet-core" target="_blank">.NET Core Runtime</a> is installed. This tutorial uses .NET Core 3.1

## Step 1: Start a New .NET Core Project

From a command line, use `dotnet new` to create a new project. For this quickstart, we'll be creating a simple console application:

```bash
dotnet new console -n FirstQuery
```

After executing that command, you should see an output similar to this:

```bash
The template "Console Application" was created successfully.

Processing post-creation actions...
Running 'dotnet restore' on FirstQuery\FirstQuery.csproj...
  Restore completed in 137.68 ms for C:\your\folder\here\FirstQuery\FirstQuery.csproj.

Restore succeeded.
```

Open this folder with Visual Studio Code by using File->Open Folder.

![Open Folder in Visual Studio Code](./openFolder.png)

When you open the folder, you should see the contents of the folder, including Program.cs.

![Folder contents in Visual Studio Code](./folderContents.png)

Program.cs is where we will be doing all the coding for this exercise. It should currently contain a "Hello, World" example like this:

```csharp
static void Main(string[] args)
{
    Console.WriteLine("Hello World!");
}
```

Next, install the <a target="_blank" rel="noopener noreferrer" href="https://github.com/couchbaselabs/Linq2Couchbase">Linq2Couchbase</a> package from NuGet. On the command line:

```bash
dotnet add package Linq2Couchbase --version 1.4.2
```

After running this, you should see an output similar to:

```bash
  Writing C:\Users\mgroves\AppData\Local\Temp\tmp4C1A.tmp
info : Adding PackageReference for package 'Linq2Couchbase' into project 'C:\your\folder\here\FirstQuery\FirstQuery.csproj'.
info : Restoring packages for C:\your\folder\here\FirstQuery\FirstQuery.csproj...
info : Package 'Linq2Couchbase' is compatible with all the specified frameworks in project 'C:\your\folder\here\FirstQuery\FirstQuery.csproj'.
info : PackageReference for package 'Linq2Couchbase' version '1.4.2' added to file 'C:\your\folder\here\FirstQuery\FirstQuery.csproj'.
info : Committing restore...
info : Generating MSBuild file C:\your\folder\here\FirstQuery\obj\FirstQuery.csproj.nuget.g.props.
info : Writing assets file to disk. Path: C:\your\folder\here\FirstQuery\obj\project.assets.json
log  : Restore completed in 1.26 sec for C:\your\folder\here\FirstQuery\FirstQuery.csproj.
```

## Step 2: Cluster and Linq Setup

First, in `Main`, create a Couchbase cluster object to connect to Couchbase Server and create a bucket object:

```csharp
include::quickstarts/linq-vscode/example/FirstQuery/Program.cs[tag=clusterSetup]
```

NOTE: For this simple console app, I'm hardcoding the credentials, but you should consider using a config file.

Using the bucket object, create a Linq2Couchbase context object:

```csharp
include::quickstarts/linq-vscode/example/FirstQuery/Program.cs[tag=linqSetup]
```

Make sure to call `cluster.Dispose()` at the end of `Main` to close and dispose any resources used in connecting to Couchbase.

## Step 3: Create new documents

Create a C# class that will correspond to the document that we will be creating:

```csharp
include::quickstarts/linq-vscode/example/FirstQuery/Program.cs[tag=user]
```

Now create instances of this object, and give them some values. Use `bucket.Upsert` to put this data into the Couchbase bucket.

NOTE: "Upsert" will either create a new document or update an existing document. "Insert" will create a document, but fail if it already exists. "Replace" will update a document, but fail if it doesn't exist.

```csharp
include::quickstarts/linq-vscode/example/FirstQuery/Program.cs[tag=upserts]
```

Try executing this program now by running `dotnet run` from the command line. After the program finishes executing, there should be 3 documents in the default bucket.

## Step 4: Linq2Couchbase

Open the Query Workbench in the Couchbase UI. Enter a query to select everything from the default bucket:

```sql
SELECT d.*
FROM default d
```

You should see the inserted documents in the results:

```javascript
[
  {
    "email": "perry.mason@acme.com",
    "firstName": "Perry",
    "lastName": "Mason",
    "tagLine": "Who can we get on the case?",
    "type": "user"
  },
  {
    "email": "major.tom@acme.com",
    "firstName": "Major",
    "lastName": "Tom",
    "tagLine": "Send me up a drink",
    "type": "user"
  },
  {
    "email": "jerry.wasaracecardriver@acme.com",
    "firstName": "Jerry",
    "lastName": "Wasaracecardriver",
    "tagLine": "el sob number one",
    "type": "user"
  }
]
```

Instead of writing a query directly, let's query these documents with Linq2Couchbase. Use the `context.Query<>` method to query documents with the standard Linq extension methods. To query by first name, for instance:

```csharp
include::quickstarts/linq-vscode/example/FirstQuery/Program.cs[tag=linq]
```

Run the program (again with `dotnet run`) and the output should appear like so:

```bash
Perry Mason perry.mason@acme.com
Who can we get on the case?
```

Feel free to add your own users and try your own Linq queries.

## Done

Here is the complete Startup.cs.

```csharp
include::quickstarts/linq-vscode/example/FirstQuery/Program.cs[]
```

Be sure to check out the other quick start exercises.

[The complete source code is available on GitHub](https://github.com/couchbaselabs/developer/tree/master/src/contents/quickstarts/linq-vscode/example)
