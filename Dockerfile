FROM node:18-alpine

WORKDIR /usr/src

COPY nest-cli.json ./
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

RUN yarn install --frozen-lockfile

EXPOSE 3000

ENTRYPOINT [ "node_modules/.bin/nest" ]