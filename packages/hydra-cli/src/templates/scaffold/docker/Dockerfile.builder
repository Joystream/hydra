FROM node:14-alpine 

RUN mkdir -p /home/hydra-builder && chown -R node:node /home/hydra-builder

WORKDIR /home/hydra-builder

COPY ./mappings ./mappings
COPY ./*.yml ./
COPY ./*.json ./
COPY ./*.graphql ./
COPY ./.env ./

RUN yarn 
RUN yarn codegen 
RUN yarn typegen 
RUN yarn workspace sample-mappings install
RUN yarn mappings:build

RUN yarn workspace query-node install
RUN yarn workspace query-node compile
