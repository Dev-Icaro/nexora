FROM node:22 AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production && yarn global add pm2

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["pm2-runtime", "dist/server.js"]