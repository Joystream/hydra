FROM hydra-builder:latest

COPY --chown=node:node hydra-test  /home/hydra/packages/hydra-test

RUN yarn

RUN yarn workspace hydra-test codegen

RUN yarn 

WORKDIR /home/hydra/packages/hydra-test

#RUN yarn workspace sample-hydra-processor install

# Overwrite the default files
#RUN (cd /home/hydra/packages/sample && yarn hydra-cli scaffold -n e2e-test)

# COPY ./schema/schema.graphql /home/hydra/packages/sample/schema.graphql
# COPY ./schema/mappings /home/hydra/packages/sample/mappings
# RUN yarn workspace sample build
#RUN yarn workspace sample mappings:build

