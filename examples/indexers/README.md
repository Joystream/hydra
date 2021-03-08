# Hydra Indexer examples

A Hydra Indexer (and a gateway) is an independent piece of the Hydra stack. It extracts raw data from the Substrate chain and exposes it via a GraphQL interface. One can think of Hydra Indexer as an GraphQL-based explorer suitable for queyring the chain events and extrinsics.
)

To run an indexer, one typically needs to prepare a json file with the runtime types. Otherwise, the indexer will likely fail due to deserialization errors. Here we keep some popular setups for running a self-hosted indexer.

To run a Hydra processor against the indexer, update `INDEXER_ENDPOINT_URL` environment property, e.g. to `http://localhost:4001/graphql`. For production use, it is recommended to use `https` reverse proxy for the indexer endpoint.