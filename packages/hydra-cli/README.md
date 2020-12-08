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

For an in-depth guide on how to create complex schemas and supported features like full-text search, interfaces, union and algebraic types and more, check the [Docs](./../../docs/README.md) and also visit [Hydra Webpage](https://joystream.org/hydra) for a one-pager.

## Dockerized quickstart

The easiest way to get the whole Hydra stack working is to build a `hydra-kit` Docker image. It is a one-size-fits-all tool to run
a database migrations for the inpust schema, and the processor.

First, build `hydra-kit`:
```bash
$ yarn docker:build
```

Let's start the db and run the migrations. `hydra-kit` will connect to the network running the database container created by docker-compose.
```bash
$ yarn docker:db:up
$ yarn db:prepare
$ yarn docker:db:migration
```

Now everything is ready to run the whole stack locally:
```
$ yarn docker:up
```

After some warm-up time, the query node will be available at `localhost:8080` and the indexer gateway playground at `localhost:4000`

## Local setup

Generate the indexer and the server:

```bash
$ hydra-cli codegen
```

The indexer and server files will be generated in `./generated/processor` and `./generated/graphql-server`.

Make sure the database is up and running. The credentials may be provided in `.env` file. By default, the scaffolder generates a database service `docker-compose.yml` with the same credentials via environment variables. Run

```bash
$ yarn db:up
$ yarn db:prepare
$ yarn db:migrate
```
to create the database and set up the db schemas.

## Setting up the indexer

To run a self-hosted indexer, we need to spin up a local indexer together with a GraphQL gateway. The setup requires a redis and a db instance and thus is more convenient to run with a docker-compose file:

```bash
$ docker-compose up -d redis
$ docker-compose up -d indexer
$ docker-compose up -d indexer-api-gateway
```

If everything set up correctly, it should be possible to inspect the Indexer gateway at `http://localhost:4000/graphql`

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
