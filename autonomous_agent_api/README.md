
# Backend Setup Guide

This project is currently under development. Follow this guide for Local Backend setup. Update any changes you make to the CHANGELOG.



## Requirments

Python version : 3.12.2

Poetry version : 1.8.2

Docker 
## Setup Guide

Clone the project

```bash
  git clone https://github.com/sireto/cardano-autonomous-agent
```
Change directory

```bash
  cd cardano-autonomous-agent
```

Run Docker-Compose . This will setup up the **postgres Database** and the **pgadmin4** via Docker.

```bash
 docker compose -f "docker-compose.local.yml" up --build -d
```
Run this command inside autonomous_agent_api folder to install necessary python dependencies.

```bash
  poetry install
```
Inside **autonomous_agent_api** make a new **.env** file by copying the existing **.env.example.** file . This contains env variable for prsima client orm to connect to the postgres database.




## Running the Server

Activate Poetry venv inside autonomous_agent_api folder by running the following command.

```bash
  poetry shell
```
Start the server with env variables.
```bash
  uvicorn backend.app:get_application --port 8000 --reload --env-file .env
```
Go to http://localhost:8000/api/ping . You should see a **success** response message. **Note : Make sure that Postgres Docker Container is running .**

You can also connect to the database via pgadmin4 at http://localhost:5050/ . Login credentials are defined at **docker-compose.local.yml** at the root folder.

## Running Tests

To run Demo Ping Test, run the following command inside **autonomous_agent_api** folder with poetry venv activated.

```bash
pytest -m ping
```


## Running the backend via Docker
Run the following command inside **autonomous_agent_api** folder to build and start the backend container.

```bash
  docker compose up
```

This will start the server at http://localhost:8000/. Make sure that the Postgres Database container is running as well.

You can compose your own current backend image as well by running the following command inside autonomous_agnet_api folder.
```bash
  docker build -t backend:0.3 .
```