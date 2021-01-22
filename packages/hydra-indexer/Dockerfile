FROM node:12-alpine

# TODO: optimize this
#
RUN mkdir -p /home/hydra && chown -R node:node /home/hydra

WORKDIR /home/hydra

## Add one by one for better caching
ADD --chown=node:node ./packages/apps-config ./packages/apps-config
ADD --chown=node:node ./packages/bn-typeorm ./packages/bn-typeorm
ADD --chown=node:node ./packages/hydra-common ./packages/hydra-common
ADD --chown=node:node ./packages/hydra-db-utils ./packages/hydra-db-utils
ADD --chown=node:node ./packages/hydra-indexer ./packages/hydra-indexer

COPY package.json .
COPY yarn.lock .

RUN yarn --pure-lockfile --non-interactive 

RUN yarn workspace @dzlzv/bn-typeorm build
RUN yarn workspace @dzlzv/apps-config build
RUN yarn workspace @dzlzv/hydra-common build
RUN yarn workspace @dzlzv/hydra-db-utils build
RUN yarn workspace @dzlzv/hydra-indexer build 

CMD yarn workspace @dzlzv/hydra-indexer start:prod