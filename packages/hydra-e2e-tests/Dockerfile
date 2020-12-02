FROM hydra-builder:latest
# Overwrite the default files
RUN (cd /home/hydra/packages/sample && yarn hydra-cli scaffold -n e2e-test)

COPY ./schema/schema.graphql /home/hydra/packages/sample/schema.graphql
COPY ./schema/mappings /home/hydra/packages/sample/mappings



RUN yarn workspace e2e-test build

