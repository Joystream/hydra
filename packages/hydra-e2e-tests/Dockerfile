FROM hydra-builder:latest

COPY --chown=node:node hydra-test  /home/hydra/packages/hydra-test

RUN yarn

RUN yarn workspace hydra-test codegen

RUN yarn 

WORKDIR /home/hydra/packages/hydra-test

RUN yarn workspace query-node compile


