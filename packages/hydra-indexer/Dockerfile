FROM node:12-alpine as builder 

# TODO: optimize this
#
RUN mkdir -p /home/hydra-indexer-builder
WORKDIR /home/hydra-indexer-builder

COPY src ./src
COPY *.json ./
COPY *.js ./


RUN yarn 
RUN yarn build 

FROM node:12-alpine

RUN mkdir -p /home/hydra-indexer && chown -R node:node /home/hydra-indexer
WORKDIR /home/hydra-indexer

COPY --from=builder --chown=node:node /home/hydra-indexer-builder/lib ./lib
COPY --from=builder --chown=node:node /home/hydra-indexer-builder/node_modules ./node_modules

COPY package.json .

CMD ["yarn", "start:prod"]