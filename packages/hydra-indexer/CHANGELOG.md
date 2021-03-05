# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### 2.0.1-beta.3 (2021-03-05)


### Bug Fixes

* **hydra-cli:** support entity relations in interfaces ([#275](https://github.com/Joystream/hydra/issues/275)) ([122e593](https://github.com/Joystream/hydra/commit/122e5931e75780ebb5a203ba4c568a6ab76a2668))



## 2.0.1-beta.2 (2021-03-04)

**Note:** Version bump only for package @dzlzv/hydra-indexer





# Changelog of major updates

## 0.1.6

Added fields to SubstrateEvent entity:
    - `data`: JSONified event parameters
    - `extrinsicArgs`: JSONified extrinsic arguments
    - `extrinsicHash`: Extrinsic hash (if present)

## 0.1.5  

- Added `extrinsicName` field to events

## 0.1.4

- Added blocktimestamp

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

- Hydra Indexer publishes the current head to Redis and caches metrics for quick access
- Schema update: `created_at`, `deleted_at`, `updated_at`, `version` added to the Indexer entity tables
- Added additional indices

## 0.0.14-alpha

Breaking changes:

- Fixed JSON serialization to postgres for Extrinsincs and Event params
- Event name is stored as `${section}.${method}`
- Increased the number of padding zeroes in the event id (six padding zeroes for the index part)
