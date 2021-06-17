# Sample Hydra Project

It is a sample Hydra v3 project for the Kusama network. 
It showcase the two main features of Hydra v3:

- Dealing with runtime upgrades via spec filters
- Using ad-hoc data loaders via block hooks

## 1. Bootstrap

Run

```bash
yarn && yarn bootstrap
```

It will generate the model files as defined in `schema.graphql`, create the database and run all the necessary migrations in one shot.

NB! Use with caution in production, as it will delete all the existing records.

## 2. Generate Types for events and extrinsics

A separate tool Hydra Typegen can be used for generating Typescript classes for the event handlers (the _mappings_).  
Run

```bash
yarn typegen
```
to generated types for the event `balances.Transfer`. Under the hood, it will run `hydra-typegen` twice against
different blocks and produce typed classes in `mappings/generated/types-V1` and `mappings/generated/types-V2` respectively.


## 3. Build Mappings

Mappings is a separated TypeScript module created in the mappings folder. The handlers exported by the module should match the ones defined in `manifest.yml` in the mappings section. Once the necessary files are generated, build it with

```bash
yarn mappings:build
```

Note that we have to versions of the `balancesTransfer` mapping: `balancesTransferV1` and `balancesTransferV2`. Depending on
the `specVersion` filter the processor will pick up the right one. The former is going to be applied for `specVersion` up to `1045` and the latter for `specVersion` from `1045` onwards.

Another mapping, `genesisLoader` is a pre-block hook, which means it runs before any other mapping in the block. By setting it's filter range to `[0, 0]` it is restricted only to the genesis block and is convenient place to seed some data if needed.

## 4. Run local Hydra Indexer

A stack of Hydra Indexer services is configured in `docker-compose-indexer.yml`. 
Run

```
$ docker-compose -f docker-compose-indexer.yml up -d
```

and check the status at `localhost:4001` by quering

```gql
query {
  indexerStatus {
    chainHeight
    head
    hydraVersion
  }
}
```

Make sure that the last indexer block (head) and the last known finalized block (chainHeight) are both positive and `hydraVersion` is `3.x`.

## 5. Run the processor and the GraphQL server

Then run the processor:

```bash
yarn processor:start
```

Afterwards, start the GraphQL server in a separate terminal (opens a GraphQL playground at localhost by default):

```bash
yarn query-node:start:dev
```

## Running in Docker

Docker files are located in `./docker`. First, build the builder image:

```bash
$ docker build . -f docker/Dockerfile.builder -t builder
```

Images for the GraphQL query node and the processor depend on the `builder` image.
Build with

```bash
$ docker build . -f docker/Dockerfile.query-node -t query-node:latest
$ docker build . -f docker/Dockerfile.processor -t processor:latest
```

In order to run the docker-compose stack, we need to create the schema and run the database migrations. 

```bash
$ docker-compose up -d db 
$ yarn docker:db:migrate
```

The last command runs `yarn db:bootstrap` in the `builder` image. A similar setup strategy may be used for Kubernetes (with `builder` as a starter container).

Now everything is ready:

```bash
$ docker-compose up
```
