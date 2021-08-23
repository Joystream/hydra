#!/bin/bash

set -e

echo "CLI"
yarn workspace @subsquid/hydra-cli test
echo "TYPEGEN"
yarn workspace @subsquid/hydra-typegen test
echo "BUILDING"
yarn workspace @subsquid/hydra-common build
yarn workspace @subsquid/hydra-db-utils build
echo "PROCESSOR"
yarn workspace @subsquid/hydra-processor test