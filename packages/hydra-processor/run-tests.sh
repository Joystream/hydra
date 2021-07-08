#!/bin/bash

# exit if any command in this script fails
set -e

cleanup() {
  # kill processor instance
  yarn pm2 stop processorProcess > /dev/null

  # turn off docker containers
  docker-compose -f docker-compose-test.yml down
}

startupDocker() {
  # start docker
  docker-compose -f docker-compose-test.yml up -d db # start database
  echo "starting db, please wait"
  sleep 2 # wait for db to startup
  docker-compose -f docker-compose-test.yml up -d
}

buildProcessor() {
  # build processor
  yarn
  yarn build

  # prepare db
  yarn run-dev migrate
}

startProcessor() {
  # running via pm2 is needed to prevent node (sub)process from surviving `kill -9`

  # save command to temporary file that can be read by pm2
  echo "yarn run-dev run --manifest test/fixtures/manifest.yml" > tmp.sh
  yarn pm2 start --name processorProcess tmp.sh > /dev/null
  rm tmp.sh # delete temporary script file
}

trap cleanup EXIT

# prepare processor config
export DB_USER=postgres
export DB_PASS=postgres
export INDEXER_ENDPOINT_URL=http://localhost:4002/graphql

# ensure docker depencency images exist
docker build ../../ -t hydra-builder:latest
yarn workspace @joystream/hydra-indexer docker:build
yarn workspace @joystream/hydra-indexer-gateway docker:build

# start preparation
startupDocker
buildProcessor

#exit 1 # uncomment during debugging and run rest of commands manually as you need

startProcessor

# run tests
yarn test:run
