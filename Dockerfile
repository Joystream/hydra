FROM node:14-alpine AS base
WORKDIR /hydra
ADD package.json .
ADD yarn.lock .
RUN yarn --frozen-lockfile


FROM base AS libs
ADD packages/bn-typeorm/package.json packages/bn-typeorm/
ADD packages/hydra-common/package.json packages/hydra-common/
ADD packages/hydra-db-utils/package.json packages/hydra-db-utils/
RUN yarn --frozen-lockfile

ADD packages/bn-typeorm/tsconfig.json packages/bn-typeorm/
ADD packages/bn-typeorm/src packages/bn-typeorm/src
RUN yarn workspace @subsquid/bn-typeorm build

ADD packages/hydra-common/tsconfig.json packages/hydra-common/
ADD packages/hydra-common/src packages/hydra-common/src
RUN yarn workspace @subsquid/hydra-common build

ADD packages/hydra-db-utils/tsconfig.json packages/hydra-db-utils/
ADD packages/hydra-db-utils/src packages/hydra-db-utils/src
ADD packages/hydra-db-utils/test packages/hydra-db-utils/test
RUN yarn workspace @subsquid/hydra-db-utils build


FROM libs AS indexer
ADD packages/hydra-indexer/package.json packages/hydra-indexer/
RUN yarn --frozen-lockfile
ADD packages/hydra-indexer/tsconfig.json packages/hydra-indexer/
ADD packages/hydra-indexer/src packages/hydra-indexer/src
ADD packages/hydra-indexer/test packages/hydra-indexer/test
RUN yarn workspace @subsquid/hydra-indexer build
WORKDIR /hydra/packages/hydra-indexer
CMD ["yarn", "start:prod"]


FROM libs AS processor
ADD packages/hydra-processor/package.json packages/hydra-processor/
RUN yarn --frozen-lockfile
ADD packages/hydra-processor/tsconfig.json packages/hydra-processor/
ADD packages/hydra-processor/src packages/hydra-processor/src
ADD packages/hydra-processor/test packages/hydra-processor/test
ADD packages/hydra-processor/bin packages/hydra-processor/bin
RUN yarn workspace @subsquid/hydra-processor build


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
ADD packages/hydra-typegen/package.json packages/hydra-typegen/
ADD packages/hydra-cli/package.json packages/hydra-cli/
ADD packages/hydra-e2e-tests/package.json packages/hydra-e2e-tests/
RUN yarn --frozen-lockfile


FROM deps AS test
ADD packages/hydra-typegen/tsconfig.json packages/hydra-typegen/
ADD packages/hydra-typegen/src packages/hydra-typegen/src
ADD packages/hydra-typegen/test packages/hydra-typegen/test
ADD packages/hydra-typegen/bin packages/hydra-typegen/bin
RUN yarn workspace @subsquid/hydra-typegen build
RUN yarn workspace @subsquid/hydra-typegen link

ADD packages/hydra-cli/tsconfig.json packages/hydra-cli/
ADD packages/hydra-cli/src packages/hydra-cli/src
ADD packages/hydra-cli/test packages/hydra-cli/test
ADD packages/hydra-cli/bin packages/hydra-cli/bin
RUN yarn workspace @subsquid/hydra-cli build
RUN yarn workspace @subsquid/hydra-cli link

RUN hydra-cli scaffold --dir packages/hydra-test --name hydra-test --silent
ADD packages/hydra-e2e-tests/fixtures packages/hydra-test/
RUN yarn workspace hydra-test codegen

COPY --from=libs /hydra/packages/bn-typeorm/lib packages/bn-typeorm/lib
COPY --from=libs /hydra/packages/hydra-common/lib packages/hydra-common/lib
COPY --from=libs /hydra/packages/hydra-db-utils/lib packages/hydra-db-utils/lib
COPY --from=processor /hydra/packages/hydra-processor/bin packages/hydra-processor/bin
COPY --from=processor /hydra/packages/hydra-processor/lib packages/hydra-processor/lib
RUN yarn --frozen-lockfile

WORKDIR /hydra/packages/hydra-test
RUN yarn workspace query-node compile


FROM deps AS e2e-test-runner
WORKDIR /hydra/packages/hydra-e2e-tests
ADD packages/hydra-e2e-tests/tsconfig.json .
ADD packages/hydra-e2e-tests/test test
ENV PATH ./node_modules/.bin:$PATH
RUN tsc
CMD nyc mocha --timeout 70000 --exit --file ./lib/e2e/setup-e2e.js "lib/e2e/**/*.test.js"


FROM hasura/graphql-engine:v2.0.3.cli-migrations-v3 AS indexer-gateway
RUN apt-get -y update \
    && apt-get install -y curl ca-certificates gnupg lsb-release \
    && curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get -y update \
    && apt-get install -y postgresql-12 postgresql-client-12 \
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