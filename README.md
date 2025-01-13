# Welcome to Autonomous Agent Testing

Autonomous Agent Testing focuses on evaluating features introduced in the Cardano Improvement Proposal (CIP) 1694. This includes testing the creation and voting mechanisms for proposals to ensure the governance model operates seamlessly. Additionally, it verifies functionalities such as:

- Registering and deregistering as a Delegated Representative (DRep).
- Managing stake registrations and deregistrations.
- Performing ADA transfers.
- Triggering operations manually, via a CRON schedule, or through event filtering.

The testing process ensures these operations are secure, efficient, and aligned with the decentralized governance objectives of Cardano's Voltaire era.

---

## Accessing the Deployed Service

You can access the deployed service here: [Autonomous Agent Testing](https://agents.cardanoapi.io/)

---

## Running the Stack Locally

### Directory Structure

1. **`api`**: Backend service.
2. **`manager`**: Middleware between agents and the backend; handles various agent-related services.
3. **`agent-node`**: Agent responsible for executing various functions.
4. **`frontend`**: User interface for autonomous agent testing.
5. **`dbsync-api`**: Service for interacting with the dbsync database.
---

### Using Docker

Before running the entire service locally using Docker, create `.env` files from `.env.example` and populate them with the necessary environment variables. Below are descriptions of key variables:
> **Note:** Some variables in `.env.example` are prepopulated. Keep them as it is or change them carefully.

#### Changes to be made in `.env` file

##### API and Manager

- **`KAFKA_PREFIX`**: Prefix for Kafka topics.
- **`AGENT_MNEMONIC`**: Seed phrase to generate a wallet.

##### Agent Manager

- **`KUBER_API_KEY`**: Generate an API key from [KuberIde](https://kuberide.com/kuber/settings/api-keys).
- **`MANAGER_WALLET_ADDRESS`** (Optional): Wallet address with sufficient ADA for transfers.
- **`MANAGER_WALLET_SIGNING_KEY`** (Optional): Signing key for the manager wallet.
- **`FAUCET_API_KEY`** (Optional): API key to load ADA for agent transfers if the manager wallet lacks sufficient funds.
- **`BLOCKFROST_API_KEY`** (Required if `ENABLE_BLOCKFROST_SUBMIT_API` is enabled): Obtain from [Blockfrost](https://blockfrost.io/).

> **Note:** If `ENABLE_BLOCKFROST_SUBMIT_API` is not enabled, transactions will be submitted using `Kuber`, which may take a few minutes.

##### DBSync

- **`DBSYNC_DATABASE_URL`**: URL for the `dbsync-api service`. Default running on `http://localhost:9000` on starting `dbsync-api` service.

##### Docker Network Name

- **`DOCKER_NETWORK_NAME`**: Customize the Docker network name (default value provided in `.env.example`).

##### Agent

- **`AGENT_NODE_DOCKER_IMAGE_NAME`**: Customize the Docker image name for the agent node.

#### Running in `Preprod` or `Preview` Networks

To run in `Preprod` or `Preview` networks, update the following environment variables:

##### Frontend

- **`NEXT_PUBLIC_NETWORK_NAME`**: Set to `preview` or `preprod`.

##### API and Manager

- **`DB_SYNC_BASE_URL`**:
  - `https://preprod-dbync.agents.cardanoapi.io/api` for `preprod`
  - `https://preview-dbync.agents.cardanoapi.io/api` for `preview`

##### Manager Only

- **`KUBER_BASE_URL`**:
  - `https://preview.kuber.cardanoapi.io` for `preview`
  - `https://preprod.kuber.cardanoapi.io` for `preprod`
- **`CARDANO_NETWORK_MAGIC`**:
  - `3` for `preview`
  - `2` for `preprod`
- **`BLOCKFROST_API_KEY`**: Obtain from [Blockfrost](https://blockfrost.io/) for the desired network.
- **`NETWORK_NAME`**: Set to `preprod` or `preview`.

##### DBSync

- **`DBSYNC_DATABASE_URL`**: Update the URL and database name accordingly.
---

#### Starting the Service

Run the following command:

```bash
docker compose -f docker-compose.dev.yml up -d
```

> **Note:** Ensure no applications are running on ports `3000` and `8000`. 

#### Finally Running the Agent

1. Visit the frontend at `http://localhost:3000` and connect your wallet.
2. Navigate to the `My Agent` tab in the bottom left to access the `Agents Page`.
3. In the `Overview Tab`, click the `Run Agent` button in the top-right corner of the `Agents Overview Section`.
4. Copy the Docker command and run it in the terminal. Your agent is now ready to operate.

---

### Local Setup

Each service has its own setup guide within its respective directory.

1. [Backend](api/README.md)
2. [Agent Manager](agent-manager/README.md)
3. [Agent](agent-node/README.md)
4. [Frontend](frontend/README.md)
5. [DbSync-Api](dbsync-api/README.md)

**`Note`**: For running all services locally, dependencies like `Kafka` and `PostgreSQL` can be run via Docker using the following command:
```bash
docker compose -f docker-compose.dev.yml up -d
```

---

## Important

Before committing any changes to the repository, set up the pre-commit hook by running the following command:

```bash
./install-pre-commit-hook.sh
```

