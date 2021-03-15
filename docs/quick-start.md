---
description: Build a Hydra Indexer and GraphQL server from scratch under five minutes
---

# Tutorial

{% hint style="info" %}
Before starting, make sure`hydra-cli`is [installed](install-hydra.md) on your machine together with all the prerequisites.
{% endhint %}

## 0. Hello Hydra!

Start off by setting up a project folder

```bash
mkdir hello-hydra && cd hello-hydra
```

## 1. From zero to one

Next, run the scaffold command, which generates all the required files:

```bash
hydra-cli scaffold
```

Answer the prompts and the scaffolder will generate a sample backbone for our Hydra project. This includes:

* Sample GraphQL data [schema](schema-spec/) in `schema.graphql` describing proposals in the Kusama network
* Sample [mapping](mappings/) scripts in the `./mapping` folder translating substrate events into the `Proposal` entity CRUD operations
* `docker-compose.yml` for running a Postgres instance locally as a Docker service.
* `.env` with all the necessary environment variables.
* `package.json` with a few utility yarn scripts to be used later on.

## 2. Codegen

Run

```bash
yarn && yarn bootstrap
```

It will generate the model files as defined in `schema.graphql`, create the database and run all the necessary migrations in one shot.

NB! Use with caution in production, as it will delete all the existing records.

Under the fold, `yarn booststrap` creates a folder `generated/graphql-server` with an Apollo-based GraphQL server for the query node.

## 3. Typegen for events and extrinsics

 List the events and extrinsics to be used by the mappings and generated type-safe classes using the typegen tool. One can define in a separate yml file or modify the `typegen` section in `manifest.yml` 

Typegen fetches the metadata from the chain from the block with a given hash \(or from the top block if no hash is provided\)  

```yaml
typegen:
  metadata:
    source: ws://arch.subsocial.network:9944
    # add hash of the block if the metadata from a specific block
    # should be used by typegen
    # blockHash: 0x....
  events:
    - posts.PostCreated
  calls:
    - posts.CreatePost
  customTypes: 
    lib: '@subsocial/types/substrate/interfaces'
    typedefsLoc: typedefs.json
  outDir: ./mappings/generated/types
```

## 4. Mappings and the manifest file

Modify the default mappings in the mappings folder and make sure all the mapping functions are exported. Define the mappings in the `mappings` section 

```yaml
mappings:
  # the transpiled js module with the mappings
  mappingsModule: mappings/lib/mappings
  imports:
    # generated types to be loaded by the processor
    - mappings/lib/mappings/generated/types
  eventHandlers:
      # event to handle
    - event: posts.PostCreated
      # handler function with argument types
      handler: postCreated(DatabaseManager, Posts.PostCreatedEvent)
  extrinsicHandlers:
      # extrinsic to handle
    - extrinsic: timestamp.set 
      handler: timestampCall(DatabaseManager, Timestamp.SetCall)
 
```

## 5. Dockerize

Among other things, the scaffolder generates a `docker` folder with Dockerfiles. 

First, build the builder image:

```bash
$ docker build . -f docker/Dockerfile.builder -t builder
```

Now the images for the GraphQL query node and the processor can be built \(they use the builder image under the hood\)

```bash
$ docker build . -f docker/Dockerfile.query-node -t query-node:latest
$ docker build . -f docker/Dockerfile.processor -t processor:latest
```

In order to run the docker-compose stack, we need to create the schema and run the database migrations.

```bash
$ docker-compose up -d db 
$ yarn docker:db:migrate
```

The last command runs `yarn db:bootstrap` in the `builder` image. A similar setup strategy may be used for Kubernetes \(with `builder`as a starter container\).

Now everything is ready:

```bash
$ docker-compose up
```

## What to do next?

* Explore more [examples](https://github.com/Joystream/hydra/tree/master/examples)
* Describe your own [schema](schema-spec/) in `schema.graphql`
* Write your indexer [mappings](mappings/)
* Push your Hydra indexer and GraphQL Docker images to [Docker Hub](https://hub.docker.com/) and deploy  
