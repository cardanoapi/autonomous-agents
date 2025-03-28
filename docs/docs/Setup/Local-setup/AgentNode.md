# Agent Node Setup Guide

## Requirements

-   [Node.js](https://nodejs.org/) (v18.18.0 or higher)
-   [yarn](https://yarnpkg.com/) package manager
-   `Agent-Manager` service
-   `Fronted` service
-   `Backend` service
-   `DbSync-api` service

## Installation

1. Install dependencies using npm or yarn:

    ```shell
    yarn install
    ```

2. Create new file `.env` and copy env variables form `.env.example` to `.env` and update the env variables.

### Setting up environment variables

-   **`TOKEN`**: Run the frontend and visit `My Agent` tab from left bottom section of the page. Then click `Run Agent` button on top right of the `Agent Overview` section. Copy the token part only and paste it in env.
  
- **`WS_URL`**: `agent-manager` websocket url . Default on `ws://localhost:3001'

**`Note`** - Remember to add `ws` as protocol in `WS_URL` instead of `http`.

Copy environment variables from `.env.example` to `.env` and update them as necessary.

Finally run the agent by running below command.

```shell
  yarn dev
```
