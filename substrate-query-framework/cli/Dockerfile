FROM node:12-alpine 

ARG NAME=hydra

RUN mkdir -p /home/hydra-cli && chown -R node:node /home/hydra-cli
COPY --chown=node:node . /home/hydra-cli

WORKDIR /home/hydra-cli
RUN yarn && yarn build
RUN yarn link

RUN mkdir $NAME
WORKDIR /home/hydra-cli/$NAME

RUN hydra-cli scaffold -n $NAME
RUN yarn codegen:all

RUN yarn global add typescript
RUN yarn global add ts-node

RUN yarn install

WORKDIR /home/hydra-cli/$NAME/generated/graphql-server
RUN yarn install

WORKDIR /home/hydra-cli/$NAME/generated/graphql-server
RUN yarn install

WORKDIR /home/hydra-cli/$NAME

CMD ["yarn", "scaffold", "-n", "$NAME"]