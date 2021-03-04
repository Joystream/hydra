FROM node:12-alpine 

RUN mkdir -p /home/hydra && chown -R node:node /home/hydra

WORKDIR /home/hydra

#RUN mkdir -p /home/node/hydra-indexer-gateway && chown -R node:node /home/node/hydra-indexer-gateway

#WORKDIR /home/hydra

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

ADD --chown=node:node . /home/hydra/packages/hydra-indexer-gateway/

RUN yarn --frozen-lockfile --non-interactive 
RUN yarn workspace @dzlzv/hydra-indexer-gateway build

WORKDIR /home/hydra/packages/hydra-indexer-gateway

#RUN yarn && yarn build

CMD ["yarn", "start:prod"]