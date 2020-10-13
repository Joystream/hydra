#!/bin/bash
db_user=postgres
db_pass=postgres
db_host=localhost
db_port=5432
db_name=test
network=e2e-tests_default
command=""

if [[ $CLITAG == "" ]] ;
then
    echo "CLITAG is not set. Set the hydra-cli image version to test"
    exit 1
fi

while [ "$1" != "" ]; do
    case $1 in
        --db-name )     shift
                        db_name="$1"
                        ;;
        --db-host )     shift
                        db_host="$1"
                        ;;
        --db-port )     shift
                        db_port="$1"
                        ;;
        --db-pass )     shift
                        db_pass="$1"
                        ;;
        drop )          shift
                        command='yarn configure && yarn db:drop'
                        ;;
        up )            shift
                        command='yarn configure && yarn db:migrate'
                        ;;


        * )             echo "Wrong argument"
                        exit 1
    esac
    shift
done

if [[ $command == "" ]] ;
then
    echo "Command must be defined"
    exit 1
fi

docker run --network="$network"  \
           --env DB_NAME=$db_name  \
           --env DB_USER=$db_user  \
           --env DB_PASS=$db_pass  \
           --env DB_HOST=$db_host  \
           --env DB_PORT=$db_port  \
           --env GRAPHQL_SERVER_HOST=localhost \
           --env GRAPHQL_SERVER_PORT=4000  \
           --env TYPEORM_DATABASE=$db_name \
           --env TYPEORM_USERNAME=$db_user \
           --env TYPEORM_PASSWORD=$db_pass \
           --env TYPEORM_HOST=$db_host     \
           --env TYPEORM_PORT=$db_port     \
           hydra-cli:${CLITAG} \
           sh -c "$command"