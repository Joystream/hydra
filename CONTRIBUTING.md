# Contributing to Hydra

Hydra is an open-source project and contributions in the form of a PR are welcome. We use [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) enforced by the [commitizen](https://github.com/commitizen) and [commitlint](https://commitlint.js.org/#/)

## Testing

A pull request adding a new feature or fixing an existing bug should include a test covering the changes. The contribution can be covered either by an e2e test or by  a unit test. End-to-end tests are located in `packages/hydra-e2e-tests` and can be run from the root with `yarn e2e-test`. Unit tests are package-specific. For example, unit tests for `hydra-cli` can ber run using `yarn workspace @dzlzv/hydra-cli test`. Both e2e and unit tests are run by CI once a PR is opened.

## Versioning and Releases

The monorepo is organized with lerna, with a single version for all packages. Once a pull request is merged, the version is bumped to the new pre-release version following the conventional commits convention. When deemed mature, the `publish` action can be manuually triggered. It graduates the pre-release version and publishes to the npm registry and docker hub (for private packages `hydra-indexer` and `hydra-indexer-gateway`).
