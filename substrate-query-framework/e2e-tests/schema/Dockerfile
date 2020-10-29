# build hydra-cli first in ../cli 
FROM hydra-cli:0.0.14.1

COPY schema.graphql /home/hydra
COPY ./mappings /home/hydra/mappings

RUN yarn codegen:all

#use the latest version of @dzlzv/hydra-indexer-lib
WORKDIR /home/hydra/generated/indexer
RUN yarn upgrade @dzlzv/hydra-indexer-lib && yarn

WORKDIR /home/hydra