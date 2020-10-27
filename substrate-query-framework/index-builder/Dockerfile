FROM node:12-alpine

RUN mkdir -p /home/hydra-indexer-builder && chown -R node:node /home/hydra-indexer-builder
COPY --chown=node:node . /home/hydra-indexer-builder

WORKDIR /home/hydra-indexer-builder

RUN yarn && yarn build

RUN yarn pack --filename index-builder.tgz