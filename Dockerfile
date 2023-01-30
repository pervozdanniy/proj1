FROM node:18-alpine

WORKDIR /usr/src

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

COPY nest-cli.json ./
COPY tsconfig.json ./
COPY webpack.config.js ./
COPY webpack.config.js ./
COPY apps/* /usr/src/apps/

EXPOSE 3000

ENTRYPOINT [ "node_modules/.bin/nest" ]