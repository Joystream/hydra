# Hydra e2e tests

This project runs end-to-end tests for Hydra services. The docker-compose file defines the following services:

- substrate chain based on node-template
- [Hydra Indexer](../hydra-indexer/README.md)
- [Hydra Indexer Gateway](../hydra-indexer/README.md)
- Hydra Processor
- Hydra Query Node

The last two services are taken from the [sample project](../sample/README.md) and heavily use Hydra code generation tools. 
The processor (defined in `docker-compose.yml`) is started up with

```bash
yarn workspace sample query-node:configure && \
yarn workspace sample db:prepare && \
yarn workspace sample db:migrate && \
yarn workspace sample mappings:build && \
yarn workspace sample processor:start
```

The first three commands generate prepare and run DB migrations for the entities.
The fourth generates typescript classes for the events the mappings are going to handle.
The last one starts Hydra processor.

Hydra Query Node service is started with

```bash
yarn query-node:start:prod
```