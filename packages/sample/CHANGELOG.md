# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 3.0.0-beta.2 (2021-05-07)


### Bug Fixes

* **hydra-cli:** bump hydraVersion -> 3 in manifest files ([#388](https://github.com/Joystream/hydra/issues/388)) ([f837191](https://github.com/Joystream/hydra/commit/f8371914dae087ac5edd9bcc0d0bdeac8c4d9d93))



## [3.0.0-beta.1](https://github.com/dzhelezov/hydra/compare/v2.1.0-beta.8...v3.0.0-beta.1) (2021-05-07)


### Features

* **hydra-processor:** add hydra indexer check + hydra-processor performance fix ([#385](https://github.com/dzhelezov/hydra/issues/385)) ([dd77e3f](https://github.com/dzhelezov/hydra/commit/dd77e3fc861cd6f914a961788de0eef8ecf16e82))
* **hydra-processor:** string-based ranges in manifest ([#347](https://github.com/dzhelezov/hydra/issues/347)) ([d343da1](https://github.com/dzhelezov/hydra/commit/d343da15b6b90e71bf69e85f93d5fe7fc1bf3e4e))
* **hydra-processor:** use mappings contexts and support specVersion filters ([#375](https://github.com/dzhelezov/hydra/issues/375)) ([6a95a99](https://github.com/dzhelezov/hydra/commit/6a95a99b5d212de50ae83c3b8ec6cb42a66204af))
* **typegen:** tuple return type for event.params ([#358](https://github.com/dzhelezov/hydra/issues/358)) ([bf16156](https://github.com/dzhelezov/hydra/commit/bf16156c63893ba5a4c6906341319a27a05b788d))



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



## [2.1.0-beta.3](https://github.com/dzhelezov/hydra/compare/v2.0.1-beta.17...v2.1.0-beta.3) (2021-03-31)


### Features

* **packages:** upgrade polkadot/api version to 4.2.1 ([#339](https://github.com/dzhelezov/hydra/issues/339)) ([e840712](https://github.com/dzhelezov/hydra/commit/e840712816db963035470f2bd57da2b795f769ae))



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

**Note:** Version bump only for package sample





### 2.0.1-beta.3 (2021-03-05)


### Bug Fixes

* **hydra-cli:** support entity relations in interfaces ([#275](https://github.com/Joystream/hydra/issues/275)) ([122e593](https://github.com/Joystream/hydra/commit/122e5931e75780ebb5a203ba4c568a6ab76a2668))



## 2.0.1-beta.2 (2021-03-04)

**Note:** Version bump only for package sample
