# Use Node.js base image with a specific version (you can change this as needed)
FROM node:18-alpine as base

# Set working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

FROM node:18-alpine as builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

# Copy the rest of the application code to the container
COPY . .

RUN yarn build

FROM node:18-alpine

USER node

WORKDIR /app

COPY --from=builder --chown=node:node app/dist/ dist/

COPY --from=base --chown=node:node app/node_modules node_modules/

# Command to run the application
CMD ["node", "dist/index.js"]
