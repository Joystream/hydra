FROM node:12-alpine 

RUN mkdir -p /home/node/index-server && chown -R node:node /home/node/index-server
COPY --chown=node:node . /home/node/index-server/

WORKDIR /home/node/index-server
ENV WARTHOG_ENV development
RUN yarn 
RUN yarn dotenvi -s ${WARTHOG_ENV:-development}
RUN yarn codegen && yarn build

CMD ["yarn", "start:prod"]