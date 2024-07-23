---
sidebar_position: 1
---

# Architecture

### Architecture Diagram

![Autonomous Agent Architecture](/img/autonomous_agent.png)

## Services

### Frontend (Next.js)

In this service, users can view a dashboard for insightful information regarding `triggerHistory`, `number of agents`, `number of proposals`, and `number of votes`. Furthermore, users can perform the following actions:

- View trigger logs through the `Logs` tab.
- Create templates with desired functions and different trigger types.

  :::info
  Trigger types are either CRON-based or Event-based.
  :::

- Create agents based on the available templates.
- Manually trigger available functions for individual agents.
- Edit and delete individual `template` or `agent`.
- View the `Drep Directory` list available on SanchoNet where they can delegate to available Dreps.
- View the `Governance Actions` list available on SanchoNet where they can vote on available actions.

### Backend (FastAPI)

This service is connected to multiple services for various purposes:

- #### Kafka Service

  Publishes messages related to `Agent_Configuration_Update`, `Manual_Action_Trigger`, and `Agent_Deletion`.

- #### PostgreSQL Database

  Stores data related to `Trigger`, `TriggerHistory`, `Agent`, and `Templates`.

- #### Kuber Service

  Fetches the wallet information related to a particular agent.

- #### Agent Manager

  Passes information about various private keys related to the agent.

### Agent Manager

This service handles WebSocket creation using the RPC protocol. It consumes messages from Kafka and, depending on the message type, either broadcasts them to all active agents or sends them to a specific agent. Additionally, it listens for events from the Cardano Node and broadcasts these events to all active agents. It also interacts with the `Backend sevice` to fetch agent private keys.

The primary function of the service is to submit transactions to the Kuber service as requested by the agents. After submitting a transaction, it logs the response to the PostgreSQL database, which is subsequently displayed in the UI.

### Agent

The service connects to the Agent Manager service via WebSocket using the RPC protocol and executes actions as configured. It receives various messages from the Agent Manager Service, including blocks of transactions, agent configurations, and manual action triggers. Based on these messages, it performs actions according to the CRON schedule, event-based triggers, or manual user commands.

The Agent performs the following actions:

- RegisterDRep
- DeRegisterDRep
- RegisterStake
- DeRegisterStake
- Abstain
- NoConfidence
- StakeDelegation
- VoteOnProposal
- InfoAction
- NewConstitution
- Transfer ADA

For event-based actions, it monitors blocks of transactions and executes the relevant action upon detecting suitable transactions. For CRON-based actions, it executes the specified tasks at regular intervals as configured. Manual triggers execute actions when initiated by the user through the UI.

In cases where actions like voteOnProposal or stakeDelegation fail due to dependencies on other actions, the service first completes the necessary dependent actions before executing the intended action.

### Kafka Service

This service handles the publishing and consumption of messages related to the agent. The `Backend` publishes messages, while the `Agent Manager` consumes them.

### Cardano Node

The `Agent Manager` receives transaction blocks from this service. These transactions are used to validate submissions made by the Agent Manager on behalf of the Agent.

### Kuber

Kuber is responsible for submitting transactions initiated by the Agent Manager on behalf of the Agent. It also retrieves the wallet details for the agent.
