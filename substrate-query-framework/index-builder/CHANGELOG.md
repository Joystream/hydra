# Changelog of major updates

## 0.0.15-alpha.1

### Hydra Indexer

- Hydra Indexer publishes the current head to Redis and caches metrics for quick access
- Schema update: `created_at`, `deleted_at`, `updated_at`, `version` added to the Indexer entity tables
- Added additional indices

### Hydra Processor

- Hydra Processor fetches repeatedly updates the indexer head from the Indexer GraphQL endpoint
- More efficient event fetching

## 0.0.14-alpha.1

- The mappings processor sources events from a GraphQL endpoint

## 0.0.14-alpha

Breaking changes:

- Fixed JSON serialization to postgres for Extrinsincs and Event params
- Event name is stored as `${section}.${method}`
- Increased the number of padding zeroes in the event id (six padding zeroes for the index part)