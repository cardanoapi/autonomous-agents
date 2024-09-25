FROM node:18-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_ENDPOINT_HOST
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_ENDPOINT_HOST=${NEXT_PUBLIC_API_ENDPOINT_HOST}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["yarn" ,"start", "-p", "3000"]
