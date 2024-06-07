# Agent Manager Application

This project is a TypeScript Agent Manager application where Agents are connected to it through websocket .

## Table of Contents

-   [Requirements](#requirements)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Development](#development)

## Requirements

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) package manager

## Installation

1. Clone the repository:

    ```shell
    git clone https://github.com/sireto/cardano-autonomous-agent.git
    cd  cardano-autonomous-agent/autonomous-agent-manager
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

To run the Agent Manager application, follow these steps:

1. Build the application using the following command:

    ```shell
    npm run build
    ```

    This will compile the TypeScript files into JavaScript and place the output in the `dist` directory.

2. Run the application with an agent ID as a command-line argument:

    ```shell
    npm run start
    ```

3. Run this command for generating the database client and creating the required table mentioned in schema

```bash
   prisma generate
```

Make sure your API service is up and running .

## Docker

hange directory

```bash
  cd cardano-autonomous-agent
```

Run Docker-Compose . This will setup up the **postgres Database**, **pgadmin4** , **kafka** and **backend** via Docker.

```bash
 docker compose -f "docker-compose.deployment.yml" up --build -d
```

After successfully running the service ,It will be up and running at http://localhost:3001 and its websocket service will be available to use by agents.
