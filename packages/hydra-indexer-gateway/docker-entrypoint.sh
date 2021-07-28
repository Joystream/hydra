#!/bin/bash

function wait-until {
    local attempt_counter=0
    local max_attempts=30
    until $(eval "$1"); do
        if [ ${attempt_counter} -eq ${max_attempts} ];then
            echo "Max attempts reached"
            exit 1
        fi
        attempt_counter=$(($attempt_counter+1))
        sleep 2
    done
}


echo "Waiting until indexer db is ready"
wait-until 'psql "$HYDRA_INDEXER_DB" -q -c "select count(*) from substrate_block" > /dev/null 2>&1'


# initialize metadata db
rm -rf /var/lib/postgresql/data
su -l postgres -c "/usr/lib/postgresql/12/bin/initdb -D /var/lib/postgresql/data" || exit 1


function terminate {
    trap '' INT TERM
    kill -TERM `jobs -pr` 2>/dev/null
}


trap terminate TERM INT


su -l postgres -c "/usr/lib/postgresql/12/bin/postgres -D /var/lib/postgresql/data" &


if [ "$DEV_MODE" == "true" ]; then
    export HASURA_GRAPHQL_ENABLE_CONSOLE="true"
else
    export HASURA_GRAPHQL_ADMIN_SECRET="$(openssl rand -hex 12)"
    export HASURA_GRAPHQL_UNAUTHORIZED_ROLE=user
fi
HASURA_GRAPHQL_STRINGIFY_NUMERIC_TYPES=true \
HASURA_GRAPHQL_ENABLE_TELEMETRY=false \
HASURA_GRAPHQL_METADATA_DATABASE_URL="postgres://postgres@localhost:5432/" \
/bin/hasura-entrypoint.sh graphql-engine serve &


#TODO: check metadata consistency


wait -n
terminate
wait
exit 1