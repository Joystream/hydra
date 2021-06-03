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

(cd ../ && yarn workspace @dzlzv/hydra-indexer docker:build)
(cd ../ && yarn workspace @dzlzv/hydra-indexer-gateway docker:build)

docker-compose up -d

# wait for the processor to start grinding 
attempt_counter=0
max_attempts=25

until $(curl -s --head  --request GET http://localhost:3000/metrics/hydra_processor_last_scanned_block | grep "200" > /dev/null);  do
    if [ ${attempt_counter} -eq ${max_attempts} ];then
      echo "Max attempts reached"
      exit 1
    fi

    printf '.'
    attempt_counter=$(($attempt_counter+1))
    sleep 5
done 

# run the actual tests
yarn e2e-test-local
