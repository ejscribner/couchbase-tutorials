---
# frontmatter
path: "/tutorial-openai-claude-couchbase-rag"
title: Retrieval-Augmented Generation (RAG) with Couchbase, OpenAI, and Claude
short_title: RAG with Couchbase, OpenAI, and Claude
description:
  - Learn how to build a semantic search engine using Couchbase, OpenAI embeddings, and Anthropic's Claude.
  - This tutorial demonstrates how to integrate Couchbase's vector search capabilities with OpenAI embeddings and use Claude as the language model.
  - You'll understand how to perform Retrieval-Augmented Generation (RAG) using LangChain and Couchbase.
content_type: tutorial
filter: sdk
technology:
  - vector search
tags:
  - Artificial Intelligence
  - LangChain
  - OpenAI
sdk_language:
  - python
length: 60 Mins
---


```python
!pip install datasets langchain-couchbase langchain-anthropic langchain-openai
```

    Collecting datasets
      Downloading datasets-2.21.0-py3-none-any.whl.metadata (21 kB)
    Collecting langchain-couchbase
      Downloading langchain_couchbase-0.1.1-py3-none-any.whl.metadata (1.9 kB)
    Collecting langchain-anthropic
      Downloading langchain_anthropic-0.1.23-py3-none-any.whl.metadata (2.2 kB)
    Collecting langchain-openai
      Downloading langchain_openai-0.1.23-py3-none-any.whl.metadata (2.6 kB)
    Requirement already satisfied: filelock in /usr/local/lib/python3.10/dist-packages (from datasets) (3.15.4)
    Requirement already satisfied: numpy>=1.17 in /usr/local/lib/python3.10/dist-packages (from datasets) (1.26.4)
    Collecting pyarrow>=15.0.0 (from datasets)
      Downloading pyarrow-17.0.0-cp310-cp310-manylinux_2_28_x86_64.whl.metadata (3.3 kB)
    Collecting dill<0.3.9,>=0.3.0 (from datasets)
      Downloading dill-0.3.8-py3-none-any.whl.metadata (10 kB)
    Requirement already satisfied: pandas in /usr/local/lib/python3.10/dist-packages (from datasets) (2.1.4)
    Requirement already satisfied: requests>=2.32.2 in /usr/local/lib/python3.10/dist-packages (from datasets) (2.32.3)
    Requirement already satisfied: tqdm>=4.66.3 in /usr/local/lib/python3.10/dist-packages (from datasets) (4.66.5)
    Collecting xxhash (from datasets)
      Downloading xxhash-3.5.0-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (12 kB)
    Collecting multiprocess (from datasets)
      Downloading multiprocess-0.70.16-py310-none-any.whl.metadata (7.2 kB)
    Requirement already satisfied: fsspec<=2024.6.1,>=2023.1.0 in /usr/local/lib/python3.10/dist-packages (from fsspec[http]<=2024.6.1,>=2023.1.0->datasets) (2024.6.1)
    Requirement already satisfied: aiohttp in /usr/local/lib/python3.10/dist-packages (from datasets) (3.10.5)
    Requirement already satisfied: huggingface-hub>=0.21.2 in /usr/local/lib/python3.10/dist-packages (from datasets) (0.23.5)
    Requirement already satisfied: packaging in /usr/local/lib/python3.10/dist-packages (from datasets) (24.1)
    Requirement already satisfied: pyyaml>=5.1 in /usr/local/lib/python3.10/dist-packages (from datasets) (6.0.2)
    Collecting couchbase<5.0.0,>=4.2.1 (from langchain-couchbase)
      Downloading couchbase-4.3.1-cp310-cp310-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (23 kB)
    Collecting langchain-core<0.3,>=0.2.0 (from langchain-couchbase)
      Downloading langchain_core-0.2.36-py3-none-any.whl.metadata (6.2 kB)
    Collecting anthropic<1,>=0.30.0 (from langchain-anthropic)
      Downloading anthropic-0.34.1-py3-none-any.whl.metadata (18 kB)
    Requirement already satisfied: defusedxml<0.8.0,>=0.7.1 in /usr/local/lib/python3.10/dist-packages (from langchain-anthropic) (0.7.1)
    Collecting openai<2.0.0,>=1.40.0 (from langchain-openai)
      Downloading openai-1.42.0-py3-none-any.whl.metadata (22 kB)
    Collecting tiktoken<1,>=0.7 (from langchain-openai)
      Downloading tiktoken-0.7.0-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (6.6 kB)
    Requirement already satisfied: anyio<5,>=3.5.0 in /usr/local/lib/python3.10/dist-packages (from anthropic<1,>=0.30.0->langchain-anthropic) (3.7.1)
    Requirement already satisfied: distro<2,>=1.7.0 in /usr/lib/python3/dist-packages (from anthropic<1,>=0.30.0->langchain-anthropic) (1.7.0)
    Collecting httpx<1,>=0.23.0 (from anthropic<1,>=0.30.0->langchain-anthropic)
      Downloading httpx-0.27.2-py3-none-any.whl.metadata (7.1 kB)
    Collecting jiter<1,>=0.4.0 (from anthropic<1,>=0.30.0->langchain-anthropic)
      Downloading jiter-0.5.0-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (3.6 kB)
    Requirement already satisfied: pydantic<3,>=1.9.0 in /usr/local/lib/python3.10/dist-packages (from anthropic<1,>=0.30.0->langchain-anthropic) (2.8.2)
    Requirement already satisfied: sniffio in /usr/local/lib/python3.10/dist-packages (from anthropic<1,>=0.30.0->langchain-anthropic) (1.3.1)
    Requirement already satisfied: tokenizers>=0.13.0 in /usr/local/lib/python3.10/dist-packages (from anthropic<1,>=0.30.0->langchain-anthropic) (0.19.1)
    Requirement already satisfied: typing-extensions<5,>=4.7 in /usr/local/lib/python3.10/dist-packages (from anthropic<1,>=0.30.0->langchain-anthropic) (4.12.2)
    Requirement already satisfied: aiohappyeyeballs>=2.3.0 in /usr/local/lib/python3.10/dist-packages (from aiohttp->datasets) (2.4.0)
    Requirement already satisfied: aiosignal>=1.1.2 in /usr/local/lib/python3.10/dist-packages (from aiohttp->datasets) (1.3.1)
    Requirement already satisfied: attrs>=17.3.0 in /usr/local/lib/python3.10/dist-packages (from aiohttp->datasets) (24.2.0)
    Requirement already satisfied: frozenlist>=1.1.1 in /usr/local/lib/python3.10/dist-packages (from aiohttp->datasets) (1.4.1)
    Requirement already satisfied: multidict<7.0,>=4.5 in /usr/local/lib/python3.10/dist-packages (from aiohttp->datasets) (6.0.5)
    Requirement already satisfied: yarl<2.0,>=1.0 in /usr/local/lib/python3.10/dist-packages (from aiohttp->datasets) (1.9.4)
    Requirement already satisfied: async-timeout<5.0,>=4.0 in /usr/local/lib/python3.10/dist-packages (from aiohttp->datasets) (4.0.3)
    Collecting jsonpatch<2.0,>=1.33 (from langchain-core<0.3,>=0.2.0->langchain-couchbase)
      Downloading jsonpatch-1.33-py2.py3-none-any.whl.metadata (3.0 kB)
    Collecting langsmith<0.2.0,>=0.1.75 (from langchain-core<0.3,>=0.2.0->langchain-couchbase)
      Downloading langsmith-0.1.106-py3-none-any.whl.metadata (13 kB)
    Collecting tenacity!=8.4.0,<9.0.0,>=8.1.0 (from langchain-core<0.3,>=0.2.0->langchain-couchbase)
      Downloading tenacity-8.5.0-py3-none-any.whl.metadata (1.2 kB)
    Requirement already satisfied: charset-normalizer<4,>=2 in /usr/local/lib/python3.10/dist-packages (from requests>=2.32.2->datasets) (3.3.2)
    Requirement already satisfied: idna<4,>=2.5 in /usr/local/lib/python3.10/dist-packages (from requests>=2.32.2->datasets) (3.8)
    Requirement already satisfied: urllib3<3,>=1.21.1 in /usr/local/lib/python3.10/dist-packages (from requests>=2.32.2->datasets) (2.0.7)
    Requirement already satisfied: certifi>=2017.4.17 in /usr/local/lib/python3.10/dist-packages (from requests>=2.32.2->datasets) (2024.7.4)
    Requirement already satisfied: regex>=2022.1.18 in /usr/local/lib/python3.10/dist-packages (from tiktoken<1,>=0.7->langchain-openai) (2024.5.15)
    Requirement already satisfied: python-dateutil>=2.8.2 in /usr/local/lib/python3.10/dist-packages (from pandas->datasets) (2.8.2)
    Requirement already satisfied: pytz>=2020.1 in /usr/local/lib/python3.10/dist-packages (from pandas->datasets) (2024.1)
    Requirement already satisfied: tzdata>=2022.1 in /usr/local/lib/python3.10/dist-packages (from pandas->datasets) (2024.1)
    Requirement already satisfied: exceptiongroup in /usr/local/lib/python3.10/dist-packages (from anyio<5,>=3.5.0->anthropic<1,>=0.30.0->langchain-anthropic) (1.2.2)
    Collecting httpcore==1.* (from httpx<1,>=0.23.0->anthropic<1,>=0.30.0->langchain-anthropic)
      Downloading httpcore-1.0.5-py3-none-any.whl.metadata (20 kB)
    Collecting h11<0.15,>=0.13 (from httpcore==1.*->httpx<1,>=0.23.0->anthropic<1,>=0.30.0->langchain-anthropic)
      Downloading h11-0.14.0-py3-none-any.whl.metadata (8.2 kB)
    Collecting jsonpointer>=1.9 (from jsonpatch<2.0,>=1.33->langchain-core<0.3,>=0.2.0->langchain-couchbase)
      Downloading jsonpointer-3.0.0-py2.py3-none-any.whl.metadata (2.3 kB)
    Collecting orjson<4.0.0,>=3.9.14 (from langsmith<0.2.0,>=0.1.75->langchain-core<0.3,>=0.2.0->langchain-couchbase)
      Downloading orjson-3.10.7-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (50 kB)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 50.4/50.4 kB 718.6 kB/s eta 0:00:00
    Requirement already satisfied: annotated-types>=0.4.0 in /usr/local/lib/python3.10/dist-packages (from pydantic<3,>=1.9.0->anthropic<1,>=0.30.0->langchain-anthropic) (0.7.0)
    Requirement already satisfied: pydantic-core==2.20.1 in /usr/local/lib/python3.10/dist-packages (from pydantic<3,>=1.9.0->anthropic<1,>=0.30.0->langchain-anthropic) (2.20.1)
    Requirement already satisfied: six>=1.5 in /usr/local/lib/python3.10/dist-packages (from python-dateutil>=2.8.2->pandas->datasets) (1.16.0)
    Downloading datasets-2.21.0-py3-none-any.whl (527 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 527.3/527.3 kB 4.5 MB/s eta 0:00:00
    Downloading langchain_couchbase-0.1.1-py3-none-any.whl (13 kB)
    Downloading langchain_anthropic-0.1.23-py3-none-any.whl (21 kB)
    Downloading langchain_openai-0.1.23-py3-none-any.whl (51 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 52.0/52.0 kB 2.6 MB/s eta 0:00:00
    Downloading anthropic-0.34.1-py3-none-any.whl (891 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 891.5/891.5 kB 14.6 MB/s eta 0:00:00
    Downloading couchbase-4.3.1-cp310-cp310-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (5.1 MB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 5.1/5.1 MB 39.4 MB/s eta 0:00:00
    Downloading dill-0.3.8-py3-none-any.whl (116 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 116.3/116.3 kB 5.4 MB/s eta 0:00:00
    Downloading langchain_core-0.2.36-py3-none-any.whl (395 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 395.9/395.9 kB 15.2 MB/s eta 0:00:00
    Downloading openai-1.42.0-py3-none-any.whl (362 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 362.9/362.9 kB 16.4 MB/s eta 0:00:00
    Downloading pyarrow-17.0.0-cp310-cp310-manylinux_2_28_x86_64.whl (39.9 MB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 39.9/39.9 MB 18.0 MB/s eta 0:00:00
    Downloading tiktoken-0.7.0-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (1.1 MB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.1/1.1 MB 29.2 MB/s eta 0:00:00
    Downloading multiprocess-0.70.16-py310-none-any.whl (134 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 134.8/134.8 kB 8.3 MB/s eta 0:00:00
    Downloading xxhash-3.5.0-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (194 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 194.1/194.1 kB 10.9 MB/s eta 0:00:00
    Downloading httpx-0.27.2-py3-none-any.whl (76 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 76.4/76.4 kB 4.8 MB/s eta 0:00:00
    Downloading httpcore-1.0.5-py3-none-any.whl (77 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 77.9/77.9 kB 4.9 MB/s eta 0:00:00
    Downloading jiter-0.5.0-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (318 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 318.9/318.9 kB 17.4 MB/s eta 0:00:00
    Downloading jsonpatch-1.33-py2.py3-none-any.whl (12 kB)
    Downloading langsmith-0.1.106-py3-none-any.whl (150 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 150.6/150.6 kB 8.3 MB/s eta 0:00:00
    Downloading tenacity-8.5.0-py3-none-any.whl (28 kB)
    Downloading jsonpointer-3.0.0-py2.py3-none-any.whl (7.6 kB)
    Downloading orjson-3.10.7-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (141 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 141.9/141.9 kB 7.1 MB/s eta 0:00:00
    Downloading h11-0.14.0-py3-none-any.whl (58 kB)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 58.3/58.3 kB 3.4 MB/s eta 0:00:00
    Installing collected packages: xxhash, tenacity, pyarrow, orjson, jsonpointer, jiter, h11, dill, couchbase, tiktoken, multiprocess, jsonpatch, httpcore, httpx, openai, langsmith, datasets, anthropic, langchain-core, langchain-openai, langchain-couchbase, langchain-anthropic
      Attempting uninstall: tenacity
        Found existing installation: tenacity 9.0.0
        Uninstalling tenacity-9.0.0:
          Successfully uninstalled tenacity-9.0.0
      Attempting uninstall: pyarrow
        Found existing installation: pyarrow 14.0.2
        Uninstalling pyarrow-14.0.2:
          Successfully uninstalled pyarrow-14.0.2
    ERROR: pip's dependency resolver does not currently take into account all the packages that are installed. This behaviour is the source of the following dependency conflicts.
    cudf-cu12 24.4.1 requires pyarrow<15.0.0a0,>=14.0.1, but you have pyarrow 17.0.0 which is incompatible.
    ibis-framework 8.0.0 requires pyarrow<16,>=2, but you have pyarrow 17.0.0 which is incompatible.
    Successfully installed anthropic-0.34.1 couchbase-4.3.1 datasets-2.21.0 dill-0.3.8 h11-0.14.0 httpcore-1.0.5 httpx-0.27.2 jiter-0.5.0 jsonpatch-1.33 jsonpointer-3.0.0 langchain-anthropic-0.1.23 langchain-core-0.2.36 langchain-couchbase-0.1.1 langchain-openai-0.1.23 langsmith-0.1.106 multiprocess-0.70.16 openai-1.42.0 orjson-3.10.7 pyarrow-17.0.0 tenacity-8.5.0 tiktoken-0.7.0 xxhash-3.5.0


# Importing Necessary Libraries
The script starts by importing a series of libraries required for various tasks, including handling JSON, logging, time tracking, Couchbase connections, embedding generation, and dataset loading. These libraries provide essential functions for working with data, managing database connections, and processing machine learning models.


```python
import json
import logging
import time
import sys
import getpass
from datetime import timedelta
from uuid import uuid4

from couchbase.auth import PasswordAuthenticator
from couchbase.cluster import Cluster
from couchbase.exceptions import CouchbaseException, InternalServerFailureException, QueryIndexAlreadyExistsException
from couchbase.management.search import SearchIndex
from couchbase.options import ClusterOptions
from datasets import load_dataset
from langchain_anthropic import ChatAnthropic
from langchain_core.documents import Document
from langchain_core.globals import set_llm_cache
from langchain_core.prompts.chat import ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_couchbase.cache import CouchbaseCache
from langchain_couchbase.vectorstores import CouchbaseVectorStore
from langchain_openai import OpenAIEmbeddings
from tqdm import tqdm
```

# Setup Logging
Logging is configured to track the progress of the script and capture any errors or warnings. This is crucial for debugging and understanding the flow of execution. The logging output includes timestamps, log levels (e.g., INFO, ERROR), and messages that describe what is happening in the script.



```python
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', force=True)
```

# Loading Sensitive Informnation
In this section, we prompt the user to input essential configuration settings needed. These settings include sensitive information like API keys, database credentials, and specific configuration names. Instead of hardcoding these details into the script, we request the user to provide them at runtime, ensuring flexibility and security.

The script also validates that all required inputs are provided, raising an error if any crucial information is missing. This approach ensures that your integration is both secure and correctly configured without hardcoding sensitive information, enhancing the overall security and maintainability of your code.


```python
ANTHROPIC_API_KEY = getpass.getpass('Enter your Anthropic API key: ')
OPENAI_API_KEY = getpass.getpass('Enter your OpenAI API key: ')
CB_HOST = input('Enter your Couchbase host (default: couchbase://localhost): ') or 'couchbase://localhost'
CB_USERNAME = input('Enter your Couchbase username (default: Administrator): ') or 'Administrator'
CB_PASSWORD = getpass.getpass('Enter your Couchbase password (default: password): ') or 'password'
CB_BUCKET_NAME = input('Enter your Couchbase bucket name (default: vector-search-testing): ') or 'vector-search-testing'
INDEX_NAME = input('Enter your index name (default: vector_search_claude): ') or 'vector_search_claude'
SCOPE_NAME = input('Enter your scope name (default: shared): ') or 'shared'
COLLECTION_NAME = input('Enter your collection name (default: claude): ') or 'claude'
CACHE_COLLECTION = input('Enter your cache collection name (default: cache): ') or 'cache'

# Check if the variables are correctly loaded
if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY is not set in the environment.")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set in the environment.")
```

    Enter your Anthropic API key: ··········
    Enter your OpenAI API key: ··········
    Enter your Couchbase host (default: couchbase://localhost): couchbases://cb.hlcup4o4jmjr55yf.cloud.couchbase.com
    Enter your Couchbase username (default: Administrator): vector-search-rag-demos
    Enter your Couchbase password (default: password): ··········
    Enter your Couchbase bucket name (default: vector-search-testing): 
    Enter your index name (default: vector_search_claude): 
    Enter your scope name (default: shared): 
    Enter your collection name (default: claude): 
    Enter your cache collection name (default: cache): 


# Connecting to the Couchbase Cluster
Connecting to a Couchbase cluster is the foundation of our project. Couchbase will serve as our primary data store, handling all the storage and retrieval operations required for our semantic search engine. By establishing this connection, we enable our application to interact with the database, allowing us to perform operations such as storing embeddings, querying data, and managing collections. This connection is the gateway through which all data will flow, so ensuring it's set up correctly is paramount.




```python
try:
    auth = PasswordAuthenticator(CB_USERNAME, CB_PASSWORD)
    options = ClusterOptions(auth)
    cluster = Cluster(CB_HOST, options)
    cluster.wait_until_ready(timedelta(seconds=5))
    logging.info("Successfully connected to Couchbase")
except Exception as e:
    raise ConnectionError(f"Failed to connect to Couchbase: {str(e)}")
```

    2024-08-29 13:33:54,574 - INFO - Successfully connected to Couchbase


# Setting Up Collections in Couchbase
In Couchbase, data is organized in buckets, which can be further divided into scopes and collections. Think of a collection as a table in a traditional SQL database. Before we can store any data, we need to ensure that our collections exist. If they don't, we must create them. This step is important because it prepares the database to handle the specific types of data our application will process. By setting up collections, we define the structure of our data storage, which is essential for efficient data retrieval and management.

Moreover, setting up collections allows us to isolate different types of data within the same bucket, providing a more organized and scalable data structure. This is particularly useful when dealing with large datasets, as it ensures that related data is stored together, making it easier to manage and query.


```python
def setup_collection(cluster, bucket_name, scope_name, collection_name):
    try:
        bucket = cluster.bucket(bucket_name)
        bucket_manager = bucket.collections()

        # Check if collection exists, create if it doesn't
        collections = bucket_manager.get_all_scopes()
        collection_exists = any(
            scope.name == scope_name and collection_name in [col.name for col in scope.collections]
            for scope in collections
        )

        if not collection_exists:
            logging.info(f"Collection '{collection_name}' does not exist. Creating it...")
            bucket_manager.create_collection(scope_name, collection_name)
            logging.info(f"Collection '{collection_name}' created successfully.")
        else:
            logging.info(f"Collection '{collection_name}' already exists.Skipping creation.")

        collection = bucket.scope(scope_name).collection(collection_name)

        # Ensure primary index exists
        try:
            cluster.query(f"CREATE PRIMARY INDEX IF NOT EXISTS ON `{bucket_name}`.`{scope_name}`.`{collection_name}`").execute()
            logging.info("Primary index present or created successfully.")
        except Exception as e:
            logging.warning(f"Error creating primary index: {str(e)}")

        # Clear all documents in the collection
        try:
            query = f"DELETE FROM `{bucket_name}`.`{scope_name}`.`{collection_name}`"
            cluster.query(query).execute()
            logging.info("All documents cleared from the collection.")
        except Exception as e:
            logging.warning(f"Error while clearing documents: {str(e)}. The collection might be empty.")

        return collection
    except Exception as e:
        raise RuntimeError(f"Error setting up collection: {str(e)}")

setup_collection(cluster, CB_BUCKET_NAME, SCOPE_NAME, COLLECTION_NAME)
setup_collection(cluster, CB_BUCKET_NAME, SCOPE_NAME, CACHE_COLLECTION)
```

    2024-08-29 13:33:54,801 - INFO - Collection 'claude' already exists.Skipping creation.
    2024-08-29 13:33:54,836 - INFO - Primary index present or created successfully.
    2024-08-29 13:33:55,491 - INFO - All documents cleared from the collection.
    2024-08-29 13:33:55,529 - INFO - Collection 'cache' already exists.Skipping creation.
    2024-08-29 13:33:55,567 - INFO - Primary index present or created successfully.
    2024-08-29 13:33:55,605 - INFO - All documents cleared from the collection.





    <couchbase.collection.Collection at 0x7c1c3a201d20>



# Loading the Index Definition
Semantic search requires an efficient way to retrieve relevant documents based on a user’s query. This is where the Couchbase Full-Text Search (FTS) index comes in. An FTS index is designed to enable full-text search capabilities, such as searching for words or phrases within documents stored in Couchbase. In this step, we load the FTS index definition from a JSON file, which specifies how the index should be structured. This includes the fields to be indexed and other parameters that determine how the search engine processes queries. By defining an index, we ensure that our search engine can quickly and accurately retrieve the most relevant documents, which is crucial for delivering fast and relevant search results to users.



```python
# index_definition_path = '/path_to_your_index_file/claude_index.json'

# Prompt user to upload to google drive
from google.colab import files
print("Upload your index definition file")
uploaded = files.upload()
index_definition_path = list(uploaded.keys())[0]

try:
    with open(index_definition_path, 'r') as file:
        index_definition = json.load(file)
except Exception as e:
    raise ValueError(f"Error loading index definition from {index_definition_path}: {str(e)}")
```

    Upload your index definition file




     <input type="file" id="files-94d5a7bb-ab15-4295-99c4-f03570ace405" name="files[]" multiple disabled
        style="border:none" />
     <output id="result-94d5a7bb-ab15-4295-99c4-f03570ace405">
      Upload widget is only available when the cell has been executed in the
      current browser session. Please rerun this cell to enable.
      </output>
      <script>// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Helpers for google.colab Python module.
 */
(function(scope) {
function span(text, styleAttributes = {}) {
  const element = document.createElement('span');
  element.textContent = text;
  for (const key of Object.keys(styleAttributes)) {
    element.style[key] = styleAttributes[key];
  }
  return element;
}

// Max number of bytes which will be uploaded at a time.
const MAX_PAYLOAD_SIZE = 100 * 1024;

function _uploadFiles(inputId, outputId) {
  const steps = uploadFilesStep(inputId, outputId);
  const outputElement = document.getElementById(outputId);
  // Cache steps on the outputElement to make it available for the next call
  // to uploadFilesContinue from Python.
  outputElement.steps = steps;

  return _uploadFilesContinue(outputId);
}

// This is roughly an async generator (not supported in the browser yet),
// where there are multiple asynchronous steps and the Python side is going
// to poll for completion of each step.
// This uses a Promise to block the python side on completion of each step,
// then passes the result of the previous step as the input to the next step.
function _uploadFilesContinue(outputId) {
  const outputElement = document.getElementById(outputId);
  const steps = outputElement.steps;

  const next = steps.next(outputElement.lastPromiseValue);
  return Promise.resolve(next.value.promise).then((value) => {
    // Cache the last promise value to make it available to the next
    // step of the generator.
    outputElement.lastPromiseValue = value;
    return next.value.response;
  });
}

/**
 * Generator function which is called between each async step of the upload
 * process.
 * @param {string} inputId Element ID of the input file picker element.
 * @param {string} outputId Element ID of the output display.
 * @return {!Iterable<!Object>} Iterable of next steps.
 */
function* uploadFilesStep(inputId, outputId) {
  const inputElement = document.getElementById(inputId);
  inputElement.disabled = false;

  const outputElement = document.getElementById(outputId);
  outputElement.innerHTML = '';

  const pickedPromise = new Promise((resolve) => {
    inputElement.addEventListener('change', (e) => {
      resolve(e.target.files);
    });
  });

  const cancel = document.createElement('button');
  inputElement.parentElement.appendChild(cancel);
  cancel.textContent = 'Cancel upload';
  const cancelPromise = new Promise((resolve) => {
    cancel.onclick = () => {
      resolve(null);
    };
  });

  // Wait for the user to pick the files.
  const files = yield {
    promise: Promise.race([pickedPromise, cancelPromise]),
    response: {
      action: 'starting',
    }
  };

  cancel.remove();

  // Disable the input element since further picks are not allowed.
  inputElement.disabled = true;

  if (!files) {
    return {
      response: {
        action: 'complete',
      }
    };
  }

  for (const file of files) {
    const li = document.createElement('li');
    li.append(span(file.name, {fontWeight: 'bold'}));
    li.append(span(
        `(${file.type || 'n/a'}) - ${file.size} bytes, ` +
        `last modified: ${
            file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() :
                                    'n/a'} - `));
    const percent = span('0% done');
    li.appendChild(percent);

    outputElement.appendChild(li);

    const fileDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsArrayBuffer(file);
    });
    // Wait for the data to be ready.
    let fileData = yield {
      promise: fileDataPromise,
      response: {
        action: 'continue',
      }
    };

    // Use a chunked sending to avoid message size limits. See b/62115660.
    let position = 0;
    do {
      const length = Math.min(fileData.byteLength - position, MAX_PAYLOAD_SIZE);
      const chunk = new Uint8Array(fileData, position, length);
      position += length;

      const base64 = btoa(String.fromCharCode.apply(null, chunk));
      yield {
        response: {
          action: 'append',
          file: file.name,
          data: base64,
        },
      };

      let percentDone = fileData.byteLength === 0 ?
          100 :
          Math.round((position / fileData.byteLength) * 100);
      percent.textContent = `${percentDone}% done`;

    } while (position < fileData.byteLength);
  }

  // All done.
  yield {
    response: {
      action: 'complete',
    }
  };
}

scope.google = scope.google || {};
scope.google.colab = scope.google.colab || {};
scope.google.colab._files = {
  _uploadFiles,
  _uploadFilesContinue,
};
})(self);
</script> 


    Saving claude_index.json to claude_index.json


# Creating or Updating Search Indexes
With the index definition loaded, the next step is to create or update the FTS index in Couchbase. This step is fundamental because it optimizes our database for text search operations, allowing us to perform searches based on the content of documents rather than just their metadata. By creating or updating an FTS index, we make it possible for our search engine to handle complex queries that involve finding specific text within documents, which is essential for a robust semantic search engine.



```python
try:
    scope_index_manager = cluster.bucket(CB_BUCKET_NAME).scope(SCOPE_NAME).search_indexes()

    # Check if index already exists
    existing_indexes = scope_index_manager.get_all_indexes()
    index_name = index_definition["name"]

    if index_name in [index.name for index in existing_indexes]:
        logging.info(f"Index '{index_name}' found")
    else:
        logging.info(f"Creating new index '{index_name}'...")

    # Create SearchIndex object from JSON definition
    search_index = SearchIndex.from_json(index_definition)

    # Upsert the index (create if not exists, update if exists)
    scope_index_manager.upsert_index(search_index)
    logging.info(f"Index '{index_name}' successfully created/updated.")

except QueryIndexAlreadyExistsException:
    logging.info(f"Index '{index_name}' already exists. Skipping creation/update.")

except InternalServerFailureException as e:
    error_message = str(e)
    logging.error(f"InternalServerFailureException raised: {error_message}")

    try:
        # Accessing the response_body attribute from the context
        error_context = e.context
        response_body = error_context.response_body
        if response_body:
            error_details = json.loads(response_body)
            error_message = error_details.get('error', '')

            if "collection: 'claude' doesn't belong to scope: 'shared'" in error_message:
                raise ValueError("Collection 'claude' does not belong to scope 'shared'. Please check the collection and scope names.")

    except ValueError as ve:
        logging.error(str(ve))
        raise

    except Exception as json_error:
        logging.error(f"Failed to parse the error message: {json_error}")
        raise RuntimeError(f"Internal server error while creating/updating search index: {error_message}")
```

    2024-08-29 13:35:01,109 - INFO - Index 'vector_search_claude' found
    2024-08-29 13:35:01,317 - INFO - Index 'vector_search_claude' already exists. Skipping creation/update.


# Load the TREC Dataset
To build a search engine, we need data to search through. We use the TREC dataset, a well-known benchmark in the field of information retrieval. This dataset contains a wide variety of text data that we'll use to train our search engine. Loading the dataset is a crucial step because it provides the raw material that our search engine will work with. The quality and diversity of the data in the TREC dataset make it an excellent choice for testing and refining our search engine, ensuring that it can handle a wide range of queries effectively.

The TREC dataset's rich content allows us to simulate real-world scenarios where users ask complex questions, enabling us to fine-tune our search engine's ability to understand and respond to various types of queries.


```python
try:
    trec = load_dataset('trec', split='train[:1000]')
    logging.info(f"Successfully loaded TREC dataset with {len(trec)} samples")
except Exception as e:
    raise ValueError(f"Error loading TREC dataset: {str(e)}")
```

    /usr/local/lib/python3.10/dist-packages/huggingface_hub/utils/_token.py:89: UserWarning: 
    The secret `HF_TOKEN` does not exist in your Colab secrets.
    To authenticate with the Hugging Face Hub, create a token in your settings tab (https://huggingface.co/settings/tokens), set it as secret in your Google Colab and restart your session.
    You will be able to reuse this secret in all of your notebooks.
    Please note that authentication is recommended but still optional to access public models or datasets.
      warnings.warn(



    Downloading builder script:   0%|          | 0.00/5.09k [00:00<?, ?B/s]



    Downloading readme:   0%|          | 0.00/10.6k [00:00<?, ?B/s]


    The repository for trec contains custom code which must be executed to correctly load the dataset. You can inspect the repository content at https://hf.co/datasets/trec.
    You can avoid this prompt in future by passing the argument `trust_remote_code=True`.
    
    Do you wish to run the custom code? [y/N] y



    Downloading data:   0%|          | 0.00/336k [00:00<?, ?B/s]



    Downloading data:   0%|          | 0.00/23.4k [00:00<?, ?B/s]



    Generating train split:   0%|          | 0/5452 [00:00<?, ? examples/s]



    Generating test split:   0%|          | 0/500 [00:00<?, ? examples/s]


    2024-08-29 13:35:10,138 - INFO - Successfully loaded TREC dataset with 1000 samples


# Creating OpenAI Embeddings
Embeddings are at the heart of semantic search. They are numerical representations of text that capture the semantic meaning of the words and phrases. Unlike traditional keyword-based search, which looks for exact matches, embeddings allow our search engine to understand the context and nuances of language, enabling it to retrieve documents that are semantically similar to the query, even if they don't contain the exact keywords. By creating embeddings using OpenAI, we equip our search engine with the ability to understand and process natural language in a way that's much closer to how humans understand language. This step transforms our raw text data into a format that the search engine can use to find and rank relevant documents.




```python
try:
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY, model='text-embedding-ada-002')
    logging.info("Successfully created OpenAIEmbeddings")
except Exception as e:
    raise ValueError(f"Error creating OpenAIEmbeddings: {str(e)}")
```

    2024-08-29 13:35:10,317 - INFO - Successfully created OpenAIEmbeddings


#  Setting Up the Couchbase Vector Store
A vector store is where we'll keep our embeddings. Unlike the FTS index, which is used for text-based search, the vector store is specifically designed to handle embeddings and perform similarity searches. When a user inputs a query, the search engine converts the query into an embedding and compares it against the embeddings stored in the vector store. This allows the engine to find documents that are semantically similar to the query, even if they don't contain the exact same words. By setting up the vector store in Couchbase, we create a powerful tool that enables our search engine to understand and retrieve information based on the meaning and context of the query, rather than just the specific words used.


```python
try:
    vector_store = CouchbaseVectorStore(
        cluster=cluster,
        bucket_name=CB_BUCKET_NAME,
        scope_name=SCOPE_NAME,
        collection_name=COLLECTION_NAME,
        embedding=embeddings,
        index_name=INDEX_NAME,
    )
    logging.info("Successfully created vector store")
except Exception as e:
    raise ValueError(f"Failed to create vector store: {str(e)}")

```

    2024-08-29 13:35:10,989 - INFO - Successfully created vector store


# Saving Data to the Vector Store
With the vector store set up, the next step is to populate it with data. We save the TREC dataset to the vector store in batches. This method is efficient and ensures that our search engine can handle large datasets without running into performance issues. By saving the data in this way, we prepare our search engine to quickly and accurately respond to user queries. This step is essential for making the dataset searchable, transforming raw data into a format that can be easily queried by our search engine.

Batch processing is particularly important when dealing with large datasets, as it prevents memory overload and ensures that the data is stored in a structured and retrievable manner. This approach not only optimizes performance but also ensures the scalability of our system.


```python
try:
    batch_size = 50
    logging.disable(sys.maxsize) # Disable logging to prevent tqdm output
    for i in tqdm(range(0, len(trec['text']), batch_size), desc="Processing Batches"):
        batch = trec['text'][i:i + batch_size]
        documents = [Document(page_content=text) for text in batch]
        uuids = [str(uuid4()) for _ in range(len(documents))]
        vector_store.add_documents(documents=documents, ids=uuids)
    logging.disable(logging.NOTSET) # Re-enable logging
except Exception as e:
    raise RuntimeError(f"Failed to save documents to vector store: {str(e)}")
```

    Processing Batches: 100%|██████████| 20/20 [00:16<00:00,  1.22it/s]


# Setting Up a Couchbase Cache
To further optimize our system, we set up a Couchbase-based cache. A cache is a temporary storage layer that holds data that is frequently accessed, speeding up operations by reducing the need to repeatedly retrieve the same information from the database. In our setup, the cache will help us accelerate repetitive tasks, such as looking up similar documents. By implementing a cache, we enhance the overall performance of our search engine, ensuring that it can handle high query volumes and deliver results quickly.

Caching is particularly valuable in scenarios where users may submit similar queries multiple times or where certain pieces of information are frequently requested. By storing these in a cache, we can significantly reduce the time it takes to respond to these queries, improving the user experience.



```python
try:
    cache = CouchbaseCache(
        cluster=cluster,
        bucket_name=CB_BUCKET_NAME,
        scope_name=SCOPE_NAME,
        collection_name=CACHE_COLLECTION,
    )
    logging.info("Successfully created cache")
    set_llm_cache(cache)
except Exception as e:
    raise ValueError(f"Failed to create cache: {str(e)}")
```

    2024-08-29 13:35:27,788 - INFO - Successfully created cache


# Using the Claude 3.5 Sonnet Language Model (LLM)
Language models are AI systems that are trained to understand and generate human language. We'll be using the `Claude 3.5 Sonnet` language model to process user queries and generate meaningful responses. This model is a key component of our semantic search engine, allowing it to go beyond simple keyword matching and truly understand the intent behind a query. By creating this language model, we equip our search engine with the ability to interpret complex queries, understand the nuances of language, and provide more accurate and contextually relevant responses.

The language model's ability to understand context and generate coherent responses is what makes our search engine truly intelligent. It can not only find the right information but also present it in a way that is useful and understandable to the user.




```python
try:
    llm = ChatAnthropic(temperature=0, anthropic_api_key=ANTHROPIC_API_KEY, model_name='claude-3-5-sonnet-20240620')
    logging.info("Successfully created ChatAnthropic")
except Exception as e:
    logging.error(f"Error creating ChatAnthropic: {str(e)}. Please check your API key and network connection.")
    raise
```

    2024-08-29 13:35:27,933 - INFO - Successfully created ChatAnthropic


# Perform Semantic Search
Semantic search in Couchbase involves converting queries and documents into vector representations using an embeddings model. These vectors capture the semantic meaning of the text and are stored directly in Couchbase. When a query is made, Couchbase performs a similarity search by comparing the query vector against the stored document vectors. The similarity metric used for this comparison is configurable, allowing flexibility in how the relevance of documents is determined. Common metrics include cosine similarity, Euclidean distance, or dot product, but other metrics can be implemented based on specific use cases. Different embedding models like BERT, Word2Vec, or GloVe can also be used depending on the application's needs, with the vectors generated by these models stored and searched within Couchbase itself.

In the provided code, the search process begins by recording the start time, followed by executing the similarity_search_with_score method of the CouchbaseVectorStore. This method searches Couchbase for the most relevant documents based on the vector similarity to the query. The search results include the document content and a similarity score that reflects how closely each document aligns with the query in the defined semantic space. The time taken to perform this search is then calculated and logged, and the results are displayed, showing the most relevant documents along with their similarity scores. This approach leverages Couchbase as both a storage and retrieval engine for vector data, enabling efficient and scalable semantic searches. The integration of vector storage and search capabilities within Couchbase allows for sophisticated semantic search operations without relying on external services for vector storage or comparison.


```python
query = "What caused the 1929 Great Depression?"

try:
    # Perform the semantic search
    start_time = time.time()
    search_results = vector_store.similarity_search_with_score(query, k=10)
    search_elapsed_time = time.time() - start_time

    logging.info(f"Semantic search completed in {search_elapsed_time:.2f} seconds")

    # Display search results
    print(f"\nSemantic Search Results (completed in {search_elapsed_time:.2f} seconds):")
    for doc, score in search_results:
        print(f"Distance: {score:.4f}, Text: {doc.page_content}")

except CouchbaseException as e:
    raise RuntimeError(f"Error performing semantic search: {str(e)}")
except Exception as e:
    raise RuntimeError(f"Unexpected error: {str(e)}")
```

    2024-08-29 13:35:28,094 - INFO - HTTP Request: POST https://api.openai.com/v1/embeddings "HTTP/1.1 200 OK"
    2024-08-29 13:35:28,285 - INFO - Semantic search completed in 0.34 seconds


    
    Semantic Search Results (completed in 0.34 seconds):
    Distance: 0.9178, Text: Why did the world enter a global depression in 1929 ?
    Distance: 0.8714, Text: When was `` the Great Depression '' ?
    Distance: 0.8115, Text: What crop failure caused the Irish Famine ?
    Distance: 0.7985, Text: What historical event happened in Dogtown in 1899 ?
    Distance: 0.7917, Text: What caused the Lynmouth floods ?
    Distance: 0.7912, Text: When did the Dow first reach ?
    Distance: 0.7908, Text: When was the first Wall Street Journal published ?
    Distance: 0.7885, Text: What were popular songs and types of songs in the 1920s ?
    Distance: 0.7857, Text: When did World War I start ?
    Distance: 0.7842, Text: What caused Harry Houdini 's death ?


# Retrieval-Augmented Generation (RAG) with Couchbase and LangChain
Couchbase and LangChain can be seamlessly integrated to create RAG (Retrieval-Augmented Generation) chains, enhancing the process of generating contextually relevant responses. In this setup, Couchbase serves as the vector store, where embeddings of documents are stored. When a query is made, LangChain retrieves the most relevant documents from Couchbase by comparing the query’s embedding with the stored document embeddings. These documents, which provide contextual information, are then passed to a generative language model within LangChain.

The language model, equipped with the context from the retrieved documents, generates a response that is both informed and contextually accurate. This integration allows the RAG chain to leverage Couchbase’s efficient storage and retrieval capabilities, while LangChain handles the generation of responses based on the context provided by the retrieved documents. Together, they create a powerful system that can deliver highly relevant and accurate answers by combining the strengths of both retrieval and generation.


```python
system_template = "You are a helpful assistant that answers questions based on the provided context."
system_message_prompt = SystemMessagePromptTemplate.from_template(system_template)

human_template = "Context: {context}\n\nQuestion: {question}"
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)

chat_prompt = ChatPromptTemplate.from_messages([
    system_message_prompt,
    human_message_prompt
])

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": lambda x: format_docs(vector_store.similarity_search(x)), "question": RunnablePassthrough()}
    | chat_prompt
    | llm
)
logging.info("Successfully created RAG chain")
```

    2024-08-29 13:35:28,305 - INFO - Successfully created RAG chain



```python
# Get responses
logging.disable(sys.maxsize) # Disable logging to prevent tqdm output
start_time = time.time()
rag_response = rag_chain.invoke(query)
rag_elapsed_time = time.time() - start_time

print(f"RAG Response: {rag_response.content}")
print(f"RAG response generated in {rag_elapsed_time:.2f} seconds")
```

    RAG Response: Based on the context provided, the world entered a global depression in 1929. This event is commonly known as "the Great Depression." While the context doesn't provide specific causes for the Great Depression, it's generally understood that it was triggered by a combination of factors, including:
    
    1. The stock market crash of 1929
    2. Bank failures
    3. A decline in consumer spending and investment
    4. International economic issues, such as the gold standard and trade policies
    
    It's important to note that the exact causes of the Great Depression are complex and still debated by historians and economists. The context doesn't provide detailed information about the specific triggers, but it does confirm that 1929 was the year when the global depression began.
    RAG response generated in 3.16 seconds


# Using Couchbase as a caching mechanism
Couchbase can be effectively used as a caching mechanism for RAG (Retrieval-Augmented Generation) responses by storing and retrieving precomputed results for specific queries. This approach enhances the system's efficiency and speed, particularly when dealing with repeated or similar queries. When a query is first processed, the RAG chain retrieves relevant documents, generates a response using the language model, and then stores this response in Couchbase, with the query serving as the key.

For subsequent requests with the same query, the system checks Couchbase first. If a cached response is found, it is retrieved directly from Couchbase, bypassing the need to re-run the entire RAG process. This significantly reduces response time because the computationally expensive steps of document retrieval and response generation are skipped. Couchbase's role in this setup is to provide a fast and scalable storage solution for caching these responses, ensuring that frequently asked queries can be answered more quickly and efficiently.



```python
try:
    queries = [
        "Why do heavier objects travel downhill faster?",
        "What caused the 1929 Great Depression?", # Repeated query
        "Why do heavier objects travel downhill faster?",  # Repeated query
    ]

    for i, query in enumerate(queries, 1):
        print(f"\nQuery {i}: {query}")
        start_time = time.time()

        response = rag_chain.invoke(query)
        elapsed_time = time.time() - start_time
        print(f"Response: {response.content}")
        print(f"Time taken: {elapsed_time:.2f} seconds")
except Exception as e:
    raise ValueError(f"Error generating RAG response: {str(e)}")
```

    
    Query 1: Why do heavier objects travel downhill faster?
    Response: Based on the provided context, I can answer the question about why heavier objects travel downhill faster.
    
    Heavier objects generally travel downhill faster due to the relationship between mass, gravity, and friction. Here's a more detailed explanation:
    
    1. Gravitational force: The force of gravity acting on an object is proportional to its mass. Heavier objects have more mass, so they experience a stronger gravitational pull.
    
    2. Friction: While friction does act against the motion of objects rolling downhill, it doesn't increase proportionally with mass. This means that the ratio of gravitational force to friction is generally more favorable for heavier objects.
    
    3. Inertia: Heavier objects have more inertia, which means they resist changes in motion more than lighter objects. Once they start moving, they tend to keep moving more easily.
    
    4. Air resistance: While air resistance does affect objects moving downhill, its effect is relatively smaller on heavier objects compared to lighter ones, as the ratio of air resistance to mass is lower for heavier objects.
    
    As a result of these factors, heavier objects typically accelerate faster and reach higher speeds when traveling downhill compared to lighter objects of similar shape and size.
    
    It's important to note that in a vacuum (where there's no air resistance), all objects would fall at the same rate regardless of their mass. However, in real-world conditions with air resistance and friction, heavier objects generally move faster downhill.
    Time taken: 5.61 seconds
    
    Query 2: What caused the 1929 Great Depression?
    Response: Based on the context provided, the world entered a global depression in 1929. This event is commonly known as "the Great Depression." While the context doesn't provide specific causes for the Great Depression, it's generally understood that it was triggered by a combination of factors, including:
    
    1. The stock market crash of 1929
    2. Bank failures
    3. A decline in consumer spending and investment
    4. International economic issues, such as the gold standard and trade policies
    
    It's important to note that the exact causes of the Great Depression are complex and still debated by historians and economists. The context doesn't provide detailed information about the specific triggers, but it does confirm that 1929 was the year when the global depression began.
    Time taken: 2.22 seconds
    
    Query 3: Why do heavier objects travel downhill faster?
    Response: Based on the provided context, I can answer the question about why heavier objects travel downhill faster.
    
    Heavier objects generally travel downhill faster due to the relationship between mass, gravity, and friction. Here's a more detailed explanation:
    
    1. Gravitational force: The force of gravity acting on an object is proportional to its mass. Heavier objects have more mass, so they experience a stronger gravitational pull.
    
    2. Friction: While friction does act against the motion of objects rolling downhill, it doesn't increase proportionally with mass. This means that the ratio of gravitational force to friction is generally more favorable for heavier objects.
    
    3. Inertia: Heavier objects have more inertia, which means they resist changes in motion more than lighter objects. Once they start moving, they tend to keep moving more easily.
    
    4. Air resistance: While air resistance does affect objects moving downhill, its effect is relatively smaller on heavier objects compared to lighter ones, as the ratio of air resistance to mass is lower for heavier objects.
    
    As a result of these factors, heavier objects typically accelerate faster and reach higher speeds when traveling downhill compared to lighter objects of similar shape and size.
    
    It's important to note that in a vacuum (where there's no air resistance), all objects would fall at the same rate regardless of their mass. However, in real-world conditions with air resistance and friction, heavier objects generally move faster downhill.
    Time taken: 0.35 seconds


By following these steps, you’ll have a fully functional semantic search engine that leverages the strengths of Couchbase and Claude(by Anthropic). This guide is designed not just to show you how to build the system, but also to explain why each step is necessary, giving you a deeper understanding of the principles behind semantic search and how to implement it effectively. Whether you’re a newcomer to software development or an experienced developer looking to expand your skills, this guide will provide you with the knowledge and tools you need to create a powerful, AI-driven search engine.
