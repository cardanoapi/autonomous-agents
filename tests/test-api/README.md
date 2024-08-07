
# Autonomous Agent Testing backend PyTest

The test is responsible for following things

- Perform user/ admin authentication tests.
- Perform Agents/Template CRUD Operation tests.
- Run Agent using Agent Node.




## Installation

Run this command inside tests/test-api

```bash
  poetry install
```


## Environment Variables

To run the tests, you will need to add the following environment variables to your .env file

`BASE_API_URL`

`USER_KEY`

`USER_SIGNATURE`

`ADMIN_KEY`

`ADMIN_SIGNATURE`

`AGENT_MANAGER_WS_URL`

`AGENT_RUN_TIMEOUT`



## Running Tests

To run tests, run the following command inside tests/test-api

```bash
  poetry shell
```

```bash
  pytest 
```


## Edge Cases and Special Condition

The agent that gets generated during the test session is generated using admin. When the test is running the agent for certain period of time via agent-node, another user with admin privilege can delete the running agent which can lead to faliure of Trigger History Logs test.

