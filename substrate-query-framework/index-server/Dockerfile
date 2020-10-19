FROM node:12-alpine 

RUN mkdir -p /home/node/index-server && chown -R node:node /home/node/index-server
COPY --chown=node:node . /home/node/index-server/

WORKDIR /home/node/index-server
RUN yarn
RUN yarn codegen

CMD ["yarn", "bootstrap:prod"]