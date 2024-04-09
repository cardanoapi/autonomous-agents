# Changelog

 - Added docker compose file for postgres database and pgadmin4.
 - Configured Prisma ORM.
 - Added demo api at /ping/api
 - Added sample test case for demo api
 - Added docker compose and image builder for backend.
 - Added read me guide for backend setup/ installation.

# TITLE - AGENT CRUD API , DATE- 2024-03-27/28 
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
 
# TITLE - TEST Setup and Test cases for Agent Api , Date - 2024-03-28/29 - 04-01
  - Made setup to run the test cases
  - Wrote Unit test for API methods of Agent

# TITLE - Trigger/API crud operation , Date - 2024-04-01/02
  - Made table for Triggers 
  - Created router,service,repository for trigger CRUD Action
  - Created the validation function for cron expression and kafka topic while creating the trigger by agent
