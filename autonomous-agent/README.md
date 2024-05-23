#  Autonomous Agent Application

This project is a TypeScript client application that connects to a server via WebSocket and processes configurations sent by the server. It can schedule and trigger functions based on received configurations.

## Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)

## Requirements

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) package manager

## Installation

1. Clone the repository:

    ```shell
    git clone https://github.com/sireto/cardano-autonomous-agent.git
    cd  autonomous_agent_ts
    ```

2. Install dependencies using npm or yarn:

    ```shell
    npm install
    ```

    or

    ```shell
    yarn install
    ```

## Usage

To run the client application, follow these steps:

1. Build the application using the following command:

    ```shell
    npm run build
    ```

    This will compile the TypeScript files into JavaScript and place the output in the `dist` directory.

2. Run the application with exporting  agent ID  and WS_URL as a environment variable

    ```shell
    export AGENT_ID=50641eb5-6254-4066-9260-5469598a9e95  WS_URL=ws://localhost:3001

    ```

    Replace `AGENT_ID` value with actual id  you want to use.

## Docker Usage
Change directory

```bash
  cd cardano-autonomous-agent
```

Run Docker-Compose . This will setup up the **postgres Database**, **pgadmin4** , **kafka** and **backend** via Docker.

```bash
 docker compose -f "docker-compose.deployment.yml" up --build -d
 ```

image will be build of agent 

Now before running the below command make sure api and manager service is up and running

```shell
docker run -e WS_URL=ws://localhost:3001 -e AGENT_ID=d3abcc95-bb8f-40d5-9ba6-38ac6dbcfe8d  cardano-autonomous-agent-agent

```
Replace the AGENT_ID with the actual agent id .