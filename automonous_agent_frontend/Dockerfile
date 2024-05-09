FROM node:18-alpine

WORKDIR /app

COPY . .

RUN yarn install

CMD ["yarn", "dev", "-p", "3000"]

EXPOSE 3000
