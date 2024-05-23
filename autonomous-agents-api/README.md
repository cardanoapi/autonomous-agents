
# Backend Setup Guide

Cardano Autonomous Agent Backend API


## Requirments

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

Run this command inside autonomous-agents-api folder to install necessary python dependencies.

```bash
  poetry install
```
Inside **autonomous-agents-api** make a new **.env** file by copying the existing **.env.example.** file . This contains env variable for prsima client orm to connect to the postgres database.


Run this command for generating the database client and creating the required table mentioned in schema

```bash
   prisma generate
```

```bash
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

You would see the list of API services

Before that make sure to run the postgres , kafka and other services first , either with docker or locally setup.
for local development to start the services you can run the docker-compose.local.yml




