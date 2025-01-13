# Agent Manager Application

This project is a TypeScript Agent Manager application where agents are connected to it through websocket.

## Table of Contents

-   [Requirements](#requirements)
-   [Installation](#installation)

## Requirements

-   [Node.js](https://nodejs.org/) (v18.18.0 or higher)
-   [yarn](https://yarnpkg.com/) package manager
-   `kafka service`
-   `postgres server`

## Installation

1. Go to the agent-manager folder (If in root folder)

    ```shell
    cd agent-manager
    ```

2. Install dependencies using yarn:

    ```shell
    yarn install
    ```

## Usage

Create new file `.env` and copy env variables form `.env.example` to `.env` and update the env variables.

#### Setup environment variables

#### Kafka Configuration

-   **`KAFKA_CONSUMER_GROUP`**: Kafka consumer group name.
-   **`CLIENT_ID`**: Unique client ID for Kafka.
-   **`KAFKA_PREFIX`**: Prefix for Kafka topics.
-   **`KAFKA_BROKERS`**: Kafka broker URL. Specify either a locally running Kafka URL (e.g., on Docker) or a deployed Kafka service URL.

#### Cardano Configuration

-   **`CARDANO_NODE_URL`**: `172.31.0.4:3004` - URL for the Cardano node.
-   **`KUBER_BASE_URL`**: `'https://sanchonet.kuber.cardanoapi.io'` - Base URL for Kuber's Cardano API.
-   **`KUBER_API_KEY`**: API key for accessing Kuber services. Generate an API key from [KuberIde](https://kuberide.com/kuber/settings/api-keys).
-   **`METADATA_BASE_URL`**: Metadata URL to fetch information about dReps and proposals across different networks. (Default provided in `.env.example`)
-   **`DB_SYNC_BASE_URL`**: URL for the `dbsync-api service`. Default running on `http://localhost:9000` on starting `dbsync-api` service.
-   **`CARDANO_NETWORK_MAGIC`**: `4` - Network magic for the Cardano testnet(Sanchonet).
-   **`BLOCKFROST_API_KEY`** (Optional): API key for accessing the Blockfrost API. (Required if `ENABLE_BLOCKFROST_SUBMIT_API` is enabled): Obtain from [Blockfrost](https://blockfrost.io/).
-   **`ENABLE_BLOCKFROST_SUBMIT_API`** (Optional): `'True'` - Enable or disable Blockfrost transaction submission API.
    > **Note:** If `ENABLE_BLOCKFROST_SUBMIT_API` is not enabled, transactions will be submitted using `Kuber`, which may take a few minutes.

#### Wallet Configuration

-   **`MANAGER_WALLET_ADDRESS`** (Optional): Wallet address with sufficient ADA for transfers.
-   **`MANAGER_WALLET_SIGNING_KEY`** (Optional): Signing key for the manager wallet.
-   **`FAUCET_API_KEY`** (Optional): API key to load ADA for agent transfers if the manager wallet lacks sufficient funds.
-   **`AGENT_MNEMONIC`**: Seed phrase used to generate a wallet.

#### Database Configuration

-   **`DATABASE_URL`**: PostgreSQL database URL. Specify either a local Docker-based database or a deployed database URL.

#### Server Configuration

-   **`SERVER_PORT`** (OPTIONAL): `3002` - Port number for the server. (Default port is 3001)
-   **`NETWORK_NAME`**: `sanchonet` - Name of the Cardano network.

After updating environment variables make sure to run the following command to generate the database client and creating the required table mentioned in schema

```bash
yarn prisma generate
```

Now finally run the below command to start the manager:

```bash
yarn dev
```

If successful a server listening on mentioned PORT will be running:

> http://localhost:3001

## Running in `Preprod` or `Preview` Networks

To run in `Preprod` or `Preview` networks, update the following environment variables:

-   **`DB_SYNC_BASE_URL`**:
    -   `https://preprod-dbync.agents.cardanoapi.io/api` for `preprod`
    -   `https://preview-dbync.agents.cardanoapi.io/api` for `preview`
-   **`KUBER_BASE_URL`**:
    -   `https://preview.kuber.cardanoapi.io` for `preview`
    -   `https://preprod.kuber.cardanoapi.io` for `preprod`
-   **`CARDANO_NETWORK_MAGIC`**:
    -   `3` for `preview`
    -   `2` for `preprod`
-   **`BLOCKFROST_API_KEY`**: Obtain from [Blockfrost](https://blockfrost.io/) for the desired network.
-   **`NETWORK_NAME`**: Set to `preprod` or `preview`.
