# Changelog of major updates

## 0.0.22

- If the indexer is started at a block ahead of the current chain height, it waits intstead of throwing

## 0.0.21-

- The index builder caches finalized indexer heads it subscribes to. Added `FINALIZATION_THRESHOLD` env setting to further enforce the blocks to be final

## 0.0.20-

- bugfix: the indexer subscribes only for finalized heads

## 0.0.19-alpha

- Add Prometheus Client for the processor

## 0.0.18-alpha

- IndexerStatusService adds additional data into Redis:
  - Last comepleted block
  - Max completeted block
  - Substrate chain height

## 0.0.17-alpha

- Bugfixes and stability improvements

## 0.0.16-alpha

- Indexer supports custom substrate types
- Substrate API stability improvements 

## 0.0.15-alpha.2

- Reworked indexer head updates by IndexerStatusService to make it more stable against Redis outages. 
By default the indexer head expires after 15 mins which forces the update from the database

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
