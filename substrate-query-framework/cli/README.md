# Hydra CLI

A query node for substrate based chains, inspired by TheGraph.

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

## Architecture overview

A Hydra query node ingests substrate events in a multi-step pipeline which looks as follows:
```
Substrate Chain => Hydra Indexer => Indexer GraphQL gateway => Hydra Processor => Database => Query Node GraphQL endnpoint 
```

For popular chains the processor may connect to a publicly available Indexer endpoint (such as https://hakusama.joystream.app/graphql for Kusama), otherwise a self-hosted indexer should be run.


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

By default the scaffolder generates mappings and a schema tracking Kusama transfers. Generate the indexer and the server:

```bash
$ hydra-cli codegen
```

The indexer and server files will be generated in `./generated/indexer` and `./generated/graphql-server` respectively.

In order to run them, a Postgres database should be up and running and accept connections. The credentials may be provided in `.env` file. By default, the scaffolder generates a database service `docker-compose.yml` with the same credentials via environment variables. Run

```bash
$ yarn db:up
$ yarn db:migrate
```
to create the database and set up the db schemas \(if the database already exists, skip the first one\). 

## Setting up and indexer

To run a self-hosted indexer, we need to set the indexer itself and the an GraphQL gateway which will expose for querying raw events and extrinsics from the chain. The setup requires botha a redis and a db instance and thus is more convenient to run with a docker-compose file:

```bash
$ docker-compose up -d redis
```
Now build and run the indexer:
```
$ docker-compose build indexer && docker-compose up -d indexer
```

To run the indexer gateway, simply pull the image and run the service:
```
$ docker-compose up -d indexer-api-gateway
```

If everything set up correctly, it should be possible to inspect the gateway at `http://localhost:4000/graphql`

## Running the processor

When the indexer gateway is available (either run locally or hosted elsewhere), the processor can be run againt it:

```
$ docker-compose up -d processor
```

## Running the query node endpoint

Finally, run the query node endpoint:

```
$ docker-compose up -d graphql-server
```

## Examples

Check out [sample projects](https://github.com/Joystream/joystream/tree/query_node/query-node/examples) for inspiration!
