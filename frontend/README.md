## Getting Started

First, install the required dependencies for the project using the following command:

```bash
yarn install
```

Once the installation is complete create new file `.env` and copy env variables form `.env.example` to `.env` and update the env variables.

-   **`NEXT_PUBLIC_NETWORK_NAME`**: Set to`sanchonet` or `preview` or `preprod`.
    **`Note`**: It will only display network type in web app. You need to update `agent-manager`, `backend` and `dbsync-api` services to change thw working of functions in other networks.
-   -   **`NEXT_PUBLIC_ENABLE_AGENT_INSTANCE`**: Enable it by adding `true` to run `multiple instances of single agent` feature where same type of functions will be executed by multiple instance of agent. To use this feature you also need to increase the instance number from `Agent Overview ` section.
-   -   **`NEXT_PUBLIC_API_URL`**: `Backend ` service url accessed from browser.

##### Finally run one of the commands below to start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.
