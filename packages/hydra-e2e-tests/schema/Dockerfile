FROM node:12-alpine

RUN mkdir -p /home/hydra-cli 
RUN mkdir -p /home/hydra

WORKDIR /home/hydra-cli

COPY --from=hydra-builder:latest /home/hydra/packages/hydra-cli /home/hydra-cli
RUN yarn install
RUN yarn link

WORKDIR /home/hydra
RUN yarn link @dzlzv/hydra-cli
RUN hydra-cli scaffold -n hydra --no-mappings

COPY schema.graphql /home/hydra
COPY ./mappings /home/hydra/mappings

RUN yarn codegen:all 

WORKDIR /home/hydra/generated/hydra-processor

COPY --from=hydra-builder:latest /home/hydra/packages/hydra-common/hydra-common.tgz .
RUN yarn remove @dzlzv/hydra-common --no-lockfile
RUN yarn add -D file:hydra-common.tgz

COPY --from=hydra-builder:latest /home/hydra/packages/hydra-db-utils/hydra-db-utils.tgz .
RUN yarn remove @dzlzv/hydra-db-utils --no-lockfile
RUN yarn add -D file:hydra-db-utils.tgz

COPY --from=hydra-builder:latest /home/hydra/packages/hydra-processor/hydra-processor.tgz . 
RUN yarn remove @dzlzv/hydra-processor --no-lockfile
RUN yarn add -D file:hydra-processor.tgz

RUN yarn install

WORKDIR /home/hydra

