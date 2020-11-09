FROM node:12-alpine

# TODO: optimize this
#
RUN mkdir -p /home/hydra-indexer && chown -R node:node /home/hydra-indexer

COPY --chown=node:node . /home/hydra-indexer

WORKDIR /home/hydra-indexer

RUN yarn && yarn build

RUN yarn pack --filename index-builder.tgz

CMD ["yarn", "start:prod"]