Cardano Autonomous Agents
============
This project introduces an innovative approach to testing these networks using autonomous agents. The goal is to leverage the self-organizing capabilities of these agents to simulate/emulate real-world scenarios and interactions in Cardano blockchain networks, providing a comprehensive and dynamic testing environment.

## Objectives

- To develop a framework for deploying autonomous agents within blockchain environments.
- To simulate a wide range of network conditions and user interactions to test network resilience and performance.
- To identify potential vulnerabilities and performance bottlenecks.

## Scope

CIP - 1694 scenarios; Voltaire Voting Testing

## Architecture

https://cardanoapi.github.io/autonomous-agents/docs/architecture

## Designs

https://www.figma.com/design/h9K0eArOSnZOVw7O5UrYFu/AAT?node-id=552-18675&t=Oo8Btdz1I9F8RfiG-0

## Repository structure

The repository is a monorepo and contains sub-projects and components needed for this project.
Here are the sub-projects within this repository.
1. [Autonomous Agent API](./autonomous_agent_api/)
2. [Agent Dashboard](./automonous_agent_frontend/)

## Requirements

- Python version : 3.12.2 
- docker-compose.local - (Docker Container for Postgres database and pgadmin4) 
- For Backend setup refer to autonomous_agent_api/readme guide.
