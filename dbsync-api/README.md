# dbsync-api Service

The `dbsync-api` service is a Node.js application designed to provide API access to interact with the `dbsync` database. This service enables efficient data retrieval for Cardano-related operations.

## Requirements
Before running the service, ensure the following dependencies are installed:
- PostgreSQL server

## Installation
1. Run this command for package installation
    ```shell
      yarn install
    ```
2. Create new file `.env` and copy env variables form `.env.example` to `.env` and update the env variables.
- **`DATABASE_URL`**: PostgreSQL database URL for dbsync_sanchonet. For `preprod` and `preview` update database instance accordingly.
- **`PORT`**: Port for running the server. Default value is 8080
- **`CORS_ENABLE`**:  CORS support for cross-origin requests.
 
3. Run the following command to generate the database client and creating the required table mentioned in schema    
    ```bash
        yarn prisma generate
    ```

4. Now finally run the below command to start the `dbsync-api` service:
    ```bash
        yarn dev
    ```
   
Now goto `http://localhost:8080/api/docs` to see list of api in `swaggerDocs`.
