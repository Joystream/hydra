# build hydra-cli first in ../cli 
ARG HYDRA_CLI_VERSION=latest
FROM hydra-cli:${HYDRA_CLI_VERSION}

COPY schema.graphql /home/hydra
COPY ./mappings /home/hydra/mappings

RUN yarn codegen:all

WORKDIR /home/hydra