#!/bin/bash

set -e

# Ensure, that everything builds correctly
echo "BUILDING warthog"
yarn workspace @subsquid/warthog prepack
echo "BUILDING bn-typeorm"
yarn workspace @subsquid/bn-typeorm prepack
echo "BUILDING common"
yarn workspace @subsquid/hydra-common prepack
echo "BUILDING db-utils"
yarn workspace @subsquid/hydra-db-utils prepack
echo "BUILDING cli"
yarn workspace @subsquid/hydra-cli prepack
echo "BUILDING typegen"
yarn workspace @subsquid/hydra-typegen prepack
echo "BUILDING processor"
yarn workspace @subsquid/hydra-processor prepack

echo "CLI"
yarn workspace @subsquid/hydra-cli test

echo "TYPEGEN"
yarn workspace @subsquid/hydra-typegen test

echo "PROCESSOR"
yarn workspace @subsquid/hydra-processor test