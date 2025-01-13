# Backend Setup Guide

Cardano Autonomous Agent Backend API

## Requirements

Python version : 3.12.2

Poetry version : 1.8.2

#### Prerequisites

-   Python version: `3.12` or higher
-   Poetry version: `1.8.3` or higher
-   Pip version: `24.0.0` or higher

#### Steps

> **Note**: Make sure the all the following required services are running before setting up the api server
>
> -   Postgres (Required)
>
> -   Kafka with Zookeeper (Required)

#### Setup environment variables
Make new file `.env` using `.env.example` and update the environments before running the below steps:

- **`KAFKA_PREFIX`**: Prefix for Kafka topics.
- **`AGENT_MNEMONIC`**: Seed phrase to generate a wallet.
- **`DOCS_URL`**: Path for swagger docs
- **`KAFKA_ENABLED`**: To enable kafka (Must be enabled by putting value `true` to run the testing agents)
- **`METADATA_BASE_URL`**: Metadata url to fetch metadata of the drep and proposals of different network
- **`DB_SYNC_BASE_URL`**: DbSync url 
- **`KAFKA_PREFIX`**: Kafka prefix topic
- **`DATABASE_URL`**: Postgres database url
- **`KAFKA_BROKERS`**: Kafka broker url

<br/>

1. Go to the api folder (If in root folder)

    ```shell
    cd api
    ```

2. Activate a poetry virtual environment

    ```shell
    poetry shell
    ```
3. Check if your virtual env is created using python of version `3.12` or higher
> **Note:** Your terminal should have something like this `(backend-py3.12) `
   - If it is not created using python of version `3.12` or higher then create virtual environment again using command
      ```shell
    poetry env use 3.12
    ```
   - And finally again use command 
      ```shell
       poetry shell
       ```

3. Install Dependencies

    ```shell
    poetry install
    ```

4. Update the environment variables copying it form `.env.example` to `.env`


5. Run this command for generating the database client and creating the required table mentioned in schema

    ```shell
    prisma generate
    prisma migrate dev
    ```

> **Note**: You should always activate virtual environment by using command `poetry shell` before running below command

Start the server with env variables.

```bash
  uvicorn backend.app:get_application --port 8000 --reload --env-file .env
```

Go to http://localhost:8000/api/docs

You would see the list of available API 
