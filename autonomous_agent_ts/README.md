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

2. Run the application with an agent ID as a command-line argument:

    ```shell
    npm run start -- <agent_id>
    ```

    Replace `<agent_id>` with the actual agent ID you want to use.

## Development

For development purposes, you can use the following command to run the application directly from the source TypeScript files:

```shell
npm run dev -- <agent_id>
