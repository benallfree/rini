FROM node:12

WORKDIR /usr/src/app
COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ./build ./build

EXPOSE 3000

CMD [ "node", "./build/server.js" ]


