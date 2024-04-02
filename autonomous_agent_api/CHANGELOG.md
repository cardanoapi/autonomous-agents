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
     POST api for agent creation
     GET api for listing agents
     GET api for getting agent properties.
     PUT api to update agent properties.
     DELETE api for soft deletion of agent.
 -created dtos model for request and response inside model directory

# TITLE - AGENT Websocket , DATE- 2024-04-02
 - Added websocket endpoint for agent websocket connection