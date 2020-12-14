# Hydra CLI

A cli tool for running a [Hydra](https://joystream.org/hydra) query node

USAGE

```bash
$ hydra-cli [COMMAND]
```

COMMANDS

```bash
scaffold  Generate a starter project with a sample schema file and mappings
codegen   Generate a ready to run graphql server and block indexer
preview   Preview the output schema served by the GraphQL server
```

## Architecture one-liner

A Hydra query node ingests substrate events in a multi-step pipeline which looks as follows:
```
Substrate Chain => Hydra Indexer => Indexer GraphQL gateway => Hydra Processor => Database => Query Node GraphQL endnpoint 
```

For popular chains the processor may connect to a publicly available Indexer endpoint (such as https://kusama-indexer.joystream.app/graphql for Kusama), otherwise a self-hosted indexer should be run.


## Using Hydra CLI

Using `npx`:

```bash
$ alias hydra-cli='npx @dzlzv/hydra-cli'
```

or install via npm:

```bash
npm install -g @dzlzv/hydra-cli
```

and then

```bash
$ hydra-cli [COMMAND]
```

## Getting Started

Run

```text
$ hydra-cli scaffold
```

and answer the prompts. The scaffolder will generate the following files:

```text
├── .env
├── docker-compose.yml
├── docker
├── mappings
├── package.json
└── schema.graphql
```

The scaffolder auto-generates sample mappings and an input  schema file as a quick starter. The provided example simply tracks all the transfers in the chain and is not that interesting on its own.

Make sure a PostgresDB is running in the background. You may start it with docker:

```bash
docker-compose up -d db
```

Then run all the nessary migrations and codegen in a single run:

```bash
yarn bootstrap
```

Now you can start Hydra processor running the mappings in `./mappings` against the indexer as configure in `.env`:

```bash
yarn processor:start
```

To run a GraphQL query node server run in a separate window:

```bash
yarn server:start:dev
```

A GraphQL playground will open up at `localhost:4000`. Try to query some Kusama transfers:

```gql
query {
  transfers(limit: 5, where: { value_gt: 1000000000000 }) {
    block
    value
    from
    to
  }
}
```

The schema and the queries can be inspected on the Schema and Docs tabs on the right.

For an in-depth guide on how to create complex schemas and supported features like full-text search, interfaces, union and algebraic types and more, check the [Docs](./../../docs/README.md) and also visit [Hydra Webpage](https://joystream.org/hydra) for a one-pager.

## Dockerized quickstart

The easiest way to get the whole Hydra stack working inside a Docker container is to build a `hydra-kit` Docker image. The provided `docker-compose.yml` comes with a `node-template` image for a Substate chain and a Hydra indexer run against it.

First, build `hydra-kit`:

```bash
$ yarn docker:build
```

Let's start the db and run the migrations. `hydra-kit` will connect to the network running the database container created by docker-compose.
```bash
$ yarn docker:db:up
$ yarn db:prepare
$ yarn docker:db:migrate
```

Now everything is ready to run the whole stack locally:
```
$ yarn docker:up
```

After some warm-up time, the query node will be available at `localhost:4000` and the indexer gateway playground at `localhost:4001`

## Setting up the indexer

To run a self-hosted indexer, we need to spin up a local indexer together with a GraphQL gateway. The setup requires a redis and a db instance and thus is more convenient to run with a docker-compose file:

```bash
$ docker-compose up -d redis
$ docker-compose up -d indexer
$ docker-compose up -d indexer-api-gateway
```

If everything set up correctly, it should be possible to inspect the Indexer gateway at `http://localhost:4001/graphql`

## Running the processor

### Dockerized

When the indexer gateway is available (either locally or hosted elsewhere), the processor can be run againt it:

```bash
$ docker-compose up -d processor
```

For running against a hosted indexer gateway, simply change `INDEXER_ENDPOINT_URL` variable. For example, setting it to `https://indexer-kusama.joystream.app/graphql` will run the processor against events and extrinsincs in Kusama chain.

### Running locally

For running the processor locally, run `yarn processor:start`

## Running the query node endpoint

Finally, run the query node endpoint:

```bash
$ docker-compose up -d graphql-server
```

The query node is run at port 8080 by default.

To run it locally, inspect the settings in `.env` and run
```
$ yarn configure:dev
$ yarn server:start:dev
```
