FROM node:14-alpine

RUN mkdir -p /home/hydra && chown -R node:node /home/hydra

WORKDIR /home/hydra

COPY --from=hydra-builder:latest --chown=node:node /home/hydra/package.json .
COPY --from=hydra-builder:latest --chown=node:node /home/hydra/yarn.lock .

COPY --chown=node:node package.json ./packages/hydra-indexer-status-service/

RUN yarn --frozen-lockfile --non-interactive 

COPY --chown=node:node tsconfig.json ./packages/hydra-indexer-status-service/
COPY --chown=node:node src ./packages/hydra-indexer-status-service/src

RUN yarn workspace @subsquid/hydra-indexer-status-service build

WORKDIR /home/hydra/packages/hydra-indexer-status-service

CMD node dist/app.js