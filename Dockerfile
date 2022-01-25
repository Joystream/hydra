ARG NODE=node:14-alpine
ARG HASURA=hasura/graphql-engine:v2.0.3.cli-migrations-v3
FROM ${NODE} AS node
FROM ${HASURA} AS hasura-with-migrations


FROM node AS base
WORKDIR /hydra
ADD package.json .
ADD yarn.lock .
ADD packages/hydra-common/package.json packages/hydra-common/
ADD packages/hydra-indexer/package.json packages/hydra-indexer/
ADD packages/hydra-indexer-status-service/package.json packages/hydra-indexer-status-service/
ADD packages/hydra-processor/package.json packages/hydra-processor/
ADD packages/hydra-processor/bin packages/hydra-processor/bin
ADD packages/hydra-typegen/package.json packages/hydra-typegen/
ADD packages/hydra-typegen/bin packages/hydra-typegen/bin
ADD packages/hydra-cli/package.json packages/hydra-cli/
ADD packages/hydra-cli/bin packages/hydra-cli/bin
ADD packages/hydra-e2e-tests/package.json packages/hydra-e2e-tests/
RUN yarn --frozen-lockfile


FROM base AS common-build
WORKDIR /hydra/packages/hydra-common
ADD packages/hydra-common/tsconfig.json .
ADD packages/hydra-common/src src/
# can't do just `yarn pack` because it ignores `.files` field
RUN yarn prepack
RUN mv "$(npm pack --ignore-scripts)" package.tgz


FROM common-build AS indexer-build
WORKDIR /hydra/packages/hydra-indexer
ADD packages/hydra-indexer/tsconfig.json .
ADD packages/hydra-indexer/src src/
RUN yarn build


FROM node AS indexer
WORKDIR /hydra-indexer
COPY --from=common-build  /hydra/packages/hydra-common/package.tgz /hydra-common.tgz
COPY --from=indexer-build /hydra/packages/hydra-indexer/package.json .
ADD scripts/patch-deps.js /patch-deps.js
RUN node /patch-deps.js
ENV NODE_ENV production
RUN npm install --production
COPY --from=indexer-build /hydra/packages/hydra-indexer/lib lib/
CMD ["node", "./lib/run.js", "index"]

FROM node AS indexer-evm
WORKDIR /hydra-indexer
COPY --from=common-build  /hydra/packages/hydra-common/package.tgz /hydra-common.tgz
COPY --from=indexer-build /hydra/packages/hydra-indexer/package.json .
ADD scripts/patch-deps.js /patch-deps.js
RUN node /patch-deps.js
ENV NODE_ENV production
RUN npm install --production
COPY --from=indexer-build /hydra/packages/hydra-indexer/lib lib/
COPY --from=indexer-build /hydra/packages/hydra-indexer/lib/migrations/evm lib/migrations/v4
CMD ["node", "./lib/run.js", "index"]


FROM base AS indexer-status-service-builder
WORKDIR /hydra/packages/hydra-indexer-status-service
ADD packages/hydra-indexer-status-service/tsconfig.json .
ADD packages/hydra-indexer-status-service/src src/
RUN yarn build


FROM node AS indexer-status-service
WORKDIR /hydra-indexer-status-service
COPY --from=indexer-status-service-builder /hydra/packages/hydra-indexer-status-service/package.json .
ENV NODE_ENV production
RUN npm install --production
COPY --from=indexer-status-service-builder /hydra/packages/hydra-indexer-status-service/lib lib/
CMD ["node", "./lib/app.js"]


FROM base AS cli-build
WORKDIR /hydra/packages/hydra-cli
ADD packages/hydra-cli/tsconfig.json .
ADD packages/hydra-cli/src src/
ADD packages/hydra-cli/resource resource/
RUN yarn prepack
RUN mv "$(npm pack --ignore-scripts)" package.tgz


FROM common-build AS processor-build
WORKDIR /hydra/packages/hydra-processor
ADD packages/hydra-processor/tsconfig.json .
ADD packages/hydra-processor/src src/
RUN yarn prepack
RUN mv "$(npm pack --ignore-scripts)" package.tgz


FROM base AS typegen-build
WORKDIR /hydra/packages/hydra-typegen
ADD packages/hydra-typegen/tsconfig.json .
ADD packages/hydra-typegen/src src/
RUN yarn prepack
RUN mv "$(npm pack --ignore-scripts)" package.tgz


FROM node AS test-project
COPY --from=cli-build /hydra/packages/hydra-cli/package.tgz /hydra-cli.tgz
RUN npm install -g --production /hydra-cli.tgz
COPY --from=common-build /hydra/packages/hydra-common/package.tgz /hydra-common.tgz
COPY --from=processor-build /hydra/packages/hydra-processor/package.tgz /hydra-processor.tgz
COPY --from=typegen-build /hydra/packages/hydra-typegen/package.tgz /hydra-typegen.tgz
RUN hydra-cli scaffold -d /hydra-test --server-extension --silent
WORKDIR /hydra-test
ADD scripts/patch-deps.js /patch-deps.js
RUN node /patch-deps.js
RUN npm install
ADD packages/hydra-e2e-tests/fixtures .
RUN npm run typegen
RUN npm run codegen
RUN npm run build


FROM base AS e2e-test-runner
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
ADD packages/hydra-indexer-gateway/substrate-metadata /hasura-metadata/
ADD packages/hydra-indexer-gateway/docker-entrypoint.sh .
ENTRYPOINT [ "/docker-entrypoint.sh" ]
EXPOSE 8080


FROM hasura-with-migrations AS moonriver-indexer-gateway
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
ADD packages/hydra-indexer-gateway/moonriver-metadata /hasura-metadata/
ADD packages/hydra-indexer-gateway/docker-entrypoint.sh .
ENTRYPOINT [ "/docker-entrypoint.sh" ]
EXPOSE 8080


FROM hasura-with-migrations AS moonriver-flat-indexer-gateway
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
ADD packages/hydra-indexer-gateway/moonriver-flat-metadata /hasura-metadata/
ADD packages/hydra-indexer-gateway/docker-entrypoint.sh .
ENTRYPOINT [ "/docker-entrypoint.sh" ]
EXPOSE 8080
