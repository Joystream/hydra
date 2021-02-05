# CHANGELOG

## 0.1.6

- Fixed preview feature

## 0.0.24

- bugfix: QueryRunner connection leaks in full-text search queries

## 0.0.23

- bugfix: fields resolution in findOne queries

## 0.0.22

- Add unique entity queries

## 0.0.21

Major upgrade

- Hydra Indexer is run as an independent docker image
- Changed docker-compose and processor templates
- Updated migrations workflow

## 0.0.19

- Support of ES-style imports in mappings (via `esModuleInterop:true`)
- Add `--no-install` flag to `hydra-cli codegen` to skip dependecies installation

## 0.0.18

- Fix entity relation resolvers for the generated GraphQL server

## 0.0.17

- Update warthog version to 2.20.0

## 0.0.16

- Fixed duplicate flags in the scaffold
- New docker targets for migrating the db from a docker container

## 0.0.15

- Updated docker-compose and docker templates

## 0.0.14

- Custom types support via type definition files
- Dockerfile
- The indexer template uses the most recent version of the indexer-lib by default

## 0.0.13

- New default mappings: handle balance.Transfered events
- Update scaffold prompts: additinal settings for indexing and processor set-ups
- Cleaned up `./generated/indexer/index.ts` 