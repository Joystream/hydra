# Karura Indexer 

To run the indexer (all scripts should be from the root folder)

1. Set up the DB:

```sh

ENV=test/acala/.env yarn workspace @subsquid/hydra-indexer db:bootstrap:dev

```

2. Run the indexer:

```sh

ENV=test/acala/.env yarn workspace @subsquid/hydra-indexer start:de

```