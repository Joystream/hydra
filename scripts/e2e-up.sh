#!/bin/bash

. scripts/base-images.sh

docker-compose -f packages/hydra-e2e-tests/docker-compose.yml build \
    --build-arg NODE="$HYDRA_NODE_BASE" \
    --build-arg HASURA="$HYDRA_HASURA_BASE" || exit 1

docker-compose -f packages/hydra-e2e-tests/docker-compose.yml up "$@"