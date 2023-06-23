---
# frontmatter
path: "/tutorial-couchbase-exporter-setup"
title: Couchbase Exporter Setup (Prometheus)
short_title: Couchbase Exporter Setup
description: 
  - This tutorial walks you through installation and configuration of the Couchbase Exporter
  - Learn about setting up uWSGI with Emperor to execute multiple Cluster Monitoring Instances
content_type: tutorial
filter: observability
technology:
  - server
  - connectors
tags:
  - Prometheus
  - Monitoring
  - Observability
  - Configuration
sdk_language:
  - any
length: 15 Mins
---

The following will walk you through how to install and configure the Couchbase Exporter and its dependencies. Depending on which mode you want to run the Couchbase Exporter in, there will either be a single instance for each cluster, or an instance for each node in the cluster.

## Download Couchbase Exporter

[Download](https://github.com/couchbaselabs/cbprometheus_python) the Couchbase Exporter python code.

```bash
curl -L \
  https://github.com/couchbaselabs/cbprometheus_python/tarball/master > \
  couchbase_exporter.tar.gz
```

## Create User

Create a Couchbase Exporter user, required directories, and make prometheus user as the owner of those directories.

```bash
sudo groupadd -f couchbase_exporter
sudo useradd -g couchbase_exporter --no-create-home --shell /bin/false couchbase_exporter
sudo mkdir /etc/couchbase_exporter
sudo chown couchbase_exporter:couchbase_exporter /etc/couchbase_exporter
```

## Unpack Couchbase Exporter Binary

Untar and move the downloaded Couchbase Exporter code

```bash
mkdir -p couchbase_exporter
tar -xzf couchbase_exporter.tar.gz \
  -C couchbase_exporter --strip-components=1
```

## Install Python Dependencies

Python is required for the exporter to run, along with the `uwsgi` package.

`pip` is not packaged in official software repositories of CentOS/RHEL. The  EPEL repository needs to be enabled.

**CentOS**

```bash
sudo yum install epel-release
```

If you're running in AWS you'll need to run:

```bash
sudo amazon-linux-extras install epel
```

Install `pip`

**CentOS**

```bash
sudo yum install python-pip python-devel gcc -y
```

Install `uwsgi` and `flask` using `pip`

```bash
sudo pip install -r ./couchbase_exporter/requirements
```

## Install Couchbase Exporter

Copy `couchbase_exporter` directory from `couchbase_exporter` folder to `/opt/couchbase_exporter` and change the ownership to the couchbase_exporter user.

```bash
sudo mv couchbase_exporter /opt
sudo chown -R couchbase_exporter:couchbase_exporter /opt/couchbase_exporter
```

## Setup ssh keys for cbstats

This step only needs to be performed if you are running the exporter in a cluster/standalone mode and wish to retrieve `cbstats` metrics. If you are running the exporter in local mode, this step is not required as the local version of `cbstats` is used.

This can be done a few ways. This example we will be creating a user for the
exporter to use on the Couchbase nodes. You will need to have ssh sudo access to
complete this step.

From the exporter:

```bash
ssh-keygen -t rsa -b 4096 -C "enter.user@domain.com"
```

Enter file in which to save the key (/home/vagrant/.ssh/id_rsa): `exporter` \
Enter passphrase (empty for no passphrase):\
Enter same passphrase again:\
Your identification has been saved in exporter.\
Your public key has been saved in exporter.pub. 

```bash
mv exporter* ~/.ssh
cat ~/.ssh/exporter.pub
```

Copy the key to your clipboard

You can setup keys on each of the individual Couchbase nodes and the exporter
will connect to each node and run cbstats against that node. Or you can setup
the key on a single host in the cluster and use that node to access the other
nodes in the cluster. If you do the latter you have to set the `CB_SSH_HOST`
environment variable.

On each host the exporter will need to connect to:

```bash
sudo useradd -m -d /home/exporter -s /bin/bash -G couchbase exporter
sudo su
mkdir /home/exporter/.ssh
chown exporter:exporter /home/exporter/.ssh/
vi /home/exporter/.ssh/authorized_keys
```

Paste the copied key into the authorized keys file

```bash
chmod 600 /home/exporter/.ssh/authorized_keys
chown exporter:exporter /home/exporter/.ssh/authorized_keys
exit
```

## uwsgi Emperor

Emperor will maintain and execute multiple instances of `uwsgi`.

Create a directory for the `uwsgi` configuration files.

```bash
sudo mkdir -p /etc/uwsgi/vassals
```

Create a new file for the `emperor.ini`

```bash
sudo vi /etc/uwsgi/emperor.ini
```

Add the following contents to the `emperor.ini` file

```bash
[uwsgi]
emperor = /etc/uwsgi/vassals
```

Set the appropriate permissions

```bash
sudo chown -R couchbase_exporter:couchbase_exporter /etc/uwsgi
```

## Vassals (Cluster Monitoring Instances)

Create an `ini` file for each cluster that you wish to monitor.

```bash
sudo vi /etc/uwsgi/vassals/{{CLUSTER}}.ini
```

Replace `{{CLUSTER}}` with a friendly name that contains no spaces i.e. (`cluster1.ini`).

Add the following contents to the file. Replace `{{CLUSTER_HOSTNAME}}` with the hostname of one of the Couchbase nodes in the cluster that you wish to monitor. Each exporter will need to run on a different port, it is recommended that you start with `5000` for `{{PORT}}` and increment by 1 (i.e. 5000, 5001, 5002, etc.)  

> CB_EXPORTER_MODE This can be "standalone" or "local".

- `CLUSTER` - Friendly cluster name (no spaces). If `CB_EXPORTER_MODE` is set to `local` this value is changed to `"localhost"`
- `CLUSTER_HOSTNAME` - A comma-delimited list of one or more nodes (from the same cluster).
- `CLUSTER_USERNAME` - An RBAC user with Read-Only Admin as well as System Catalog Query Permissions
- `CLUSTER_PASSWORD` - The Password for the RBAC user
- `PORT` - The port for the exporter to listen on
- `CB_RESULTSET` - Optional, used to limit the result size. Default is 60. For larger clusters or clusters with a high number of buckets/indexes, consider lowering this value.
- `CB_CBSTAT_PATH` - Optional, Used to state path to cbstats for non-default installations of Couchbase
- `CB_KEY` - Required if intending to use cbstats in standalone mode from the exporter, path to private key
- `CB_SSH_USER` - Required if intending to use cbstats from the exporter in standalone mode, username for private key
- `CB_SSH_HOST` -  Required if using cbstats in standalone mode and only connecting to a single host, ip address of that host.
- `CB_NODE_EXPORTER_PORT` - Optional, The port that node exporter is running on. The Couchbase Exporter can act as a proxy to Node Exporter, retrieving Node Exporter and adding labels with Couchbase Server information to the Node Exporter Metrics. Defaults to 9200.
- `CB_PROCESS_EXPORTER_PORT` - Optional, The port that process exporter is running on. The Couchbase Exporter can act as a proxy to Process Exporter, retrieving Process Exporter and adding labels with Couchbase Server information to the Node Exporter Metrics. Defaults to 9256.

```bash
[uwsgi]
http = :{{PORT}}
pidfile = /tmp/{{CLUSTER}}.pid
env = CB_DATABASE={{CLUSTER_HOSTNAME}}
env = CB_USERNAME={{CLUSTER_USERNAME}}
env = CB_PASSWORD={{CLUSTER_PASSWORD}}
env = CB_RESULTSET={{CB_RESULTSET}}
env = CB_CBSTAT_PATH={{CB_CBSTAT_PATH}}
env = CB_KEY={{CB_KEY}}
env = CB_SSH_USER={{CB_SSH_USER}}
env = CB_SSH_HOST={{CB_SSH_HOST}}
processes = 1
master =
chdir = /opt/couchbase_exporter/src
wsgi-file = /opt/couchbase_exporter/src/wsgi.py
enable-threads =
```

Set the appropriate permissions on the file

```bash
sudo chown couchbase_exporter:couchbase_exporter /etc/uwsgi/vassals/{{CLUSTER}}.ini
```

## Setup Emperor Service

Configure emperor to run as a service by creating the following file:

```bash
sudo vi /usr/lib/systemd/system/emperor.uwsgi.service
```

Add the following configuration

```bash
[Unit]
Description=uWSGI Emperor
After=syslog.target

[Service]
User=couchbase_exporter
Group=couchbase_exporter
ExecStart=/usr/bin/uwsgi --ini /etc/uwsgi/emperor.ini
RuntimeDirectory=/opt/couchbase_exporter
Restart=always
KillSignal=SIGQUIT
Type=notify
StandardError=syslog
NotifyAccess=all

[Install]
WantedBy=multi-user.target
```

Set the appropriate permissions

```bash
sudo chmod 664 /usr/lib/systemd/system/emperor.uwsgi.service
```

## Reload systemd and Start Emperor

Reload the `systemd` service to register the prometheus service and start the prometheus service.

```bash
sudo systemctl daemon-reload
sudo systemctl start emperor.uwsgi.service
```

Check the Emperor service status using the following command.

```bash
sudo systemctl status emperor.uwsgi.service
```

![Couchbase Exporter Status](./assets/couchbase-exporter-status.png)

Configure Emperor to start at boot

```bash
sudo systemctl enable emperor.uwsgi.service
```

If `firewalld` is enabled and running, add a rule for port each exporter configured i.e `5000`, `5001`, etc.

```bash
sudo firewall-cmd --permanent --zone=public --add-port=5000/tcp
sudo firewall-cmd --reload
```

## Verify the Exporter is Running

Verify the exporter is running by visiting the `/metrics` endpoint on the node on port `5000`

```bash
http://<couchbase_exporter/emperor-ip>:5000/metrics/buckets
```

You should be able to see something similar to the following:

```bash
...
ep_dcp_other_producer_count {cluster="Demo-6.0.3", bucket="demo", node="10.1.2.100", type="bucket"} 0 1581621651527
ep_dcp_other_producer_count {cluster="Demo-6.0.3", bucket="demo", node="10.1.2.100", type="bucket"} 0 1581621652528
ep_dcp_other_producer_count {cluster="Demo-6.0.3", bucket="demo", node="10.1.2.100", type="bucket"} 0 1581621653528
ep_dcp_other_producer_count {cluster="Demo-6.0.3", bucket="demo", node="10.1.2.100", type="bucket"} 0 1581621654527
ep_dcp_other_producer_count {cluster="Demo-6.0.3", bucket="demo", node="10.1.2.100", type="bucket"} 0 1581621655527
ep_dcp_other_producer_count {cluster="Demo-6.0.3", bucket="demo", node="10.1.2.100", type="bucket"} 0 1581621656528
ep_dcp_other_producer_count {cluster="Demo-6.0.3", bucket="demo", node="10.1.2.100", type="bucket"} 0 1581621657528
...
```

## Clean Up

Remove the download and temporary files

```bash
rm -rf couchbase_exporter*
```

If you wish to add another cluster in the future, repeat Step 4.7 and restart the emperor service.
