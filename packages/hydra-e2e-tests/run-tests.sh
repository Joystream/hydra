function cleanup()
{
    yarn post-e2e-test
}

set -e
# clean up
trap cleanup ERR EXIT SIGINT SIGTERM

docker build ../index-builder -t index-builder:latest 
docker build ../hydra-cli -t hydra-cli:latest 
docker build ./schema -t hydra:latest
docker build ../hydra-indexer-gateway -t indexer-api-gateway:latest
# setup db's
yarn pre-e2e-test

# wait for the indexer api to start 
attempt_counter=0
max_attempts=10

until $(curl -s --head  --request GET http://localhost:4001/graphql | grep "400" > /dev/null);  do
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
