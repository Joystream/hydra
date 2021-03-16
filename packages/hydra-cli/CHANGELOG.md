# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### 2.0.1-beta.11 (2021-03-16)


### Bug Fixes

* **hydra-typegen:** validate location of type definitions json ([#320](https://github.com/Joystream/hydra/issues/320)) ([c29433d](https://github.com/Joystream/hydra/commit/c29433de51acbedf2823eef29700a5feacf0b02f))



### 2.0.1-beta.10 (2021-03-16)


### Bug Fixes

* **hydra-cli:** fix dockerfiles created by scaffold ([#317](https://github.com/Joystream/hydra/issues/317)) ([ecc2226](https://github.com/Joystream/hydra/commit/ecc2226d965f5c368dc49134b82c303d0f3f60b5))



### 2.0.1-beta.9 (2021-03-10)


### Bug Fixes

* **hydra-cli:** fix docker setup for scaffold + sample project ([#312](https://github.com/Joystream/hydra/issues/312)) ([023e4ef](https://github.com/Joystream/hydra/commit/023e4ef6684348fc5d3b5dbe3f013ad17a6e9f56))



### 2.0.1-beta.8 (2021-03-10)


### Bug Fixes

* **hydra-cli:** generate server source before installing the dependencies ([#311](https://github.com/Joystream/hydra/issues/311)) ([f6aa58c](https://github.com/Joystream/hydra/commit/f6aa58c1c29afcd56e394094a5f02e3714d2bd1f))



### 2.0.1-beta.7 (2021-03-10)


### Bug Fixes

* fix package.json files and prepack scripts ([#308](https://github.com/Joystream/hydra/issues/308)) ([469198e](https://github.com/Joystream/hydra/commit/469198eca45bfd1c6430817632890cbba9434bbe))



### 2.0.1-beta.6 (2021-03-09)


### Bug Fixes

* **hydra-indexer-gateway:** add 'inSync' and 'hydraVersion' fields to the indexerStatus query ([#295](https://github.com/Joystream/hydra/issues/295)) ([fc07445](https://github.com/Joystream/hydra/commit/fc0744501ebe1338cd4f200491d88dfaa707cbcc))



### 2.0.1-beta.5 (2021-03-09)


### Bug Fixes

* **hydra-processor:** Use single hydraVersion in manifest ([#293](https://github.com/Joystream/hydra/issues/293)) ([08a1694](https://github.com/Joystream/hydra/commit/08a16945bf23acbb2528695ff95b51857dc4cd35))



### 2.0.1-beta.4 (2021-03-05)

**Note:** Version bump only for package @dzlzv/hydra-cli





### 2.0.1-beta.3 (2021-03-05)


### Bug Fixes

* **hydra-cli:** support entity relations in interfaces ([#275](https://github.com/Joystream/hydra/issues/275)) ([122e593](https://github.com/Joystream/hydra/commit/122e5931e75780ebb5a203ba4c568a6ab76a2668))



## 2.0.1-beta.2 (2021-03-04)

**Note:** Version bump only for package @dzlzv/hydra-cli

# CHANGELOG

## 0.1.7

- `codegen --schema` now supports passing folders instead of single schema file

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
