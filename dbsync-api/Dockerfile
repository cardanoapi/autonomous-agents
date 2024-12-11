FROM node:20-alpine  AS api_base
WORKDIR /prisma
RUN yarn add prisma

WORKDIR /app
COPY ./package.json ./yarn.lock ./
# Copy the rest of the application code to the container
RUN yarn install --frozen-lockfile --production

COPY ./prisma ./prisma
RUN /prisma/node_modules/.bin/prisma generate


FROM api_base AS builder
RUN yarn install
COPY ./ ./
RUN yarn build
RUN cp ./swagger.yaml ./dist



FROM node:20-alpine
RUN apk add openssl
USER node

WORKDIR /api
COPY --from=api_base --chown=node:node /app/node_modules node_modules
COPY --from=builder --chown=node:node /app/prisma prisma
COPY --from=builder --chown=node:node /app/dist ./

# Expose the port the app runs on (if applicable)
EXPOSE 8080

# Command to run the application
CMD ["node", "/api/index.js"]


