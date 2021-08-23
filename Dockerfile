ARG NODE=node:14-alpine
ARG HASURA=hasura/graphql-engine:v2.0.3.cli-migrations-v3
FROM ${NODE} AS node
FROM ${HASURA} AS hasura-with-migrations


FROM node AS base
WORKDIR /hydra
ADD package.json .
ADD yarn.lock .
RUN yarn --frozen-lockfile


FROM base AS indexer
ADD packages/bn-typeorm/package.json packages/bn-typeorm/
ADD packages/hydra-common/package.json packages/hydra-common/
ADD packages/hydra-db-utils/package.json packages/hydra-db-utils/
ADD packages/hydra-indexer/package.json packages/hydra-indexer/
RUN yarn --frozen-lockfile

ADD packages/bn-typeorm/tsconfig.json packages/bn-typeorm/
ADD packages/bn-typeorm/src packages/bn-typeorm/src
RUN yarn workspace @subsquid/bn-typeorm build

ADD packages/hydra-common/tsconfig.json packages/hydra-common/
ADD packages/hydra-common/src packages/hydra-common/src
RUN yarn workspace @subsquid/hydra-common build

ADD packages/hydra-db-utils/tsconfig.json packages/hydra-db-utils/
ADD packages/hydra-db-utils/src packages/hydra-db-utils/src
RUN yarn workspace @subsquid/hydra-db-utils build

ADD packages/hydra-indexer/tsconfig.json packages/hydra-indexer/
ADD packages/hydra-indexer/src packages/hydra-indexer/src
RUN yarn workspace @subsquid/hydra-indexer build

WORKDIR /hydra/packages/hydra-indexer
CMD ["yarn", "start:prod"]


FROM base AS indexer-status-service
ADD packages/hydra-indexer-status-service/package.json packages/hydra-indexer-status-service/
RUN yarn --frozen-lockfile
ADD packages/hydra-indexer-status-service/tsconfig.json packages/hydra-indexer-status-service/
ADD packages/hydra-indexer-status-service/src packages/hydra-indexer-status-service/src
RUN yarn workspace @subsquid/hydra-indexer-status-service build
WORKDIR /hydra/packages/hydra-indexer-status-service
CMD ["yarn", "start"]


FROM base AS deps
ADD packages/bn-typeorm/package.json packages/bn-typeorm/
ADD packages/hydra-common/package.json packages/hydra-common/
ADD packages/hydra-db-utils/package.json packages/hydra-db-utils/
ADD packages/hydra-processor/package.json packages/hydra-processor/
ADD packages/hydra-processor/bin packages/hydra-processor/bin
ADD packages/hydra-typegen/package.json packages/hydra-typegen/
ADD packages/hydra-typegen/bin packages/hydra-typegen/bin
ADD packages/hydra-cli/package.json packages/hydra-cli/
ADD packages/hydra-cli/bin packages/hydra-cli/bin
ADD packages/hydra-e2e-tests/package.json packages/hydra-e2e-tests/
ADD packages/warthog/package.json packages/warthog/
ADD packages/warthog/bin packages/warthog/bin
RUN yarn --frozen-lockfile


FROM deps AS test
ADD packages/warthog/tsconfig.json packages/warthog/
ADD packages/warthog/src packages/warthog/src
ADD packages/warthog/typings packages/warthog/typings
RUN yarn workspace @subsquid/warthog prepack
RUN rm -r packages/warthog/src packages/warthog/typings

ADD packages/hydra-cli/tsconfig.json packages/hydra-cli/
ADD packages/hydra-cli/src packages/hydra-cli/src
ADD packages/hydra-cli/bin packages/hydra-cli/bin
RUN yarn workspace @subsquid/hydra-cli prepack
RUN rm -r packages/hydra-cli/src

RUN ./packages/hydra-cli/bin/run scaffold --dir packages/hydra-test --name hydra-test --silent
RUN yarn

ADD packages/hydra-e2e-tests/fixtures packages/hydra-test/
RUN yarn workspace hydra-test codegen

ADD packages/hydra-typegen/tsconfig.json packages/hydra-typegen/
ADD packages/hydra-typegen/src packages/hydra-typegen/src
RUN yarn workspace @subsquid/hydra-typegen prepack
RUN rm -r packages/hydra-typegen/src

COPY --from=indexer /hydra/packages/bn-typeorm/lib packages/bn-typeorm/lib
COPY --from=indexer /hydra/packages/hydra-common/lib packages/hydra-common/lib
COPY --from=indexer /hydra/packages/hydra-db-utils/lib packages/hydra-db-utils/lib

ADD packages/hydra-processor/tsconfig.json packages/hydra-processor/
ADD packages/hydra-processor/src packages/hydra-processor/src
RUN yarn workspace @subsquid/hydra-processor prepack
RUN rm -r packages/hydra-processor/src

WORKDIR /hydra/packages/hydra-test


FROM deps AS e2e-test-runner
WORKDIR /hydra/packages/hydra-e2e-tests
ADD packages/hydra-e2e-tests/tsconfig.json .
ADD packages/hydra-e2e-tests/test test
CMD yarn test


FROM hasura-with-migrations AS indexer-gateway
RUN apt-get -y update \
    && apt-get install -y curl ca-certificates gnupg lsb-release \
    && curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get -y update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql-client-12 \
    && apt-get purge -y curl lsb-release gnupg \
    && apt-get -y autoremove \
    && apt-get -y clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /usr/share/doc/ \
    && rm -rf /usr/share/man/ \
    && rm -rf /usr/share/locale/
RUN mv /bin/docker-entrypoint.sh /bin/hasura-entrypoint.sh
ADD packages/hydra-indexer-gateway/metadata /hasura-metadata/
ADD packages/hydra-indexer-gateway/docker-entrypoint.sh .
ENTRYPOINT [ "/docker-entrypoint.sh" ]
EXPOSE 8080