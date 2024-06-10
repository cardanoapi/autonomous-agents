# Autonomous Agent Application

This project is a TypeScript client application that connects to a server via WebSocket and processes configurations sent by the server. It can schedule and trigger functions based on received configurations.

## Table of Contents

-   [Requirements](#requirements)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Development](#development)

## Requirements

-   [Node.js](https://nodejs.org/) (v18.18.0 or higher)
-   [yarn](https://yarnpkg.com/) package manager

## Installation

1. Clone the repository:

    ```shell
    git clone https://github.com/sireto/cardano-autonomous-agent.git
    cd  cardano-autonomous-agent/agent-node
    ```

2. Install dependencies using npm or yarn:

    ```shell
    yarn install
    ```

## Usage

### Setting up environment variables

Copy environment variables from `.env.example` to `.env` and update them as necessary.

> **Note**: AGENT_ID if the ID of the agent created with API.

### Development Mode

To run the application in dev mode run the following command

```shell
yarn dev
```

### Production Mode

1. Build the application using the following command:

    ```shell
    yarn build
    ```

    This will compile the TypeScript files into JavaScript and place the output in the `dist` directory.

2. Run the application with an agent ID as a command-line argument:

    ```shell
    yarn start
    ```
