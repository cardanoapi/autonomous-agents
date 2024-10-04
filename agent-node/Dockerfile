# Use Node.js base image with a specific version (you can change this as needed)
FROM node:18-alpine as base

# Set working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json yarn.lock ./

# Install dependencies
RUN if [ "$(uname -m)" != "x86_64" ]; then \
        apk add --no-cache py3-setuptools make python3 build-base; \
    fi \
    && yarn install --frozen-lockfile --production \
    && if [ "$(uname -m)" != "x86_64" ]; then \
        apk del py3-setuptools make python3 build-base; \
    fi

FROM base as builder

RUN yarn install --frozen-lockfile

# Copy the rest of the application code to the container
COPY . .

RUN yarn build

FROM node:18-alpine

USER node

WORKDIR /app

COPY --from=builder --chown=node:node app/dist/ dist/

COPY --from=base --chown=node:node app/node_modules node_modules/
ENV MANAGER_BASE_DOMAIN=manager.agents.cardanoapi.io

# Command to run the application
CMD ["node", "dist/index.js"]
