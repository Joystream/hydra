#!/bin/bash

cleanup()
{
  (echo "## Processor Logs ##" && docker logs hydra-e2e-tests_hydra-processor_1 --tail 50) || :
  (echo "## Query Node Logs ##" && docker logs hydra-e2e-tests_query-node_1 --tail 50) || :
  (echo "## Indexer Logs ##" && docker logs hydra-e2e-tests_hydra-indexer_1 --tail 50) || :
  (echo "## Indexer API Server ##" && docker logs hydra-e2e-tests_hydra-indexer-gateway_1 --tail 50) || :
  (yarn post-e2e-test) || :
  rm -rf ./hydra-test
}

set -e
# clean up
trap cleanup ERR EXIT SIGINT SIGTERM

docker build ../../ -t hydra-builder:latest
yarn hydra-cli scaffold --dir hydra-test --name hydra-test --silent
cp -R fixtures/* hydra-test
docker build . -t hydra-test:latest

(cd ../ && yarn workspace @subsquid/hydra-indexer docker:build)
(cd ../ && yarn workspace @subsquid/hydra-indexer-status-service docker:build)
(cd ../hydra-indexer-gateway && docker build . -t hydra-indexer-gateway:latest)


docker-compose up -d


function wait-until {
    local attempt_counter=0
    local max_attempts=50
    until $(eval "$1"); do
        if [ ${attempt_counter} -eq ${max_attempts} ];then
            echo "Max attempts reached"
            exit 1
        fi
        printf '.'
        attempt_counter=$(($attempt_counter+1))
        sleep 5
    done
}


echo -n "Waiting for the processor to start grinding"
wait-until "curl -fs http://localhost:3000/metrics/hydra_processor_last_scanned_block > /dev/null"


# run the actual tests
yarn e2e-test-local
