FROM node:12-alpine 

RUN mkdir -p /home/hydra && chown -R node:node /home/hydra

WORKDIR /home/hydra

COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/bn-typeorm/lib ./packages/bn-typeorm
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/bn-typeorm/*.json ./packages/bn-typeorm/

COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/hydra-common/lib ./packages/hydra-common
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/hydra-common/*.json ./packages/hydra-common/

COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/hydra-db-utils/lib ./packages/hydra-db-utils
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/packages/hydra-db-utils/*.json ./packages/hydra-db-utils/

COPY --from=hydra-builder:latest --chown=node:node /home/hydra/package.json .
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/yarn.lock .

ADD --chown=node:node . /home/hydra/packages/hydra-indexer-gateway/

RUN yarn --frozen-lockfile --non-interactive 
RUN yarn workspace @dzlzv/hydra-indexer-gateway build

WORKDIR /home/hydra/packages/hydra-indexer-gateway

CMD ["yarn", "start:prod"]