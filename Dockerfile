FROM node:12-alpine

# TODO: optimize this
#
RUN mkdir -p /home/hydra && chown -R node:node /home/hydra

WORKDIR /home/hydra

COPY package.json .
COPY yarn.lock .
RUN mkdir packages

## Add one by one for better caching
ADD --chown=node:node ./packages/bn-typeorm ./packages/bn-typeorm
RUN yarn workspace @dzlzv/bn-typeorm install 
RUN yarn workspace @dzlzv/bn-typeorm build 
RUN yarn workspace @dzlzv/bn-typeorm pack --filename bn-typeorm.tgz

ADD --chown=node:node ./packages/hydra-common ./packages/hydra-common
RUN yarn workspace @dzlzv/hydra-common install 
RUN yarn workspace @dzlzv/hydra-common build 
RUN yarn workspace @dzlzv/hydra-common pack --filename hydra-common.tgz

ADD --chown=node:node ./packages/hydra-db-utils ./packages/hydra-db-utils
RUN yarn workspace @dzlzv/hydra-db-utils install 
RUN yarn workspace @dzlzv/hydra-db-utils build 
RUN yarn workspace @dzlzv/hydra-db-utils pack --filename hydra-db-utils.tgz

ADD --chown=node:node ./packages/hydra-processor ./packages/hydra-processor
RUN yarn workspace @dzlzv/hydra-processor install 
RUN yarn workspace @dzlzv/hydra-processor build 
RUN yarn workspace @dzlzv/hydra-processor pack --filename hydra-processor.tgz

ADD --chown=node:node ./packages/hydra-cli ./packages/hydra-cli
RUN yarn workspace @dzlzv/hydra-cli install 
RUN yarn workspace @dzlzv/hydra-cli build 
RUN yarn workspace @dzlzv/hydra-cli pack --filename hydra-cli.tgz
