# build hydra-cli first in ../cli 
ARG HYDRA_CLI_VERSION=latest
FROM hydra-cli:${HYDRA_CLI_VERSION}

COPY schema.graphql /home/hydra
COPY ./mappings /home/hydra/mappings

RUN yarn codegen:all

COPY --from=index-builder:latest /home/hydra-indexer-builder/index-builder.tgz /home/hydra/generated/indexer 

WORKDIR /home/hydra/generated/indexer 
RUN yarn remove @dzlzv/hydra-indexer-lib
RUN yarn add file:index-builder.tgz
RUN yarn install

WORKDIR /home/hydra