# Hydra Subsocial project

Sample project showcasing Hydra for Subsocial substrate chain

## Prerequisites

- Yarn
- Node v12.x
- Docker (Optional)

## Quickstart

First, run the database:

```sh
docker-compose up -d db
```

Then run hydra codegen together with all the necessary schema migrations. There is a convenient script to make everything in one shot

```sh
yarn bootstrap
```

Now run the processor:

```sh
yarn processor:start
```

This will run Hydra processor running the event handlers in `./mappings` against the [Subsocial indexer](https://subsocial-indexer.joystream.app/graphql) 

In a separate terminal running
```
yarn server:start:dev
```

This will run a GraphQL API against the entity schema defined in `schema.graphl`. The playground opens up at `localhost:4000`.

Let's query some posts:
```graphql
query {
  posts(limit: 5) {
    content
    id
    author
  }
}
```

## What's next?

- Extend the schema by adding new fields and entities to `scheama.graphql`. There are lot of possibilities explained in the [docs](https://dzhelezov.gitbook.io/hydra/docs/schema-spec)
- Add new mappings (event listeners) to `./mappings`. Remember that all event handlers must be imported in `./mappings/index.ts` and follow the naming convention `<module>_<eventName>`.

Make sure the model classes and the database schema are rebuilt after a model or mappings change. There is a separate script for it:

```sh
yarn rebuild 
```