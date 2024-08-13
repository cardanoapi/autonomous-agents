
# Autonomous Agent Testing backend PyTest

The test is responsible for following things

- Perform User & Admin authentication tests.
- Perform Agents & Template Managment tests.
- Run Agent using Agent Node.
- Run Test Scenerio to Load Ada from faucet and refund it. (Cron Trigger)
- Run Test Scenerio to Create an Info Action Proposal and vote on it. (Manual & Event Trigger)




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

`CARDANO_FAUCET_BASE_URL`

`CARDANO_FAUCET_API_KEY`


## Running Tests

To run tests, run the following command inside tests/test-api

```bash
  poetry shell
```

```bash
  pytest 
```
## To Generate Allure Test report

To generate allure tests you need to run pytest with allure for which you need to  have the Allure CLI tool installed. For installation [refer here.](https://allurereport.org/docs/install/)

```bash
  poetry shell 
```
```bash
  pytest -alluredir allure-result
```
```bash
  allure serve ./allure-result
```

To presist test case data between test sessions [refer here.](https://allurereport.org/docs/history-and-retries/)