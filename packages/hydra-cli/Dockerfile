FROM node:18 

RUN mkdir -p /home/hydra-cli && chown -R node:node /home/hydra-cli
RUN mkdir -p /home/hydra && chown -R node:node /home/hydra

COPY --chown=node:node . /home/hydra-cli

WORKDIR /home/hydra-cli
RUN yarn && yarn build
RUN yarn link

WORKDIR /home/hydra

RUN hydra-cli scaffold -n hydra --no-mappings


CMD ["yarn", "codegen:all"]
