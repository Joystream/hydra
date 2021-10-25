if [ "$(uname -m)" == "arm64" ]; then
    export HYDRA_NODE_BASE="node:14"
    export HYDRA_HASURA_BASE="fedormelexin/graphql-engine-arm64:v2.0.10.cli-migrations-v3"
else
    export HYDRA_NODE_BASE="node:14-alpine"
    export HYDRA_HASURA_BASE="hasura/graphql-engine:v2.0.10.cli-migrations-v3"
fi
