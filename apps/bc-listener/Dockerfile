FROM node:18-alpine

WORKDIR /usr/app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

RUN yarn install --frozen-lockfile

EXPOSE 3000

ENTRYPOINT [ "yarn" ]

CMD [ "start:dev" ]