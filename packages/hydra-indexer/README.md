# Hydra Indexer

Hydra Indexer is a daemon that ingests raw substrate data such as events and extrinsics from a substrate chain and saves it into a Postgres database. It is typically used in conjunction with [Hydra Indexer Gateway](./../hydra-indexer-gateway/README.md) providing a GraphQL API interface.

## Installation

The indexer exits if an unrecoverable error occurs. It is therefore advisable to run the indexer with a process manager, such as [PM2](https://pm2.keymetrics.io/) or Docker.

### Prerequisites

- Node 12.x
- Postgres database
- Redis instances
- (Optional) Docker

### Environment variables

The indexer is set up using the following environment variables

| Variable        | Default           | Required  | Description |
| -------|:------:| --------:| ---------------------------:|
| WS_PROVIDER_ENDPOINT_URI      | - | **Yes** | Substrate API endpoint to connect |
| REDIS_URI      | -      | **Yes** | Redis instance URI |
| DB_NAME | - | **Yes** | Database name |
| DB_PORT | - | **Yes** | Database port |
| DB_HOST | - | **Yes** | Database host |
| DB_USER | - | **Yes** | Database user |
| DB_PASS | - | **Yes** | Database password |
| TYPES_JSON | -      | No | Path to a JSON type definition with custom Substrate types |
| BLOCK_HEIGHT | 0 | No | Block height to start indexing. Ignored if the database already contains indexed blocks |

### Manual setup

Run

```bash
yarn && yarn build
```

For setting up the database and running the migrations, run `yarn db:bootstrap`. Make sure the environment variables `DB_*` are set.

For starting the indexer, run `yarn start:prod`.

### Docker image

There are pre-built runnable docker images in `joystream/hydra-indexer` docker repo. The default command is `yarn start:prod`.

First, bootstrap the database:

```bash
docker run -e DB_HOST=... -e DB_PORT=... -e DB_NAME=... -e DB_PASS=... -e DB_USER=... joystream/hydra-indexer sh -c 'yarn db:bootstrap'
```

Then run the indexer (make sure that all the required environment variables are set)

```bash
docker run -e ... joystream/hydra-indexer
```

## Advanced environment variables

Some optional environment variables are available for fine-tuning.

| Variable        | Default           |  Description |
| -------|:--------------:| ---------------------------:|
| BLOCK_CACHE_TTL_SEC      | `60*60` | TTL for processed blocks in the Redis cache |
| INDEXER_HEAD_TTL_SEC      | `60*15` | TTL for the indexer head block entry |
| WORKERS_NUMBER | 5 |  Number of concurrent workers fetching the blocks |
| BLOCK_PRODUCER_FETCH_RETRIES | 3 | Number of attempts fetching each a block before throwing an error. Set to `-1` for indefinite attempts |
| SUBSTRATE_API_TIMEOUT | `1000 * 60 * 5` | Timeout in (milliseconds) for API calls |
| NEW_BLOCK_TIMEOUT_MS | `60 * 10 * 1000` | Panic if no blockchain blocks have been received within this time |