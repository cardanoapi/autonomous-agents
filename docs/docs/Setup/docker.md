# Using Docker

### Directory Structure

1. **`api`**: Backend service.
2. **`manager`**: Middleware between agents and the backend; handles various agent-related services.
3. **`agent-node`**: Agent responsible for executing various functions.
4. **`frontend`**: User interface for autonomous agent testing.
5. **`dbsync-api`**: Service for interacting with the dbsync database.
---

Before running the entire service locally using Docker, create `.env` files from `.env.example` at the root level and populate them with the necessary environment variables. Below are descriptions of key variables:
> **Note:** Some variables in `.env.example` are prepopulated. Keep them as it is or change them carefully.

#### Changes to be made in `.env` file

##### API and Manager common

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

##### Docker Compose Configuration

- **`DOCKER_NETWORK_NAME`**: Customize the Docker network name (default value provided in `.env.example`).

##### Agent

- **`AGENT_NODE_DOCKER_IMAGE_NAME`**: Customize the Docker image name for the agent node.

---

#### Starting the Service
After setting up the environment variables now run the following command:

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

#### Running in `Preprod` or `Preview` Networks

To run the whole project in `Preprod` or `Preview` networks, update the following environment variables for docker-compose file:

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

