function cleanup()
{
    yarn post-e2e-test
}

docker build ../index-builder -t index-builder:latest 
docker build ../cli -t hydra-cli:latest 
docker build ./schema -t hydra:latest
docker build ../index-server -t indexer-api-gateway:latest
# setup db's
yarn pre-e2e-test

sleep 10s

# wait for the indexer api to start 
attempt_counter=0
max_attempts=50

until $(curl -s --head  --request GET http://localhost:4001/graphql | grep "400" > /dev/null);  do
    if [ ${attempt_counter} -eq ${max_attempts} ];then
      echo "Max attempts reached"
      break
    fi

    printf '.'
    attempt_counter=$(($attempt_counter+1))
    sleep 5
done

# run the actual tests
yarn e2e-test

# clean up
trap cleanup EXIT
