# Hydra

![A query node builder for Substrate chains](.gitbook/assets/hydra-logo-horizontallockup.svg)

A Substrate query node framework. Inspired by [TheGraph](http://thegraph.com/), it gives a smooth way to provide powerful GraphQL queries to app developers over your Substrate blockchain state and history.

## What's Hydra?

[Hydra](https://joystream.org/hydra) is a query node for Substrate-based blockchains. A query node ingests data from a substrate chain and provides rich, domain-specific, and highly customizable access to the blockchain data, far beyond the scope of direct RPC calls. For example, expired [Kusama Treasury](https://wiki.polkadot.network/docs/en/learn-treasury) spending [proposals](https://kusama.subscan.io/event?module=Treasury&event=Proposed) are pruned from the state of the [Kusama blockchain](https://polkascan.io/kusama), so querying, say, one-year-old proposals is problematic. Indeed, one has to track the evolution of the state by sequentially applying the Treasury events and extrinsics in each historical block.

That's where Hydra gets you covered. Define your data model and the Hydra indexer will get it in sync with the chain. On top of that, you get a batteries-included GraphQL server with comprehensive filtering, pagination, and even full-text search capabilities.

## Monorepo structure

The monorepo contains the following sub-packages:

* [Hydra CLI](https://github.com/dzhelezov/hydra/tree/d8c7f79fd26db49de753e0247ef561f5fcb7878f/packages/hydra-cli/README.md): Codegen tools to set up and run a Hydra pipeline
* [Hydra Indexer](https://github.com/dzhelezov/hydra/tree/d8c7f79fd26db49de753e0247ef561f5fcb7878f/packages/hydra-indexer/README.md): Hydra indexer for ingesting raw events and extrinsics
* [Hydra Indexer Gateway](https://github.com/dzhelezov/hydra/tree/d8c7f79fd26db49de753e0247ef561f5fcb7878f/packages/hydra-indexer-gateway/README.md): GraphQL interface for the Indexer
* [Hydra Processor](https://github.com/dzhelezov/hydra/tree/d8c7f79fd26db49de753e0247ef561f5fcb7878f/packages/hydra-indexer-gateway/README.md): Processing part of the pipeline for transforming events into rich business-level objects
* [Sample Project](https://github.com/dzhelezov/hydra/tree/d8c7f79fd26db49de753e0247ef561f5fcb7878f/packages/sample/README.md): A quickstart Hydra project set up against a publicly available Kusama indexer. Good starting point.
* [Docs](docs/): In-depth documentation covering the Hydra pipeline and API features, such as full-text search, pagination, extensive filtering and a rich GraphQL dialect defining your schema!

