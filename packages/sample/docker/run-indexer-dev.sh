#!/bin/bash

cleanup()
{
  (echo "## Indexer Logs ##" && docker logs sample_hydra-indexer_1 --tail 50) || :  
  (echo "## Indexer API Server ##" && docker logs sample_hydra-indexer-gateway_1 --tail 50) || :  
  docker-compose -f docker-compose-indexer-dev.yml down
}

set -e
# clean up
trap cleanup ERR EXIT SIGINT SIGTERM

docker build ../../ -t hydra-builder:latest
(cd ../../ && yarn workspace @dzlzv/hydra-indexer docker:build)
(cd ../../ && yarn workspace @dzlzv/hydra-indexer-gateway docker:build)
docker-compose -f docker-compose-indexer-dev.yml up 

