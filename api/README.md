# Backend Setup Guide

Cardano Autonomous Agent Backend API

## Requirements

Python version : 3.12.2

Poetry version : 1.8.2

## Docker

## Setup Guide

Clone the project

```bash
  git clone https://github.com/sireto/cardano-autonomous-agent
```

Change directory

```bash
  cd cardano-autonomous-agent
```

Run Docker-Compose . This will setup up the **postgres Database**, **pgadmin4** , **kafka** and **backend** via Docker.

```bash
 docker compose -f "docker-compose.deployment.yml" up --build -d
```

After successfully run ,Go to http://0.0.0.0:8000/ , to see the list of api services

## Locally

## Setup Guide

#### Prerequisites

-   Python version: `3.12` or higher
-   Poetry version: `1.8.3` or higher
-   Pip version: `24.0.0` or higher

#### Steps

> **Note**: Make sure the all the following required services are running before setting up the api server
>
> -   Postgres (Required)
>
> -   Kafka with Zookeeper (Optional)
>
> -   Redis (Optional)

<br/>

1. Go to the api folder (If in root folder)

    ```shell
    cd api
    ```

2. Activate a poetry virtual environment

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

## Running the Server

Activate Poetry venv inside autonomous-agents-api folder by running the following command.

```bash
  poetry shell
```

Start the server with env variables.

```bash
  uvicorn backend.app:get_application --port 8000 --reload --env-file .env
```

Go to http://localhost:8000

You would see the list of API available
