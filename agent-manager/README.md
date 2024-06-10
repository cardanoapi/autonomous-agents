# Agent Manager Application

This project is a TypeScript Agent Manager application where Agents are connected to it through websocket .

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
    cd  cardano-autonomous-agent/agent-manager
    ```

2. Install dependencies using yarn:

    ```shell
    yarn install
    ```

## Usage

Copy the env variables form `.env.example` to `.env` and update the env variables.

Make sure to run the following command to generate the database client and creating the required table mentioned in schema

```bash
yarn prisma generate
```

### Development Mode

To run the application in dev mode run the following command

```shell
yarn dev
```

### Production Mode

To run the Agent Manager application, follow these steps:

1. Build the application using the following command:

    ```shell
    yarn build
    ```

    This will compile the TypeScript files into JavaScript and place the output in the `dist` directory.

2. Run the application with an agent ID as a command-line argument:

    ```shell
    yarn start
    ```

Make sure your API service is up and running .

If successful a server listening on port `3000` will be running:

> http://localhost:3001
