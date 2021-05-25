# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### 3.0.1-alpha.0 (2021-05-25)


### Bug Fixes

* **hydra-cli:** add DB env variables to indexer docker-compose stack ([#405](https://github.com/Joystream/hydra/issues/405)) ([fb53385](https://github.com/Joystream/hydra/commit/fb53385682287ae0653a152f6d466cb68d4c0c2a))



## [3.0.0](https://github.com/Joystream/hydra/compare/v3.0.0-beta.8...v3.0.0) (2021-05-24)

**Note:** Version bump only for package @dzlzv/hydra-cli





## 3.0.0-beta.8 (2021-05-24)

**Note:** Version bump only for package @dzlzv/hydra-cli





## 3.0.0-beta.7 (2021-05-21)


### Bug Fixes

* **hydra-typegen:** do proper handling of tuples in typegen ([#403](https://github.com/Joystream/hydra/issues/403)) ([bf89dc8](https://github.com/Joystream/hydra/commit/bf89dc8ae10673332539091dd1065688bdea37b4)), closes [#398](https://github.com/Joystream/hydra/issues/398)



## 3.0.0-beta.6 (2021-05-14)


### Bug Fixes

* **hydra-indexer:** do not coerce null values to an empty string ([#395](https://github.com/Joystream/hydra/issues/395)) ([aced643](https://github.com/Joystream/hydra/commit/aced643e1988bb1563e190dd02c91acc8df2c863)), closes [#393](https://github.com/Joystream/hydra/issues/393)



## 3.0.0-beta.5 (2021-05-14)


### Bug Fixes

* **hydra-cli:** fix ts compilation error in generated relationship resolver ([#392](https://github.com/Joystream/hydra/issues/392)) ([22a18e3](https://github.com/Joystream/hydra/commit/22a18e30cfccd5985f09772f4cccd2f551d39679))



## 3.0.0-beta.4 (2021-05-10)


### Features

* **hydra-cli:** upgrade Node version to 14: hydra-cli, hydra-indexer, hydra-indexer-gateway ([#390](https://github.com/Joystream/hydra/issues/390)) ([bc57996](https://github.com/Joystream/hydra/commit/bc57996d228109e8f84816dccd0baf99f35b0f05)), closes [#4](https://github.com/Joystream/hydra/issues/4)



## 3.0.0-beta.3 (2021-05-07)


### Bug Fixes

* **hydra-typegen:** fix tuple types not correctly parsed by typegen ([#389](https://github.com/Joystream/hydra/issues/389)) ([8a3d8e7](https://github.com/Joystream/hydra/commit/8a3d8e739edc847292775c565b3d36ce0ccce913)), closes [#373](https://github.com/Joystream/hydra/issues/373)



## 3.0.0-beta.2 (2021-05-07)


### Bug Fixes

* **hydra-cli:** bump hydraVersion -> 3 in manifest files ([#388](https://github.com/Joystream/hydra/issues/388)) ([f837191](https://github.com/Joystream/hydra/commit/f8371914dae087ac5edd9bcc0d0bdeac8c4d9d93))



## [3.0.0-beta.1](https://github.com/Joystream/hydra/compare/v2.1.0-beta.8...v3.0.0-beta.1) (2021-05-07)


### Features

* **hydra-cli:** support cross filters for entity relationship ([#381](https://github.com/Joystream/hydra/issues/381)) ([04f2dca](https://github.com/Joystream/hydra/commit/04f2dca8fdec18d2351f6740de693fc5d45845f5))
* **hydra-cli:** support multiple orderBy clauses ([#378](https://github.com/Joystream/hydra/issues/378)) ([7348f03](https://github.com/Joystream/hydra/commit/7348f03eca746e9c897b68df80b02b7da0976b29))
* **hydra-cli:** support variant relations v3 ([#380](https://github.com/Joystream/hydra/issues/380)) ([8ab5222](https://github.com/Joystream/hydra/commit/8ab5222337557c51849b5b43fe512f84bcda868c)), closes [#357](https://github.com/Joystream/hydra/issues/357)
* **typegen:** tuple return type for event.params ([#358](https://github.com/Joystream/hydra/issues/358)) ([bf16156](https://github.com/Joystream/hydra/commit/bf16156c63893ba5a4c6906341319a27a05b788d))


### Bug Fixes

* **hydra-cli:** update scaffold templates ([#383](https://github.com/Joystream/hydra/issues/383)) ([427625a](https://github.com/Joystream/hydra/commit/427625a589923929d2e955691fd52575b84dea76))



## 2.1.0-beta.8 (2021-04-29)


### Bug Fixes

* **hydra-cli:** fix stack overflow caused by lodash.cloneDeep ([#369](https://github.com/Joystream/hydra/issues/369)) ([e087c5c](https://github.com/Joystream/hydra/commit/e087c5c771de20a1b1cf09c38c9a91806af84819))



## 2.1.0-beta.7 (2021-04-08)


### Bug Fixes

* **hydra-cli:** fix single import of model files ([#352](https://github.com/Joystream/hydra/issues/352)) ([10f84d4](https://github.com/Joystream/hydra/commit/10f84d4ee5a42a2451f61fcc69135d068d876171))



## 2.1.0-beta.6 (2021-04-08)


### Features

* **hydra-cli:** export all model files from a single module ([#348](https://github.com/Joystream/hydra/issues/348)) ([47b526a](https://github.com/Joystream/hydra/commit/47b526a1a9eab8401051761d409d24f86b5ff6f3))



## 2.1.0-beta.5 (2021-04-02)


### Bug Fixes

* **hydra-cli:** Export all enums + refactor ([#344](https://github.com/Joystream/hydra/issues/344)) ([221f961](https://github.com/Joystream/hydra/commit/221f9611e12cb4df9586fa509c7d050d2e59ee2a))



## 2.1.0-beta.4 (2021-03-31)


### Bug Fixes

* **hydra-processor:** lazily init config to fix the --indexer flag ([#341](https://github.com/Joystream/hydra/issues/341)) ([e7e3d77](https://github.com/Joystream/hydra/commit/e7e3d777dd53adcd958f0d3852a5741fd254b08b))



## [2.1.0-beta.3](https://github.com/Joystream/hydra/compare/v2.0.1-beta.17...v2.1.0-beta.3) (2021-03-31)


### Features

* **packages:** upgrade polkadot/api version to 4.2.1 ([#339](https://github.com/Joystream/hydra/issues/339)) ([e840712](https://github.com/Joystream/hydra/commit/e840712816db963035470f2bd57da2b795f769ae))



## 2.1.0-beta.0 (2021-03-30)


### Features

* **packages:** upgrade polkadot/api version to 4.2.1 ([#339](https://github.com/Joystream/hydra/issues/339)) ([e840712](https://github.com/Joystream/hydra/commit/e840712816db963035470f2bd57da2b795f769ae))



### 2.0.1-beta.17 (2021-03-29)


### Bug Fixes

* **hydra-cli:** declaration:true for graphql-server + fix resolver duplicate names ([#338](https://github.com/Joystream/hydra/issues/338)) ([e3fa092](https://github.com/Joystream/hydra/commit/e3fa092a71b2461ea1e25f417aeb6a1a78a4c7ab))



### 2.0.1-beta.16 (2021-03-24)


### Bug Fixes

* **hydra-cli:** fix [#328](https://github.com/Joystream/hydra/issues/328) ([#332](https://github.com/Joystream/hydra/issues/332)) ([c119193](https://github.com/Joystream/hydra/commit/c1191932b850bdaa2b0ba2f5e3a843c571511a5b))



### 2.0.1-beta.15 (2021-03-19)


### Bug Fixes

* **hydra-cli:** use transpiled js files for query-node  ([#323](https://github.com/Joystream/hydra/issues/323)) ([af382ac](https://github.com/Joystream/hydra/commit/af382acbeaece10f386b3a127bb0b5e500e67f42))



### 2.0.1-beta.14 (2021-03-19)


### Bug Fixes

* **hydra-cli:** variants import fixes ([#325](https://github.com/Joystream/hydra/issues/325)) ([7e8cfad](https://github.com/Joystream/hydra/commit/7e8cfad8d2da80ae0755ef435c8cd94fd21dba35))



### 2.0.1-beta.13 (2021-03-18)


### Bug Fixes

* **hydra-cli:** fix overriding entity relation type and derivedFrom ([#324](https://github.com/Joystream/hydra/issues/324)) ([d2393a3](https://github.com/Joystream/hydra/commit/d2393a3c997cd8940b6b592da9a31d1e07bf5286))



### 2.0.1-beta.12 (2021-03-17)


### Bug Fixes

* **hydra-cli:** ignore generating module import for self referenced entities ([#322](https://github.com/Joystream/hydra/issues/322)) ([2d09777](https://github.com/Joystream/hydra/commit/2d0977784f24b20a75c1f6085a42912014c0a312))



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
