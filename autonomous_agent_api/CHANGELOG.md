# Changelog

 - Added docker compose file for postgres database and pgadmin4.
 - Configured Prisma ORM.
 - Added demo api at /ping/api
 - Added sample test case for demo api
 - Added docker compose and image builder for backend.
 - Added read me guide for backend setup/ installation.

#  AGENT CRUD API , DATE- 2024-03-27/28 
 - Added Repository and Service folder 
 - Created Agent prisma model
 - Added agent_router 
   - created crud Api endpoints 
   - POST api for agent creation
   - GET api for listing agents
   - GET api for getting agent properties.
   - PUT api to update agent properties.
   - DELETE api for soft deletion of agent.
   - created dtos model for request and response inside model directory
 
# TEST Setup and Test cases for Agent Api , Date - 2024-03-28/29 - 04-01
  - Made setup to run the test cases
  - Wrote Unit test for API methods of Agent

# Trigger/API crud operation , Date - 2024-04-01/02
  - Made table for Triggers 
  - Created router,service,repository for trigger CRUD Action
  - Created the validation function for cron expression and kafka topic while creating the trigger by agent

# AGENT Websocket , DATE- 2024-04-09
 - Added websocket endpoint for agent websocket connection

#  Agent registration and config fetch , DATE - 2024-04-09/10
  - added instance and last_active field in Agent Field
  - updated Agent Model and refactored repository 
  - added features for fetching the configuration on the basis of agent_id
  - Added functionality for periodically updating last_active for agent in agent table
  - Added test case for the trigger repository

 # Trigger Table update and define action in trigger config , DATE - 2024-04-11
 - added action field in trigger table
 - action field json 
    - contains function_name and parameter as a details for action in dto model
 - updated the trigger dto model and updated trigger respository class

# Trigger Table update and define action in trigger config , DATE - 2024-04-12
  - refactored the agent_websocket.py router class to websocket_router.py
  - modularized the agent_websocket code into seprate service , repository , and controller class

# Agent Key Generation, DATE - 2024-04-19
  -  Update agent table to include the index field.
  -  Create Api endpoint to fetch agent's wallet details and it's wallet address.

# Agent Handler Service(Agent Manager) , DATE - 2024 -05 - 07
  - Created Agent Manager seprate service project to handle the incoming request from the Agents
  - integration of Kafka in Api and agent manager to handle update configuration

# Template , Date - 2024 - 05 - 10
  - Created template Service to support creation of template
  - Created static api service to fetch the function/behaviour details.

# Template Trigger , 2024 -05 -12
  - Created Template Trigger Services 
   - Created Template trigger table for template's trigger

# Function Api, docker , 2024 - 05 -13/18
  - Created static api for the function listing and its details
  - test case updated
  - updated trigger config and template trigger config models and database according to structure of function metadata
  - Creation of docker file for the api, agent , and agent manager
  - created docker compose for building the deployment ready images of all three service

# Trigger History Api ,2024 -05- 20/23
  - Created API Service for the Trigger History 
  - Updated test cases 