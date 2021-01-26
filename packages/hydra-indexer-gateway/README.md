# Hydra Indexer Gateway

Hydra Indexer Gateway is a GraphQL server exposing the indexed Substrate data (primarily, extrinsics and events), indexed by Hydra Indexer.

## Installation

The project is built using [Warthog](https://github.com/goldcaddy77/warthog) library.

### Local development

For local development, first inspect `env.yml` and generate a dev `.env` file using run `yarn config:dev`.
Then the server can be run with `yarn start:dev`

### Production/Docker

For production a pre-built Docker image in recommended. The following environment variables must be set:

| Variable        |  Description |
| -------| ---------------------------|
| WARTHOG_STARTER_DB_DATABASE      | Indexer database name |
| WARTHOG_STARTER_DB_HOST      | Indexer database host |
| WARTHOG_STARTER_DB_PORT     | Indexer database port |
| WARTHOG_STARTER_DB_USERNAME | User to access the indexer database |
| WARTHOG_STARTER_DB_PASSWORD | User password  |
| WARTHOG_STARTER_REDIS_URI |  Redis connection string (must be the same as used by the Indexer) |
| PORT | Port at which the GraphQL server will listen for connections |
