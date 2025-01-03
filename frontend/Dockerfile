FROM node:18-alpine AS base

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

FROM  base AS prod
RUN find ./node_modules/@next/ -maxdepth 1 -name 'swc*' | xargs rm -rf

FROM base AS builder

RUN yarn install --frozen-lockfile

COPY ./src ./src
COPY ./public ./public
COPY next.config.mjs .eslintignore .eslintrc.json postcss.config.js ./next-i18next.config.js ./entrypoint.sh prettier.config.js tsconfig.json tailwind.config.ts ./

RUN NEXT_PUBLIC_UMAMI_ENABLED=true NEXT_PUBLIC_NODE_ENV=production NEXT_PUBLIC_APM_ENABLED=true yarn build && rm -rf ./.next/cache
 
FROM node:18-alpine

WORKDIR /app
COPY --from=prod /app/node_modules ./node_modules

COPY --from=builder  /app/entrypoint.sh /app/next-i18next.config.js /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/ ./.next

EXPOSE 3000

CMD ["sh", "-e", "entrypoint.sh"]
