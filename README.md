Cardano Autonomous Agent Monorepo
============

1. [Backend](api/)
2. [Agent Manager](agent-manager/)
3. [Agent](agent-node/)
4. [Frontend](frontend/)

## Running the stack locally

Setup the required dependencies by running the command locally.

```shell
docker compose -f docker-compose.local.yml up -d
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