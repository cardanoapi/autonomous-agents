FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN NEXT_PUBLIC_UMAMI_ENABLED=true NEXT_PUBLIC_NODE_ENV=production NEXT_PUBLIC_APM_ENABLED=true yarn build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["yarn" ,"start", "-p", "3000"]
