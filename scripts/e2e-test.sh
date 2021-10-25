#!/bin/bash

trap 'on_exit $?' EXIT; on_exit() {
    if [ "$1" != "0" ]; then
        echo "## Query Node Logs ##"
        docker logs hydra-e2e-tests_query-node_1 --tail all

        echo "## Indexer Logs ##"
        docker logs hydra-e2e-tests_hydra-indexer_1 --tail all

        echo "## Indexer API Server ##"
        docker logs hydra-e2e-tests_hydra-indexer-gateway_1 --tail all

        echo "## Processor Logs ##"
        docker logs hydra-e2e-tests_hydra-processor_1 --tail all
    fi
    docker-compose -f packages/hydra-e2e-tests/docker-compose.yml down
}

./scripts/e2e-up.sh -d || exit 1

RUNNER="$(./scripts/docker-build.sh --target e2e-test-runner -q)" || exit 1

docker run --rm \
    --network hydra-e2e-tests_default \
    --name hydra-e2e-test-runner \
    "$RUNNER"
