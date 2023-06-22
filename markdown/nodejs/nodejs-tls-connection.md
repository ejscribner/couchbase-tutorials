---
# frontmatter
path: "/tutorial-nodejs-tls-connection"
# title and description do not need to be added to markdown, start with H2 (##)
title: Connecting with TLS using the Node.js SDK
short_title: Node.js TLS Connection
description:
  - See different authentication options with the Node.js SDK
  - Connect to a TLS-secured Couchbase cluster (such as Capella) with the root certificate 
  - Learn how you can secure your application and prepare it for production
content_type: tutorial
filter: sdk
technology:
  - capella
  - server
tags:
  - TLS
  - Configuration
sdk_language:
  - nodejs
length: 5 Mins
---

## Prerequisites
- A Couchbase cluster with TLS enabled. Capella clusters are secured with TLS 1.2 out of the box.
- A Node.js Project using Couchbase (see our other Node.js-based tutorials to get started!)
- Code Editor
- A root certificate for your cluster. For Capella clusters, this can be found at the bottom of the 'Connect' tab for a given cluster.

## Different Authentication Methods
We can authenticate a Couchbase connection in a variety of different ways.

### Basic Username/Password Authentication
This authentication method commonly used for locally hosted development clusters. It's the easiest method for getting started quickly, but its also not very secure. The benefit of using basic authentication is that there is no additional TLS configuration required when setting up your local Couchbase cluster.
```js
var cluster = await couchbase.connect('couchbase://localhost', {
  username: 'Administrator',
  password: 'password',
})
```
Note that this connection string begins with `couchbase://`, denoting a non-TLS connection (think `http://`).

### TLS Authentication without certificate checking
In certain situations, such as when using Capella, TLS is required. To circumvent the need to download a certificate, the parameter `?tls_verify=none` can be passed with the connection string to ignore mismatched certificates.
```js
const cluster = await couchbase.connect('couchbases://'+ endpoint +'?tls_verify=none', {
  username: 'Administrator',
  password: 'password'
});
```
Note that this connection string begins with `couchbases://`, with the 's' denoting a TLS-secured connection (think `https://`). This is a great way of connecting for development purposes, but it's important to understand that this method is **not recommended for use in production**. 

### TLS Authentication with proper certificate checking
To properly secure our connection, we'll remove the `?tls_verify=none` parameter and instead add a `security` object that contains a `trustStorePath` string that locates the root certificate file.
```js
const cluster = await couchbase.connect('couchbases://'+ endpoint, {
  username: 'Administrator',
  password: 'password',
  security: {
    trustStorePath: "/path/to/root/certificate.pem"
  }
});
```
Note that we're still using `couchbases://` here. You'll have to download the root certificate file(s). In Capella, this is located at the bottom of the 'Connect' tab for a given cluster. 


## Conclusion
Hopefully this brief tutorial has shed some light on the various authentication methods you can use with Couchbase. You can always [read more in the documentation](https://docs.couchbase.com/nodejs-sdk/current/howtos/sdk-authentication.html#authenticating-a-node-js-client-by-certificate).

The purpose of this tutorial is to help developers switch from basic authentication and/or ignoring TLS certificates for development to a properly encrypted connection for use in production. This is a really important step to ensuring your application is safe from bad actors! 
