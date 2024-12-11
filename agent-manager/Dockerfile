# Use Node.js base image with a specific version (you can change this as needed)
FROM node:18-alpine AS base

# Set working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json yarn.lock ./

# Install dependencies
RUN apk add --no-cache  py3-setuptools make python3 build-base \
    && yarn install --frozen-lockfile --production \
    && apk del  py3-setuptools make python3 build-base


FROM base AS builder
# Copy the rest of the application code to the container
RUN yarn install

COPY . .


RUN yarn build
RUN pwd && ls

FROM node:18-alpine
RUN apk add openssl
USER node

WORKDIR /app

COPY --from=base --chown=node:node /app/node_modules node_modules
COPY --from=base --chown=node:node /app/package.json package.json
COPY --from=base --chown=node:node /app/yarn.lock yarn.lock

COPY --from=builder --chown=node:node /app/dist dist
COPY --chown=node:node prisma prisma

RUN yarn prisma generate
# Expose the port the app runs on (if applicable)
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/index.js"]
