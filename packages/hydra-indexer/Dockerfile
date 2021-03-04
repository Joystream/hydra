FROM node:12-alpine

# TODO: optimize this
#
RUN mkdir -p /home/hydra && chown -R node:node /home/hydra

WORKDIR /home/hydra

## Add one by one for better caching
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/apps-config/lib ./packages/apps-config
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/apps-config/*.json ./packages/apps-config
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/apps-config/*.lock ./packages/apps-config


#ADD --chown=node:node ./packages/bn-typeorm ./packages/bn-typeorm
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/bn-typeorm/lib ./packages/bn-typeorm
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/bn-typeorm/*.json ./packages/bn-typeorm
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/bn-typeorm/*.lock ./packages/bn-typeorm


#ADD --chown=node:node ./packages/hydra-common ./packages/hydra-common
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/hydra-common/lib ./packages/hydra-common
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/hydra-common/*.json ./packages/hydra-common
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/hydra-common/*.lock ./packages/hydra-common

COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/hydra-db-utils/lib ./packages/hydra-db-utils
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/hydra-db-utils/*.json ./packages/hydra-db-utils
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/hydra-db-utils/*.lock ./packages/hydra-db-utils

COPY --from=hydra-builder:latest --chown=node:node /home/hydra/package.json .
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/yarn.lock .

#ADD --chown=node:node ./packages/hydra-db-utils ./packages/hydra-db-utils
ADD --chown=node:node ./packages/hydra-indexer ./packages/hydra-indexer

RUN yarn --frozen-lockfile --non-interactive 

#RUN yarn workspace @dzlzv/bn-typeorm build
#RUN yarn workspace @dzlzv/apps-config build
#RUN yarn workspace @dzlzv/hydra-common build
#RUN yarn workspace @dzlzv/hydra-db-utils build
#RUN yarn workspace @dzlzv/hydra-indexer build 

WORKDIR /home/hydra/packages/hydra-indexer

CMD yarn start:prod