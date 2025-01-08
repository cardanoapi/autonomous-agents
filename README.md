### Welcome to Autonomous Agent Testing 
Autonomous Agent Testing primarily focuses on evaluating the features introduced in the Cardano Improvement Proposal (CIP) 1694. 
This includes testing the creation and voting mechanisms for proposals to ensure the governance model operates seamlessly.
Additionally, it verifies functionalities like registering and deregistering as a Delegated Representative (DRep), 
managing stake registrations and deregistrations, and performing ADA transfers. It also provides the feature to trigger these function either 
Manually or by setting a CRON schedule or by event filtering The testing process ensures these operations are secure, efficient, 
and align with the decentralized governance objectives of Cardano's Voltaire era.

## Running the deployed service 
[Autonomous Agent Testing](https://agents.cardanoapi.io/)

## Running the stack locally

### Directory Structure
1. `api`: the backend service
2. `manager`: Middleman between agents and backend. Also handles different services for agent
3. `agent-node`: agent for handling various functions
4. `frontend`: UI for autonomous agent testing
5. `dbsync-api`: handling services related to dbsync database

### Using Docker

Before running whole service locally using docker you need to add few of the environment variables
on file `docker-compose.dev.yml`

##### api
- AGENT_MNEMONIC 
  - Add seed phrase to generate wallet

##### agent_manager
- KUBER_API_KEY
  - Visit [KuberIde](https://kuberide.com/kuber/settings/api-keys) and generate api-key
- MANAGER_WALLET_ADDRESS (OPTIONAL)
- MANAGER_WALLET_SIGNING_KEY (OPTIONAL)
  - Add a wallet address having sufficient ADA so that it can be used to transfer ADA to agent when requested
- FAUCET_API_KEY (OPTIONAL)
  - Add faucet api key to load ADA which will be used to transfer ADA to agents as per request. And it will only be used if the provided `MANAGER_WALLET_ADDRESS` doesnot have sufficient ADA.
- AGENT_MNEMONIC
    - Add seed phrase to generate wallet that should be same as added in `api`
- BLOCKFROST_API_KEY (Required if ENABLE_BLOCKFROST_SUBMIT_API is 'True' or enabled)
  - Visit [Blockfrost](https://blockfrost.io/) and sign up and generate api key

Note: environment variable `ENABLE_BLOCKFROST_SUBMIT_API` is preferred as if it is not enabled then `Kuber` will be used to submit the transaction which might take couple of minutes.

##### dbsync
- DATABASE_URL
  - Add database url of dbsync

Furthermore all env are setup to run in `Sanchonet` so if you want to run in `Preprod` or `Preview`
Network then following environment variables are to be updated:

##### frontend
- NEXT_PUBLIC_NETWORK_NAME
  -  preview or preprod

##### api and manager
- DB_SYNC_BASE_URL
  - https://preprod-dbync.agents.cardanoapi.io/api for `preprod`
  - https://preview-dbync.agents.cardanoapi.io/api for `preview`

##### manager only
- KUBER_BASE_URL
  - https://preview.kuber.cardanoapi.io for `preview`
  - https://preprod.kuber.cardanoapi.io for `preprod`

- CARDANO_NETWORK_MAGIC
  - 3 for `preview`
  - 2 for `preprod`

- BLOCKFROST_API_KEY
  - Visit [Blockfrost](https://blockfrost.io/) and sign up and generate api key based on desired network type 

- NETWORK_NAME
  - preprod or preview

##### dbsync
- DATABASE_URL
  - Update the dbsync database url and database name accordingly

```shell
docker compose -f docker-compose.dev.yml up -d
```

**Note**: You can also use already existing services in place of this


The setup guide for each services are in the respective directories:

1. [Backend](api/README.md)
2. [Agent Manager](agent-manager/README.md)
3. [Agent](agent-node/README.md)
4. [Frontend](frontend/README.md)


# IMPORTANT

Please setup the pre-commit hook before adding any commit for git by running the following command:
```shell
./install-pre-commit-hook.sh
```