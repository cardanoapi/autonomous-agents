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

Setup the required dependencies by running the command locally.

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