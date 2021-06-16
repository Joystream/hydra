FROM node:14-alpine

# TODO: optimize this
#
RUN mkdir -p /home/hydra && chown -R node:node /home/hydra

WORKDIR /home/hydra

COPY package.json .
COPY yarn.lock .
RUN mkdir packages

## Add one by one for better caching
ADD --chown=node:node ./packages/bn-typeorm ./packages/bn-typeorm
ADD --chown=node:node ./packages/hydra-common ./packages/hydra-common
ADD --chown=node:node ./packages/hydra-db-utils ./packages/hydra-db-utils
ADD --chown=node:node ./packages/hydra-processor ./packages/hydra-processor
ADD --chown=node:node ./packages/hydra-cli ./packages/hydra-cli
ADD --chown=node:node ./packages/hydra-typegen ./packages/hydra-typegen

RUN yarn --frozen-lockfile 

RUN yarn workspace @subsquid/bn-typeorm build
RUN yarn workspace @subsquid/hydra-common build
RUN yarn workspace @subsquid/hydra-db-utils build
RUN yarn workspace @subsquid/hydra-processor build
RUN yarn workspace @subsquid/hydra-cli build
RUN yarn workspace @subsquid/hydra-typegen build

