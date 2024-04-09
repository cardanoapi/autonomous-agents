
# Autonomous Agent

This is a python service for creating websocket connection with the central server using agent id. The agent pings the server periodically via the websocket connection.

Requirments:

 - Python 3.12.2

 - Poetry
## Setup Guide

Clone the project

```bash
  git clone https://github.com/sireto/cardano-autonomous-agent
```

Go to the Autonomous Agent Directory

```bash
  cd autonomous_agent
```

Install dependencies via poetry.

```bash
  poetry install
```
## Creating a new Agent.

To create a new agent you need to send a post request to **api/create_agent** endpoint. Make sure that **autonomous_agent_api** backend service and **database** are running correctly.

Copy the id from the post response . The id looks something similar to **c2d4c358-5171-4be8-b273-0147cc57c204.**

## Running the service

Activate the poetry virtual env inside **autonomous_agent** folder by running the following command.

```
 poetry shell
```
Now run the following command along with your agent id.

```
python connect-agent.py --agent_id  < Your id here > 
```
After a successfull connection , you should see the periodic ping request and response in your terminal.