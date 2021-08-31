#!/bin/bash

. scripts/base-images.sh

docker build . \
    --build-arg NODE="$HYDRA_NODE_BASE" \
    --build-arg HASURA="$HYDRA_HASURA_BASE" \
    "$@"
