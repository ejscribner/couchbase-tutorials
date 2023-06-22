---
# frontmatter
path: '/tutorial-python-connect-to-cluster'
title: Connect to Couchbase Cluster using Python
short_title: Connect to Couchbase
description:
  - Learn how to connect to Couchbase clusters
  - Examples to connect to both local Couchbase server and Capella cluster
content_type: tutorial
filter: sdk
technology:
  - server
  - capella
exclude_tutorials: true
tags:
  - Configuration
sdk_language:
  - python
length: 15 Mins
---

In this tutorial, you will learn how to connect to a Couchbase cluster including both local cluster as well as Capella cluster.

## Introduction

The first step involved in working with Couchbase using Python is to connect to the cluster, be it your local Couchbase server or the Capella servers.

### Capella Cluster

To connect to Couchbase Capella, be sure to get the correct endpoint as well as user, password, certificate and bucket name. Note that for the Capella connection to work you need to whitelist the IP of the machine from which you are trying to connect. More details can be found in the [documentation](https://docs.couchbase.com/cloud/get-started/cluster-and-data.html).

```python
# Insert document with options
from datetime import timedelta

# needed for any cluster connection
from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster
# needed for options -- cluster, timeout, SQL++ (N1QL) query, etc.
from couchbase.options import (ClusterOptions, ClusterTimeoutOptions,
                               QueryOptions)


# Update this to your cluster
endpoint = "--your-instance--.dp.cloud.couchbase.com"
username = "username"
password = "Password123!"
bucket_name = "travel-sample"
# User Input ends here.

# Connect options - authentication
auth = PasswordAuthenticator(username, password)

# Connect options - global timeout opts
timeout_opts = ClusterTimeoutOptions(kv_timeout=timedelta(seconds=10))

# get a reference to our cluster
cluster = Cluster('couchbases://{}'.format(endpoint),
                  ClusterOptions(auth, timeout_options=timeout_opts))

# Wait until the cluster is ready for use.
cluster.wait_until_ready(timedelta(seconds=5))
```

### Local Couchbase Server

You can connect to a local Couchbase server by replacing the credentials in the code with the credentials used in your cluster.

```python
from datetime import timedelta

# needed for any cluster connection
from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster
# needed for options -- cluster, timeout, SQL++ (N1QL) query, etc.
from couchbase.options import (ClusterOptions, ClusterTimeoutOptions,
                               QueryOptions)

# Update this to your cluster
username = "username"
password = "password"
bucket_name = "travel-sample"
cert_path = "path/to/certificate"
# User Input ends here.

# Connect options - authentication
auth = PasswordAuthenticator(
    username,
    password,
    # NOTE: If using SSL/TLS, add the certificate path.
    # We strongly reccomend this for production use.
    # cert_path=cert_path
)

# Get a reference to our cluster
# NOTE: For TLS/SSL connection use 'couchbases://<your-ip-address>' instead
cluster = Cluster('couchbase://localhost', ClusterOptions(auth))

# Wait until the cluster is ready for use.
cluster.wait_until_ready(timedelta(seconds=5))
```

## Next Steps

With these two options, you have learnt how to connect to a Couchbase cluster using Python. These connection snippets can be used to perform different operations on the Couchbase cluster with the Python SDK.

For simplicity, the subsequent tutorials would showcase the examples using a local installation of Couchbase. They can be easily replaced with the alternate connection string to connect to your Capella cluster.
